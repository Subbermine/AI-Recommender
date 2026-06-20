import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, CreditCard, MapPin, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/Toast';
import API from '../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, totals, clearCart, shippingAddress, saveShippingAddress } = useCart();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('USA');

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defAddress = user.addresses.find((addr) => addr.isDefault) || user.addresses[0];
      setStreet(defAddress.street);
      setCity(defAddress.city);
      setState(defAddress.state);
      setZipCode(defAddress.zipCode);
      setCountry(defAddress.country);
    } else if (shippingAddress) {
      setStreet(shippingAddress.street);
      setCity(shippingAddress.city);
      setState(shippingAddress.state);
      setZipCode(shippingAddress.zipCode);
      setCountry(shippingAddress.country);
    }
  }, [user, shippingAddress]);

  useEffect(() => {
    if (cartItems.length === 0 && step !== 3) {
      navigate('/cart');
    }
  }, [cartItems, step, navigate]);

  const selectSavedAddress = (addr) => {
    setStreet(addr.street);
    setCity(addr.city);
    setState(addr.state);
    setZipCode(addr.zipCode);
    setCountry(addr.country);
    showToast('Applied delivery address', 'success');
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!street.trim()) newErrors.street = 'Street address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!state.trim()) newErrors.state = 'State / Province is required';
    if (!zipCode.trim()) newErrors.zipCode = 'ZIP / Postal code is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct the validation errors', 'error');
      return;
    }

    setErrors({});
    saveShippingAddress({ street, city, state, zipCode, country });
    setStep(2);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!cardHolder.trim()) newErrors.cardHolder = 'Cardholder name is required';
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }
    if (!expiry.trim() || !/^\d{2}\/\d{2}?/.test(expiry)) {
      newErrors.expiry = 'Expiry must be in MM/YY format';
    }
    if (!cvc.trim() || cvc.length !== 3) {
      newErrors.cvc = 'CVC must be 3 digits';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fill out the mock card details', 'error');
      return;
    }

    setErrors({});
    
    try {
      setLoading(true);
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          image: item.image,
          price: item.discountPrice !== null && item.discountPrice !== undefined ? item.discountPrice : item.price,
          product: item.product,
        })),
        shippingAddress: {
          street,
          city,
          state,
          zipCode,
          country,
        },
        paymentMethod: 'Credit Card',
        paymentResult: {
          id: 'pay_mock_' + Math.random().toString(36).substring(2, 12),
          status: 'success',
          update_time: new Date().toISOString(),
          email_address: user?.email || 'customer@apexbuy.com',
        },
        itemsPrice: totals.itemsPrice,
        shippingPrice: totals.shippingPrice,
        taxPrice: totals.taxPrice,
        totalPrice: totals.totalPrice,
      };

      const { data } = await API.post('/orders', orderPayload);
      setOrderId(data._id);
      clearCart();
      setStep(3);
      showToast('Order placed successfully! Thank you.', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Checkout failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="flex justify-center">
          <div className="p-4 bg-brand-brown/10  text-brand-brown rounded-full animate-bounce">
            <CheckCircle2 className="w-16 h-16" />
          </div>
        </div>
        
        <h1 className="font-display font-black text-3xl text-brand-navy  my-0">
          Order Confirmed!
        </h1>
        
        <p className="text-brand-navy/60  text-sm max-w-sm mx-auto leading-relaxed">
          Your order has been placed successfully. A digital receipt has been dispatched, and our warehouse is preparing your shipment.
        </p>

        {orderId && (
          <div className="bg-brand-cream/50  border border-brand-sage/40  p-4 rounded-2xl text-xs max-w-xs mx-auto">
            <p className="font-bold text-brand-navy/60 ">Order Reference</p>
            <p className="font-mono text-brand-brown font-bold mt-1">{orderId}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center pt-4">
          <Link
            to="/orders"
            className="bg-brand-brown hover:bg-brand-violet text-brand-cream font-bold text-xs px-6 py-2.5 rounded-full transition-all"
          >
            Track My Order
          </Link>
          <Link
            to="/catalog"
            className="border border-brand-sage/40  text-brand-navy/60  font-bold text-xs px-6 py-2.5 rounded-full hover:bg-brand-cream/50 :bg-brand-dark-border transition-all"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <div className="flex items-center gap-2 text-xs font-semibold text-brand-navy/60 pb-2 border-b border-gray-50 ">
        <span className={step === 1 ? 'text-brand-brown font-bold' : 'text-brand-navy/60'}>1. Delivery Info</span>
        <ChevronRight className="w-4 h-4" />
        <span className={step === 2 ? 'text-brand-brown font-bold' : 'text-brand-navy/60'}>2. Secure Payment</span>
        <ChevronRight className="w-4 h-4" />
        <span>3. Finish</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <div className="bg-brand-cream  border border-brand-sage/40  rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-brown" />
                <h2 className="font-display font-bold text-xl text-brand-navy  my-0">Shipping Destination</h2>
              </div>

              {user && user.addresses && user.addresses.length > 0 && (
                <div className="space-y-2.5">
                  <p className="text-xs font-bold text-brand-navy/60 uppercase tracking-wider">Select Saved Address</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {user.addresses.map((addr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectSavedAddress(addr)}
                        className="text-left p-3.5 border border-brand-sage/40  rounded-2xl hover:border-brand-brown hover:bg-brand-brown/5 transition-all text-xs space-y-1"
                      >
                        <p className="font-bold text-brand-navy ">
                          {addr.street} {addr.isDefault && <span className="text-[9px] bg-brand-brown/10 text-brand-brown px-1.5 py-0.5 rounded ml-1 font-extrabold uppercase">Default</span>}
                        </p>
                        <p className="text-brand-navy/60">{addr.city}, {addr.state} {addr.zipCode}</p>
                        <p className="text-brand-navy/60">{addr.country}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleShippingSubmit} className="space-y-4 pt-2">
                <p className="text-xs font-bold text-brand-navy/60 uppercase tracking-wider">Or Enter Address Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-brand-navy/60">Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full p-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
                    />
                    {errors.street && <p className="text-[10px] text-brand-brown font-semibold">{errors.street}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-navy/60">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
                    />
                    {errors.city && <p className="text-[10px] text-brand-brown font-semibold">{errors.city}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-navy/60">State / Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
                    />
                    {errors.state && <p className="text-[10px] text-brand-brown font-semibold">{errors.state}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-navy/60">ZIP / Postal Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full p-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
                    />
                    {errors.zipCode && <p className="text-[10px] text-brand-brown font-semibold">{errors.zipCode}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-navy/60">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
                    >
                      <option value="USA">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-brown hover:bg-brand-violet text-brand-cream font-bold py-3.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 text-sm mt-4"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className="bg-brand-cream  border border-brand-sage/40  rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-brand-brown" />
                  <h2 className="font-display font-bold text-xl text-brand-navy  my-0">Payment Details</h2>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-brand-brown hover:underline font-bold"
                >
                  Edit Address
                </button>
              </div>

              <div className="bg-slate-900 text-brand-cream rounded-2xl p-5 space-y-6 shadow-inner relative overflow-hidden max-w-sm">
                <div className="absolute right-4 top-4 text-brand-navy  opacity-20">
                  <CreditCard className="w-24 h-24" />
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs uppercase tracking-widest text-brand-navy/50">APEX SECURE</span>
                  <span className="text-emerald-400 font-extrabold text-[10px] uppercase flex items-center gap-1 bg-brand-brown/100/10 px-2 py-0.5 rounded-full"><ShieldCheck className="w-3.5 h-3.5" /> Encrypted</span>
                </div>
                <div className="font-mono text-base tracking-widest pt-2">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex justify-between text-xs pt-1">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-brand-navy/50 font-bold">Holder</p>
                    <p className="font-bold">{cardHolder || 'NAME HERE'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-brand-navy/50 font-bold">Expires</p>
                    <p className="font-bold">{expiry || 'MM/YY'}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-navy/60">Cardholder Name</label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full p-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
                  />
                  {errors.cardHolder && <p className="text-[10px] text-brand-brown font-semibold">{errors.cardHolder}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-navy/60">Credit Card Number</label>
                  <input
                    type="text"
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                      const formatted = raw.match(/.{1,4}/g)?.join(' ') || '';
                      setCardNumber(formatted);
                    }}
                    className="w-full p-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
                  />
                  {errors.cardNumber && <p className="text-[10px] text-brand-brown font-semibold">{errors.cardNumber}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-navy/60">Expiration Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        if (raw.length <= 2) {
                          setExpiry(raw);
                        } else {
                          setExpiry(raw.slice(0, 2) + '/' + raw.slice(2, 4));
                        }
                      }}
                      className="w-full p-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
                    />
                    {errors.expiry && <p className="text-[10px] text-brand-brown font-semibold">{errors.expiry}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-brand-navy/60">Security Code (CVC)</label>
                    <input
                      type="password"
                      placeholder="•••"
                      maxLength={3}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      className="w-full p-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy "
                    />
                    {errors.cvc && <p className="text-[10px] text-brand-brown font-semibold">{errors.cvc}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-indigo to-brand-violet hover:from-brand-indigo hover:to-brand-violet text-brand-cream font-bold py-3.5 rounded-xl shadow-md hover:shadow transition-all flex items-center justify-center gap-1.5 text-sm mt-4"
                >
                  {loading ? 'Processing Order...' : `Pay ₹${totals.totalPrice.toFixed(2)}`}
                </button>
              </form>
            </div>
          )}
        </div>

        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-brand-cream  border border-brand-sage/40  rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-base text-brand-navy  pb-2 border-b border-gray-50 ">
              Checkout Bag
            </h3>
            
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {cartItems.map((item) => {
                const activePrice = item.discountPrice !== null && item.discountPrice !== undefined ? item.discountPrice : item.price;
                return (
                  <div key={item.product} className="flex gap-3 items-center text-xs">
                    <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-lg bg-brand-cream/50 shrink-0 border border-brand-sage/40 " />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-navy  truncate">{item.title}</p>
                      <p className="text-brand-navy/60">{item.quantity} x ₹{activePrice.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <hr className="border-gray-50 " />

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Subtotal</span>
                <span className="font-semibold text-brand-navy ">₹{totals.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Shipping</span>
                <span className="font-semibold text-brand-navy ">{totals.shippingPrice === 0 ? 'FREE' : `₹${totals.shippingPrice.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-navy/60">Estimated Tax</span>
                <span className="font-semibold text-brand-navy ">₹{totals.taxPrice.toFixed(2)}</span>
              </div>
              <hr className="border-gray-50 " />
              <div className="flex justify-between text-sm font-bold text-brand-navy ">
                <span>Total</span>
                <span className="text-brand-brown">₹{totals.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;

