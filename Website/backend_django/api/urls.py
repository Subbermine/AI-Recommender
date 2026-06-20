from django.urls import path
from . import views

urlpatterns = [
    # Auth endpoints
    path('auth/register', views.register_user, name='register'),
    path('auth/login', views.login_user, name='login'),
    path('auth/csrf-token', views.get_csrf_token, name='csrf_token'),
    path('auth/profile', views.user_profile, name='profile'),
    path('auth/wishlist', views.get_user_wishlist, name='wishlist'),
    path('auth/wishlist/<int:product_id>', views.toggle_wishlist, name='toggle_wishlist'),

    # Category endpoints
    path('categories', views.get_categories, name='categories'),

    # Product endpoints
    path('products', views.get_products, name='products'),
    path('products/featured', views.get_featured_products, name='featured_products'),
    path('products/deals', views.get_deal_products, name='deal_products'),
    path('products/<slug:slug>', views.get_product_by_slug, name='product_by_slug'),
    path('products/<int:product_id>/similar', views.get_similar_products, name='similar_products'),
    path('products/<int:product_id>/reviews', views.create_product_review, name='create_review'),

    # Order endpoints
    path('orders', views.add_order_items, name='add_order'),
    path('orders/myorders', views.get_my_orders, name='my_orders'),
    path('orders/<int:pk>', views.get_order_by_id, name='order_by_id'),

    # Admin endpoints
    path('admin/analytics', views.get_analytics, name='admin_analytics'),
    path('admin/users', views.get_users, name='admin_users'),
    path('admin/users/<int:user_id>/block', views.toggle_block_user, name='toggle_block_user'),
    path('admin/products', views.create_product, name='admin_create_product'),
    path('admin/products/<int:product_id>', views.update_product, name='admin_update_product'),
    path('admin/products/<int:product_id>/delete', views.delete_product, name='admin_delete_product'),
    path('admin/orders', views.get_orders, name='admin_orders'),
    path('admin/orders/<int:order_id>/status', views.update_order_status, name='admin_update_order_status'),
]
