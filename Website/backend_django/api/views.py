# pyrefly: ignore [missing-import]
import numpy as np
from datetime import datetime
from textblob import TextBlob
from django.db import models
from django.db.models import Q, Avg, Count, Sum
from django.db.models.functions import TruncDate
from django.utils.text import slugify
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import User, Address, Category, Product, Review, Order, OrderItem
from .serializers import (
    UserSerializer, AddressSerializer, CategorySerializer, ProductSerializer,
    ReviewSerializer, OrderSerializer
)
from .authentication import JWTAuthentication, generate_token

from django.middleware.csrf import get_token

# ... (other imports)

# ==========================================
# AUTH CONTROLLER VIEWS
# ==========================================

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_csrf_token(request):
    return Response({'csrfToken': get_token(request)})


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def register_user(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return Response({'message': 'Please enter all fields'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'message': 'User already exists with this email'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        name=name
    )

    serializer = UserSerializer(user)
    response_data = serializer.data
    response_data['token'] = generate_token(user.id)
    return Response(response_data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def login_user(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return Response({'message': 'Please enter email and password'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'message': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

    if user.is_blocked:
        return Response({'message': 'This account has been suspended. Please contact support.'}, status=status.HTTP_403_FORBIDDEN)

    if user.check_password(password):
        serializer = UserSerializer(user)
        response_data = serializer.data
        response_data['token'] = generate_token(user.id)
        return Response(response_data, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        data = request.data
        user.name = data.get('name', user.name)
        
        # Check if email is updated and unique
        email = data.get('email')
        if email and email != user.email:
            if User.objects.filter(email=email).exists():
                return Response({'message': 'Email is already in use'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = email
            user.username = email

        if data.get('password'):
            user.set_password(data.get('password'))

        # Update addresses list if provided
        if 'addresses' in data:
            # Delete existing non-default/all user addresses
            Address.objects.filter(user=user).delete()
            for addr in data['addresses']:
                Address.objects.create(
                    user=user,
                    street=addr.get('street'),
                    city=addr.get('city'),
                    state=addr.get('state'),
                    zip_code=addr.get('zipCode'),
                    country=addr.get('country'),
                    is_default=addr.get('isDefault', False)
                )

        user.save()
        serializer = UserSerializer(user)
        response_data = serializer.data
        response_data['token'] = generate_token(user.id)
        return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_user_wishlist(request):
    wishlist = request.user.wishlist.all()
    serializer = ProductSerializer(wishlist, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def toggle_wishlist(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    user = request.user
    if product in user.wishlist.all():
        user.wishlist.remove(product)
        return Response({'message': 'Product removed from wishlist', 'isWishlisted': False}, status=status.HTTP_200_OK)
    else:
        user.wishlist.add(product)
        return Response({'message': 'Product added to wishlist', 'isWishlisted': True}, status=status.HTTP_200_OK)


# ==========================================
# CATEGORY CONTROLLER VIEWS
# ==========================================

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ==========================================
# PRODUCT CONTROLLER VIEWS (WITH AI INTEGRATION)
# ==========================================

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_products(request):
    limit = int(request.query_params.get('limit', 12))
    page = int(request.query_params.get('page', 1))

    query = Q()

    # Keyword Search
    keyword = request.query_params.get('keyword')
    if keyword:
        query &= (
            Q(title__icontains=keyword) |
            Q(description__icontains=keyword) |
            Q(brand__icontains=keyword)
        )

    # Category Filter
    category = request.query_params.get('category')
    if category and category != 'all':
        try:
            # Check by slug
            cat_obj = Category.objects.get(slug=category)
            query &= Q(category=cat_obj)
        except Category.DoesNotExist:
            # Fallback to ID
            if category.isdigit():
                query &= Q(category_id=int(category))

    # Brand Filter
    brand = request.query_params.get('brand')
    if brand and brand != 'all':
        query &= Q(brand=brand)

    # Rating Filter
    rating = request.query_params.get('rating')
    if rating:
        query &= Q(rating__gte=float(rating))

    # Price Filter
    min_price = request.query_params.get('minPrice')
    max_price = request.query_params.get('maxPrice')
    if min_price:
        query &= Q(price__gte=float(min_price))
    if max_price:
        query &= Q(price__lte=float(max_price))

    products_qs = Product.objects.filter(query)

    # Sorting
    sort = request.query_params.get('sort')
    if sort == 'priceAsc':
        products_qs = products_qs.order_by('price')
    elif sort == 'priceDesc':
        products_qs = products_qs.order_by('-price')
    elif sort == 'ratingDesc':
        products_qs = products_qs.order_by('-rating')
    elif sort == 'newest':
        products_qs = products_qs.order_by('-created_at')
    else:
        products_qs = products_qs.order_by('-created_at')

    total_products = products_qs.count()
    
    # Pagination
    start = (page - 1) * limit
    end = start + limit
    paginated_products = products_qs[start:end]

    # Get distinct brands
    distinct_brands = Product.objects.values_list('brand', flat=True).distinct()

    serializer = ProductSerializer(paginated_products, many=True)
    return Response({
        'products': serializer.data,
        'page': page,
        'pages': int(np.ceil(total_products / limit)) if limit > 0 else 1,
        'totalProducts': total_products,
        'brands': list(distinct_brands)
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([])
def get_featured_products(request):
    """
    AI-driven recommendation logic. Recommends products based on user interests
    if authenticated, otherwise falls back to general weightage.
    """
    from .recommender import recommender
    if request.user and request.user.is_authenticated:
        recommended_products = recommender.recommend_for_user(request.user, limit=8)
    else:
        recommended_products = recommender.get_fallback_recommendations(limit=8)

    serializer = ProductSerializer(recommended_products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_similar_products(request, product_id):
    """
    Recommends products similar to the given product using cosine similarity
    on precomputed DeBERTa embeddings.
    """
    from .recommender import recommender
    product = get_object_or_404(Product, id=product_id)
    limit = int(request.query_params.get('limit', 4))
    similar_products = recommender.recommend_similar(product, limit=limit)
    serializer = ProductSerializer(similar_products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_deal_products(request):
    deals = Product.objects.filter(is_deal=True)[:8]
    serializer = ProductSerializer(deals, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([])
@permission_classes([])
def get_product_by_slug(request, slug):
    product = get_object_or_404(Product, slug=slug)
    reviews = Review.objects.filter(product=product).order_by('-created_at')
    
    product_serializer = ProductSerializer(product)
    reviews_serializer = ReviewSerializer(reviews, many=True)
    
    return Response({
        'product': product_serializer.data,
        'reviews': reviews_serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def create_product_review(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    user = request.user
    data = request.data

    rating = data.get('rating')
    comment = data.get('comment')

    if not rating or not comment:
        return Response({'message': 'Please provide rating and comment'}, status=status.HTTP_400_BAD_REQUEST)

    if Review.objects.filter(product=product, user=user).exists():
        return Response({'message': 'You have already reviewed this product'}, status=status.HTTP_400_BAD_REQUEST)

    # ----------------------------------------------------
    # AI INTEGRATION: Real-time Sentiment Analysis via TextBlob
    # ----------------------------------------------------
    sentiment = TextBlob(comment)
    polarity = sentiment.polarity          # float in [-1.0, 1.0]
    subjectivity = sentiment.subjectivity  # float in [0.0, 1.0]

    review = Review.objects.create(
        product=product,
        user=user,
        user_name=user.name,
        rating=int(rating),
        comment=comment,
        polarity=polarity,
        subjectivity=subjectivity
    )

    # Recalculate average rating of the product
    reviews = Review.objects.filter(product=product)
    product.num_reviews = reviews.count()
    product.rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0
    product.save()

    serializer = ReviewSerializer(review)
    return Response({
        'message': 'Review added successfully',
        'review': serializer.data,
        'productRating': product.rating,
        'productNumReviews': product.num_reviews
    }, status=status.HTTP_201_CREATED)


# ==========================================
# ORDER CONTROLLER VIEWS
# ==========================================

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def add_order_items(request):
    data = request.data
    order_items = data.get('orderItems')

    if not order_items or len(order_items) == 0:
        return Response({'message': 'No items in order'}, status=status.HTTP_400_BAD_REQUEST)

    # Create order object
    order = Order.objects.create(
        user=request.user,
        shipping_address=data.get('shippingAddress'),
        payment_method=data.get('paymentMethod', 'Credit Card'),
        items_price=float(data.get('itemsPrice', 0.0)),
        shipping_price=float(data.get('shippingPrice', 0.0)),
        tax_price=float(data.get('taxPrice', 0.0)),
        total_price=float(data.get('totalPrice', 0.0))
    )

    # Create order items and adjust stock
    for item in order_items:
        product = get_object_or_404(Product, id=int(item.get('product')))
        OrderItem.objects.create(
            order=order,
            product=product,
            title=item.get('title'),
            quantity=int(item.get('quantity')),
            price=float(item.get('price')),
            image=item.get('image')
        )
        
        # Decrement stock
        product.stock = max(0, product.stock - int(item.get('quantity')))
        product.save()

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_my_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_order_by_id(request, pk):
    order = get_object_or_404(Order, id=pk)
    
    if order.user.id == request.user.id or request.user.is_staff:
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Access denied: Unauthorized view request'}, status=status.HTTP_403_FORBIDDEN)


# ==========================================
# ADMIN CONTROLLER VIEWS
# ==========================================

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_analytics(request):
    total_orders = Order.objects.count()
    total_products = Product.objects.count()
    total_users = User.objects.count()
    total_sales = Order.objects.aggregate(Sum('total_price'))['total_price__sum'] or 0.0

    # Sales over time (Truncate date and group by date)
    sales_qs = Order.objects.annotate(date_str=TruncDate('created_at')) \
                            .values('date_str') \
                            .annotate(sales=Sum('total_price'), ordersCount=Count('id')) \
                            .order_by('date_str')[:10]

    sales_over_time = []
    for item in sales_qs:
        sales_over_time.append({
            '_id': item['date_str'].strftime('%Y-%m-%d') if item['date_str'] else 'Unknown',
            'sales': item['sales'] or 0.0,
            'ordersCount': item['ordersCount']
        })

    # Category distribution
    cat_qs = Product.objects.values('category__name') \
                            .annotate(count=Count('id'))
    category_distribution = []
    for item in cat_qs:
        category_distribution.append({
            'categoryName': item['category__name'] or 'Unknown',
            'count': item['count']
        })

    return Response({
        'summary': {
            'totalSales': total_sales,
            'totalOrders': total_orders,
            'totalProducts': total_products,
            'totalUsers': total_users
        },
        'salesOverTime': sales_over_time,
        'categoryDistribution': category_distribution
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_users(request):
    users = User.objects.all().order_by('-date_joined')
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def toggle_block_user(request, user_id):
    user = get_object_or_404(User, id=user_id)

    if user.is_staff and user.id == request.user.id:
        return Response({'message': 'Administrators cannot suspend their own account'}, status=status.HTTP_400_BAD_REQUEST)

    user.is_blocked = not user.is_blocked
    user.save()

    serializer = UserSerializer(user)
    return Response({
        'message': f"User {user.name} has been {'suspended' if user.is_blocked else 're-activated'} successfully",
        'user': serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_product(request):
    data = request.data
    title = data.get('title')
    description = data.get('description')
    price = data.get('price')
    category_id = data.get('categoryId')
    category_name = data.get('categoryName')
    brand = data.get('brand')
    stock = data.get('stock')
    images = data.get('images', [])
    specifications = data.get('specifications', [])
    is_featured = data.get('isFeatured', False)
    is_deal = data.get('isDeal', False)

    final_category = None
    if category_id:
        final_category = get_object_or_404(Category, id=int(category_id))
    elif category_name:
        final_category = Category.objects.filter(name=category_name).first()

    if not final_category:
        return Response({'message': 'Valid Category ID or Category Name is required'}, status=status.HTTP_400_BAD_REQUEST)

    generated_slug = slugify(title) + '-' + str(np.random.randint(1000, 9999))

    product = Product.objects.create(
        title=title,
        slug=generated_slug,
        description=description,
        price=float(price or 0),
        discount_price=float(data['discountPrice']) if data.get('discountPrice') else None,
        images=images if len(images) > 0 else ['/images/placeholder.jpg'],
        category=final_category,
        brand=brand,
        stock=int(stock or 0),
        specifications=specifications,
        is_featured=is_featured,
        is_deal=is_deal
    )

    serializer = ProductSerializer(product)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    data = request.data

    product.title = data.get('title', product.title)
    product.description = data.get('description', product.description)
    if 'price' in data:
        product.price = float(data['price'])
    if 'discountPrice' in data:
        product.discount_price = float(data['discountPrice']) if data['discountPrice'] else None
    product.images = data.get('images', product.images)
    product.brand = data.get('brand', product.brand)
    if 'stock' in data:
        product.stock = int(data['stock'])
    product.specifications = data.get('specifications', product.specifications)
    product.is_featured = data.get('isFeatured', product.is_featured)
    product.is_deal = data.get('isDeal', product.is_deal)

    if 'categoryId' in data:
        product.category = get_object_or_404(Category, id=int(data['categoryId']))

    if 'title' in data and data['title'] != product.title:
        product.slug = slugify(data['title']) + '-' + str(np.random.randint(1000, 9999))

    product.save()
    serializer = ProductSerializer(product)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_product(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    
    # Cascade delete reviews
    Review.objects.filter(product=product).delete()
    product.delete()

    return Response({'message': 'Product and associated reviews deleted successfully'}, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_orders(request):
    orders = Order.objects.all().order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_order_status(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    status_val = request.data.get('status')

    if status_val:
        order.status = status_val

        if status_val == 'Delivered':
            order.is_delivered = True
            order.delivered_at = datetime.now()
            order.is_paid = True
            order.paid_at = datetime.now()
        elif status_val == 'Cancelled':
            # Revert stock
            for item in order.order_items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save()

        order.save()

    serializer = OrderSerializer(order)
    return Response(serializer.data, status=status.HTTP_200_OK)
