import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BarChart3, Users, Package, ShoppingBag, DollarSign,
  Shield, Ban, Check, Trash2, Plus, Edit, X, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import API from '../utils/api';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('analytics');

  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '', brand: '', description: '', price: '', discountPrice: '',
    stock: '', category: '', images: '', isFeatured: false,
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTab = async (tab) => {
    setLoading(true);
    try {
      if (tab === 'analytics') {
        const { data } = await API.get('/admin/analytics');
        setAnalytics(data);
      } else if (tab === 'users') {
        const { data } = await API.get('/admin/users');
        setUsers(data);
      } else if (tab === 'products') {
        const { data } = await API.get('/products?limit=50');
        setProducts(data.products);
      } else if (tab === 'orders') {
        const { data } = await API.get('/admin/orders');
        setOrders(data);
      }
    } catch (err) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/'); return; }
    fetchTab(activeTab);
  }, [user, activeTab, navigate]);

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data)).catch(() => { });
  }, []);

  const handleToggleBlock = async (userId, isBlocked) => {
    try {
      await API.put(`/admin/users/${userId}/block`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
      showToast(`User ${isBlocked ? 'unblocked' : 'blocked'} successfully`, 'success');
    } catch { showToast('Action failed', 'error'); }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      showToast('Order status updated', 'success');
    } catch { showToast('Failed to update status', 'error'); }
  };

  const resetProductForm = () => {
    setProductForm({ title: '', brand: '', description: '', price: '', discountPrice: '', stock: '', category: '', images: '', isFeatured: false });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      brand: product.brand,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || '',
      stock: product.stock,
      category: product.category?._id || product.category,
      images: product.images?.join(', ') || '',
      isFeatured: product.isFeatured || false,
    });
    setShowProductForm(true);
  };

  const handleProductSave = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price || !productForm.stock || !productForm.category) {
      showToast('Please fill all required fields', 'error'); return;
    }
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : null,
        stock: Number(productForm.stock),
        images: productForm.images.split(',').map(s => s.trim()).filter(Boolean),
      };
      if (editingProduct) {
        await API.put(`/admin/products/${editingProduct._id}`, payload);
        showToast('Product updated!', 'success');
      } else {
        await API.post('/admin/products', payload);
        showToast('Product created!', 'success');
      }
      resetProductForm();
      fetchTab('products');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await API.delete(`/admin/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      showToast('Product deleted', 'info');
    } catch { showToast('Delete failed', 'error'); }
  };

  const inputCls = 'w-full p-2.5 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy ';

  const tabs = [
    { id: 'analytics', label: 'Analytics', Icon: BarChart3 },
    { id: 'products', label: 'Products', Icon: Package },
    { id: 'orders', label: 'Orders', Icon: ShoppingBag },
    { id: 'users', label: 'Users', Icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Admin Portal</span>
          </div>
          <h1 className="font-display font-black text-3xl text-brand-navy  my-0">Dashboard</h1>
        </div>
        <Link to="/" className="text-xs font-bold text-brand-navy/60 hover:text-brand-brown">← Storefront</Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === id
                ? 'bg-brand-brown text-brand-cream shadow-sm'
                : 'bg-brand-cream  border border-brand-sage/40  text-brand-navy/60  hover:text-brand-brown'
              }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          {loading || !analytics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl shimmer" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: `₹${analytics.totalRevenue?.toFixed(2) ?? '0.00'}`, Icon: DollarSign, color: 'text-brand-brown bg-brand-brown/10 ' },
                  { label: 'Total Orders', value: analytics.totalOrders ?? 0, Icon: ShoppingBag, color: 'text-blue-500 bg-blue-50 ' },
                  { label: 'Total Products', value: analytics.totalProducts ?? 0, Icon: Package, color: 'text-brand-brown bg-brand-brown/10 ' },
                  { label: 'Total Users', value: analytics.totalUsers ?? 0, Icon: Users, color: 'text-amber-500 bg-amber-50 ' },
                ].map(({ label, value, Icon, color }) => (
                  <div key={label} className="bg-brand-cream  border border-brand-sage/40  rounded-2xl p-5 shadow-sm space-y-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-2xl font-black text-brand-navy ">{value}</p>
                      <p className="text-xs text-brand-navy/60">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {analytics.recentOrders?.length > 0 && (
                <div className="bg-brand-cream  border border-brand-sage/40  rounded-2xl p-5 shadow-sm">
                  <h3 className="font-bold text-sm text-brand-navy  mb-4">Recent Orders</h3>
                  <div className="space-y-2">
                    {analytics.recentOrders.map((o) => (
                      <div key={o._id} className="flex items-center justify-between text-xs py-2 border-b border-gray-50  last:border-0">
                        <span className="font-mono text-brand-navy/60">#{o._id.slice(-8).toUpperCase()}</span>
                        <span className="text-brand-navy/60 ">{o.user?.name || 'Unknown'}</span>
                        <span className="font-bold text-brand-navy ">₹{o.totalPrice?.toFixed(2)}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold capitalize ${o.status === 'delivered' ? 'bg-brand-brown/10 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{o.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <button
              onClick={() => { resetProductForm(); setShowProductForm(true); }}
              className="flex items-center gap-1.5 bg-brand-brown hover:bg-brand-violet text-brand-cream font-bold text-xs px-4 py-2 rounded-xl transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Product
            </button>
          </div>

          {showProductForm && (
            <div className="bg-brand-cream  border border-brand-brown/20 rounded-2xl p-6 shadow-md space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-brand-navy ">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                <button onClick={resetProductForm} className="text-brand-navy/60 hover:text-brand-navy/60"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleProductSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-brand-navy/60">Title *</label>
                  <input value={productForm.title} onChange={e => setProductForm(p => ({ ...p, title: e.target.value }))} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-navy/60">Brand *</label>
                  <input value={productForm.brand} onChange={e => setProductForm(p => ({ ...p, brand: e.target.value }))} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-navy/60">Category *</label>
                  <select value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-navy/60">Price (₹) *</label>
                  <input type="number" value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-navy/60">Discount Price (₹)</label>
                  <input type="number" value={productForm.discountPrice} onChange={e => setProductForm(p => ({ ...p, discountPrice: e.target.value }))} className={inputCls} placeholder="Optional" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-navy/60">Stock *</label>
                  <input type="number" value={productForm.stock} onChange={e => setProductForm(p => ({ ...p, stock: e.target.value }))} className={inputCls} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-brand-navy/60">Image URLs (comma-separated)</label>
                  <input value={productForm.images} onChange={e => setProductForm(p => ({ ...p, images: e.target.value }))} className={inputCls} placeholder="https://..." />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-brand-navy/60">Description</label>
                  <textarea rows={3} value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={productForm.isFeatured} onChange={e => setProductForm(p => ({ ...p, isFeatured: e.target.checked }))} className="accent-brand-indigo" />
                  <label htmlFor="featured" className="text-xs font-semibold text-brand-navy/60">Mark as Featured</label>
                </div>
                <div className="sm:col-span-2 flex gap-3 pt-2">
                  <button type="submit" className="bg-brand-brown hover:bg-brand-violet text-brand-cream font-bold text-xs px-6 py-2 rounded-xl transition-all">
                    {editingProduct ? 'Update' : 'Create'} Product
                  </button>
                  <button type="button" onClick={resetProductForm} className="border border-brand-sage/40  text-brand-navy/60 font-bold text-xs px-6 py-2 rounded-xl">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-brand-cream  border border-brand-sage/40  rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100  text-xs">
                <thead className="bg-brand-cream/50 ">
                  <tr>
                    {['Product', 'Brand', 'Price', 'Stock', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-bold uppercase tracking-wider text-brand-navy/60">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 ">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-brand-navy/60">Loading...</td></tr>
                  ) : products.map(p => (
                    <tr key={p._id} className="hover:bg-brand-cream/50/50 :bg-brand-dark-border/10 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <img src={p.images?.[0]} alt="" className="w-8 h-8 rounded-lg object-cover bg-brand-sage/40 shrink-0" />
                          <span className="font-semibold text-brand-navy  truncate max-w-[160px]">{p.title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-brand-navy/60">{p.brand}</td>
                      <td className="px-4 py-3 font-bold text-brand-navy ">
                        {p.discountPrice ? <><span className="text-brand-brown">₹{p.discountPrice}</span> <span className="line-through text-brand-navy/60">₹{p.price}</span></> : `₹${p.price}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${p.stock === 0 ? 'text-brand-brown' : p.stock < 10 ? 'text-amber-500' : 'text-brand-brown'}`}>{p.stock}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditProduct(p)} className="p-1.5 text-brand-navy/60 hover:text-brand-brown rounded-lg hover:bg-brand-sage/40 :bg-brand-dark-border transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 text-brand-navy/60 hover:text-brand-brown rounded-lg hover:bg-brand-sage/40 :bg-brand-dark-border transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-brand-cream  border border-brand-sage/40  rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100  text-xs">
              <thead className="bg-brand-cream/50 ">
                <tr>
                  {['Order ID', 'Customer', 'Total', 'Items', 'Status', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold uppercase tracking-wider text-brand-navy/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 ">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-brand-navy/60">Loading...</td></tr>
                ) : orders.map(o => (
                  <tr key={o._id} className="hover:bg-brand-cream/50/50 :bg-brand-dark-border/10 transition-colors">
                    <td className="px-4 py-3 font-mono text-brand-navy/60">#{o._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3 font-semibold text-brand-navy/60 ">{o.user?.name || 'Deleted'}</td>
                    <td className="px-4 py-3 font-bold text-brand-navy ">₹{o.totalPrice?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-brand-navy/60">{o.orderItems?.length}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={e => handleStatusChange(o._id, e.target.value)}
                        className="bg-brand-cream/50  border border-brand-sage/40  rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                      >
                        {statusOptions.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-brand-navy/60">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-brand-cream  border border-brand-sage/40  rounded-2xl shadow-sm overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100  text-xs">
              <thead className="bg-brand-cream/50 ">
                <tr>
                  {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-bold uppercase tracking-wider text-brand-navy/60">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 ">
                {loading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-brand-navy/60">Loading...</td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className={`hover:bg-brand-cream/50/50 :bg-brand-dark-border/10 transition-colors ${u.isBlocked ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-brown/10 text-brand-brown font-bold flex items-center justify-center shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-brand-navy ">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-navy/60">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.isAdmin
                        ? <span className="bg-amber-50 text-amber-600  font-bold px-2 py-0.5 rounded-full">Admin</span>
                        : <span className="text-brand-navy/60">Customer</span>}
                    </td>
                    <td className="px-4 py-3">
                      {u.isBlocked
                        ? <span className="bg-brand-brown/10 text-rose-600  font-bold px-2 py-0.5 rounded-full">Blocked</span>
                        : <span className="bg-brand-brown/10 text-emerald-600  font-bold px-2 py-0.5 rounded-full">Active</span>}
                    </td>
                    <td className="px-4 py-3 text-brand-navy/60">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {!u.isAdmin && (
                        <button
                          onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all ${u.isBlocked
                            ? 'bg-brand-brown/10 text-emerald-600 hover:bg-emerald-100 '
                            : 'bg-brand-brown/10 text-rose-600 hover:bg-rose-100 '
                            }`}
                        >
                          {u.isBlocked ? <><Check className="w-3 h-3" /> Unblock</> : <><Ban className="w-3 h-3" /> Block</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

