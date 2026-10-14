'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  Send, 
  Printer, 
  Receipt, 
  CheckCircle2, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { OrderItem, BusinessInfo } from '@/types/menu';
import { formatDZD } from '@/lib/menu-store';

interface OrderTrayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearTray: () => void;
  businessInfo: BusinessInfo;
  tableNumber: string;
  onSetTableNumber: (num: string) => void;
}

export function OrderTrayDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearTray,
  businessInfo,
  tableNumber,
  onSetTableNumber,
}: OrderTrayDrawerProps) {
  const [orderSent, setOrderSent] = useState(false);
  const [customerNotes, setCustomerNotes] = useState('');

  if (!isOpen) return null;

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSendWhatsApp = () => {
    if (items.length === 0) return;

    let message = `*☕ New Order - ${businessInfo.name}*\n`;
    message += `*Table / Location:* ${tableNumber || 'Takeaway'}\n`;
    message += `*Date:* ${new Date().toLocaleDateString('fr-DZ')} ${new Date().toLocaleTimeString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}\n`;
    message += `----------------------------\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}* x${item.quantity} = ${formatDZD(item.product.price * item.quantity)}\n`;
      if (item.notes) {
        message += `   _Note: ${item.notes}_\n`;
      }
    });

    message += `----------------------------\n`;
    message += `*Total Amount:* ${formatDZD(totalAmount)}\n`;
    if (customerNotes.trim()) {
      message += `*Customer Request:* ${customerNotes.trim()}\n`;
    }
    message += `\nMerci pour votre commande!`;

    const encoded = encodeURIComponent(message);
    const cleanPhone = businessInfo.whatsapp.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setOrderSent(true);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-slide-left border-l border-pink-100"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-pink-100 flex items-center justify-between bg-[#FFF5F7]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-600" />
            <h2 className="font-serif font-bold text-lg text-[#3B121E]">
              Your Café Tray
            </h2>
            <span className="text-xs bg-rose-100 text-rose-800 font-semibold px-2 py-0.5 rounded-full tabular-nums">
              {totalItemCount} items
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close tray"
            className="w-8 h-8 rounded-full hover:bg-pink-100/60 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation View */}
        {orderSent ? (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-serif font-bold text-[#3B121E]">
              Order Prepared!
            </h3>
            <p className="text-xs text-[#703A4B] max-w-xs leading-relaxed">
              Your order has been formatted for Table {tableNumber || 'Takeaway'}. The café team will prepare your selections shortly.
            </p>
            <div className="pt-4 flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={() => {
                  setOrderSent(false);
                  onClearTray();
                  onClose();
                }}
                className="w-full py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Back to Menu
              </button>
              <button
                onClick={handlePrintSlip}
                className="w-full py-2.5 rounded-full border border-pink-200 text-[#5C2333] hover:bg-pink-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-rose-500" />
                Print Order Slip
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty Tray State */
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-rose-400 flex items-center justify-center">
              <Receipt className="w-8 h-8" />
            </div>
            <p className="font-serif text-base font-semibold text-[#3B121E]">
              Your tray is empty
            </p>
            <p className="text-xs text-[#8A4A5D] max-w-xs">
              Browse our freshly baked cakes, milkshakes, and specialty coffees to add your favorites.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-full bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          /* Items List */
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Table Selection Box */}
            <div className="bg-pink-50/70 rounded-2xl p-3 border border-pink-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#8A4A5D] font-bold">
                  Order Location
                </span>
                <p className="text-xs font-semibold text-[#4A1525]">
                  {tableNumber ? `Dine-in: Table ${tableNumber}` : 'Takeaway / Bar'}
                </p>
              </div>

              <select
                value={tableNumber}
                onChange={(e) => onSetTableNumber(e.target.value)}
                className="text-xs bg-white border border-pink-200 rounded-lg px-2.5 py-1 text-[#4A1525] focus:outline-none focus:ring-1 focus:ring-rose-400"
              >
                <option value="">Takeaway / Counter</option>
                {Array.from({ length: businessInfo.tableCount || 20 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    Table #{i + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* Itemized List */}
            <div className="space-y-3 divide-y divide-pink-50">
              {items.map((item) => (
                <div key={item.product.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-pink-100/60 shrink-0">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-rose-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[#2D1820] truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-[11px] text-rose-800 font-mono font-medium tabular-nums">
                      {formatDZD(item.product.price)}
                    </p>
                    {item.notes && (
                      <p className="text-[10px] text-[#8A4A5D] italic truncate mt-0.5">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center bg-pink-50 border border-pink-200/80 rounded-full px-1 py-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-rose-700 hover:bg-white rounded-full transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold font-mono text-[#3B121E] tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-rose-700 hover:bg-white rounded-full transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional instructions */}
            <div className="pt-2">
              <label className="block text-[11px] font-semibold text-[#5C2B3B] mb-1">
                Order Note for Server
              </label>
              <textarea
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Serve dessert after coffee, bring extra glasses..."
                rows={2}
                className="w-full text-xs p-2.5 bg-pink-50/40 border border-pink-200 rounded-xl text-[#3B121E] placeholder-pink-400/80 focus:outline-none focus:ring-1 focus:ring-rose-400 resize-none"
              />
            </div>
          </div>
        )}

        {/* Footer Summary & Checkout */}
        {items.length > 0 && !orderSent && (
          <div className="p-4 sm:p-5 bg-[#FFF5F7] border-t border-pink-100 space-y-3 shrink-0">
            <div className="flex items-center justify-between text-xs text-[#703A4B]">
              <span>Subtotal ({totalItemCount} items)</span>
              <span className="font-mono font-medium tabular-nums">{formatDZD(totalAmount)}</span>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-[#3B121E] pt-1 border-t border-pink-200/60">
              <span className="font-serif">Total in DZD</span>
              <span className="text-base text-rose-800 font-mono tabular-nums">
                {formatDZD(totalAmount)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 space-y-2">
              <button
                onClick={handleSendWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-[0_4px_14px_rgba(5,150,105,0.25)] transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Order via WhatsApp</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSlip}
                  className="flex-1 py-2 rounded-full border border-pink-200 bg-white text-xs font-semibold text-[#5C2333] hover:bg-pink-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-rose-500" />
                  <span>Print Bill Slip</span>
                </button>

                <button
                  onClick={onClearTray}
                  className="px-3 py-2 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-500 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
