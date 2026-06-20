import React from 'react';
import { RotateCcw, Star, ChevronRight } from 'lucide-react';

const SidebarFilter = ({
  categories,
  availableBrands,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  selectedRating,
  setSelectedRating,
  onReset,
}) => {
  return (
    <div className="w-full bg-brand-cream  border border-brand-sage/40  rounded-2xl p-5 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-brand-sage/40 ">
        <h2 className="font-display font-bold text-brand-navy  text-lg">Filters</h2>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm font-semibold text-brand-navy/60 hover:text-brand-brown transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Category List */}
      <div>
        <h3 className="text-sm font-bold text-brand-navy  uppercase tracking-wider mb-3">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center justify-between group ${
              selectedCategory === 'all' || !selectedCategory
                ? 'bg-brand-brown/10 text-brand-brown font-bold'
                : 'text-brand-navy/60  hover:bg-brand-cream/50 :bg-brand-dark-border/40'
            }`}
          >
            <span>All Categories</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedCategory === 'all' ? 'translate-x-0.5' : 'opacity-0 group-hover:opacity-100'}`} />
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center justify-between group ${
                selectedCategory === cat.slug
                  ? 'bg-brand-brown/10 text-brand-brown font-bold'
                  : 'text-brand-navy/60  hover:bg-brand-cream/50 :bg-brand-dark-border/40'
              }`}
            >
              <span>{cat.name}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${selectedCategory === cat.slug ? 'translate-x-0.5' : 'opacity-0 group-hover:opacity-100'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filters */}
      <div>
        <h3 className="text-sm font-bold text-brand-navy  uppercase tracking-wider mb-3">Brands</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedBrand('all')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center justify-between ${
              selectedBrand === 'all' || !selectedBrand
                ? 'bg-brand-brown/10 text-brand-brown font-bold'
                : 'text-brand-navy/60  hover:bg-brand-cream/50 :bg-brand-dark-border/40'
            }`}
          >
            <span>All Brands</span>
          </button>
          {availableBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center justify-between ${
                selectedBrand === brand
                  ? 'bg-brand-brown/10 text-brand-brown font-bold'
                  : 'text-brand-navy/60  hover:bg-brand-cream/50 :bg-brand-dark-border/40'
              }`}
            >
              <span>{brand}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="text-sm font-bold text-brand-navy  uppercase tracking-wider mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1.5 text-sm text-brand-navy/60">?</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 bg-brand-cream/50  border border-brand-sage/40  rounded-lg text-sm text-brand-navy  focus:outline-none focus:ring-1 focus:ring-brand-indigo"
            />
          </div>
          <span className="text-sm text-brand-navy/60">to</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1.5 text-sm text-brand-navy/60">?</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full pl-6 pr-2 py-1.5 bg-brand-cream/50  border border-brand-sage/40  rounded-lg text-sm text-brand-navy  focus:outline-none focus:ring-1 focus:ring-brand-indigo"
            />
          </div>
        </div>
      </div>

      {/* Rating Filters */}
      <div>
        <h3 className="text-sm font-bold text-brand-navy  uppercase tracking-wider mb-3">Avg. Customer Review</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedRating('all')}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center justify-between ${
              selectedRating === 'all' || !selectedRating
                ? 'bg-brand-brown/10 text-brand-brown font-bold'
                : 'text-brand-navy/60  hover:bg-brand-cream/50 :bg-brand-dark-border/40'
            }`}
          >
            <span>All Ratings</span>
          </button>
          {['4', '3', '2', '1'].map((starsNum) => {
            const isActive = selectedRating === starsNum;
            return (
              <button
                key={starsNum}
                onClick={() => setSelectedRating(starsNum)}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-brand-brown/10 text-brand-brown font-bold'
                    : 'text-brand-navy/60  hover:bg-brand-cream/50 :bg-brand-dark-border/40'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <Star
                      key={val}
                      className={`w-3.5 h-3.5 ${
                        val <= Number(starsNum)
                          ? 'text-brand-brown fill-amber-400'
                          : 'text-brand-navy/60 '
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs">& Up</span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default SidebarFilter;

