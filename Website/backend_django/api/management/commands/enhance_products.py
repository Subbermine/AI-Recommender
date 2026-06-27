"""
enhance_products.py — Add premium, high-quality products with AI-optimized descriptions.

This script adds complementary products across multiple categories (Electronics, Accessories, Home & Living)
with rich descriptions designed to work well with the DeBERTa semantic embedding recommendation system.

All products have:
- Detailed descriptions for better AI semantic understanding
- Rich specifications for the recommendation engine
- Appropriate pricing and discounts
- High-quality image URLs
- Featured/Deal tags for visibility
"""

import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from textblob import TextBlob
from api.models import Category, Product, Review, User

# ────────────────────────────────────────────────────────────────────
# Premium Products Data
# ────────────────────────────────────────────────────────────────────

ELECTRONICS_PRODUCTS = [
    {
        'title': 'Sony WH-1000XM5 Wireless Headphones',
        'description': 'Premium noise-canceling wireless headphones with industry-leading active noise cancellation. Features 30-hour battery life, touch sensor controls, multipoint connection for seamless device switching, and premium sound quality with LDAC support. Perfect for professionals and audiophiles seeking superior audio performance. Lightweight design with comfortable fit for extended listening sessions. Premium build quality with durable materials.',
        'price': 399.99,
        'discount_price': 349.99,
        'brand': 'Sony',
        'images': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Noise Cancellation', 'value': 'Active with dual noise sensor'},
            {'key': 'Battery Life', 'value': '30 hours (8 hours with ANC)'},
            {'key': 'Connectivity', 'value': 'Bluetooth 5.3, 3.5mm jack'},
            {'key': 'Driver', 'value': '40mm dynamic'},
            {'key': 'Weight', 'value': '250g'},
            {'key': 'Warranty', 'value': '2 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'Apple AirPods Pro (2nd Generation)',
        'description': 'Revolutionary in-ear earphones with advanced active noise cancellation and transparency mode. Features personalized audio experience with spatial audio and dynamic head tracking. Up to 6 hours of listening time on a single charge, with MagSafe charging case providing 30 hours total. Seamless integration with Apple devices. Water and sweat resistant design suitable for workouts and outdoor activities.',
        'price': 249.99,
        'discount_price': 199.99,
        'brand': 'Apple',
        'images': ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Type', 'value': 'In-ear wireless earphones'},
            {'key': 'Battery', 'value': '6 hours listening (30 with case)'},
            {'key': 'Noise Cancellation', 'value': 'Adaptive ANC'},
            {'key': 'Audio Features', 'value': 'Spatial Audio with Head Tracking'},
            {'key': 'Resistance', 'value': 'Water and sweat resistant'},
            {'key': 'Warranty', 'value': '1 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'Tablet iPad Air (5th Generation)',
        'description': 'Powerful 10.9-inch tablet featuring the M1 chip for exceptional performance. Perfect for creative professionals, students, and media consumption. Supports Apple Pencil for creative work and keyboard accessories for productivity. Stunning Liquid Retina display with ProMotion 60Hz refresh rate. All-day battery life and lightweight design. Great for video editing, design work, or casual browsing.',
        'price': 599.99,
        'discount_price': 549.99,
        'brand': 'Apple',
        'images': ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Display', 'value': '10.9-inch Liquid Retina'},
            {'key': 'Processor', 'value': 'M1 chip'},
            {'key': 'Storage', 'value': '256GB'},
            {'key': 'Battery', 'value': 'All-day battery life'},
            {'key': 'Cameras', 'value': '12MP wide and 12MP ultra-wide'},
            {'key': 'Connectivity', 'value': 'Wi-Fi 6E + Bluetooth 5.3'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'Samsung 4K Smart TV 65-inch',
        'description': 'Immersive 4K Ultra HD viewing experience with quantum dot technology delivering vivid colors and deep blacks. Features smart AI upscaling for non-4K content and game optimization mode for smooth gaming. Voice control integration with Alexa and Google Assistant. Sleek design with minimal bezels. Perfect for entertainment, sports, and gaming. Energy-efficient with modern connectivity options.',
        'price': 799.99,
        'discount_price': 649.99,
        'brand': 'Samsung',
        'images': ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Screen Size', 'value': '65-inch 4K UHD'},
            {'key': 'Resolution', 'value': '3840x2160p'},
            {'key': 'Refresh Rate', 'value': '120Hz'},
            {'key': 'Smart Features', 'value': 'Tizen OS, Voice Control'},
            {'key': 'Connectivity', 'value': 'HDMI 2.1, Wi-Fi 6, Bluetooth'},
            {'key': 'Warranty', 'value': '2 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'DJI Mini 3 Pro Drone',
        'description': 'Ultra-compact and lightweight drone perfect for travel and aerial photography. Features 4K camera with mechanical gimbal for stabilized footage. Obstacle avoidance system for safe flight. 38-minute max flight time with extended battery. Quick transmission video with 10km range. Ideal for vloggers, photographers, and drone enthusiasts. Portable design fits in a pocket.',
        'price': 499.99,
        'discount_price': 429.99,
        'brand': 'DJI',
        'images': ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Camera', 'value': '4K video + 48MP still'},
            {'key': 'Flight Time', 'value': '38 minutes'},
            {'key': 'Transmission Range', 'value': '10km'},
            {'key': 'Sensors', 'value': 'Obstacle avoidance'},
            {'key': 'Weight', 'value': '249g'},
            {'key': 'Warranty', 'value': '1 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'GoPro HERO11 Black Action Camera',
        'description': 'Professional-grade action camera with advanced 5.3K video recording and HyperSmooth stabilization. Rugged, waterproof design suitable for extreme sports and underwater activities. Real-time horizon leveling and low-light performance. Touchscreen interface with easy navigation. Perfect for vloggers, adventurers, and content creators. Wide range of mounting accessories available.',
        'price': 449.99,
        'discount_price': 389.99,
        'brand': 'GoPro',
        'images': ['https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Video Resolution', 'value': '5.3K60 + 2.7K240'},
            {'key': 'Stabilization', 'value': 'HyperSmooth 6.0'},
            {'key': 'Waterproof', 'value': '33 feet (10m) without housing'},
            {'key': 'Storage', 'value': 'MicroSD card'},
            {'key': 'Battery', 'value': 'Up to 2 hours recording'},
            {'key': 'Warranty', 'value': '1 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': False,
    },
    {
        'title': 'Laptop MacBook Pro 16-inch M3 Max',
        'description': 'Powerful laptop designed for professionals. Features stunning 16-inch Liquid Retina XDR display with ProMotion 120Hz. M3 Max chip with up to 12-core CPU and 18-core GPU for exceptional performance. 36GB unified memory and 1TB SSD storage. Excellent for video editing, 3D rendering, software development, and creative work. Sleek aluminum design with excellent keyboard and trackpad.',
        'price': 3499.99,
        'discount_price': 3249.99,
        'brand': 'Apple',
        'images': ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Display', 'value': '16-inch Liquid Retina XDR'},
            {'key': 'Processor', 'value': 'Apple M3 Max'},
            {'key': 'Memory', 'value': '36GB Unified'},
            {'key': 'Storage', 'value': '1TB SSD'},
            {'key': 'Battery', 'value': 'Up to 17 hours'},
            {'key': 'Warranty', 'value': '1 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
]

ACCESSORIES_PRODUCTS = [
    {
        'title': 'Premium Leather Crossbody Bag',
        'description': 'Elegant crossbody bag crafted from genuine Italian leather. Features adjustable shoulder strap, multiple compartments, and zippered pockets for organization. RFID-blocking technology protects your cards and documents. Perfect companion for travel or daily use. Durable construction ensures longevity. Sophisticated design complements any outfit from casual to formal occasions.',
        'price': 129.99,
        'discount_price': 99.99,
        'brand': 'Coach',
        'images': ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Material', 'value': 'Genuine Italian Leather'},
            {'key': 'Color Options', 'value': 'Black, Brown, Tan'},
            {'key': 'Capacity', 'value': 'Large'},
            {'key': 'Security', 'value': 'RFID blocking'},
            {'key': 'Strap', 'value': 'Adjustable crossbody'},
            {'key': 'Warranty', 'value': 'Lifetime leather care'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'Designer Watch Chronograph',
        'description': 'Sophisticated chronograph watch combining classic design with modern functionality. Stainless steel case with sapphire crystal for scratch resistance. Water-resistant up to 100 meters. Precision quartz movement ensures accurate timekeeping. Stylish design suitable for both professional and casual settings. Perfect gift for watch enthusiasts and professionals.',
        'price': 249.99,
        'discount_price': 199.99,
        'brand': 'Seiko',
        'images': ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Case Material', 'value': 'Stainless Steel'},
            {'key': 'Crystal', 'value': 'Sapphire'},
            {'key': 'Movement', 'value': 'Quartz'},
            {'key': 'Water Resistance', 'value': '100m'},
            {'key': 'Functions', 'value': 'Chronograph, Date'},
            {'key': 'Warranty', 'value': '2 Year International'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'Premium Silk Scarf Collection',
        'description': 'Collection of premium silk scarves crafted from 100% pure mulberry silk. Hand-rolled edges provide refined finish. Multiple patterns and colors to suit various styles and occasions. Versatile styling options: wear as headscarf, neck scarf, or hair accessory. Perfect gift. UV protection helps maintain vibrant colors. Suitable for professional and casual wear.',
        'price': 79.99,
        'discount_price': 59.99,
        'brand': 'Hermès-inspired',
        'images': ['https://images.unsplash.com/photo-1559526323-cb2586fe878a?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Material', 'value': '100% Mulberry Silk'},
            {'key': 'Size', 'value': '90x90cm'},
            {'key': 'Finish', 'value': 'Hand-rolled edges'},
            {'key': 'Patterns', 'value': 'Multiple designs'},
            {'key': 'Care', 'value': 'Dry clean recommended'},
            {'key': 'Origin', 'value': 'Premium quality'},
        ],
        'is_featured': False,
        'is_deal': True,
    },
    {
        'title': 'Luxury Sunglasses Aviator Style',
        'description': 'Timeless aviator sunglasses with premium materials and UV protection. Polarized lenses reduce glare and provide crystal-clear vision. Lightweight titanium frames for comfort during extended wear. Iconic style suitable for all face shapes. Perfect for outdoor activities, travel, or everyday wear. Includes premium case and cleaning cloth.',
        'price': 189.99,
        'discount_price': 149.99,
        'brand': 'Ray-Ban',
        'images': ['https://images.unsplash.com/photo-1511499767150-a48a237aa085?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Lens Material', 'value': 'Polarized glass'},
            {'key': 'Frame Material', 'value': 'Titanium alloy'},
            {'key': 'UV Protection', 'value': '100% UV400'},
            {'key': 'Lens Color', 'value': 'Brown gradient'},
            {'key': 'Style', 'value': 'Classic aviator'},
            {'key': 'Warranty', 'value': '1 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'Premium Jewelry Set 18K Gold',
        'description': 'Elegant jewelry set featuring 18K gold-plated pieces. Includes necklace, earrings, and bracelet with cubic zirconia stones for sparkle. Hypoallergenic materials suitable for sensitive skin. Versatile pieces that work for everyday wear or special occasions. Beautiful presentation box included. Perfect gift for loved ones. Durable construction with secure clasps.',
        'price': 159.99,
        'discount_price': 119.99,
        'brand': 'Various',
        'images': ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Material', 'value': '18K Gold Plated'},
            {'key': 'Stones', 'value': 'Cubic Zirconia'},
            {'key': 'Hypoallergenic', 'value': 'Nickel-free'},
            {'key': 'Set Includes', 'value': 'Necklace, Earrings, Bracelet'},
            {'key': 'Packaging', 'value': 'Luxury gift box'},
            {'key': 'Warranty', 'value': '2 Year manufacturer'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
]

HOME_LIVING_PRODUCTS = [
    {
        'title': 'Smart Home Security System',
        'description': 'Complete wireless security system for modern homes. Includes HD cameras, door/window sensors, and motion detectors. Smart hub with 24/7 monitoring and mobile app access. Night vision cameras for low-light surveillance. Easy installation without professional help. Integration with Alexa and Google Home for voice control. Peace of mind with remote monitoring capability.',
        'price': 399.99,
        'discount_price': 329.99,
        'brand': 'Ring',
        'images': ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Cameras', 'value': '2x 1080p HD'},
            {'key': 'Night Vision', 'value': 'Infrared'},
            {'key': 'Sensors', 'value': 'Door/window + motion'},
            {'key': 'Monitoring', 'value': '24/7 cloud storage'},
            {'key': 'Connectivity', 'value': 'Wi-Fi + cellular backup'},
            {'key': 'Warranty', 'value': '1 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'Premium Robot Vacuum Cleaner',
        'description': 'Intelligent robot vacuum with advanced mapping and obstacle avoidance. Powerful suction for carpets and hard floors. Smart scheduling and app control from anywhere. Automatic dust collection into base station reduces maintenance. Works with smart home systems for voice control. Battery lasts up to 2 hours per charge. Quiet operation with noise levels under 65dB.',
        'price': 599.99,
        'discount_price': 499.99,
        'brand': 'Roborock',
        'images': ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Suction Power', 'value': '4000Pa'},
            {'key': 'Battery Life', 'value': 'Up to 2 hours'},
            {'key': 'Mapping', 'value': 'LiDAR SLAM'},
            {'key': 'Navigation', 'value': 'AI obstacle avoidance'},
            {'key': 'Dustbin', 'value': 'Auto-emptying to base'},
            {'key': 'Warranty', 'value': '2 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'Smart WiFi Enabled Air Purifier',
        'description': 'Advanced air purification system for cleaner, healthier air. HEPA and activated carbon filters remove 99.97% of particles, allergens, and odors. Real-time air quality display with mobile app monitoring. Whisper-quiet operation. Energy-efficient with smart scheduling. Compatible with voice assistants. Filters last 6-12 months. Suitable for bedrooms, living rooms, and offices.',
        'price': 249.99,
        'discount_price': 199.99,
        'brand': 'Levoit',
        'images': ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Filter Type', 'value': 'HEPA + activated carbon'},
            {'key': 'Coverage', 'value': 'Up to 356 sq ft'},
            {'key': 'CADR', 'value': '240m³/h'},
            {'key': 'Noise Level', 'value': '22-45dB'},
            {'key': 'Smart Features', 'value': 'WiFi + app control'},
            {'key': 'Warranty', 'value': '3 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'Premium Memory Foam Mattress Queen',
        'description': 'Luxurious memory foam mattress designed for superior comfort and support. Gel-infused foam keeps you cool throughout the night. Responsive support layer maintains spinal alignment. Hypoallergenic materials resist dust mites and allergens. Motion isolation prevents sleep disruption from partner movement. Comes compressed in a box for easy delivery. 10-year warranty backing quality.',
        'price': 799.99,
        'discount_price': 649.99,
        'brand': 'Tempur-Pedic inspired',
        'images': ['https://images.unsplash.com/photo-1540932239986-310128078ceb?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Material', 'value': 'Gel-infused memory foam'},
            {'key': 'Firmness', 'value': 'Medium'},
            {'key': 'Height', 'value': '12 inches'},
            {'key': 'Cooling', 'value': 'Gel infused'},
            {'key': 'Motion Isolation', 'value': 'Excellent'},
            {'key': 'Warranty', 'value': '10 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
    {
        'title': 'Smart WiFi Thermostat',
        'description': 'Energy-efficient smart thermostat that learns your preferences and adjusts temperature automatically. Remote control via mobile app from anywhere. Compatible with most HVAC systems. Detailed energy reports help reduce bills. Works with Alexa and Google Home for voice control. Sleek design fits any home decor. Easy installation with step-by-step guidance. Reduces energy consumption by up to 15%.',
        'price': 249.99,
        'discount_price': 179.99,
        'brand': 'Nest',
        'images': ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=80'],
        'specs': [
            {'key': 'Learning Capability', 'value': 'AI-powered'},
            {'key': 'Compatibility', 'value': 'Most HVAC systems'},
            {'key': 'Remote Control', 'value': 'Mobile app'},
            {'key': 'Voice Control', 'value': 'Alexa & Google'},
            {'key': 'Energy Savings', 'value': 'Up to 15%'},
            {'key': 'Warranty', 'value': '2 Year Limited'},
        ],
        'is_featured': True,
        'is_deal': True,
    },
]

# ────────────────────────────────────────────────────────────────────
# Helper Functions
# ────────────────────────────────────────────────────────────────────

def _get_or_create_category(name: str, slug: str = None) -> Category:
    """Get or create a category."""
    if not slug:
        slug = slugify(name)
    category, created = Category.objects.get_or_create(
        slug=slug,
        defaults={
            'name': name,
            'image': f'https://images.unsplash.com/photo-1557821552-17105176677c?w=600&auto=format&fit=crop&q=80',
            'description': f'{name} products',
        }
    )
    return category


def _create_product(product_data: dict, category: Category) -> Product:
    """Create a product if it doesn't exist."""
    slug = slugify(product_data['title'])
    
    # Ensure unique slug
    base_slug = slug
    counter = 1
    while Product.objects.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    product, created = Product.objects.get_or_create(
        slug=slug,
        defaults={
            'title': product_data['title'],
            'description': product_data['description'],
            'price': product_data['price'],
            'discount_price': product_data.get('discount_price'),
            'category': category,
            'brand': product_data.get('brand', 'Premium Brand'),
            'images': product_data.get('images', []),
            'specifications': product_data.get('specs', []),
            'is_featured': product_data.get('is_featured', False),
            'is_deal': product_data.get('is_deal', False),
            'stock': 50,  # Default stock
            'rating': 4.8,  # High initial rating for premium products
            'num_reviews': 100,  # Assume good reviews
        }
    )
    
    if created:
        print(f"✓ Created: {product.title}")
    else:
        print(f"→ Already exists: {product.title}")
    
    return product


def _add_synthetic_reviews(product: Product, count: int = 3):
    """Add synthetic positive reviews to enhance AI recommendation."""
    admin_user = User.objects.filter(is_staff=True).first()
    if not admin_user:
        admin_user = User.objects.first()
    
    if not admin_user:
        # print(f"  ⚠ No admin user found, skipping reviews for {product.title}")
        return
    
    # Check if reviews already exist
    if product.reviews.count() >= count:
        return
    
    positive_comments = [
        "Excellent product! Exactly as described. Highly recommend.",
        "Outstanding quality and fast delivery. Very satisfied.",
        "Best purchase! Great value for money. Will buy again.",
        "Perfect! Exceeded my expectations. Amazing product.",
        "Love it! High-quality product. Great customer service.",
        "Fantastic! Works perfectly. Great investment.",
        "Highly satisfied! This product is outstanding.",
        "Excellent quality and fast shipping. Thumbs up!",
    ]
    
    for i in range(count - product.reviews.count()):
        comment = positive_comments[i % len(positive_comments)]
        sentiment = TextBlob(comment)
        
        Review.objects.get_or_create(
            product=product,
            user=admin_user,
            defaults={
                'user_name': 'Verified Buyer',
                'rating': 5,
                'comment': comment,
                'polarity': round(sentiment.sentiment.polarity, 4),
                'subjectivity': round(sentiment.sentiment.subjectivity, 4),
            }
        )


# ────────────────────────────────────────────────────────────────────
# Main Enhancement Command
# ────────────────────────────────────────────────────────────────────

class Command(BaseCommand):
    """Django management command to enhance products database."""
    help = 'Add premium, high-quality products with AI-optimized descriptions'

    def handle(self, *args, **options):
        self.stdout.write("\n" + "="*70)
        self.stdout.write("ENHANCING PRODUCT DATABASE WITH PREMIUM PRODUCTS")
        self.stdout.write("="*70 + "\n")
        
        # Create categories
        self.stdout.write("📁 Creating/Getting Categories...")
        electronics = _get_or_create_category('Electronics', 'electronics')
        accessories = _get_or_create_category('Accessories', 'accessories')
        home_living = _get_or_create_category('Home & Living', 'home-living')
        self.stdout.write("✓ Categories ready\n")
        
        # Add Electronics
        self.stdout.write("📱 Adding Premium Electronics...")
        for product_data in ELECTRONICS_PRODUCTS:
            product = _create_product(product_data, electronics)
            _add_synthetic_reviews(product, count=5)
        self.stdout.write()
        
        # Add Accessories
        self.stdout.write("👜 Adding Premium Accessories...")
        for product_data in ACCESSORIES_PRODUCTS:
            product = _create_product(product_data, accessories)
            _add_synthetic_reviews(product, count=4)
        self.stdout.write()
        
        # Add Home & Living
        self.stdout.write("🏠 Adding Home & Living Products...")
        for product_data in HOME_LIVING_PRODUCTS:
            product = _create_product(product_data, home_living)
            _add_synthetic_reviews(product, count=4)
        self.stdout.write()
        
        # Summary
        total_products = Product.objects.count()
        total_electronics = electronics.products.count()
        total_accessories = accessories.products.count()
        total_home = home_living.products.count()
        
        self.stdout.write("="*70)
        self.stdout.write("📊 ENHANCEMENT SUMMARY")
        self.stdout.write("="*70)
        self.stdout.write(f"Total Products in Database: {total_products}")
        self.stdout.write(f"  • Electronics: {total_electronics}")
        self.stdout.write(f"  • Accessories: {total_accessories}")
        self.stdout.write(f"  • Home & Living: {total_home}")
        self.stdout.write("\n✅ Database enhancement complete!")
        self.stdout.write("AI Recommender System is now ready with premium products.")
        self.stdout.write("="*70 + "\n")


def enhance_database():
    """Main function to enhance the database with premium products."""
    print("\n" + "="*70)
    print("ENHANCING PRODUCT DATABASE WITH PREMIUM PRODUCTS")
    print("="*70 + "\n")
    
    # Create categories
    print("📁 Creating/Getting Categories...")
    electronics = _get_or_create_category('Electronics', 'electronics')
    accessories = _get_or_create_category('Accessories', 'accessories')
    home_living = _get_or_create_category('Home & Living', 'home-living')
    print("✓ Categories ready\n")
    
    # Add Electronics
    print("📱 Adding Premium Electronics...")
    for product_data in ELECTRONICS_PRODUCTS:
        product = _create_product(product_data, electronics)
        _add_synthetic_reviews(product, count=5)
    print()
    
    # Add Accessories
    print("👜 Adding Premium Accessories...")
    for product_data in ACCESSORIES_PRODUCTS:
        product = _create_product(product_data, accessories)
        _add_synthetic_reviews(product, count=4)
    print()
    
    # Add Home & Living
    print("🏠 Adding Home & Living Products...")
    for product_data in HOME_LIVING_PRODUCTS:
        product = _create_product(product_data, home_living)
        _add_synthetic_reviews(product, count=4)
    print()
    
    # Summary
    total_products = Product.objects.count()
    total_electronics = electronics.products.count()
    total_accessories = accessories.products.count()
    total_home = home_living.products.count()
    
    print("="*70)
    print("📊 ENHANCEMENT SUMMARY")
    print("="*70)
    print(f"Total Products in Database: {total_products}")
    print(f"  • Electronics: {total_electronics}")
    print(f"  • Accessories: {total_accessories}")
    print(f"  • Home & Living: {total_home}")
    print("\n✅ Database enhancement complete!")
    print("AI Recommender System is now ready with premium products.")
    print("="*70 + "\n")


if __name__ == '__main__':
    enhance_database()
