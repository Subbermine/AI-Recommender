import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, AlertTriangle } from 'lucide-react';
import API from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import SidebarFilter from '../components/layout/SidebarFilter';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const queryKeyword = searchParams.get('keyword') || '';
  const queryCategory = searchParams.get('category') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, selectedBrand, minPrice, maxPrice, selectedRating, sort, queryKeyword]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let endpoint = `/products?page=${page}&limit=12&sort=${sort}`;
        
        if (queryKeyword) {
          endpoint += `&keyword=${encodeURIComponent(queryKeyword)}`;
        }
        if (selectedCategory && selectedCategory !== 'all') {
          endpoint += `&category=${selectedCategory}`;
        }
        if (selectedBrand && selectedBrand !== 'all') {
          endpoint += `&brand=${selectedBrand}`;
        }
        if (selectedRating && selectedRating !== 'all') {
          endpoint += `&rating=${selectedRating}`;
        }
        if (minPrice) {
          endpoint += `&minPrice=${minPrice}`;
        }
        if (maxPrice) {
          endpoint += `&maxPrice=${maxPrice}`;
        }

        const { data } = await API.get(endpoint);
        setProducts(data.products);
        setPages(data.pages);
        setTotalProducts(data.totalProducts);
        setBrands(data.brands);
      } catch (err) {
        console.error('Error fetching catalog products', err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [page, sort, selectedCategory, selectedBrand, minPrice, maxPrice, selectedRating, queryKeyword]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setSelectedRating('all');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
        <div className="space-y-1">
           <h1 className="font-sans font-black text-3xl sm:text-4xl text-brand-navy tracking-tight">Our Collection</h1>
           <p className="text-brand-navy/50 font-bold text-sm uppercase tracking-widest">Premium essentials curated with AI</p>
        </div>
        
        {queryKeyword && (
          <div className="bg-brand-brown/10 border border-brand-brown/20 rounded-2xl px-5 py-3 flex items-center gap-4 animate-fade-in shadow-sm">
            <p className="text-sm font-bold text-brand-navy">
              Results for <span className="text-brand-brown font-black">"{queryKeyword}"</span>
            </p>
            <button
              onClick={() => setSearchParams({})}
              className="text-[10px] uppercase font-black text-brand-brown hover:underline tracking-widest"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
        <aside className="lg:col-span-1 lg:sticky lg:top-28">
          <SidebarFilter
            categories={categories}
            availableBrands={brands}
            selectedCategory={selectedCategory}
            setSelectedCategory={(cat) => {
              setSelectedCategory(cat);
              if (cat === 'all') {
                searchParams.delete('category');
              } else {
                searchParams.set('category', cat);
              }
              setSearchParams(searchParams);
            }}
            selectedBrand={selectedBrand}
            setSelectedBrand={setSelectedBrand}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedRating={selectedRating}
            setSelectedRating={setSelectedRating}
            onReset={handleResetFilters}
          />
        </aside>

        <main className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between gap-4 p-5 bg-brand-cream border-2 border-slate-100 rounded-[32px] shadow-sm">
            <span className="text-xs font-black text-brand-navy/50 uppercase tracking-widest px-2">
              {totalProducts} Items Available
            </span>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-brand-cream/50 border-2 border-transparent hover:border-slate-100 text-brand-navy text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl focus:outline-none transition-all cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="ratingDesc">Top Rated</option>
                </select>
              </div>

              <div className="flex bg-brand-cream/50 border-2 border-slate-50 rounded-2xl overflow-hidden shrink-0">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-brand-navy text-brand-cream shadow-lg' : 'text-brand-navy/50 hover:text-brand-navy/60'}`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${viewMode === 'list' ? 'bg-brand-navy text-brand-cream shadow-lg' : 'text-brand-navy/50 hover:text-brand-navy/60'}`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`rounded-[32px] shimmer ${viewMode === 'grid' ? 'h-[420px]' : 'h-56'}`} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-brand-cream border-2 border-slate-100 border-dashed rounded-[40px] p-24 text-center flex flex-col items-center justify-center gap-6 animate-fade-in">
              <div className="p-6 rounded-[24px] bg-brand-cream/50 text-brand-navy/60">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-xl text-brand-navy tracking-tight">No Items Found</h3>
                <p className="text-sm text-brand-navy/50 font-bold max-w-xs mx-auto">
                  Try adjusting your filters or search keywords to find what you're looking for.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="bg-brand-navy hover:bg-brand-brown text-brand-cream font-black text-xs px-10 py-4 rounded-[20px] transition-all shadow-xl shadow-slate-200 mt-2 active:scale-95 uppercase tracking-widest"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} viewMode={viewMode} />
              ))}
            </div>
          )}

          {!loading && pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-12">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-6 py-3 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-cream/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-brand-navy/60"
              >
                Prev
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: pages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === page;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-11 h-11 rounded-2xl text-xs font-black transition-all flex items-center justify-center ${
                        isActive
                          ? 'bg-brand-navy text-brand-cream shadow-xl shadow-slate-200'
                          : 'border-2 border-transparent hover:border-slate-100 text-brand-navy/50 hover:text-brand-navy hover:bg-brand-cream/50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === pages}
                className="px-6 py-3 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-cream/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-brand-navy/60"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Catalog;

