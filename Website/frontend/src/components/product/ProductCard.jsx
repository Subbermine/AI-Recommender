import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../ui/Toast';
import Rating from '../ui/Rating';

const ProductCard = ({ product, viewMode = 'grid', isDark = false }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { showToast } = useToast();

  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined;
  
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const isWishlisted = isInWishlist(product._id);

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock === 0) {
      showToast('Out of stock', 'error');
      return;
    }

    addToCart({
      product: product._id,
      slug: product.slug,
      title: product.title,
      price: product.price,
      discountPrice: product.discountPrice,
      image: product.images[0],
      stock: product.stock,
      brand: product.brand,
    }, 1);

    showToast(`Added to cart!`, 'success');
  };

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product._id);
  };

  // GRID VIEW CARD
  if (viewMode === 'grid') {
    return (
      <div className={`group relative ${isDark ? 'bg-brand-cream/5 border-brand-sage/10' : 'bg-brand-cream border-brand-sage'} border-2 rounded-[32px] overflow-hidden shadow-premium shadow-premium-hover transition-all duration-500 flex flex-col h-full animate-fade-in`}>
        
        {/* Wishlist toggle overlay */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-4 right-4 z-10 p-2.5 rounded-2xl ${isDark ? 'bg-brand-navy/60 text-brand-cream/40' : 'bg-brand-cream/80 text-brand-navy/40 shadow-sm'} backdrop-blur-md hover:text-red-500 transition-all active:scale-90`}
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-4 left-4 z-10 bg-gradient-to-r from-rose-500 to-pink-500 text-brand-cream font-bold text-xs px-3 py-1 rounded-xl shadow-lg shadow-rose-500/20 uppercase tracking-wider">
            {discountPercent}% OFF
          </span>
        )}

        {/* Product Image */}
        <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden m-2 rounded-[24px]">
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-brand-cream text-brand-navy text-xs font-bold uppercase px-4 py-2 rounded-xl">
                Sold Out
              </span>
            </div>
          )}
        </Link>

        {/* Product Details */}
        <div className="p-6 pt-2 flex flex-col flex-grow gap-3">
          <div className="flex items-center justify-between">
            <span className={`text-xs uppercase font-bold tracking-[0.2em] ${isDark ? 'text-brand-brown' : 'text-brand-brown'}`}>
              {product.brand}
            </span>
          </div>

          <Link to={`/product/${product.slug}`} className="block group/title">
            <h3 className={`font-black text-sm ${isDark ? 'text-brand-cream' : 'text-brand-navy'} line-clamp-2 leading-snug group-hover/title:text-brand-brown transition-colors min-h-[40px]`}>
              {product.title}
            </h3>
          </Link>

          <Rating rating={product.rating} numReviews={product.numReviews} size={3} />

          {/* Pricing & Add to Cart */}
          <div className={`mt-auto pt-4 flex items-center justify-between gap-2 border-t ${isDark ? 'border-brand-sage/5' : 'border-brand-sage/20'}`}>
            <div className="flex flex-col">
              {hasDiscount ? (
                <>
                  <span className={`text-xs ${isDark ? 'text-brand-cream/40' : 'text-brand-navy/40'} font-bold line-through`}>₹{product.price.toFixed(2)}</span>
                  <span className={`text-lg font-black ${isDark ? 'text-brand-brown' : 'text-brand-navy'}`}>₹{product.discountPrice.toFixed(2)}</span>
                </>
              ) : (
                <span className={`text-lg font-black ${isDark ? 'text-brand-cream' : 'text-brand-navy'}`}>₹{product.price.toFixed(2)}</span>
              )}
            </div>

            <button
              onClick={handleAddToCartClick}
              disabled={product.stock === 0}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                product.stock === 0
                  ? 'bg-brand-sage text-brand-navy/20 cursor-not-allowed'
                  : isDark 
                    ? 'bg-brand-cream text-brand-navy hover:bg-brand-brown hover:text-brand-cream' 
                    : 'bg-brand-navy text-brand-cream hover:bg-brand-brown shadow-lg shadow-brand-navy/10'
              } active:scale-90`}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    );
  }

  // LIST VIEW CARD
  return (
    <div className={`group ${isDark ? 'bg-brand-cream/5 border-brand-sage/10' : 'bg-brand-cream border-slate-100'} border-2 rounded-[32px] overflow-hidden shadow-premium shadow-premium-hover transition-all duration-300 flex flex-col sm:flex-row gap-6 p-4 animate-fade-in`}>
      
      {/* Product Image Section */}
      <div className="relative w-full sm:w-56 aspect-square sm:h-48 shrink-0 overflow-hidden rounded-[24px]">
        {hasDiscount && (
          <span className="absolute top-3 left-3 z-10 bg-brand-brown/100 text-brand-cream font-bold text-xs px-3 py-1 rounded-xl shadow-lg shadow-rose-500/20 uppercase">
            {discountPercent}%
          </span>
        )}
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </Link>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-brand-cream text-brand-navy text-xs font-bold uppercase px-3 py-1.5 rounded-xl">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Description Section */}
      <div className="flex-1 flex flex-col gap-3 py-2 pr-4">
        <div className="flex items-center justify-between">
          <span className={`text-xs uppercase font-bold tracking-[0.2em] ${isDark ? 'text-indigo-400' : 'text-brand-brown'}`}>
            {product.brand}
          </span>
          <button
            onClick={handleWishlistClick}
            className={`p-2 rounded-xl ${isDark ? 'bg-slate-800 text-brand-navy/60' : 'bg-brand-cream/50 text-brand-navy/50'} hover:text-red-500 transition-colors active:scale-90`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        <Link to={`/product/${product.slug}`}>
          <h3 className={`font-black text-xl ${isDark ? 'text-brand-cream' : 'text-brand-navy'} hover:text-brand-brown transition-colors line-clamp-1`}>
            {product.title}
          </h3>
        </Link>

        <Rating rating={product.rating} numReviews={product.numReviews} size={3.5} />

        <p className={`text-sm ${isDark ? 'text-brand-navy/60' : 'text-brand-navy/60'} font-medium line-clamp-2 leading-relaxed`}>
          {product.description}
        </p>

        {/* Prices and add actions */}
        <div className={`mt-auto pt-4 flex items-center justify-between border-t ${isDark ? 'border-brand-sage/5' : 'border-slate-50'}`}>
          <div className="flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className={`text-2xl font-black ${isDark ? 'text-brand-cream' : 'text-brand-navy'}`}>₹{product.discountPrice.toFixed(2)}</span>
                <span className={`text-sm ${isDark ? 'text-brand-navy/60' : 'text-brand-navy/50'} font-bold line-through`}>₹{product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className={`text-2xl font-black ${isDark ? 'text-brand-cream' : 'text-brand-navy'}`}>₹{product.price.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCartClick}
            disabled={product.stock === 0}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-black transition-all ${
              product.stock === 0
                ? 'bg-brand-sage/40 text-brand-navy/50 cursor-not-allowed'
                : isDark 
                    ? 'bg-brand-cream text-brand-navy hover:bg-brand-brown hover:text-brand-cream' 
                    : 'bg-brand-navy text-brand-cream hover:bg-brand-brown shadow-lg shadow-slate-200'
            } active:scale-95`}
          >
            <ShoppingCart className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;

