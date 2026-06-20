import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, ShoppingCart, Heart, User,
  Menu, X, ChevronDown, Package, LogOut, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import API from '../../utils/api';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { cartItems, wishlist, totals } = useCart();

  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [showMegaMenu, setShowMegaMenu] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (keyword.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const { data } = await API.get(`/products?keyword=${keyword}&limit=5`);
        setSuggestions(data.products);
      } catch (err) {
        console.error('Error fetching suggestions', err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setShowMegaMenu(false);
    setShowSuggestions(false);
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/catalog?keyword=${encodeURIComponent(keyword.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug) => {
    navigate(`/product/${slug}`);
    setKeyword('');
    setShowSuggestions(false);
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-cream/80 backdrop-blur-md border-b border-brand-sage/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">

          {/* Logo Branding */}
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-brown to-brand-brown/80 flex items-center justify-center text-brand-cream shadow-brand-brown/20 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <ShoppingCart className="w-6 h-6 fill-current" />
            </div>
            <span className="font-sans font-extrabold text-2xl tracking-tighter text-brand-navy group-hover:text-brand-brown transition-colors">
              ApexBuy
            </span>
          </Link>

          {/* Categories Dropdown (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 relative">
            <button
              onMouseEnter={() => setShowMegaMenu(true)}
              className="flex items-center gap-1 font-bold text-sm text-brand-navy/80 hover:text-brand-brown transition-colors py-2"
            >
              Catalog <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showMegaMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showMegaMenu && (
              <div
                className="absolute top-12 left-0 w-64 bg-brand-cream border border-brand-sage rounded-2xl shadow-2xl p-4 animate-fade-in"
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <div className="border-b border-brand-sage/20 pb-2 mb-2">
                  <span className="text-xs uppercase tracking-widest font-bold text-brand-navy/40">Discover</span>
                </div>
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    to={`/catalog?category=${cat.slug}`}
                    className="block py-2.5 px-3 rounded-xl hover:bg-brand-cream text-sm font-bold text-brand-navy/80 hover:text-brand-brown transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div ref={searchRef} className="flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Find premium products..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-12 pr-10 py-3 rounded-2xl border border-brand-sage bg-brand-cream/50 focus:outline-none focus:ring-4 focus:ring-brand-brown/10 focus:border-brand-brown text-sm font-semibold transition-all text-brand-navy placeholder:text-brand-navy/40 shadow-sm"
              />
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-brand-navy/40" />
            </form>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-14 left-0 w-full bg-brand-cream border border-brand-sage rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                {suggestions.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSuggestionClick(item.slug)}
                    className="w-full text-left px-4 py-3.5 hover:bg-brand-cream flex items-center gap-4 transition-colors border-b border-brand-sage/20 last:border-0"
                  >
                    <div className="w-12 h-12 rounded-lg border border-brand-sage/20 overflow-hidden shrink-0 shadow-sm">
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-extrabold text-brand-navy truncate leading-tight">{item.title}</p>
                      <p className="text-xs font-bold text-brand-brown mt-0.5">₹{item.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-5 shrink-0">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2.5 rounded-xl text-brand-navy/60 hover:text-red-500 hover:bg-red-50 transition-all relative group"
            >
              <Heart className="w-5 h-5 group-hover:fill-current transition-colors" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-brand-cream text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-sage">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2.5 rounded-xl text-brand-navy/60 hover:text-brand-brown hover:bg-brand-brown/10 transition-all relative group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:fill-current transition-colors" />
              {totals.itemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-brown text-brand-cream text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-sage shadow-sm shadow-brand-brown/30">
                  {totals.itemsCount}
                </span>
              )}
            </Link>

            <div className="h-6 w-[1px] bg-brand-sage mx-1" />

            {/* User */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 text-sm font-extrabold text-brand-navy hover:text-brand-brown transition-colors bg-brand-cream hover:bg-brand-cream px-4 py-2 rounded-xl border border-brand-sage shadow-sm"
                >
                  <div className="w-7 h-7 rounded-lg bg-brand-brown/10 flex items-center justify-center text-brand-brown font-black text-xs shadow-inner">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-brand-navy/40" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-brand-cream border border-brand-sage rounded-2xl shadow-2xl py-2.5 z-50 animate-fade-in overflow-hidden">
                    {user.isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-xs text-amber-700 font-black hover:bg-amber-50 transition-colors border-b border-brand-sage/20"
                      >
                        <ShieldAlert className="w-4.5 h-4.5" /> DASHBOARD PORTAL
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-brand-navy/80 hover:bg-brand-cream transition-colors"
                    >
                      <User className="w-4.5 h-4.5 text-brand-navy/40" /> My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-brand-navy/80 hover:bg-brand-cream transition-colors"
                    >
                      <Package className="w-4.5 h-4.5 text-brand-navy/40" /> My Orders
                    </Link>
                    <div className="border-t border-brand-sage/20 my-1" />
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-extrabold text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut className="w-4.5 h-4.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-brand-navy hover:bg-brand-brown text-brand-cream px-7 py-2.5 rounded-xl text-sm font-extrabold transition-all shadow-xl shadow-brand-navy/20 active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Button Controls */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <Link to="/cart" className="p-2 text-brand-navy/80 relative">
              <ShoppingCart className="w-6 h-6" />
              {totals.itemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-brand-brown text-brand-cream text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-brand-sage">
                  {totals.itemsCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-brand-navy hover:bg-brand-cream rounded-xl transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-brand-sage/20 bg-brand-cream/95 backdrop-blur-xl px-4 py-8 space-y-10 animate-fade-in shadow-2xl h-[calc(100vh-64px)] overflow-y-auto">
          <div className="space-y-5">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-brand-navy/40 px-1">Shop by Category</p>
            <div className="grid grid-cols-1 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/catalog?category=${cat.slug}`}
                  className="flex items-center justify-between py-4 px-5 rounded-2xl bg-brand-cream/50 border border-brand-sage/30 text-sm font-extrabold text-brand-navy/80 hover:bg-brand-brown/10 hover:text-brand-brown hover:border-brand-brown/20 transition-all"
                >
                  {cat.name} <ChevronDown className="w-4 h-4 -rotate-90 text-brand-navy/20" />
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-brand-sage/20 pt-8 space-y-6">
            <Link to="/wishlist" className="flex items-center gap-4 text-sm font-extrabold text-brand-navy group">
              <div className="p-2.5 rounded-xl bg-brand-cream group-hover:bg-red-50 text-brand-navy/40 group-hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </div>
              My Wishlist <span className="text-brand-navy/30 font-bold">({wishlist.length})</span>
            </Link>

            {user ? (
              <div className="pt-4 space-y-6">
                <div className="flex items-center gap-4 text-lg font-black text-brand-navy p-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-brown to-brand-brown/60 flex items-center justify-center text-brand-cream font-black text-sm shadow-lg shadow-brand-brown/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {user.isAdmin && (
                    <Link to="/admin/dashboard" className="flex items-center gap-4 text-sm font-black text-amber-700 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                      <ShieldAlert className="w-5 h-5" /> DASHBOARD ACCESS
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-4 text-sm font-bold text-brand-navy/70 p-1">
                    <User className="w-5 h-5 text-brand-navy/30" /> Profile Settings
                  </Link>
                  <Link to="/orders" className="flex items-center gap-4 text-sm font-bold text-brand-navy/70 p-1">
                    <Package className="w-5 h-5 text-brand-navy/30" /> Track Orders
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left text-sm font-black text-red-600 flex items-center gap-4 p-1 mt-4"
                  >
                    <div className="p-2.5 rounded-xl bg-red-50">
                      <LogOut className="w-5 h-5" />
                    </div>
                    Log Out Account
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4">
                <Link
                  to="/login"
                  className="block text-center bg-brand-navy text-brand-cream py-5 rounded-2xl text-base font-black shadow-2xl shadow-brand-navy/20 active:scale-95 transition-all"
                >
                  Sign In to Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

