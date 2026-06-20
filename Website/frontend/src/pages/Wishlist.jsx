import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

const Wishlist = () => {
  const { user } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const { showToast } = useToast();

  const handleRemove = async (productId, title) => {
    await toggleWishlist(productId);
    showToast(`Removed ${title} from wishlist`, 'info');
  };

  const handleAddToCart = (e, item) => {
    e.preventDefault();
    if (item.stock === 0) {
      showToast('Product is out of stock', 'error');
      return;
    }

    addToCart({
      product: item._id,
      slug: item.slug,
      title: item.title,
      price: item.price,
      discountPrice: item.discountPrice,
      image: item.images[0],
      stock: item.stock,
      brand: item.brand,
    }, 1);

    showToast(`Added ${item.title} to cart!`, 'success');
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-full bg-brand-brown/10 text-brand-brown inline-block">
          <Heart className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-lg text-brand-navy">Sign in to view your wishlist</h3>
        <p className="text-sm text-brand-navy/60 max-w-xs mx-auto">
          We keep track of your favorite items! Sign in to see what you saved.
        </p>
        <Link
          to="/login"
          className="inline-block bg-brand-brown hover:bg-brand-brown/80 text-brand-cream font-bold text-xs px-6 py-2.5 rounded-full transition-all mt-2"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <div>
        <Link to="/catalog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy/60 hover:text-brand-brown transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-navy leading-tight mt-4 mb-0">
          My Wishlist
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-brand-cream border border-brand-sage/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm animate-fade-in">
          <div className="p-4 rounded-full bg-brand-brown/10 text-brand-brown">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-brand-navy">Your wishlist is empty</h3>
          <p className="text-sm text-brand-navy/60 max-w-xs">
            Save items here that you love, and they will be waiting for you when you return.
          </p>
          <Link
            to="/catalog"
            className="bg-brand-brown hover:bg-brand-brown/80 text-brand-cream font-bold text-xs px-6 py-2.5 rounded-full transition-all mt-2"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <div
              key={item._id}
              className="group bg-brand-cream border border-brand-sage/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full animate-fade-in"
            >
              <Link to={`/product/${item.slug}`} className="block relative aspect-square bg-brand-sage/40 overflow-hidden">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </Link>

              <div className="p-4 flex flex-col flex-grow gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-brown bg-brand-brown/10 px-2 py-0.5 rounded-full self-start">
                  {item.brand}
                </span>

                <Link to={`/product/${item.slug}`} className="block">
                  <h3 className="font-bold text-xs text-brand-navy line-clamp-2 hover:text-brand-brown min-h-[32px]">
                    {item.title}
                  </h3>
                </Link>

                <div className="mt-auto pt-2 flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    {item.discountPrice ? (
                      <>
                        <span className="text-sm font-extrabold text-brand-brown">₹{item.discountPrice}</span>
                        <span className="text-[10px] text-brand-navy/60 line-through">₹{item.price}</span>
                      </>
                    ) : (
                      <span className="text-sm font-extrabold text-brand-navy">₹{item.price}</span>
                    )}
                  </div>

                  <div className="flex gap-2 border-t border-brand-cream pt-2.5">
                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      disabled={item.stock === 0}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-bold text-brand-cream transition-all ${
                        item.stock === 0
                          ? 'bg-brand-sage/40 text-brand-navy/60 cursor-not-allowed'
                          : 'bg-brand-brown hover:bg-brand-brown/80'
                      }`}
                    >
                      <ShoppingCart className="w-3 h-3" /> Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item._id, item.title)}
                      className="p-1.5 border border-brand-sage/40 text-brand-navy/60 hover:text-brand-brown rounded-xl hover:bg-brand-cream/50 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

