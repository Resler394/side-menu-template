'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Clock, Flame, ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '@/types/menu';
import { formatDZD } from '@/lib/menu-store';

interface ProductDetailModalProps {
  product: Product | null;
  categoryName?: string;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, notes?: string) => void;
}

export function ProductDetailModal({
  product,
  categoryName,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !product) return null;

  const totalPrice = product.price * quantity;

  const handleAdd = () => {
    if (!product.isAvailable) return;
    onAddToCart(product, quantity, notes.trim() || undefined);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        key={product.id}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-100 flex flex-col max-h-[90vh] animate-scale-up"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-700 flex items-center justify-center shadow-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Product Image Header */}
        <div className="relative w-full h-56 sm:h-64 bg-pink-50/80 shrink-0">
          {!imageError && product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className={`object-cover ${!product.isAvailable ? 'grayscale opacity-75' : ''}`}
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-rose-50 text-rose-800">
              <Sparkles className="w-8 h-8 text-rose-400 mb-2" />
              <span className="font-serif text-base font-medium">{product.name}</span>
            </div>
          )}

          {/* Availability / Tag overlay */}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            {!product.isAvailable ? (
              <span className="bg-[#1F1D2B]/90 text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                Currently Sold Out
              </span>
            ) : product.isFeatured ? (
              <span className="bg-rose-600 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                Chef&apos;s Signature
              </span>
            ) : null}
          </div>
        </div>

        {/* Scrollable Details Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8A4A5D] font-medium mb-1">
              <span>{categoryName || 'Menu Item'}</span>
              <div className="flex items-center gap-3">
                {product.calories && (
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    {product.calories} kcal
                  </span>
                )}
                {product.preparationTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {product.preparationTime}
                  </span>
                )}
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#3B121E]">
              {product.name}
            </h2>

            <p className="mt-2 text-sm text-[#5C2B3B] leading-relaxed">
              {product.description || 'Prepared fresh using our house-made recipe and premium local ingredients.'}
            </p>

            {/* Tags (if any) */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-rose-800/80">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="bg-pink-50 border border-pink-200/60 rounded-md px-2 py-0.5">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes for Barista / Chef */}
          <div className="pt-2 border-t border-pink-100">
            <label className="block text-xs font-semibold text-[#5C2B3B] mb-1.5">
              Special Requests or Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extra hot, with oat milk, less sugar, no nuts"
              className="w-full text-xs px-3 py-2 bg-pink-50/40 border border-pink-200/80 rounded-xl text-[#3B121E] placeholder-pink-400/80 focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        {/* Modal Footer: Quantity Stepper & Add Button */}
        <div className="p-4 sm:p-5 bg-pink-50/50 border-t border-pink-100 flex items-center justify-between gap-4 shrink-0">
          {product.isAvailable ? (
            <>
              {/* Stepper */}
              <div className="flex items-center bg-white border border-pink-200 rounded-full px-2 py-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-rose-700 hover:bg-pink-100/60 disabled:opacity-30 cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold font-mono text-[#3B121E] tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-full text-rose-700 hover:bg-pink-100/60 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add CTA */}
              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 flex items-center justify-between px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm shadow-[0_4px_14px_rgba(225,29,72,0.25)] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Tray</span>
                </div>
                <span className="font-mono font-bold tabular-nums">
                  {formatDZD(totalPrice)}
                </span>
              </button>
            </>
          ) : (
            <div className="w-full text-center py-2 text-sm text-[#8A4A5D] font-medium">
              Item temporarily unavailable. Please check back later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
