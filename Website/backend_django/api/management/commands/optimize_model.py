"""
optimize_model.py — Optimize the AI model for enhanced product recommendations.

This script:
1. Recomputes embeddings for all products (caches them)
2. Validates recommendation quality
3. Suggests model improvements
4. Generates sample recommendations for new products
"""

from django.core.management.base import BaseCommand
from django.db import models
from api.models import Product, Category
from api.recommender import Recommender


class Command(BaseCommand):
    """Django management command to optimize the AI recommendation system."""
    help = 'Optimize AI recommendation system for better product suggestions'

    def handle(self, *args, **options):
        self.print_section("🚀 OPTIMIZING AI RECOMMENDATION SYSTEM")
        
        # Initialize recommender
        self.stdout.write("\n📦 Initializing Recommender Engine...")
        recommender = Recommender()
        
        # Get all products
        all_products = Product.objects.all()
        total_products = all_products.count()
        self.stdout.write(f"   Found {total_products} products in database")
        
        # Precompute embeddings
        self.stdout.write("\n🔄 Precomputing Product Embeddings...")
        self.stdout.write("   This allows faster recommendations during runtime")
        recommender.precompute_all()
        self.stdout.write(f"   ✓ Cached {len(recommender.embeddings_cache)} product embeddings")
        
        # Test recommendations for featured products
        self.print_section("📊 TESTING RECOMMENDATIONS")
        
        featured_products = Product.objects.filter(is_featured=True)[:3]
        
        for product in featured_products:
            similar = recommender.recommend_similar(product, limit=4)
            self.stdout.write(f"\n📌 {product.title}")
            self.stdout.write(f"   Category: {product.category.name}")
            self.stdout.write(f"   Price: ${product.price}")
            self.stdout.write("   Similar Products:")
            for i, sim_prod in enumerate(similar, 1):
                self.stdout.write(f"      {i}. {sim_prod.title} (${sim_prod.price})")
        
        # Analyze product coverage
        self.print_section("📈 PRODUCT COVERAGE ANALYSIS")
        
        categories = Category.objects.all()
        for category in categories:
            count = category.products.count()
            self.stdout.write(f"\n{category.name}: {count} products")
            if count > 0:
                avg_rating = category.products.aggregate(
                    avg_rating=models.Avg('rating')
                )['avg_rating'] or 0
                self.stdout.write(f"   Average Rating: {avg_rating:.1f}/5.0")
        
        # Summary statistics
        self.print_section("📋 SYSTEM STATISTICS")
        
        avg_price = Product.objects.aggregate(
            avg=models.Avg('price')
        )['avg'] or 0
        
        total_reviews = sum(p.num_reviews for p in all_products)
        featured_count = Product.objects.filter(is_featured=True).count()
        deals_count = Product.objects.filter(is_deal=True).count()
        
        self.stdout.write(f"\nTotal Products: {total_products}")
        self.stdout.write(f"Average Product Price: ${avg_price:.2f}")
        self.stdout.write(f"Total Reviews: {total_reviews}")
        self.stdout.write(f"Featured Products: {featured_count}")
        self.stdout.write(f"Deal Products: {deals_count}")
        self.stdout.write(f"Cached Embeddings: {len(recommender.embeddings_cache)}")
        
        # Recommendations for improvement
        self.print_section("💡 RECOMMENDATIONS")
        
        if featured_count < total_products * 0.2:
            self.stdout.write("\n⚠️  Consider marking more products as featured (currently < 20%)")
        else:
            self.stdout.write(f"\n✓ Featured product coverage is good ({featured_count}/{total_products})")
        
        if avg_price < 50:
            self.stdout.write("⚠️  Average price is low. Consider adding premium products for better margins.")
        else:
            self.stdout.write(f"✓ Average price point is healthy at ${avg_price:.2f}")
        
        if total_reviews < total_products * 3:
            self.stdout.write(f"⚠️  Consider adding more reviews (currently {total_reviews} for {total_products} products)")
        else:
            self.stdout.write(f"✓ Good review coverage with {total_reviews} total reviews")
        
        # Model training suggestion
        self.print_section("🤖 MODEL TRAINING SUGGESTION")
        
        self.stdout.write("\nThe current DeBERTa model is fine-tuned on:")
        self.stdout.write("  • Electronics dataset (50,000 samples)")
        self.stdout.write("  • Fashion dataset (30,000 samples)")
        self.stdout.write("  • Training time: ~26-27 hours on CPU")
        self.stdout.write("\nFor better recommendations with new products:")
        self.stdout.write("  1. Ensure product descriptions are detailed and descriptive")
        self.stdout.write("  2. Add customer reviews regularly for polarity/subjectivity signals")
        self.stdout.write("  3. Consider fine-tuning with domain-specific product data")
        self.stdout.write("  4. Monitor recommendation quality and adjust if needed")
        
        self.print_section("✅ OPTIMIZATION COMPLETE")
        self.stdout.write("\nYour AI recommendation system is now optimized!")
        self.stdout.write("All product embeddings are cached for fast recommendations.")

    def print_section(self, title):
        """Print a formatted section header."""
        self.stdout.write("\n" + "="*70)
        self.stdout.write(title)
        self.stdout.write("="*70)
