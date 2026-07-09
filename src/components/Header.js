'use client';

import React from 'react';
import { useLanguage } from './LanguageProvider';

export default function Header() {
  const { lang, toggleLanguage, t } = useLanguage();

  return (
    <header className="bg-white border-b-4 border-brand-navy text-brand-navy shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Shivpratha Logo" className="h-12 w-auto object-contain" />
          <h1 className="font-bold text-lg md:text-xl truncate hidden sm:block">
            {t('brand')}
          </h1>
        </div>
        <button
          onClick={toggleLanguage}
          className="bg-brand-rust text-white font-semibold px-4 py-1.5 rounded-full hover:opacity-90 transition-colors shrink-0 text-sm md:text-base shadow-sm"
        >
          {t('toggle')}
        </button>
      </div>
    </header>
  );
}
