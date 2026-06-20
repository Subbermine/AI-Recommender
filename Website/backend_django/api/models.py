from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    is_blocked = models.BooleanField(default=False)
    wishlist = models.ManyToManyField('Product', blank=True, related_name='wishlisted_by')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    zip_code = models.CharField(max_length=50)
    country = models.CharField(max_length=255)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.street}, {self.city}"

class Category(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True, db_index=True)
    image = models.TextField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, db_index=True)
    description = models.TextField()
    price = models.FloatField(default=0.0)
    discount_price = models.FloatField(blank=True, null=True)
    images = models.JSONField(default=list)  # Stores a list of image URLs
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.CharField(max_length=255)
    stock = models.IntegerField(default=0)
    rating = models.FloatField(default=0.0)
    num_reviews = models.IntegerField(default=0)
    specifications = models.JSONField(default=list)  # List of dicts: [{"key": "Material", "value": "100% Cotton"}]
    is_featured = models.BooleanField(default=False)
    is_deal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Review(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    user_name = models.CharField(max_length=255)
    rating = models.IntegerField()
    comment = models.TextField()
    
    # AI Sentiment metrics calculated dynamically on submission
    polarity = models.FloatField(default=0.0)
    subjectivity = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'user')

    def __str__(self):
        return f"{self.user_name} - {self.product.title} ({self.rating})"

class Order(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Processing', 'Processing'),
        ('Shipped', 'Shipped'),
        ('Delivered', 'Delivered'),
        ('Cancelled', 'Cancelled'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    shipping_address = models.JSONField()  # street, city, state, zipCode, country
    payment_method = models.CharField(max_length=100, default='Credit Card')
    payment_result = models.JSONField(blank=True, null=True)  # id, status, updateTime, emailAddress
    items_price = models.FloatField(default=0.0)
    shipping_price = models.FloatField(default=0.0)
    tax_price = models.FloatField(default=0.0)
    total_price = models.FloatField(default=0.0)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(blank=True, null=True)
    is_delivered = models.BooleanField(default=False)
    delivered_at = models.DateTimeField(blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.email}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, blank=True, null=True)
    title = models.CharField(max_length=255)
    quantity = models.IntegerField()
    price = models.FloatField()
    image = models.TextField()

    def __str__(self):
        return f"{self.quantity} x {self.title}"
