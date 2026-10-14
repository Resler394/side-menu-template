'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Check, Sparkles } from 'lucide-react';
import { Product } from '@/types/menu';
import { formatDZD } from '@/lib/menu-store';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({
  product,
  categoryName,
  onOpenDetail,
  onAddToCart,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.isAvailable) return;
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  };

  return (
    <article
      onClick={() => onOpenDetail(product)}
      className="group relative flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-[0_4px_18px_rgba(244,114,182,0.06)] hover:shadow-[0_8px_26px_rgba(244,114,182,0.14)] hover:-translate-y-0.5 border border-pink-100/70 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Softly Tinted Pink Image Container */}
      <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#FFF0F4] p-1.5 flex items-center justify-center">
        {!imageError && product.image ? (
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
              className={`object-cover transition-transform duration-300 group-hover:scale-104 ${
                !product.isAvailable ? 'grayscale opacity-60' : ''
              }`}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center text-rose-800">
            <Sparkles className="w-6 h-6 mb-1 text-rose-400" />
            <span className="text-[11px] font-medium px-2">{product.name}</span>
          </div>
        )}

        {/* Quiet status tag */}
        {!product.isAvailable ? (
          <div className="absolute top-2 left-2 bg-[#1F1D2B]/85 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-md">
            Sold Out
          </div>
        ) : product.isFeatured ? (
          <div className="absolute top-2 left-2 bg-rose-600/90 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-md shadow-xs">
            Special
          </div>
        ) : null}
      </div>

      {/* Product Details */}
      <div className="mt-2 flex-1 flex flex-col justify-between">
        <div>
          {categoryName && (
            <span className="text-[10px] text-rose-400/90 font-medium uppercase tracking-wider block truncate">
              {categoryName}
            </span>
          )}
          <h3 className="text-xs sm:text-sm font-bold text-[#2D1820] line-clamp-1 leading-snug group-hover:text-rose-600 transition-colors mt-0.5">
            {product.name}
          </h3>
        </div>

        {/* Price & Add Button */}
        <div className="mt-2 pt-1.5 border-t border-pink-50 flex items-center justify-between gap-1">
          <span className="text-xs sm:text-sm font-bold text-rose-600 font-mono tabular-nums">
            {formatDZD(product.price)}
          </span>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.isAvailable}
            aria-label={`Add ${product.name} to tray`}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              !product.isAvailable
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200/80 active:scale-95'
            }`}
          >
            {justAdded ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            ) : (
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
