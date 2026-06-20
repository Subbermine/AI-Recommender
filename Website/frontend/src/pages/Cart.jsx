import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart, ShoppingBag, ArrowRight, Bookmark } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/Toast';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, savedItems, updateCartQty, removeFromCart, saveForLater, moveToCart, totals } = useCart();
  const { showToast } = useToast();

  const handleQtyChange = (productId, val) => {
    updateCartQty(productId, Number(val));
    showToast('Cart quantity updated', 'success');
  };

  const handleRemove = (productId, title) => {
    removeFromCart(productId);
    showToast(`Removed ${title} from cart`, 'info');
  };

  const handleSaveForLater = (productId, title) => {
    saveForLater(productId);
    showToast(`Saved ${title} for later`, 'info');
  };

  const handleMoveToCart = (productId, title) => {
    moveToCart(productId);
    showToast(`Moved ${title} back to cart`, 'success');
  };

  const handleCheckoutClick = () => {
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-navy  leading-tight my-0">
          Shopping Cart
        </h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-brand-cream  border border-brand-sage/40  rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
          <div className="p-4 rounded-full bg-brand-brown/10 text-brand-brown">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-brand-navy ">Your cart is empty</h3>
          <p className="text-sm text-brand-navy/60  max-w-xs">
            Looks like you haven't added anything to your cart yet. Head back to the shop to find items!
          </p>
          <Link
            to="/catalog"
            className="bg-brand-brown hover:bg-brand-violet text-brand-cream font-bold text-xs px-6 py-2.5 rounded-full transition-all mt-2"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const activePrice = item.discountPrice !== null && item.discountPrice !== undefined ? item.discountPrice : item.price;
              
              return (
                <div
                  key={item.product}
                  className="bg-brand-cream  border border-brand-sage/40  rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm animate-fade-in"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-xl shrink-0 bg-brand-cream/50 border border-brand-sage/40 "
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase font-bold tracking-wider text-brand-brown bg-brand-brown/10 px-2 py-0.5 rounded-full">
                      {item.brand}
                    </span>
                    <Link to={`/product/${item.slug}`} className="block mt-1">
                      <h3 className="font-bold text-sm text-brand-navy  truncate hover:text-brand-brown">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-brand-navy/60 mt-0.5">Price: ₹{activePrice.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto shrink-0 justify-between sm:justify-end border-t sm:border-0 pt-3 sm:pt-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-brand-navy/60 mr-1">Qty</span>
                      <select
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(item.product, e.target.value)}
                        className="bg-brand-cream/50  border border-brand-sage/40  text-brand-navy/60  text-xs font-bold px-2 py-1 rounded-lg focus:outline-none"
                      >
                        {Array.from({ length: Math.min(10, item.stock) }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="font-extrabold text-sm text-brand-navy ">
                        ₹{(activePrice * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveForLater(item.product, item.title)}
                        className="p-2 text-brand-navy/60 hover:text-brand-brown rounded-lg hover:bg-brand-cream/50 :bg-brand-dark-border transition-colors"
                        title="Save for Later"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemove(item.product, item.title)}
                        className="p-2 text-brand-navy/60 hover:text-brand-brown rounded-lg hover:bg-brand-cream/50 :bg-brand-dark-border transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1 bg-brand-cream  border border-brand-sage/40  rounded-3xl p-6 shadow-sm space-y-6">
            <h2 className="font-display font-bold text-xl text-brand-navy  pb-3 border-b border-brand-sage/40 ">
              Order Summary
            </h2>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-navy/60 ">Items Subtotal</span>
                <span className="font-semibold text-brand-navy ">₹{totals.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60 ">Estimated Shipping</span>
                <span className="font-semibold text-brand-navy ">
                  {totals.shippingPrice === 0 ? (
                    <span className="text-brand-brown font-bold">FREE</span>
                  ) : (
                    `₹${totals.shippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60 ">Estimated Tax (15%)</span>
                <span className="font-semibold text-brand-navy ">₹{totals.taxPrice.toFixed(2)}</span>
              </div>

              {totals.shippingPrice > 0 && (
                <div className="bg-brand-brown/5 border border-brand-brown/10 p-3 rounded-2xl text-xs text-brand-brown">
                  Tip: Add <span className="font-bold">₹{(100 - totals.itemsPrice).toFixed(2)}</span> more to qualify for <span className="font-bold">FREE SHIPPING</span>.
                </div>
              )}

              <hr className="border-brand-sage/40 " />

              <div className="flex justify-between text-base">
                <span className="font-bold text-brand-navy ">Total Price</span>
                <span className="font-black text-brand-brown text-lg">₹{totals.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutClick}
              className="w-full bg-gradient-to-r from-brand-indigo to-brand-violet hover:from-brand-indigo hover:to-brand-violet text-brand-cream font-bold py-3.5 rounded-2xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all text-sm"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {savedItems.length > 0 && (
        <section className="space-y-4 pt-8 border-t border-brand-sage/40 ">
          <div>
            <h2 className="font-display font-bold text-xl text-brand-navy ">Saved for Later</h2>
            <p className="text-xs text-brand-navy/60">Items you marked to purchase at another time</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedItems.map((item) => (
              <div
                key={item.product}
                className="bg-brand-cream  border border-brand-sage/40  rounded-2xl p-4 flex gap-4 items-center shadow-sm animate-fade-in"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-14 h-14 object-cover rounded-lg shrink-0 bg-brand-cream/50"
                />

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs text-brand-navy  truncate">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-navy/60 mt-0.5">₹{item.price}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleMoveToCart(item.product, item.title)}
                    className="flex items-center gap-1 bg-brand-brown/10 text-brand-brown hover:bg-brand-brown text-xs font-bold px-3 py-1.5 rounded-lg hover:text-brand-cream transition-colors"
                  >
                    Move to Cart
                  </button>
                  <button
                    onClick={() => {}}
                    className="p-1.5 text-brand-navy/60 hover:text-brand-brown rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Cart;

