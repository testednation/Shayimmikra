/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Search, Sparkles, BookOpen } from 'lucide-react';
import { ALL_PARSHIOT } from '../data/parshiotList';
import { AppTheme, ParashaMetadata } from '../types';

interface ParashaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeParashaId: string;
  currentWeeklyParashaId: string;
  onSelectParasha: (parasha: ParashaMetadata) => void;
  theme: AppTheme;
}

const CHUMASHIM = [
  { id: 'all', nameHe: 'כל התורה' },
  { id: 'Genesis', nameHe: 'ספר בראשית' },
  { id: 'Exodus', nameHe: 'ספר שמות' },
  { id: 'Leviticus', nameHe: 'ספר ויקרא' },
  { id: 'Numbers', nameHe: 'ספר במדבר' },
  { id: 'Deuteronomy', nameHe: 'ספר דברים' },
];

export const ParashaSelectorModal: React.FC<ParashaSelectorModalProps> = ({
  isOpen,
  onClose,
  activeParashaId,
  currentWeeklyParashaId,
  onSelectParasha,
  theme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChumash, setSelectedChumash] = useState('all');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const filtered = ALL_PARSHIOT.filter((p) => {
    const matchesChumash = selectedChumash === 'all' || p.chumashEn === selectedChumash;
    const matchesSearch =
      p.nameHe.includes(searchTerm) ||
      p.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.chumashHe.includes(searchTerm);
    return matchesChumash && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-3xl rounded-xl border max-h-[88vh] flex flex-col shadow-2xl transition-all ${
        isDark
          ? 'bg-[#181614] border-[#2C2720] text-[#EDE7DC]'
          : 'bg-[#FCFAF6] border-[#E8DFC8] text-[#24201A]'
      }`}>
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#9E7422] dark:text-[#D4AF37]" />
            <h2 className="font-frank text-xl font-bold">בחירת פרשת השבוע</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            aria-label="סגור חלון"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Chumash Filter Bar */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="חיפוש לפי שם פרשה (למשל: נח, בראשית, וירא, Lech-Lecha)..."
              className={`w-full pr-9 pl-4 py-2 text-xs rounded-lg border outline-none transition-all ${
                isDark
                  ? 'bg-[#221F1B] border-[#383127] text-stone-100 focus:border-[#D4AF37]'
                  : 'bg-white border-stone-300 text-stone-900 focus:border-[#9E7422]'
              }`}
            />
          </div>

          {/* Chumash Segmented Control */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CHUMASHIM.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChumash(c.id)}
                className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  selectedChumash === c.id
                    ? 'bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 font-medium'
                    : isDark
                    ? 'bg-[#221F1B] text-stone-300 hover:bg-[#2C2722]'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {c.nameHe}
              </button>
            ))}
          </div>
        </div>

        {/* Parshiot Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {filtered.map((parasha) => {
            const isSelected = parasha.id === activeParashaId;
            const isThisWeek = parasha.id === currentWeeklyParashaId;

            return (
              <button
                key={parasha.id}
                onClick={() => {
                  onSelectParasha(parasha);
                  onClose();
                }}
                className={`text-right p-3.5 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/10'
                    : isDark
                    ? 'border-[#2C2720] hover:bg-[#201D19] text-stone-300'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold font-frank text-base text-stone-900 dark:text-stone-100">
                    {parasha.nameHe}
                  </span>
                  {isThisWeek && (
                    <span className="text-[10px] text-[#9E7422] dark:text-[#D4AF37] font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">
                      השבוע
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-stone-500 dark:text-stone-400">
                  {parasha.chumashHe} · {parasha.nameEn}
                </div>

                <div className="text-[10px] text-stone-400 dark:text-stone-500 font-mono tabular-nums mt-1">
                  {parasha.versesTotal} פסוקים
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 flex items-center justify-between">
          <span>נמצאו {filtered.length} פרשיות</span>
          <button
            onClick={() => {
              const current = ALL_PARSHIOT.find((p) => p.id === currentWeeklyParashaId);
              if (current) {
                onSelectParasha(current);
                onClose();
              }
            }}
            className="text-[#9E7422] dark:text-[#D4AF37] font-medium hover:underline"
          >
            קפיצה לפרשת השבוע הנוכחית
          </button>
        </div>

      </div>
    </div>
  );
};
