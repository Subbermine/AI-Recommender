import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

const statusConfig = {
  pending:    { label: 'Pending',    color: 'bg-amber-50 text-amber-600 border-amber-200  ',    Icon: Clock },
  processing: { label: 'Processing', color: 'bg-blue-50 text-blue-600 border-blue-200  ',         Icon: Clock },
  shipped:    { label: 'Shipped',    color: 'bg-brand-brown/10 text-brand-brown border-brand-brown/20',                                   Icon: Truck },
  delivered:  { label: 'Delivered',  color: 'bg-brand-brown/10 text-emerald-600 border-emerald-200  ', Icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  color: 'bg-brand-brown/10 text-rose-600 border-rose-200  ',          Icon: XCircle },
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/orders/myorders');
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-brand-navy/60">Please <Link to="/login" className="text-brand-brown font-bold hover:underline">sign in</Link> to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy/60 hover:text-brand-brown transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-brand-navy  leading-tight mt-4 mb-0">
          Order History
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 rounded-2xl shimmer" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-brand-cream  border border-brand-sage/40  rounded-3xl p-12 text-center flex flex-col items-center gap-4 shadow-sm">
          <div className="p-4 rounded-full bg-brand-brown/10 text-brand-brown">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-lg text-brand-navy ">No orders yet</h3>
          <p className="text-sm text-brand-navy/60 max-w-xs">You haven't placed any orders. Explore our catalog to find something you love!</p>
          <Link to="/catalog" className="bg-brand-brown hover:bg-brand-violet text-brand-cream font-bold text-xs px-6 py-2.5 rounded-full transition-all mt-2">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const status = statusConfig[order.status] || statusConfig['pending'];
            const StatusIcon = status.Icon;

            return (
              <div key={order._id} className="bg-brand-cream  border border-brand-sage/40  rounded-2xl shadow-sm overflow-hidden animate-fade-in">
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  className="w-full p-5 flex flex-col sm:flex-row sm:items-center gap-4 text-left hover:bg-brand-cream/50/50 :bg-brand-dark-border/20 transition-colors"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" /> {status.label}
                      </span>
                      <span className="text-xs text-brand-navy/60">#{order._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-brand-navy/60 ">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-brand-navy/60">Total</p>
                      <p className="font-extrabold text-base text-brand-navy ">₹{order.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-brand-navy/60">Items</p>
                      <p className="font-bold text-sm text-brand-navy/60 ">{order.orderItems.length}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-brand-navy/60 shrink-0" /> : <ChevronDown className="w-5 h-5 text-brand-navy/60 shrink-0" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-brand-sage/40  p-5 space-y-5 animate-fade-in">
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-navy/60">Order Items</p>
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-brand-sage/40  shrink-0 bg-brand-cream/50" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-brand-navy  truncate">{item.title}</p>
                            <p className="text-xs text-brand-navy/60">{item.quantity} × ₹{item.price.toFixed(2)}</p>
                          </div>
                          <p className="text-sm font-bold text-brand-navy/60  shrink-0">₹{(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50 ">
                      <div className="space-y-2 text-xs">
                        <p className="font-bold uppercase tracking-wider text-brand-navy/60">Price Summary</p>
                        <div className="flex justify-between text-brand-navy/60 "><span>Subtotal</span><span>₹{order.itemsPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between text-brand-navy/60 "><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toFixed(2)}`}</span></div>
                        <div className="flex justify-between text-brand-navy/60 "><span>Tax</span><span>₹{order.taxPrice.toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold text-sm text-brand-navy  pt-1 border-t border-brand-sage/40 "><span>Total</span><span className="text-brand-brown">₹{order.totalPrice.toFixed(2)}</span></div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <p className="font-bold uppercase tracking-wider text-brand-navy/60">Shipping To</p>
                        <address className="not-italic text-brand-navy/60  space-y-0.5">
                          <p>{order.shippingAddress.street}</p>
                          <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                          <p>{order.shippingAddress.country}</p>
                        </address>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;

