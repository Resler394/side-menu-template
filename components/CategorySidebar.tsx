'use client';

import React from 'react';
import { 
  Cake, 
  Sparkles, 
  GlassWater, 
  Coffee, 
  Citrus, 
  Cherry, 
  Croissant, 
  UtensilsCrossed,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Flame
} from 'lucide-react';
import { Category, BusinessInfo } from '@/types/menu';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  productCountByCategory: Record<string, number>;
  totalProductsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onlyAvailable: boolean;
  onToggleOnlyAvailable: () => void;
  onlyFeatured: boolean;
  onToggleOnlyFeatured: () => void;
  businessInfo: BusinessInfo;
}

export function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  productCountByCategory,
  totalProductsCount,
  searchQuery,
  onSearchChange,
  onlyAvailable,
  onToggleOnlyAvailable,
  onlyFeatured,
  onToggleOnlyFeatured,
  businessInfo,
}: CategorySidebarProps) {

  // Dynamic Lucide icon mapper
  const renderIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = `w-4 h-4 shrink-0 transition-colors ${
      isSelected ? 'text-white' : 'text-rose-600'
    }`;
    switch (iconName.toLowerCase()) {
      case 'cake':
        return <Cake className={iconClass} />;
      case 'sparkles':
      case 'desserts':
        return <Sparkles className={iconClass} />;
      case 'glasswater':
      case 'milkshakes':
        return <GlassWater className={iconClass} />;
      case 'coffee':
        return <Coffee className={iconClass} />;
      case 'citrus':
      case 'fresh-juice':
        return <Citrus className={iconClass} />;
      case 'cherry':
      case 'smoothies':
        return <Cherry className={iconClass} />;
      case 'croissant':
      case 'snacks':
        return <Croissant className={iconClass} />;
      default:
        return <UtensilsCrossed className={iconClass} />;
    }
  };

  return (
    <aside className="w-72 shrink-0 hidden lg:block sticky top-20 self-start space-y-6">
      {/* Search Input Box */}
      <div className="bg-white rounded-2xl p-3 border border-pink-100 shadow-[0_4px_16px_rgba(244,114,182,0.06)]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-rose-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cakes, coffee, drinks..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-pink-50/50 rounded-xl border border-pink-100 text-[#4A1525] placeholder-pink-400/80 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-rose-400 hover:text-rose-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick Toggles */}
        <div className="mt-3 pt-3 border-t border-pink-50 flex items-center justify-between text-xs">
          <button
            onClick={onToggleOnlyFeatured}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              onlyFeatured
                ? 'bg-rose-100 text-rose-800 font-semibold'
                : 'text-[#703A4B] hover:bg-pink-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Specials Only</span>
          </button>

          <button
            onClick={onToggleOnlyAvailable}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
              onlyAvailable
                ? 'bg-rose-100 text-rose-800 font-semibold'
                : 'text-[#703A4B] hover:bg-pink-50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Available</span>
          </button>
        </div>
      </div>

      {/* Categories Navigation Container */}
      <div className="bg-white rounded-2xl p-3 border border-pink-100 shadow-[0_4px_16px_rgba(244,114,182,0.06)]">
        <div className="px-3 py-2 mb-1 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-900/70">
            Categories
          </span>
          <span className="text-xs text-[#8A4A5D] tabular-nums font-medium">
            {totalProductsCount} items
          </span>
        </div>

        <div className="space-y-1">
          {/* 'All Items' Tab */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              selectedCategoryId === 'all'
                ? 'bg-rose-600 text-white shadow-sm font-semibold'
                : 'text-[#4A1525] hover:bg-pink-50/70 hover:text-rose-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-1.5 rounded-lg ${
                  selectedCategoryId === 'all'
                    ? 'bg-rose-700/80 text-white'
                    : 'bg-pink-100/60 text-rose-600'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span>All Specialties</span>
            </div>
            <span
              className={`text-xs tabular-nums font-medium ${
                selectedCategoryId === 'all' ? 'text-pink-100' : 'text-[#8A4A5D]'
              }`}
            >
              {totalProductsCount}
            </span>
          </button>

          {/* Dynamic Categories */}
          {categories
            .filter((c) => c.isActive)
            .map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const count = productCountByCategory[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-sm font-semibold'
                      : 'text-[#4A1525] hover:bg-pink-50/70 hover:text-rose-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? 'bg-rose-700/80 text-white'
                          : 'bg-pink-100/60 text-rose-600'
                      }`}
                    >
                      {renderIcon(cat.iconName || cat.slug, isSelected)}
                    </div>
                    <span>{cat.name}</span>
                  </div>
                  <span
                    className={`text-xs tabular-nums font-medium ${
                      isSelected ? 'text-pink-100' : 'text-[#8A4A5D]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Info Card at bottom of sidebar */}
      <div className="bg-gradient-to-br from-pink-50 to-white rounded-2xl p-4 border border-pink-100/80 shadow-[0_4px_16px_rgba(244,114,182,0.04)] text-xs space-y-3">
        <div className="flex items-start gap-2.5 text-[#5C2B3B]">
          <Clock className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#4A1525]">Opening Hours</p>
            <p className="text-[#703A4B] mt-0.5">{businessInfo.openingHours}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-[#5C2B3B] pt-2 border-t border-pink-100/60">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#4A1525]">Lounge Location</p>
            <p className="text-[#703A4B] mt-0.5">{businessInfo.address}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
