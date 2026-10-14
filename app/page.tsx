'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  Search, 
  QrCode, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Check, 
  Coffee,
  X,
  SlidersHorizontal,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { Product, Category, OrderItem, BusinessInfo } from '@/types/menu';
import { 
  fetchCategories, 
  fetchProducts, 
  getLocalCategories, 
  getLocalProducts, 
  getLocalBusinessInfo, 
  formatDZD 
} from '@/lib/menu-store';
import { Navbar } from '@/components/Navbar';
import { VerticalCategoryRail } from '@/components/VerticalCategoryRail';
import { ProductCard } from '@/components/ProductCard';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { OrderTrayDrawer } from '@/components/OrderTrayDrawer';
import { QRCodeModal } from '@/components/QRCodeModal';
import { AdminLoginModal } from '@/components/AdminLoginModal';
import { AdminDashboard } from '@/components/AdminDashboard';

export default function MenuPage() {
  // Store Data States (initialized synchronously with local fallback data to prevent cascading setState)
  const [categories, setCategories] = useState<Category[]>(() => getLocalCategories());
  const [products, setProducts] = useState<Product[]>(() => getLocalProducts());
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>(() => getLocalBusinessInfo());
  const [isLoading, setIsLoading] = useState(false);

  // Filter States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name-asc'>('featured');
  const [showFilters, setShowFilters] = useState(false);

  // Interactive Modal & Drawer States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Cart / Tray State
  const [trayItems, setTrayItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('table') || '';
    }
    return '';
  });

  // Initial data loading from Supabase / Local storage
  const reloadData = () => {
    setIsLoading(true);
    Promise.all([fetchCategories(), fetchProducts()]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
      setBusinessInfo(getLocalBusinessInfo());
      setIsLoading(false);
    });
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchCategories(), fetchProducts()]).then(([cats, prods]) => {
      if (isMounted) {
        setCategories(cats);
        setProducts(prods);
        setBusinessInfo(getLocalBusinessInfo());
      }
    });

    const handleStoreUpdate = () => {
      reloadData();
    };
    window.addEventListener('menu_store_updated', handleStoreUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('menu_store_updated', handleStoreUpdate);
    };
  }, []);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        // Category filter
        if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchTag = item.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchTag) return false;
        }
        // Availability filter
        if (onlyAvailable && !item.isAvailable) {
          return false;
        }
        // Featured filter
        if (onlyFeatured && !item.isFeatured) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return a.sortOrder - b.sortOrder;
      });
  }, [products, selectedCategoryId, searchQuery, onlyAvailable, onlyFeatured, sortBy]);

  // Tray management handlers
  const handleAddToCart = (product: Product, quantity = 1, notes?: string) => {
    setTrayItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.notes === notes
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, notes }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setTrayItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setTrayItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearTray = () => {
    setTrayItems([]);
  };

  const totalTrayCount = trayItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalTrayAmount = trayItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const activeCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <div className="min-h-screen bg-[#FFF5F7] text-[#2D1820] flex flex-col font-sans selection:bg-rose-200">
      
      {/* Top Navbar */}
      <Navbar
        businessInfo={businessInfo}
        cartCount={totalTrayCount}
        cartTotal={totalTrayAmount}
        onOpenCart={() => setIsTrayOpen(true)}
        onOpenQR={() => setIsQROpen(true)}
        onOpenAdmin={() => {
          if (isAdminLoggedIn) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Table Welcome Banner */}
      {tableNumber && (
        <aside
          aria-label="Table order banner"
          className="bg-rose-600 text-white text-xs py-2 px-4 text-center font-medium shadow-xs flex items-center justify-center gap-2"
        >
          <span>✨ Ordering for <strong>Table #{tableNumber}</strong></span>
          <button
            onClick={() => setTableNumber('')}
            className="underline text-pink-100 hover:text-white text-[11px] ml-2"
          >
            Change
          </button>
        </aside>
      )}

      {/* Hero Header Banner */}
      <header className="bg-gradient-to-b from-[#FFEBF1] via-[#FFF3F6] to-[#FFF5F7] border-b border-pink-100/60 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Menu Digital</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#3B121E]">
              {businessInfo.name}
            </h1>
            <p className="text-xs text-[#703A4B]">
              {businessInfo.tagline} · DZD Live Pricing
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setIsQROpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#4A1525] border border-pink-200 text-xs font-semibold hover:bg-pink-50 transition-colors shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-rose-600" />
              <span>Table QR</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER: EXACT VERTICAL CATEGORY RAIL ON LEFT + PRODUCT GRID ON RIGHT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        <div className="flex items-start gap-2.5 sm:gap-4 md:gap-5">
          
          {/* 1. EXACT VERTICAL CATEGORY SIDEBAR (LEFT) - NARROW RAIL (35-45px mobile) */}
          <VerticalCategoryRail
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => {
              setSelectedCategoryId(id);
              // Smooth slight scroll if needed
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
          />

          {/* 2. PRODUCT SECTION (RIGHT) */}
          <section
            aria-label="Products Section"
            className="flex-1 min-w-0 space-y-3 sm:space-y-4"
          >
            
            {/* Top Product Controls: Search & Category Title */}
            <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 border border-pink-100/80 shadow-[0_2px_12px_rgba(244,114,182,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-serif font-bold text-[#3B121E]">
                    {selectedCategoryId === 'all'
                      ? 'All Menu Selections'
                      : activeCategory?.name || 'Category'}
                  </h2>
                  <p className="text-[11px] text-[#8A4A5D]">
                    {filteredProducts.length} items available
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`sm:hidden p-1.5 rounded-xl border transition-colors ${
                    showFilters || onlyAvailable || onlyFeatured
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'border-pink-200 text-stone-500 hover:bg-pink-50'
                  }`}
                  aria-label="Filter products"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search menu..."
                    className="w-full pl-8 pr-7 py-1.5 text-xs bg-pink-50/50 rounded-full border border-pink-100 text-[#4A1525] placeholder-pink-400/80 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:bg-white"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-rose-400 hover:text-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Desktop Quick Toggles */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setOnlyFeatured(!onlyFeatured)}
                    className={`px-2.5 py-1.5 rounded-full border transition-colors cursor-pointer flex items-center gap-1 ${
                      onlyFeatured
                        ? 'bg-rose-600 text-white border-rose-600 font-semibold shadow-xs'
                        : 'bg-white border-pink-200 text-[#703A4B] hover:bg-pink-50'
                    }`}
                  >
                    <Flame className="w-3 h-3 text-rose-400" />
                    <span>Specials</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOnlyAvailable(!onlyAvailable)}
                    className={`px-2.5 py-1.5 rounded-full border transition-colors cursor-pointer flex items-center gap-1 ${
                      onlyAvailable
                        ? 'bg-rose-600 text-white border-rose-600 font-semibold shadow-xs'
                        : 'bg-white border-pink-200 text-[#703A4B] hover:bg-pink-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-rose-400" />
                    <span>In Stock</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Expandable Filter Bar */}
            {showFilters && (
              <div className="sm:hidden bg-white rounded-2xl p-3 border border-pink-100 space-y-2 animate-fade-in text-xs">
                <div className="flex items-center justify-between text-[#8A4A5D] font-semibold text-[11px]">
                  <span>Filter Selections:</span>
                  {(onlyAvailable || onlyFeatured) && (
                    <button
                      type="button"
                      onClick={() => {
                        setOnlyAvailable(false);
                        setOnlyFeatured(false);
                      }}
                      className="text-rose-600"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOnlyFeatured(!onlyFeatured)}
                    className={`flex-1 py-1.5 rounded-xl border text-center transition-colors ${
                      onlyFeatured
                        ? 'bg-rose-600 text-white border-rose-600 font-semibold'
                        : 'border-pink-200 text-[#5C2333]'
                    }`}
                  >
                    Specials Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlyAvailable(!onlyAvailable)}
                    className={`flex-1 py-1.5 rounded-xl border text-center transition-colors ${
                      onlyAvailable
                        ? 'bg-rose-600 text-white border-rose-600 font-semibold'
                        : 'border-pink-200 text-[#5C2333]'
                    }`}
                  >
                    Available Only
                  </button>
                </div>
              </div>
            )}

            {/* PRODUCT GRID: Exactly 2 Columns on Mobile, Wider Responsive on Desktop */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3.5">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-2.5 border border-pink-100 animate-pulse space-y-2"
                  >
                    <div className="w-full aspect-square bg-pink-100/50 rounded-xl" />
                    <div className="h-3.5 bg-pink-100/60 rounded w-3/4" />
                    <div className="h-3 bg-pink-100/40 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-3xl p-8 text-center border border-pink-100 shadow-xs flex flex-col items-center justify-center space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-pink-50 text-rose-400 flex items-center justify-center">
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-[#3B121E]">
                  No Items in this Category
                </h3>
                <p className="text-xs text-[#8A4A5D] max-w-xs">
                  We currently have no available items for this selection.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId('all');
                    setSearchQuery('');
                    setOnlyAvailable(false);
                    setOnlyFeatured(false);
                  }}
                  className="mt-1 px-4 py-1.5 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  View All Items
                </button>
              </div>
            ) : (
              /* Two-Column Grid on Mobile, 3-4 columns on larger screens */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                {filteredProducts.map((product) => {
                  const cat = categories.find((c) => c.id === product.categoryId);
                  return (
                    <ProductCard
                      key={product.id}
                      product={product}
                      categoryName={cat?.name}
                      onOpenDetail={(prod) => {
                        setSelectedProduct(prod);
                        setIsDetailOpen(true);
                      }}
                      onAddToCart={(prod) => handleAddToCart(prod, 1)}
                    />
                  );
                })}
              </div>
            )}

          </section>

        </div>
      </main>

      {/* Floating Bottom Order Bar on Mobile (when tray has items) */}
      {totalTrayCount > 0 && (
        <div className="fixed bottom-3 left-3 right-3 z-40 sm:bottom-4 sm:left-4 sm:right-4">
          <button
            type="button"
            onClick={() => setIsTrayOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-[0_8px_24px_rgba(225,29,72,0.35)] active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white text-rose-700 text-xs font-bold flex items-center justify-center font-mono">
                {totalTrayCount}
              </span>
              <span className="text-xs font-semibold">
                View Tray
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono tabular-nums">
                {formatDZD(totalTrayAmount)}
              </span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 bg-white/70 border-t border-pink-100/80 py-6 text-xs text-[#703A4B]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>© {new Date().getFullYear()} {businessInfo.name} · All prices in DZD</p>
          <div className="flex items-center gap-4 text-[11px] text-[#8A4A5D]">
            <span>{businessInfo.address}</span>
            <span>·</span>
            <span>{businessInfo.openingHours}</span>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        categoryName={categories.find((c) => c.id === selectedProduct?.categoryId)?.name}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <OrderTrayDrawer
        isOpen={isTrayOpen}
        onClose={() => setIsTrayOpen(false)}
        items={trayItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearTray={handleClearTray}
        businessInfo={businessInfo}
        tableNumber={tableNumber}
        onSetTableNumber={setTableNumber}
      />

      <QRCodeModal
        isOpen={isQROpen}
        onClose={() => setIsQROpen(false)}
        businessInfo={businessInfo}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setIsAdminDashboardOpen(true);
        }}
      />

      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        products={products}
        categories={categories}
        businessInfo={businessInfo}
        onRefreshData={reloadData}
        onLogout={() => {
          setIsAdminLoggedIn(false);
          setIsAdminDashboardOpen(false);
        }}
      />

    </div>
  );
}
