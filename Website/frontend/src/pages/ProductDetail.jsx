import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, PackageCheck, AlertCircle, ShieldAlert, ArrowLeft, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/Toast';
import API from '../utils/api';
import Rating from '../components/ui/Rating';
import ProductCard from '../components/product/ProductCard';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductDetails = async () => {
      let currentProductId = null;
      try {
        setLoading(true);
        const { data: productData } = await API.get(`/products/${slug}`);
        setProduct(productData.product);
        setReviews(productData.reviews);
        setActiveImage(productData.product.images[0]);
        currentProductId = productData.product._id;
      } catch (err) {
        console.error('Failed to load product details', err);
        showToast('Product not found', 'error');
        navigate('/catalog');
      } finally {
        setLoading(false);
      }

      // Fetch similar products separately so it doesn't block the main UI loading
      if (currentProductId) {
        try {
          const { data: similarData } = await API.get(`/products/${currentProductId}/similar?limit=4`);
          setSimilarProducts(similarData);
        } catch (err) {
          console.error('Failed to load similar products', err);
        }
      }
    };

    fetchProductDetails();
  }, [slug, navigate, showToast]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="h-8 w-24 shimmer rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square shimmer rounded-2xl" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 shimmer rounded-xl" />
            <div className="h-6 w-1/4 shimmer rounded-lg" />
            <div className="h-24 w-full shimmer rounded-2xl" />
            <div className="h-12 w-1/3 shimmer rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined;
  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      showToast('Product is out of stock', 'error');
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
    }, quantity);

    showToast(`Added ${quantity} x ${product.title} to your cart!`, 'success');
  };

  const handleWishlistClick = async () => {
    await toggleWishlist(product._id);
    showToast(
      isWishlisted 
        ? `Removed ${product.title} from wishlist` 
        : `Added ${product.title} to wishlist`,
      'info'
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);

    if (newComment.trim().length < 5) {
      setReviewError('Review comment must be at least 5 characters long');
      return;
    }

    try {
      setReviewLoading(true);
      const { data } = await API.post(`/products/${product._id}/reviews`, {
        rating: newRating,
        comment: newComment.trim(),
      });
      
      setReviews([data.review, ...reviews]);
      setProduct((prev) => ({
        ...prev,
        rating: data.productRating,
        numReviews: data.productNumReviews,
      }));

      showToast('Review submitted successfully!', 'success');
      setNewComment('');
      setNewRating(5);
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-16">
      <div>
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm font-black text-brand-navy/50 hover:text-brand-brown transition-all group">
          <div className="p-2 rounded-xl bg-brand-sage/40 group-hover:bg-brand-brown/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Shop
        </Link>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-6">
          <div className="aspect-square bg-brand-cream border-2 border-slate-100 rounded-[40px] overflow-hidden relative shadow-premium p-4">
            <img src={activeImage} alt={product.title} className="w-full h-full object-cover rounded-[32px] hover:scale-105 transition-transform duration-700" />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-brand-navy/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-brand-cream text-brand-navy font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-widest">Out of Stock</span>
              </div>
            )}
          </div>
          
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 px-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 h-24 rounded-[20px] overflow-hidden border-2 transition-all shrink-0 p-1 ${
                    activeImage === img ? 'border-brand-brown shadow-lg shadow-indigo-100' : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover rounded-[16px]" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-10 py-4">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="text-xs uppercase font-bold tracking-[0.25em] text-brand-brown px-4 py-1.5 rounded-full bg-brand-brown/10 border border-brand-brown/20">
                {product.brand}
              </span>
              <span className="text-sm text-brand-navy/60 font-bold uppercase tracking-widest">
                {product.category.name}
              </span>
            </div>

            <h1 className="font-sans font-black text-4xl sm:text-5xl text-brand-navy leading-[1.1] tracking-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-4">
              <Rating rating={product.rating} numReviews={product.numReviews} size={5} />
              <div className="h-4 w-[1px] bg-slate-200" />
              <span className="text-xs font-bold text-brand-brown uppercase tracking-widest">{product.numReviews} Reviews</span>
            </div>
          </div>

          <div className="p-8 rounded-[32px] bg-brand-navy text-brand-cream space-y-6 shadow-2xl shadow-slate-200">
            <div className="space-y-1">
              <p className="text-xs uppercase font-bold text-brand-navy/50 tracking-[0.2em]">Premium Price</p>
              <div className="flex items-baseline gap-4">
                {hasDiscount ? (
                  <>
                    <span className="text-5xl font-black text-brand-cream">₹{product.discountPrice.toFixed(2)}</span>
                    <span className="text-lg text-brand-navy/60 line-through font-bold">₹{product.price.toFixed(2)}</span>
                    <div className="ml-2 bg-brand-brown/100 text-brand-cream text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Save ₹{ (product.price - product.discountPrice).toFixed(2) }
                    </div>
                  </>
                ) : (
                  <span className="text-5xl font-black text-brand-cream">₹{product.price.toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {product.stock > 10 ? (
                <div className="flex items-center gap-2 bg-brand-brown/100/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 text-xs font-bold uppercase tracking-widest">
                  <PackageCheck className="w-4 h-4" /> Ready to Ship
                </div>
              ) : product.stock > 0 ? (
                <div className="flex items-center gap-2 bg-brand-brown/10 text-brand-brown px-4 py-2 rounded-xl border border-amber-500/20 text-xs font-bold uppercase tracking-widest">
                  <AlertCircle className="w-4 h-4" /> Only {product.stock} Left
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-brand-brown/100/10 text-brand-brown px-4 py-2 rounded-xl border border-rose-500/20 text-xs font-bold uppercase tracking-widest">
                  <ShieldAlert className="w-4 h-4" /> Out of Stock
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-brand-navy/60 uppercase tracking-[0.25em]">Description</h3>
            <p className="text-base text-brand-navy font-medium leading-relaxed max-w-xl">
              {product.description}
            </p>
          </div>

          {product.stock > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch gap-4 pt-6">
              <div className="relative group">
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="appearance-none w-full sm:w-28 bg-brand-cream border-2 border-slate-100 text-brand-navy text-sm font-black pl-6 pr-10 py-4 rounded-[20px] focus:outline-none focus:border-brand-brown focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer shadow-sm"
                >
                  {Array.from({ length: Math.min(10, product.stock) }).map((_, idx) => (
                    <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-navy/50 pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary py-4 px-10 text-base"
              >
                <ShoppingCart className="w-5 h-5" /> Add to Shopping Bag
              </button>
              
              <button
                onClick={handleWishlistClick}
                className={`p-4 rounded-[20px] border-2 transition-all active:scale-90 shadow-sm ${
                  isWishlisted 
                    ? 'border-brand-brown/20 text-brand-brown bg-brand-brown/10 shadow-rose-100' 
                    : 'border-slate-100 text-brand-navy/50 hover:text-brand-navy hover:bg-brand-cream/50'
                }`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </section>

      {product.specifications && product.specifications.length > 0 && (
        <section className="bg-brand-cream border-2 border-slate-100 rounded-[40px] p-8 sm:p-12 shadow-premium space-y-10">
          <div className="space-y-2">
             <span className="text-[10px] uppercase font-black text-brand-brown tracking-[0.3em]">Technical Details</span>
             <h2 className="font-sans font-black text-3xl text-brand-navy tracking-tight">Specifications</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {product.specifications.map((spec, idx) => (
              <div key={idx} className="flex items-center justify-between py-4 border-b border-slate-50 group hover:border-brand-brown/20 transition-colors">
                <span className="text-sm font-black text-brand-navy/50 uppercase tracking-widest">{spec.key}</span>
                <span className="text-sm font-bold text-brand-navy">{spec.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-brand-cream border-2 border-slate-100 rounded-[40px] p-10 shadow-premium space-y-8">
            <h2 className="font-sans font-black text-xl text-brand-navy uppercase tracking-[0.2em]">Overall Rating</h2>
            <div className="flex items-center gap-8">
              <span className="text-7xl font-black text-brand-navy tracking-tighter">{product.rating.toFixed(1)}</span>
              <div className="space-y-2">
                <Rating rating={product.rating} size={5} />
                <p className="text-xs text-brand-navy/50 font-black uppercase tracking-widest">{product.numReviews} Global Reviews</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-cream border-2 border-slate-100 rounded-[40px] p-10 shadow-premium space-y-8">
            <h3 className="font-sans font-black text-sm text-brand-navy uppercase tracking-[0.2em]">Write a Review</h3>
            
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-brand-navy/50 tracking-widest ml-1">Your Rating</label>
                  <div className="p-4 bg-brand-cream/50 rounded-2xl inline-block">
                    <Rating rating={newRating} interactive={true} onChange={setNewRating} size={6} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black text-brand-navy/50 tracking-widest ml-1">Experience</label>
                  <textarea
                    rows={5}
                    placeholder="Tell the community about your experience..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-6 bg-brand-cream/50 border-2 border-transparent rounded-[24px] text-sm font-bold focus:outline-none focus:border-brand-brown focus:bg-brand-cream transition-all text-brand-navy placeholder:text-brand-navy/60"
                  />
                </div>

                {reviewError && <p className="text-xs text-brand-brown font-black bg-brand-brown/10 p-4 rounded-xl border border-brand-brown/20">{reviewError}</p>}

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-full bg-brand-navy hover:bg-brand-brown text-brand-cream font-black text-xs py-4 rounded-[20px] transition-all shadow-xl active:scale-95 uppercase tracking-[0.2em]"
                >
                  {reviewLoading ? 'Posting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-6">
                <p className="text-sm text-brand-navy/60 font-bold">Please sign in to provide feedback on this item.</p>
                <Link
                  to="/login"
                  className="inline-block bg-brand-navy text-brand-cream font-black text-xs px-10 py-4 rounded-[20px] shadow-xl hover:bg-brand-brown transition-all"
                >
                  Sign In to Review
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <h2 className="font-sans font-black text-3xl text-brand-navy tracking-tight">Verified Feedback</h2>
          
          {reviews.length === 0 ? (
            <div className="bg-brand-cream border-2 border-slate-100 border-dashed rounded-[40px] p-24 text-center text-brand-navy/60 font-black uppercase tracking-widest">
              No reviews available yet
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-brand-cream border-2 border-slate-100 rounded-[32px] p-8 space-y-5 shadow-premium group hover:border-brand-brown/20 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-brand-sage/40 flex items-center justify-center text-brand-navy font-black text-sm">
                         {rev.userName.charAt(0).toUpperCase()}
                       </div>
                       <span className="font-black text-base text-brand-navy">{rev.userName}</span>
                    </div>
                    <span className="text-[10px] font-black text-brand-navy/60 uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="px-1">
                    <Rating rating={rev.rating} size={3} />
                  </div>
                  <p className="text-base text-brand-navy/60 font-medium leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="space-y-12 pt-16 border-t border-slate-100">
          <div className="flex flex-col items-center text-center space-y-3">
             <span className="text-brand-brown font-black text-[11px] uppercase tracking-[0.3em]">Curated Picks</span>
             <h2 className="font-sans font-black text-3xl sm:text-4xl text-brand-navy tracking-tight">Similar Premium Items</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {similarProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;

