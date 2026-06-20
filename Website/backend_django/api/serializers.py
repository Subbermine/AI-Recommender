from rest_framework import serializers
from .models import User, Address, Category, Product, Review, Order, OrderItem

class AddressSerializer(serializers.ModelSerializer):
    zipCode = serializers.CharField(source='zip_code')
    isDefault = serializers.BooleanField(source='is_default')

    class Meta:
        model = Address
        fields = ['id', 'street', 'city', 'state', 'zipCode', 'country', 'isDefault']

class UserSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()
    isAdmin = serializers.BooleanField(source='is_staff')
    addresses = AddressSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ['_id', 'name', 'email', 'isAdmin', 'addresses']

    def get__id(self, obj):
        return str(obj.id)

class CategorySerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['_id', 'name', 'slug', 'image', 'description']

    def get__id(self, obj):
        return str(obj.id)

class ProductSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()
    discountPrice = serializers.FloatField(source='discount_price', allow_null=True)
    numReviews = serializers.IntegerField(source='num_reviews')
    isFeatured = serializers.BooleanField(source='is_featured')
    isDeal = serializers.BooleanField(source='is_deal')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    category = CategorySerializer(read_only=True)
    categoryId = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            '_id', 'title', 'slug', 'description', 'price', 'discountPrice',
            'images', 'category', 'categoryId', 'brand', 'stock', 'rating', 'numReviews',
            'specifications', 'isFeatured', 'isDeal', 'createdAt', 'updatedAt'
        ]

    def get__id(self, obj):
        return str(obj.id)

    def get_categoryId(self, obj):
        return str(obj.category.id) if obj.category else None

class ReviewSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()
    userName = serializers.CharField(source='user_name')
    product = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Review
        fields = ['_id', 'product', 'user', 'userName', 'rating', 'comment', 'polarity', 'subjectivity', 'createdAt']

    def get__id(self, obj):
        return str(obj.id)

    def get_product(self, obj):
        return str(obj.product.id)

    def get_user(self, obj):
        return str(obj.user.id)

class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['product', 'title', 'quantity', 'price', 'image']

    def get_product(self, obj):
        return str(obj.product.id) if obj.product else None

class OrderSerializer(serializers.ModelSerializer):
    _id = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    orderItems = OrderItemSerializer(many=True, source='order_items', read_only=True)
    shippingAddress = serializers.JSONField(source='shipping_address')
    paymentMethod = serializers.CharField(source='payment_method')
    paymentResult = serializers.JSONField(source='payment_result', allow_null=True)
    itemsPrice = serializers.FloatField(source='items_price')
    shippingPrice = serializers.FloatField(source='shipping_price')
    taxPrice = serializers.FloatField(source='tax_price')
    totalPrice = serializers.FloatField(source='total_price')
    isPaid = serializers.BooleanField(source='is_paid')
    paidAt = serializers.DateTimeField(source='paid_at', allow_null=True)
    isDelivered = serializers.BooleanField(source='is_delivered')
    deliveredAt = serializers.DateTimeField(source='delivered_at', allow_null=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Order
        fields = [
            '_id', 'user', 'orderItems', 'shippingAddress', 'paymentMethod',
            'paymentResult', 'itemsPrice', 'shippingPrice', 'taxPrice', 'totalPrice',
            'isPaid', 'paidAt', 'isDelivered', 'deliveredAt', 'status', 'createdAt'
        ]

    def get__id(self, obj):
        return str(obj.id)

    def get_user(self, obj):
        return {
            '_id': str(obj.user.id),
            'name': obj.user.name,
            'email': obj.user.email
        }
