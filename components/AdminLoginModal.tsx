'use client';

import React, { useState } from 'react';
import { X, Lock, KeyRound, ShieldAlert, Sparkles, Check } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default master owner passcode: 1234 or admin
    if (passcode === '1234' || passcode.toLowerCase() === 'admin' || passcode === 'rose') {
      setError('');
      onSuccess();
      onClose();
    } else {
      setError('Incorrect passcode. Try master demo code: 1234');
    }
  };

  const handleQuickDemo = () => {
    setPasscode('1234');
    setError('');
    onSuccess();
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
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-pink-100 flex flex-col items-center text-center animate-scale-up"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-pink-50 hover:bg-pink-100 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 shadow-xs">
          <Lock className="w-6 h-6" />
        </div>

        <h2 className="font-serif font-bold text-xl text-[#3B121E]">
          Owner & Staff Portal
        </h2>
        <p className="text-xs text-[#703A4B] mt-1 max-w-xs leading-relaxed">
          Authenticate to manage prices in DZD, add new desserts, toggle item availability, and update categories.
        </p>

        <form onSubmit={handleSubmit} className="w-full mt-5 space-y-3">
          <div className="text-left">
            <label className="block text-[11px] font-semibold text-[#5C2333] mb-1">
              Owner Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-rose-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="Enter passcode (e.g. 1234)"
                autoFocus
                className="w-full pl-9 pr-3 py-2 text-sm bg-pink-50/50 border border-pink-200 rounded-xl text-[#3B121E] focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            Unlock Dashboard
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-pink-100 w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="w-full py-2 rounded-xl bg-pink-50 hover:bg-pink-100/80 text-rose-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Quick Demo Sign-In (Code: 1234)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
