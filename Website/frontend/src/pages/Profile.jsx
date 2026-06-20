import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, MapPin, Plus, Trash2, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState(null);

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: 'USA', isDefault: false });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    setName(user.name);
    setEmail(user.email);
    setAddresses(user.addresses || []);
  }, [user, navigate]);

  const handleInfoSave = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (password && password.length < 6) { setFormError('Password must be at least 6 characters'); return; }
    if (password && password !== confirmPassword) { setFormError('Passwords do not match'); return; }

    try {
      setLoading(true);
      const payload = { name, email };
      if (password) payload.password = password;
      await updateProfile(payload);
      showToast('Profile updated successfully!', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      showToast('Please fill all address fields', 'error');
      return;
    }
    try {
      setLoading(true);
      const updatedAddresses = newAddress.isDefault
        ? [...addresses.map(a => ({ ...a, isDefault: false })), newAddress]
        : [...addresses, newAddress];
      await updateProfile({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setNewAddress({ street: '', city: '', state: '', zipCode: '', country: 'USA', isDefault: false });
      setShowAddressForm(false);
      showToast('Address added!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAddress = async (idx) => {
    const updated = addresses.filter((_, i) => i !== idx);
    try {
      setLoading(true);
      await updateProfile({ addresses: updated });
      setAddresses(updated);
      showToast('Address removed', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (idx) => {
    const updated = addresses.map((a, i) => ({ ...a, isDefault: i === idx }));
    try {
      setLoading(true);
      await updateProfile({ addresses: updated });
      setAddresses(updated);
      showToast('Default address updated', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full p-3 bg-brand-cream/50  border border-brand-sage/40  rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-indigo text-brand-navy ';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
      <div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-navy/60 hover:text-brand-brown transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-indigo to-brand-violet flex items-center justify-center text-brand-cream font-display font-black text-2xl shadow-md">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display font-black text-2xl text-brand-navy  leading-tight my-0">{user?.name}</h1>
              <p className="text-xs text-brand-navy/60 ">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="text-xs font-bold text-brand-brown hover:underline"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-brand-sage/40  p-1 rounded-2xl w-fit">
        {['info', 'addresses'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-brand-cream  text-brand-brown shadow-sm'
                : 'text-brand-navy/60 hover:text-brand-navy :text-brand-navy/60'
            }`}
          >
            {tab === 'info' ? 'Personal Info' : 'Saved Addresses'}
          </button>
        ))}
      </div>

      {activeTab === 'info' && (
        <div className="bg-brand-cream  border border-brand-sage/40  rounded-3xl p-6 sm:p-8 shadow-sm animate-fade-in">
          <h2 className="font-display font-bold text-xl text-brand-navy  mb-6">Edit Profile</h2>
          <form onSubmit={handleInfoSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-navy/60 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-navy/60 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
              </div>
            </div>

            <hr className="border-brand-sage/40 " />
            <p className="text-xs font-bold text-brand-navy/60 uppercase tracking-wider">Change Password (leave blank to keep current)</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-navy/60 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> New Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className={inputCls} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-navy/60 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" className={inputCls} />
              </div>
            </div>

            {formError && <p className="text-xs text-brand-brown font-semibold bg-brand-brown/10  py-2 rounded-lg text-center">{formError}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-brown hover:bg-brand-violet text-brand-cream font-bold text-sm px-8 py-2.5 rounded-xl shadow-sm transition-all"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-4 animate-fade-in">
          {addresses.length === 0 && !showAddressForm && (
            <div className="bg-brand-cream  border border-dashed border-brand-sage/40  rounded-3xl p-10 text-center space-y-3">
              <MapPin className="w-8 h-8 text-brand-navy/60 mx-auto" />
              <p className="text-sm text-brand-navy/60">No saved addresses. Add one for faster checkout.</p>
            </div>
          )}

          {addresses.map((addr, idx) => (
            <div key={idx} className={`bg-brand-cream  border rounded-2xl p-5 flex items-start justify-between gap-4 shadow-sm ${addr.isDefault ? 'border-brand-brown/30 ' : 'border-brand-sage/40 '}`}>
              <div className="space-y-0.5 text-sm">
                {addr.isDefault && <span className="inline-block text-[10px] font-extrabold uppercase text-brand-brown bg-brand-brown/10  px-2 py-0.5 rounded-full mb-1">Default</span>}
                <p className="font-semibold text-brand-navy ">{addr.street}</p>
                <p className="text-brand-navy/60">{addr.city}, {addr.state} {addr.zipCode}</p>
                <p className="text-brand-navy/60 text-xs">{addr.country}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(idx)} className="p-1.5 text-brand-navy/60 hover:text-brand-brown rounded-lg hover:bg-brand-cream/50 :bg-brand-dark-border/40 transition-colors" title="Set as default">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => handleRemoveAddress(idx)} className="p-1.5 text-brand-navy/60 hover:text-brand-brown rounded-lg hover:bg-brand-cream/50 :bg-brand-dark-border/40 transition-colors" title="Remove">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {showAddressForm ? (
            <div className="bg-brand-cream  border border-brand-brown/20 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
              <h3 className="font-bold text-sm text-brand-navy ">New Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Street', key: 'street', span: true },
                  { label: 'City', key: 'city', span: false },
                  { label: 'State', key: 'state', span: false },
                  { label: 'ZIP Code', key: 'zipCode', span: false },
                ].map(({ label, key, span }) => (
                  <div key={key} className={`space-y-1 ${span ? 'sm:col-span-2' : ''}`}>
                    <label className="text-xs font-semibold text-brand-navy/60">{label}</label>
                    <input
                      type="text"
                      value={newAddress[key]}
                      onChange={e => setNewAddress(prev => ({ ...prev, [key]: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-navy/60">Country</label>
                  <select value={newAddress.country} onChange={e => setNewAddress(prev => ({ ...prev, country: e.target.value }))} className={inputCls}>
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 self-end pb-3">
                  <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={e => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))} className="accent-brand-indigo" />
                  <label htmlFor="isDefault" className="text-xs font-semibold text-brand-navy/60">Set as default</label>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddAddress} disabled={loading} className="bg-brand-brown hover:bg-brand-violet text-brand-cream font-bold text-xs px-5 py-2 rounded-xl transition-all">
                  {loading ? 'Saving...' : 'Save Address'}
                </button>
                <button onClick={() => setShowAddressForm(false)} className="border border-brand-sage/40  text-brand-navy/60 hover:text-brand-navy/60 font-bold text-xs px-5 py-2 rounded-xl transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddressForm(true)}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-brand-sage/40  text-brand-navy/60 hover:text-brand-brown hover:border-brand-brown/40 font-semibold text-sm py-3 rounded-2xl transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Address
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;

