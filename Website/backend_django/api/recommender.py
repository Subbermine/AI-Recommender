import os
import torch
import numpy as np
from textblob import TextBlob
from transformers import AutoTokenizer, AutoModel
from django.db.models import Avg, Count
from api.models import Product, Review, OrderItem

_HERE = os.path.abspath(__file__)
_API_DIR = os.path.dirname(_HERE)
_DJANGO_DIR = os.path.dirname(_API_DIR)
_SUVARNAMAAM_DIR = os.path.dirname(_DJANGO_DIR)
_REPO_ROOT = os.path.dirname(_SUVARNAMAAM_DIR)
MODEL_DIR = os.path.join(_REPO_ROOT, 'code', 'saved_model')

class Recommender:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Recommender, cls).__new__(cls, *args, **kwargs)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.tokenizer = None
        self.model = None
        self.embeddings_cache = {}  # product_id -> numpy array (770,)
        self._initialized = True

    def _lazy_load_model(self):
        if self.model is None or self.tokenizer is None:
            self.tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
            self.model = AutoModel.from_pretrained(MODEL_DIR)
            self.model.eval()

    def get_embedding(self, product):
        """
        Computes DeBERTa embedding by weighing the Title (80%) and Description (20%).
        Returns a numpy array of shape (768,).
        """
        if product.id in self.embeddings_cache:
            return self.embeddings_cache[product.id]

        self._lazy_load_model()
        
        # 1. Embed the Title
        title_text = str(product.title) if product.title else ""
        title_inputs = self.tokenizer(title_text, return_tensors="pt", truncation=True, padding=True, max_length=64)
        with torch.no_grad():
            title_outputs = self.model(**title_inputs)
        title_embed = title_outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        
        # 2. Embed the Description
        desc_text = str(product.description) if product.description else ""
        desc_inputs = self.tokenizer(desc_text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            desc_outputs = self.model(**desc_inputs)
        desc_embed = desc_outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        
        # 3. Weighted Combination (80% Title, 20% Description)
        weighted_embed = (0.8 * title_embed) + (0.2 * desc_embed)
        
        self.embeddings_cache[product.id] = weighted_embed
        return weighted_embed

    def precompute_all(self):
        """Precomputes embeddings for all products in the database."""
        products = Product.objects.all()
        for prod in products:
            self.get_embedding(prod)

    def recommend_similar(self, product, limit=4):
        target_embed = self.get_embedding(product)
        all_products = Product.objects.exclude(id=product.id)
        
        import re
        target_words = set(re.findall(r'\w+', str(product.title).lower()))
        stopwords = {"the", "and", "a", "an", "is", "with", "for", "to", "in", "of", "on", "pack", "set", "size", "color", "cm", "inch", "mm", "ml", "kg"}
        target_keywords = target_words - stopwords

        scores = []
        for prod in all_products:
            embed = self.get_embedding(prod)
            norm_target = np.linalg.norm(target_embed)
            norm_embed = np.linalg.norm(embed)
            if norm_target > 0 and norm_embed > 0:
                sim = np.dot(target_embed, embed) / (norm_target * norm_embed)
            else:
                sim = 0.0
                
            prod_words = set(re.findall(r'\w+', str(prod.title).lower()))
            prod_keywords = prod_words - stopwords
            shared_words = target_keywords & prod_keywords
            
            if len(shared_words) > 0:
                sim += 0.3 * min(len(shared_words), 3)
                
            scores.append((prod, sim))
            
        scores.sort(key=lambda x: x[1], reverse=True)
        return [item[0] for item in scores[:limit]]

    def recommend_for_user(self, user, limit=8):
        interacted_product_ids = set()
        
        wishlist_ids = user.wishlist.values_list('id', flat=True)
        interacted_product_ids.update(wishlist_ids)
        
        ordered_ids = OrderItem.objects.filter(order__user=user).values_list('product_id', flat=True)
        interacted_product_ids.update(ordered_ids)
        
        reviewed_ids = Review.objects.filter(user=user).values_list('product_id', flat=True)
        interacted_product_ids.update(reviewed_ids)
        
        if not interacted_product_ids:
            return self.get_fallback_recommendations(limit)
            
        interacted_products = Product.objects.filter(id__in=interacted_product_ids)
        user_vectors = [self.get_embedding(p) for p in interacted_products]
        user_profile = np.mean(user_vectors, axis=0)
        
        import re
        stopwords = {"the", "and", "a", "an", "is", "with", "for", "to", "in", "of", "on", "pack", "set", "size", "color", "cm", "inch", "mm", "ml", "kg"}
        user_keywords = set()
        for p in interacted_products:
            user_keywords.update(set(re.findall(r'\w+', str(p.title).lower())) - stopwords)

        candidate_products = Product.objects.exclude(id__in=interacted_product_ids)
        scores = []
        for prod in candidate_products:
            embed = self.get_embedding(prod)
            norm_user = np.linalg.norm(user_profile)
            norm_embed = np.linalg.norm(embed)
            if norm_user > 0 and norm_embed > 0:
                sim = np.dot(user_profile, embed) / (norm_user * norm_embed)
            else:
                sim = 0.0
                
            prod_words = set(re.findall(r'\w+', str(prod.title).lower()))
            prod_keywords = prod_words - stopwords
            shared_words = user_keywords & prod_keywords
            
            if len(shared_words) > 0:
                sim += 0.2 * min(len(shared_words), 4)
                
            scores.append((prod, sim))
            
        scores.sort(key=lambda x: x[1], reverse=True)
        return [item[0] for item in scores[:limit]]

    def get_fallback_recommendations(self, limit=8):
        """
        AI weightage score fallback:
        Weightage = 0.6 * Rating + 0.3 * Polarity + 0.1 * ln(Review Count + 1)
        """
        products = Product.objects.annotate(
            avg_polarity=Avg('reviews__polarity'),
            review_count=Count('reviews')
        )
        
        scored_products = []
        for product in products:
            rating = product.rating
            polarity = product.avg_polarity if product.avg_polarity is not None else 0.0
            review_count = product.review_count
            weightage = 0.6 * rating + 0.3 * polarity + 0.1 * np.log1p(review_count)
            scored_products.append((product, weightage))
            
        scored_products.sort(key=lambda x: x[1], reverse=True)
        return [p[0] for p in scored_products[:limit]]

recommender = Recommender()
