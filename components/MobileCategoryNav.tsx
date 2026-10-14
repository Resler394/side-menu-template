'use client';

import React, { useRef, useEffect } from 'react';
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
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Category } from '@/types/menu';

interface MobileCategoryNavProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  productCountByCategory: Record<string, number>;
  totalProductsCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showFiltersModal: boolean;
  onToggleFiltersModal: () => void;
  hasActiveFilters: boolean;
}

export function MobileCategoryNav({
  categories,
  selectedCategoryId,
  onSelectCategory,
  productCountByCategory,
  totalProductsCount,
  searchQuery,
  onSearchChange,
  onToggleFiltersModal,
  hasActiveFilters,
}: MobileCategoryNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showSearchInput, setShowSearchInput] = React.useState(false);

  // Auto-scroll selected button into center view when category changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [selectedCategoryId]);

  const renderIcon = (iconName: string, isSelected: boolean) => {
    const iconClass = `w-3.5 h-3.5 shrink-0 ${
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
    <div className="lg:hidden sticky top-16 z-30 bg-[#FFF5F7]/95 backdrop-blur-md border-b border-pink-100/90 shadow-[0_2px_8px_rgba(244,114,182,0.04)]">
      {/* Mobile Top Sub-bar with Search & Filter Trigger */}
      <div className="px-4 py-2 flex items-center gap-2">
        {showSearchInput ? (
          <div className="flex-1 flex items-center bg-white rounded-full px-3 py-1.5 border border-pink-200 shadow-sm">
            <Search className="w-4 h-4 text-rose-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search dishes or beverages..."
              className="w-full ml-2 text-xs text-[#4A1525] bg-transparent focus:outline-none placeholder-pink-400/80"
            />
            <button
              onClick={() => {
                onSearchChange('');
                setShowSearchInput(false);
              }}
              className="p-0.5 text-rose-400 hover:text-rose-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-between">
            <button
              onClick={() => setShowSearchInput(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-rose-800/80 bg-white rounded-full border border-pink-100 shadow-xs hover:border-pink-300 w-full"
            >
              <Search className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">
                {searchQuery ? `Searching "${searchQuery}"` : 'Search menu items...'}
              </span>
            </button>
          </div>
        )}

        <button
          onClick={onToggleFiltersModal}
          aria-label="Filter menu"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors shrink-0 ${
            hasActiveFilters
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-[#703A4B] border-pink-200 hover:bg-pink-50'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filter</span>
        </button>
      </div>

      {/* Horizontal Scrollable Category Bar */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-2 px-4 py-2 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {/* All Items Button */}
        <button
          onClick={() => onSelectCategory('all')}
          data-active={selectedCategoryId === 'all'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
            selectedCategoryId === 'all'
              ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-200'
              : 'bg-white text-[#5C2333] border border-pink-100 hover:bg-pink-50/80'
          }`}
        >
          <UtensilsCrossed className={`w-3.5 h-3.5 ${selectedCategoryId === 'all' ? 'text-white' : 'text-rose-600'}`} />
          <span>All</span>
          <span className={`text-[10px] tabular-nums font-normal ${selectedCategoryId === 'all' ? 'text-pink-100' : 'text-[#8A4A5D]'}`}>
            ({totalProductsCount})
          </span>
        </button>

        {/* Dynamic Category Buttons */}
        {categories
          .filter((c) => c.isActive)
          .map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const count = productCountByCategory[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                data-active={isSelected}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-200'
                    : 'bg-white text-[#5C2333] border border-pink-100 hover:bg-pink-50/80'
                }`}
              >
                {renderIcon(cat.iconName || cat.slug, isSelected)}
                <span>{cat.name}</span>
                <span className={`text-[10px] tabular-nums font-normal ${isSelected ? 'text-pink-100' : 'text-[#8A4A5D]'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
