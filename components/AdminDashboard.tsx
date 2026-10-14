'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Upload, 
  Database, 
  Check, 
  Sparkles, 
  RotateCcw, 
  Copy, 
  DollarSign, 
  Tag, 
  Clock, 
  Flame, 
  SlidersHorizontal,
  LogOut,
  FolderPlus,
  Info
} from 'lucide-react';
import { Product, Category, BusinessInfo } from '@/types/menu';
import { 
  formatDZD, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  saveLocalBusinessInfo,
  resetToDefaults 
} from '@/lib/menu-store';
import { isSupabaseConfigured, SUPABASE_SQL_SETUP } from '@/lib/supabase';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  businessInfo: BusinessInfo;
  onRefreshData: () => void;
  onLogout: () => void;
}

export function AdminDashboard({
  isOpen,
  onClose,
  products,
  categories,
  businessInfo,
  onRefreshData,
  onLogout,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'business' | 'database'>('products');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Product Form Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: categories[0]?.id || '',
    price: 650,
    description: '',
    image: '/images/cafe_rose_strawberry_cake_1791993314333.jpg',
    isAvailable: true,
    isFeatured: false,
    calories: 350,
    preparationTime: '5 min',
    tags: 'Bestseller',
  });

  // Category Form Modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    iconName: 'Cake',
    description: '',
  });

  // Business info edit state
  const [bizForm, setBizForm] = useState<BusinessInfo>(businessInfo);
  const [bizSaved, setBizSaved] = useState(false);

  // Copied SQL state
  const [sqlCopied, setSqlCopied] = useState(false);

  // Presets of real generated cafe photography
  const PRESET_IMAGES = [
    { label: 'Rose Cake', url: '/images/cafe_rose_strawberry_cake_1791993314333.jpg' },
    { label: 'Berry Milkshake', url: '/images/cafe_berry_milkshake_1791993315054.jpg' },
    { label: 'Pistachio Croissant', url: '/images/cafe_pistachio_croissant_1791993316684.jpg' },
    { label: 'Velvet Latte', url: '/images/cafe_specialty_latte_1791993317061.jpg' },
    { label: 'Lava Cake', url: '/images/cafe_chocolate_lava_cake_1791993316783.jpg' },
    { label: 'Orange Juice', url: '/images/cafe_fresh_orange_juice_1791993414795.jpg' },
    { label: 'Matcha Cheesecake', url: '/images/cafe_matcha_cheesecake_1791993414598.jpg' },
  ];

  if (!isOpen) return null;

  // Handlers for Products
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      categoryId: categories[0]?.id || '',
      price: 650,
      description: '',
      image: PRESET_IMAGES[0].url,
      isAvailable: true,
      isFeatured: false,
      calories: 350,
      preparationTime: '5 min',
      tags: 'Fresh',
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      categoryId: prod.categoryId,
      price: prod.price,
      description: prod.description || '',
      image: prod.image,
      isAvailable: prod.isAvailable,
      isFeatured: Boolean(prod.isFeatured),
      calories: prod.calories || 350,
      preparationTime: prod.preparationTime || '5 min',
      tags: (prod.tags || []).join(', '),
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = productForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        name: productForm.name,
        categoryId: productForm.categoryId,
        price: Number(productForm.price),
        description: productForm.description,
        image: productForm.image,
        isAvailable: productForm.isAvailable,
        isFeatured: productForm.isFeatured,
        calories: Number(productForm.calories) || undefined,
        preparationTime: productForm.preparationTime,
        tags: tagArray,
      });
    } else {
      await createProduct({
        name: productForm.name,
        categoryId: productForm.categoryId,
        price: Number(productForm.price),
        description: productForm.description,
        image: productForm.image,
        isAvailable: productForm.isAvailable,
        isFeatured: productForm.isFeatured,
        sortOrder: products.length + 1,
        calories: Number(productForm.calories) || undefined,
        preparationTime: productForm.preparationTime,
        tags: tagArray,
      });
    }

    setIsProductModalOpen(false);
    onRefreshData();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteProduct(id);
      onRefreshData();
    }
  };

  const handleToggleProductAvailability = async (prod: Product) => {
    await updateProduct(prod.id, { isAvailable: !prod.isAvailable });
    onRefreshData();
  };

  const handleToggleProductFeatured = async (prod: Product) => {
    await updateProduct(prod.id, { isFeatured: !prod.isFeatured });
    onRefreshData();
  };

  const handleMoveProductOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= products.length) return;

    const currentProd = products[index];
    const targetProd = products[targetIndex];

    await updateProduct(currentProd.id, { sortOrder: targetIndex + 1 });
    await updateProduct(targetProd.id, { sortOrder: index + 1 });
    onRefreshData();
  };

  // Handle local image file upload -> Base64 data URL
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setProductForm((prev) => ({ ...prev, image: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Handlers for Categories
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      iconName: 'Cake',
      description: '',
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      iconName: cat.iconName || 'Cake',
      description: cat.description || '',
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = categoryForm.slug.trim() || categoryForm.name.toLowerCase().replace(/\s+/g, '-');

    if (editingCategory) {
      await updateCategory(editingCategory.id, {
        name: categoryForm.name,
        slug,
        iconName: categoryForm.iconName,
        description: categoryForm.description,
      });
    } else {
      await createCategory({
        name: categoryForm.name,
        slug,
        iconName: categoryForm.iconName,
        description: categoryForm.description,
        sortOrder: categories.length + 1,
        isActive: true,
      });
    }

    setIsCategoryModalOpen(false);
    onRefreshData();
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Deleting "${name}" will also remove products in this category. Continue?`)) {
      await deleteCategory(id);
      onRefreshData();
    }
  };

  // Save Business Info
  const handleSaveBusinessInfo = (e: React.FormEvent) => {
    e.preventDefault();
    saveLocalBusinessInfo(bizForm);
    setBizSaved(true);
    setTimeout(() => setBizSaved(false), 2000);
    onRefreshData();
  };

  // Reset to Defaults
  const handleResetData = () => {
    if (confirm('Restore the original curated cafe menu and categories? Any custom changes will be reset.')) {
      resetToDefaults();
      onRefreshData();
    }
  };

  // Copy SQL script
  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  // Filter products for admin view
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryFilter === 'all' || p.categoryId === selectedCategoryFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-pink-100 flex flex-col h-[92vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 sm:p-6 bg-[#FFF5F7] border-b border-pink-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg sm:text-xl text-[#3B121E]">
                  Café Management Portal
                </h1>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isSupabaseConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isSupabaseConfigured ? 'Supabase Connected' : 'Local Storage Mode'}
                </span>
              </div>
              <p className="text-xs text-[#703A4B]">
                Live updates to customer digital menu & DZD pricing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-pink-200 text-[#5C2333] hover:bg-pink-100/60 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Lock portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-pink-100/60 hover:bg-pink-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 border-b border-pink-100 bg-[#FFF5F7]/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-[#703A4B] hover:text-[#3B121E]'
            }`}
          >
            Menu Products ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-[#703A4B] hover:text-[#3B121E]'
            }`}
          >
            Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab('business')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'business'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-[#703A4B] hover:text-[#3B121E]'
            }`}
          >
            Lounge & WhatsApp Info
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'database'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-[#703A4B] hover:text-[#3B121E]'
            }`}
          >
            Supabase DB & Sync
          </button>
        </div>

        {/* Tab 1: Products Management */}
        {activeTab === 'products' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Search, Filter & Add Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-pink-50/40 p-3 rounded-2xl border border-pink-100">
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter products..."
                  className="w-full sm:w-60 text-xs px-3 py-2 bg-white rounded-xl border border-pink-200 text-[#3B121E] focus:outline-none focus:ring-1 focus:ring-rose-400"
                />

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs px-2.5 py-2 bg-white rounded-xl border border-pink-200 text-[#3B121E] focus:outline-none focus:ring-1 focus:ring-rose-400"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="border border-pink-100 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFF5F7] text-[#703A4B] border-b border-pink-100 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-3 sm:px-4">Product</th>
                    <th className="py-3 px-2 sm:px-3">Category</th>
                    <th className="py-3 px-2 sm:px-3">Price (DZD)</th>
                    <th className="py-3 px-2 sm:px-3 text-center">Status</th>
                    <th className="py-3 px-2 sm:px-3 text-center">Featured</th>
                    <th className="py-3 px-2 sm:px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {filteredProducts.map((prod, index) => {
                    const cat = categories.find((c) => c.id === prod.categoryId);
                    return (
                      <tr key={prod.id} className="hover:bg-pink-50/30 transition-colors">
                        {/* Name & Image */}
                        <td className="py-2.5 px-3 sm:px-4 flex items-center gap-3">
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-pink-100 shrink-0">
                            {prod.image ? (
                              <Image
                                src={prod.image}
                                alt={prod.name}
                                fill
                                className="object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-rose-400">
                                <Sparkles className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#2D1820] truncate max-w-[160px] sm:max-w-xs">
                              {prod.name}
                            </p>
                            <p className="text-[10px] text-[#8A4A5D] truncate max-w-[160px] sm:max-w-xs">
                              {prod.description}
                            </p>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-2 sm:px-3 text-[#5C2333]">
                          {cat?.name || 'Unassigned'}
                        </td>

                        {/* Price */}
                        <td className="py-2.5 px-2 sm:px-3 font-mono font-bold text-rose-800 tabular-nums">
                          {formatDZD(prod.price)}
                        </td>

                        {/* Availability toggle */}
                        <td className="py-2.5 px-2 sm:px-3 text-center">
                          <button
                            onClick={() => handleToggleProductAvailability(prod)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                              prod.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                            }`}
                          >
                            {prod.isAvailable ? 'In Stock' : 'Sold Out'}
                          </button>
                        </td>

                        {/* Featured toggle */}
                        <td className="py-2.5 px-2 sm:px-3 text-center">
                          <button
                            onClick={() => handleToggleProductFeatured(prod)}
                            className={`p-1 rounded-md transition-colors cursor-pointer ${
                              prod.isFeatured
                                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                                : 'text-stone-300 hover:text-stone-500'
                            }`}
                            title="Toggle Chef Special"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        </td>

                        {/* Actions (Reorder, Edit, Delete) */}
                        <td className="py-2.5 px-2 sm:px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleMoveProductOrder(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-stone-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveProductOrder(index, 'down')}
                              disabled={index === products.length - 1}
                              className="p-1 text-stone-400 hover:text-rose-600 disabled:opacity-20 cursor-pointer"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer ml-1"
                              title="Edit product"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.name)}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-pink-50 rounded-md cursor-pointer"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Categories Management */}
        {activeTab === 'categories' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between bg-pink-50/40 p-3 rounded-2xl border border-pink-100">
              <span className="text-xs text-[#703A4B]">
                Organize menu sections displayed on the desktop sidebar and mobile horizontal scroll bar.
              </span>
              <button
                onClick={handleOpenAddCategory}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl border border-pink-100 bg-white flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-[#2D1820]">{cat.name}</h4>
                        <span className="text-[10px] bg-pink-100 text-rose-800 px-1.5 py-0.2 rounded-md font-mono">
                          {cat.slug}
                        </span>
                      </div>
                      <p className="text-xs text-[#8A4A5D] mt-0.5">{cat.description || 'No description'}</p>
                      <p className="text-[11px] text-rose-700 font-medium mt-1">
                        {count} assigned products
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Edit category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-pink-50 rounded-lg cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Business Information & WhatsApp Dispatch */}
        {activeTab === 'business' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <form onSubmit={handleSaveBusinessInfo} className="max-w-xl mx-auto space-y-4">
              <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 text-xs text-[#5C2333] space-y-1">
                <p className="font-semibold text-[#3B121E]">Customer WhatsApp & Table Configuration</p>
                <p>When customers send orders from the tray, they are dispatched to this WhatsApp phone number.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B121E] mb-1">
                  Café Brand Name
                </label>
                <input
                  type="text"
                  value={bizForm.name}
                  onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B121E] mb-1">
                  Tagline / Subheading
                </label>
                <input
                  type="text"
                  value={bizForm.tagline}
                  onChange={(e) => setBizForm({ ...bizForm, tagline: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3B121E] mb-1">
                    WhatsApp Order Dispatch Phone (with country code)
                  </label>
                  <input
                    type="text"
                    value={bizForm.whatsapp}
                    onChange={(e) => setBizForm({ ...bizForm, whatsapp: e.target.value })}
                    placeholder="+213550123456"
                    className="w-full text-xs px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3B121E] mb-1">
                    Lounge Phone Number
                  </label>
                  <input
                    type="text"
                    value={bizForm.phone}
                    onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B121E] mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={bizForm.address}
                  onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3B121E] mb-1">
                    Opening Hours
                  </label>
                  <input
                    type="text"
                    value={bizForm.openingHours}
                    onChange={(e) => setBizForm({ ...bizForm, openingHours: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3B121E] mb-1">
                    Available Dining Tables
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={bizForm.tableCount}
                    onChange={(e) => setBizForm({ ...bizForm, tableCount: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 bg-pink-50/30 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {bizSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Changes Saved!</span>
                    </>
                  ) : (
                    <span>Save Lounge Settings</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 4: Database & Supabase Integration */}
        {activeTab === 'database' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-rose-600" />
                  <h3 className="font-semibold text-sm text-[#3B121E]">
                    Supabase PostgreSQL & Cloud Storage
                  </h3>
                </div>
                <p className="text-xs text-[#703A4B] mt-1">
                  Status:{' '}
                  <span className="font-semibold text-rose-800">
                    {isSupabaseConfigured ? 'Active & Connected via Env Variables' : 'Local Persistence & Browser Storage Active'}
                  </span>
                </p>
              </div>

              <button
                onClick={handleResetData}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-200 bg-white hover:bg-pink-100 text-rose-800 text-xs font-medium cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                <span>Restore Sample Menu Data</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-stone-200 bg-stone-900 text-stone-100 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
                <span className="text-stone-400">supabase_schema.sql</span>
                <button
                  onClick={handleCopySQL}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-pink-300 text-[11px] transition-colors cursor-pointer"
                >
                  {sqlCopied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy SQL Schema</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto max-h-56 text-[11px] text-stone-300">
                {SUPABASE_SQL_SETUP}
              </pre>
            </div>
          </div>
        )}

      </div>

      {/* Product Add/Edit Modal */}
      {isProductModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-pink-100 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
              <h3 className="font-serif font-bold text-lg text-[#3B121E]">
                {editingProduct ? 'Edit Menu Product' : 'Add New Menu Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-7 h-7 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#3B121E] mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Damascus Rose Layer Cake"
                  className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3B121E] mb-1">
                    Category
                  </label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#3B121E] mb-1">
                    Price in DZD
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-rose-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3B121E] mb-1">
                  Short Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={2}
                  placeholder="Ingredients, flavors, and presentation details..."
                  className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400 resize-none"
                />
              </div>

              {/* Image Selection & Upload */}
              <div>
                <label className="block font-semibold text-[#3B121E] mb-1">
                  Product Image
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="Image URL or choose preset below"
                      className="flex-1 px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-rose-400"
                    />
                    <label className="flex items-center gap-1 px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-rose-800 rounded-xl font-medium cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Preset Photos Gallery */}
                  <div>
                    <span className="text-[10px] text-[#8A4A5D]">Or select café photography preset:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mt-1">
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setProductForm({ ...productForm, image: preset.url })}
                          className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            productForm.image === preset.url
                              ? 'border-rose-600 ring-2 ring-rose-200'
                              : 'border-pink-200 hover:opacity-80'
                          }`}
                        >
                          <Image
                            src={preset.url}
                            alt={preset.label}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#3B121E] mb-1">
                    Calories (kcal)
                  </label>
                  <input
                    type="number"
                    value={productForm.calories}
                    onChange={(e) => setProductForm({ ...productForm, calories: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#3B121E] mb-1">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    value={productForm.preparationTime}
                    onChange={(e) => setProductForm({ ...productForm, preparationTime: e.target.value })}
                    placeholder="e.g. 5 min"
                    className="w-full px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#3B121E] mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={productForm.tags}
                  onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                  placeholder="e.g. Chef's Special, Gluten-Free, Bestseller"
                  className="w-full px-3 py-1.5 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded border-pink-300 focus:ring-rose-400"
                  />
                  <span className="font-medium text-[#3B121E]">In Stock & Available</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded border-pink-300 focus:ring-rose-400"
                  />
                  <span className="font-medium text-[#3B121E]">Chef Signature Item</span>
                </label>
              </div>

              <div className="pt-3 border-t border-pink-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
                >
                  {editingProduct ? 'Save Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Add/Edit Modal */}
      {isCategoryModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setIsCategoryModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-pink-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-pink-100 mb-4">
              <h3 className="font-serif font-bold text-base text-[#3B121E]">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#3B121E] mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Crepes & Waffles"
                  className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3B121E] mb-1">
                  Icon Identifier
                </label>
                <select
                  value={categoryForm.iconName}
                  onChange={(e) => setCategoryForm({ ...categoryForm, iconName: e.target.value })}
                  className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                >
                  <option value="Cake">Cake / Gateaux</option>
                  <option value="Sparkles">Sparkles / Desserts</option>
                  <option value="GlassWater">Milkshake / Cold Glass</option>
                  <option value="Coffee">Coffee Cup</option>
                  <option value="Citrus">Citrus / Juice</option>
                  <option value="Cherry">Cherry / Smoothies</option>
                  <option value="Croissant">Croissant / Bakery</option>
                  <option value="UtensilsCrossed">General Special</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#3B121E] mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="e.g. Handcrafted pastries and baked delights"
                  className="w-full px-3 py-2 bg-pink-50/40 border border-pink-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
              </div>

              <div className="pt-3 border-t border-pink-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs"
                >
                  {editingCategory ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
