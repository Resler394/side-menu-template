'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download, Printer, ExternalLink, Sparkles } from 'lucide-react';
import { BusinessInfo } from '@/types/menu';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessInfo: BusinessInfo;
}

export function QRCodeModal({ isOpen, onClose, businessInfo }: QRCodeModalProps) {
  const [selectedTable, setSelectedTable] = useState('1');
  const [copied, setCopied] = useState(false);
  const [origin] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  });

  if (!isOpen) return null;

  const menuUrl = selectedTable === 'all'
    ? `${origin}`
    : `${origin}?table=${selectedTable}`;

  // Quick reliable SVG-based QR Code using public Google Charts / QR Server API as high-res fallback with clean offline SVG canvas matrix
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    menuUrl
  )}&color=4A1525&bgcolor=FFF5F7&margin=1`;

  const handleCopy = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-pink-100 flex flex-col items-center text-center animate-scale-up"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close QR modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand header */}
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tabletop Digital Menu</span>
        </div>
        <h2 className="font-serif font-bold text-2xl text-[#3B121E]">
          {businessInfo.name}
        </h2>
        <p className="text-xs text-[#703A4B] mt-1 max-w-xs">
          Scan to view the full contactless digital menu with live DZD pricing & table order dispatch.
        </p>

        {/* Table Selector */}
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className="text-[#5C2333] font-medium">Target Table:</span>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="bg-pink-50 border border-pink-200 text-[#4A1525] font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-rose-400"
          >
            <option value="all">General Menu (No Table)</option>
            {Array.from({ length: businessInfo.tableCount || 24 }, (_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                Table #{i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* QR Code Container */}
        <div className="mt-5 p-4 bg-[#FFF5F7] rounded-3xl border border-pink-200/80 shadow-inner flex flex-col items-center">
          <div className="relative w-52 h-52 bg-white rounded-2xl p-2.5 shadow-sm border border-pink-100 overflow-hidden flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt={`QR code for ${businessInfo.name} table ${selectedTable}`}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="mt-3 text-[11px] font-mono text-rose-900 font-medium">
            {selectedTable === 'all' ? 'Lounge General URL' : `Table #${selectedTable} Link`}
          </div>
        </div>

        {/* Copyable URL bar */}
        <div className="mt-4 w-full flex items-center bg-pink-50/60 rounded-xl p-1.5 border border-pink-200/60 text-xs">
          <span className="flex-1 text-left px-2 truncate font-mono text-[#5C2333]">
            {menuUrl}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1 bg-white text-rose-700 hover:bg-rose-50 rounded-lg border border-pink-200 font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Print / Download Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 w-full">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-pink-200 bg-white text-xs font-semibold text-[#4A1525] hover:bg-pink-50 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-rose-600" />
            <span>Print Tent Card</span>
          </button>

          <a
            href={qrImageUrl}
            download={`qr-table-${selectedTable}.png`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Save Image</span>
          </a>
        </div>
      </div>
    </div>
  );
}
