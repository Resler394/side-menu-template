'use client';

import React from 'react';
import { X, Check, RotateCcw, SlidersHorizontal, Flame, CheckCircle2 } from 'lucide-react';

interface MobileFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlyAvailable: boolean;
  onToggleOnlyAvailable: () => void;
  onlyFeatured: boolean;
  onToggleOnlyFeatured: () => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name-asc';
  onSetSortBy: (sort: 'featured' | 'price-asc' | 'price-desc' | 'name-asc') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function MobileFiltersModal({
  isOpen,
  onClose,
  onlyAvailable,
  onToggleOnlyAvailable,
  onlyFeatured,
  onToggleOnlyFeatured,
  sortBy,
  onSetSortBy,
  onResetFilters,
  hasActiveFilters,
}: MobileFiltersModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-pink-100 flex flex-col space-y-4 animate-slide-up"
      >
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-rose-600" />
            <h3 className="font-serif font-bold text-base text-[#3B121E]">
              Filter & Sort Menu
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-pink-50 hover:bg-pink-100 flex items-center justify-center text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A4A5D]">
            Preferences
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleOnlyFeatured}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                onlyFeatured
                  ? 'bg-rose-50 border-rose-400 text-rose-800'
                  : 'bg-white border-pink-200 text-[#5C2333]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>Specials Only</span>
            </button>

            <button
              onClick={onToggleOnlyAvailable}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                onlyAvailable
                  ? 'bg-rose-50 border-rose-400 text-rose-800'
                  : 'bg-white border-pink-200 text-[#5C2333]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />
              <span>In Stock Only</span>
            </button>
          </div>
        </div>

        {/* Sorting options */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8A4A5D]">
            Sort By
          </span>
          <div className="space-y-1">
            {[
              { id: 'featured', label: "Chef's Recommended" },
              { id: 'price-asc', label: 'Price: Low to High' },
              { id: 'price-desc', label: 'Price: High to Low' },
              { id: 'name-asc', label: 'Alphabetical: A to Z' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => onSetSortBy(option.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === option.id
                    ? 'bg-rose-100/70 text-rose-900 font-semibold'
                    : 'text-[#4A1525] hover:bg-pink-50'
                }`}
              >
                <span>{option.label}</span>
                {sortBy === option.id && <Check className="w-3.5 h-3.5 text-rose-700" />}
              </button>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex items-center justify-between gap-3 border-t border-pink-100">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs text-[#8A4A5D] hover:text-rose-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors text-center cursor-pointer ml-auto"
          >
            Apply & View Menu
          </button>
        </div>
      </div>
    </div>
  );
}
