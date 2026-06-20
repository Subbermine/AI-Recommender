import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Send, Camera, Code, MapPin, Mail, Phone, ShoppingCart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-navy text-brand-cream mt-auto pt-24 pb-12 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

        {/* Brand Information */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-brand-brown flex items-center justify-center text-brand-cream shadow-brand-brown/20 shadow-lg group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5 fill-current" />
            </div>
            <span className="font-sans font-black text-xl tracking-tighter text-brand-cream">
              ApexBuy
            </span>
          </Link>
          <p className="text-sm font-medium leading-relaxed max-w-xs text-brand-cream/60">
            The global destination for premium daily essentials, curated with AI to ensure you only get the highest quality goods.
          </p>
          <div className="flex gap-4 pt-2">
            {[Globe, Send, Camera, Code].map((Icon, i) => (
              <a key={i} href="#" className="p-2.5 rounded-xl bg-brand-cream/5 hover:bg-brand-brown hover:text-brand-cream transition-all duration-300 shadow-sm text-brand-cream/40" title="Social">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="space-y-6">
          <h3 className="font-bold text-brand-cream text-xs uppercase tracking-[0.2em]">Shop Collection</h3>
          <ul className="space-y-3 text-sm font-semibold">
            <li><Link to="/catalog?category=essentials" className="hover:text-brand-brown transition-colors">Household Essentials</Link></li>
            <li><Link to="/catalog?category=kitchen" className="hover:text-brand-brown transition-colors">Kitchen & Dining</Link></li>
            <li><Link to="/catalog?category=apparel" className="hover:text-brand-brown transition-colors">Basics Apparel</Link></li>
            <li><Link to="/catalog?category=home" className="hover:text-brand-brown transition-colors">Home Comfort</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div className="space-y-6">
          <h3 className="font-bold text-brand-cream text-xs uppercase tracking-[0.2em]">Customer Care</h3>
          <ul className="space-y-3 text-sm font-semibold">
            <li><Link to="/profile" className="hover:text-brand-brown transition-colors">Account Settings</Link></li>
            <li><Link to="/orders" className="hover:text-brand-brown transition-colors">Track Your Order</Link></li>
            <li><Link to="/wishlist" className="hover:text-brand-brown transition-colors">My Favorites</Link></li>
            <li><Link to="/cart" className="hover:text-brand-brown transition-colors">Shopping Bag</Link></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          <h3 className="font-bold text-brand-cream text-xs uppercase tracking-[0.2em]">Connect</h3>
          <ul className="space-y-4 text-sm font-semibold">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 shrink-0 text-brand-brown" />
              <span className="leading-snug">100 Premium Plaza, Tech District, SF 94103</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 shrink-0 text-brand-brown" />
              <span>+1 (800) APEX-BUY</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 shrink-0 text-brand-brown" />
              <span>hello@apexbuy.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Copy Right */}
      <div className="border-t border-brand-sage/5 pt-12 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-brand-cream/20 max-w-7xl mx-auto px-4">
        <p>© {new Date().getFullYear()} ApexBuy Inc. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

