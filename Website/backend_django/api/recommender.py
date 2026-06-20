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
        Computes combined DeBERTa embedding + sentiment polarity/subjectivity
        feature vector for a single product based on its title and description.
        Returns a numpy array of shape (770,).
        """
        if product.id in self.embeddings_cache:
            return self.embeddings_cache[product.id]

        self._lazy_load_model()
        text = f"{product.title} {product.description}"
        
        # Tokenize and run forward pass
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        # Extract mean pooled embedding (768,)
        embed = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
        
        # Extract polarity & subjectivity of description (2,)
        sentiment = TextBlob(product.description)
        polarity = sentiment.polarity
        subjectivity = sentiment.subjectivity
        
        # Combine to (770,)
        combined = np.hstack((embed, [polarity, subjectivity]))
        
        self.embeddings_cache[product.id] = combined
        return combined

    def precompute_all(self):
        """Precomputes embeddings for all products in the database."""
        products = Product.objects.all()
        for prod in products:
            self.get_embedding(prod)

    def recommend_similar(self, product, limit=4):
        """
        Recommends products similar to the given product using cosine similarity
        on the precomputed DeBERTa embeddings.
        """
        target_embed = self.get_embedding(product)
        all_products = Product.objects.exclude(id=product.id)
        
        scores = []
        for prod in all_products:
            embed = self.get_embedding(prod)
            # Calculate cosine similarity
            norm_target = np.linalg.norm(target_embed)
            norm_embed = np.linalg.norm(embed)
            if norm_target > 0 and norm_embed > 0:
                sim = np.dot(target_embed, embed) / (norm_target * norm_embed)
            else:
                sim = 0.0
            scores.append((prod, sim))
            
        # Sort descending by similarity
        scores.sort(key=lambda x: x[1], reverse=True)
        return [item[0] for item in scores[:limit]]

    def recommend_for_user(self, user, limit=8):
        """
        Recommends products based on user interests (wishlist, order items, or reviews).
        If no user history exists, falls back to the top products ranked by AI weightage score.
        """
        # Collect products user has interacted with
        interacted_product_ids = set()
        
        # 1. Wishlist
        wishlist_ids = user.wishlist.values_list('id', flat=True)
        interacted_product_ids.update(wishlist_ids)
        
        # 2. Ordered products
        ordered_ids = OrderItem.objects.filter(order__user=user).values_list('product_id', flat=True)
        interacted_product_ids.update(ordered_ids)
        
        # 3. Reviewed products
        reviewed_ids = Review.objects.filter(user=user).values_list('product_id', flat=True)
        interacted_product_ids.update(reviewed_ids)
        
        # Fallback if no user history or user is Anonymous
        if not interacted_product_ids:
            return self.get_fallback_recommendations(limit)
            
        # Compute user interest profile vector as the mean embedding of all interacted products
        interacted_products = Product.objects.filter(id__in=interacted_product_ids)
        user_vectors = [self.get_embedding(p) for p in interacted_products]
        user_profile = np.mean(user_vectors, axis=0)
        
        # Find similar products that the user has NOT interacted with
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
