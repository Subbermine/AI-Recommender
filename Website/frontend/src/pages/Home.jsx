import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, Headset } from 'lucide-react';
import API from '../utils/api';
import ProductCard from '../components/product/ProductCard';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [dealProducts, setDealProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [catsRes, dealsRes, featuredRes] = await Promise.all([
          API.get('/categories'),
          API.get('/products/deals'),
          API.get('/products/featured'),
        ]);
        setCategories(catsRes.data);
        setDealProducts(dealsRes.data);
        setFeaturedProducts(featuredRes.data);
      } catch (err) {
        console.error('Failed to load homepage data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-brand-navy min-h-[500px] lg:min-h-[600px] flex items-center shadow-2xl shadow-brand-brown/20">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80"
              alt="Hero background"
              className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/80 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl px-8 sm:px-12 lg:px-16 space-y-8 py-20">
            <div className="inline-flex items-center gap-2 bg-brand-brown/10 backdrop-blur-sm border border-brand-brown/20 text-brand-cream font-bold text-xs uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-brown animate-ping" />
              New Spring Collection 2026
            </div>
            <h1 className="font-sans font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.9] text-brand-cream my-0">
              Premium Items.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-brown to-brand-brown/60">
                Curated for You.
              </span>
            </h1>
            <p className="text-brand-cream/80 text-lg sm:text-xl max-w-md font-medium leading-relaxed">
              Experience the next generation of e-commerce with our AI-powered recommendations and premium selected goods.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/catalog" className="bg-brand-brown hover:bg-brand-brown/90 text-brand-cream font-bold px-10 py-4 rounded-xl shadow-lg shadow-brand-brown/20 active:scale-95 transition-all duration-200 text-base group inline-flex items-center justify-center gap-2">
                Explore Shop <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/catalog?is_deal=true" className="bg-brand-cream/5 border border-brand-sage/10 text-brand-cream hover:bg-brand-cream/10 hover:border-brand-sage/20 font-bold px-10 py-4 rounded-xl active:scale-95 transition-all duration-200 text-base inline-flex items-center justify-center gap-2">
                Weekly Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Badges */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { Icon: Truck, title: 'Express Delivery', desc: 'Ships within 24 hours', color: 'text-brand-brown', bg: 'bg-brand-brown/10' },
          { Icon: ShieldCheck, title: 'Secure Checkout', desc: 'End-to-end encryption', color: 'text-emerald-700', bg: 'bg-brand-brown/10' },
          { Icon: RefreshCw, title: 'Easy Returns', desc: '30-day money back', color: 'text-amber-700', bg: 'bg-amber-50' },
          { Icon: Headset, title: 'Expert Support', desc: 'Available 24/7 for you', color: 'text-blue-700', bg: 'bg-blue-50' },
        ].map((badge, idx) => (
          <div key={idx} className="group flex gap-5 items-center p-6 bg-brand-cream border border-brand-sage rounded-2xl shadow-premium shadow-premium-hover">
            <div className={`p-4 rounded-2xl ${badge.bg} ${badge.color} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <badge.Icon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-brand-navy tracking-tight">{badge.title}</h4>
              <p className="text-sm text-brand-navy/60 font-semibold mt-0.5">{badge.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="flex flex-col items-center text-center space-y-3">
          <span className="text-brand-brown font-bold text-xs uppercase tracking-[0.25em]">Collections</span>
          <h2 className="font-sans font-black text-3xl sm:text-4xl text-brand-navy">Shop by Category</h2>
          <div className="w-12 h-1 bg-brand-brown rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-3xl shimmer" />
            ))
          ) : (
            categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/catalog?category=${cat.slug}`}
                className="group relative h-80 rounded-3xl overflow-hidden border border-brand-sage shadow-premium shadow-premium-hover"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/20 to-transparent group-hover:from-brand-brown/90 transition-colors duration-500 flex flex-col justify-end p-8">
                  <h3 className="font-sans font-black text-xl text-brand-cream tracking-tight">
                    {cat.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-xs text-brand-cream/80 font-black uppercase tracking-widest">Explore</span>
                    <ArrowRight className="w-4 h-4 text-brand-cream" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Weekly Deals */}
      <section className="max-w-7xl mx-auto px-4 space-y-10">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div className="space-y-3">
            <span className="text-rose-600 font-bold text-xs uppercase tracking-[0.25em]">Limited Time</span>
            <h2 className="font-sans font-black text-3xl sm:text-4xl text-brand-navy">Weekly Deals</h2>
          </div>
          <Link
            to="/catalog?sort=priceAsc"
            className="flex items-center gap-2 text-sm font-black text-brand-brown hover:gap-3 transition-all"
          >
            Explore all deals <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[420px] rounded-3xl shimmer" />
            ))
          ) : dealProducts.length === 0 ? (
            <div className="col-span-full py-20 bg-brand-cream/50 rounded-3xl border-2 border-dashed border-brand-sage text-center text-brand-navy/40 font-black">
              Check back soon for exclusive deals
            </div>
          ) : (
            dealProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))
          )}
        </div>
      </section>

      {/* Recommended/Featured Section with Background */}
      <section className="bg-brand-navy py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <span className="text-brand-brown font-bold text-xs uppercase tracking-[0.25em]">Personalized for You</span>
              <h2 className="font-sans font-black text-3xl sm:text-4xl lg:text-5xl text-brand-cream">Recommended Items</h2>
              <p className="text-brand-cream/60 font-semibold max-w-lg">Our AI-driven engine selects the best premium products based on quality and user satisfaction.</p>
            </div>
            <Link
              to="/catalog"
              className="bg-brand-cream/5 border border-brand-sage/10 text-brand-cream hover:bg-brand-cream/10 hover:border-brand-sage/20 font-bold px-10 py-4 rounded-xl active:scale-95 transition-all duration-200 inline-flex items-center justify-center"
            >
              View Full Catalog
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[420px] rounded-3xl bg-brand-cream/5 animate-pulse" />
              ))
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-full py-20 text-center text-brand-cream/40 font-black">
                Discovery is just a click away.
              </div>
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} isDark />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter/CTA */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="relative rounded-[40px] bg-brand-brown overflow-hidden p-8 sm:p-16 text-center space-y-8 shadow-2xl shadow-brand-brown/20">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-cream rounded-full blur-[100px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-navy rounded-full blur-[100px]" />
          </div>
          <h2 className="relative z-10 font-sans font-black text-3xl sm:text-4xl text-brand-cream">Join the Premium Club</h2>
          <p className="relative z-10 text-brand-cream font-semibold max-w-md mx-auto">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
          <form className="relative z-10 flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-6 py-4 rounded-2xl bg-brand-cream text-brand-navy font-semibold focus:outline-none focus:ring-4 focus:ring-brand-brown/30 transition-all"
            />
            <button className="bg-brand-navy text-brand-cream px-8 py-4 rounded-2xl font-bold hover:bg-brand-navy/90 transition-all active:scale-95 shadow-xl">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;

