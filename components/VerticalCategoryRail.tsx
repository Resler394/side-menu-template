'use client';

import React from 'react';
import { Category } from '@/types/menu';

interface VerticalCategoryRailProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function VerticalCategoryRail({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: VerticalCategoryRailProps) {
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <nav
      aria-label="Category Navigation Rail"
      className="sticky top-20 z-20 shrink-0 w-10 sm:w-12 lg:w-14 select-none self-start py-1"
    >
      <div className="flex flex-col items-center bg-white/80 backdrop-blur-md rounded-2xl py-3 border border-pink-100 shadow-[0_4px_20px_rgba(244,114,182,0.08)] space-y-1 sm:space-y-1.5 overflow-hidden">
        
        {/* 'ALL' Category Item */}
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          aria-label="All Categories"
          aria-current={selectedCategoryId === 'all' ? 'true' : undefined}
          className={`relative w-full py-4 sm:py-5 flex items-center justify-center transition-all cursor-pointer group ${
            selectedCategoryId === 'all'
              ? 'bg-[#FCE7F0] text-rose-600 font-extrabold'
              : 'text-stone-400 hover:text-stone-600 hover:bg-pink-50/50'
          }`}
        >
          {/* Active Bright Pink Stripe on Left Edge */}
          {selectedCategoryId === 'all' && (
            <span
              className="absolute left-0 top-1 bottom-1 w-1 bg-rose-600 rounded-r-full"
              aria-hidden="true"
            />
          )}

          {/* Rotated 90-degree Text Label */}
          <span
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
            className="tracking-widest text-[10px] sm:text-[11px] uppercase whitespace-nowrap transition-transform duration-200"
          >
            TOUT / ALL
          </span>
        </button>

        {/* Dynamic Category Items */}
        {activeCategories.map((cat) => {
          const isActive = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-label={`Category ${cat.name}`}
              aria-current={isActive ? 'true' : undefined}
              className={`relative w-full py-5 sm:py-6 flex items-center justify-center transition-all cursor-pointer group ${
                isActive
                  ? 'bg-[#FCE7F0] text-rose-600 font-extrabold'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-pink-50/50'
              }`}
            >
              {/* Active Bright Pink Stripe on Left Edge */}
              {isActive && (
                <span
                  className="absolute left-0 top-1 bottom-1 w-1 bg-rose-600 rounded-r-full"
                  aria-hidden="true"
                />
              )}

              {/* Rotated 90-degree Text Label */}
              <span
                style={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
                className={`tracking-widest text-[10px] sm:text-[11px] uppercase whitespace-nowrap transition-transform duration-200 ${
                  isActive ? 'scale-105' : 'group-hover:scale-102'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
