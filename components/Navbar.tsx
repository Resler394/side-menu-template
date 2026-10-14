import React from 'react';
import Link from 'next/link';
import { QrCode, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { BusinessInfo } from '@/types/menu';

interface NavbarProps {
  businessInfo: BusinessInfo;
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenQR: () => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onSelectCategory?: (id: string) => void;
}

export function Navbar({
  businessInfo,
  cartCount,
  onOpenCart,
  onOpenQR,
  onOpenAdmin,
  isAdminLoggedIn,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#FFF5F7]/95 backdrop-blur-md border-b border-pink-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#4A1525] hover:text-rose-700 transition-colors whitespace-nowrap shrink-0"
          >
            {businessInfo.name}
          </Link>
        </div>

        {/* Zone 2: 4-5 Concise Single-line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#703A4B]">
          <a
            href="#menu"
            className="hover:text-rose-700 transition-colors whitespace-nowrap shrink-0"
          >
            Full Menu
          </a>
          <a
            href="#featured"
            className="hover:text-rose-700 transition-colors whitespace-nowrap shrink-0"
          >
            Chef Specials
          </a>
          <button
            onClick={onOpenQR}
            className="hover:text-rose-700 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-rose-500" />
            <span>Table QR Code</span>
          </button>
          <a
            href="#location"
            className="hover:text-rose-700 transition-colors whitespace-nowrap shrink-0"
          >
            Hours & Location
          </a>
          <button
            onClick={onOpenAdmin}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              isAdminLoggedIn ? 'text-emerald-700 font-semibold' : 'text-[#703A4B] hover:text-rose-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-500" />
            <span>{isAdminLoggedIn ? 'Admin Portal (Active)' : 'Owner Portal'}</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Guest Order Tray / Cart) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenQR}
            aria-label="Table QR Code"
            className="md:hidden p-2 text-[#703A4B] hover:text-rose-700 hover:bg-pink-100/60 rounded-full transition-colors"
          >
            <QrCode className="w-5 h-5 text-rose-600" />
          </button>
          
          <button
            onClick={onOpenAdmin}
            aria-label="Admin Dashboard"
            className="md:hidden p-2 text-[#703A4B] hover:text-rose-700 hover:bg-pink-100/60 rounded-full transition-colors"
          >
            <ShieldCheck className={`w-5 h-5 ${isAdminLoggedIn ? 'text-emerald-600' : 'text-rose-600'}`} />
          </button>

          <button
            onClick={onOpenCart}
            aria-label="View Order Tray"
            className="relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-full shadow-[0_4px_14px_rgba(225,29,72,0.25)] transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">My Tray</span>
            {cartCount > 0 && (
              <span className="bg-white text-rose-700 text-xs font-bold px-1.5 py-0.2 rounded-full tabular-nums">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
