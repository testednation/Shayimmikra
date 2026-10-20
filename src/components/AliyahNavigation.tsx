/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { AliyahData, AppTheme, UILanguage } from '../types';
import { t } from '../utils/translations';

interface AliyahNavigationProps {
  aliyot: AliyahData[];
  selectedAliyah: number | 'all';
  onSelectAliyah: (aliyah: number | 'all') => void;
  theme: AppTheme;
  lang?: UILanguage;
  aliyahCompletion: Record<number, { completed: number; total: number }>;
  onMarkAliyahComplete: (aliyahIndex: number) => void;
  onResetAliyah: (aliyahIndex: number) => void;
}

export const AliyahNavigation: React.FC<AliyahNavigationProps> = ({
  aliyot,
  selectedAliyah,
  onSelectAliyah,
  theme,
  lang = 'en',
  aliyahCompletion,
  onMarkAliyahComplete,
  onResetAliyah,
}) => {
  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  return (
    <div className="mb-6 space-y-3">
      {/* Segmented Aliyot Tabs */}
      <div className={`p-1 rounded-xl border flex items-center gap-1 overflow-x-auto ${
        isDark
          ? 'bg-[#181614] border-[#2C2720]'
          : theme === 'sefer'
          ? 'bg-stone-100 border-stone-200'
          : 'bg-[#F4ECE0] border-[#E2D6C3]'
      }`}>
        <button
          onClick={() => onSelectAliyah('all')}
          className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            selectedAliyah === 'all'
              ? isDark
                ? 'bg-[#2B2620] text-[#D4AF37] shadow-xs'
                : 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          {t(lang, 'allParasha')}
        </button>

        {aliyot.map((aliyah) => {
          const isSelected = selectedAliyah === aliyah.index;
          const stats = aliyahCompletion[aliyah.index] || { completed: 0, total: aliyah.verseCount };
          const isDone = stats.total > 0 && stats.completed >= stats.total;

          return (
            <button
              key={aliyah.nameEn}
              onClick={() => onSelectAliyah(aliyah.index)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                isSelected
                  ? isDark
                    ? 'bg-[#2B2620] text-[#D4AF37] shadow-xs'
                    : 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              <span>{isEn ? aliyah.nameEn : aliyah.nameHe}</span>
              <span className="font-mono tabular-nums text-[11px] opacity-75">
                ({stats.completed}/{stats.total})
              </span>
              {isDone && (
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Aliyah Context Bar when a single Aliyah is active */}
      {selectedAliyah !== 'all' && (
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-1">
          <div>
            <span>
              {isEn ? `${aliyot[selectedAliyah]?.nameEn} Aliyah` : `עליית ${aliyot[selectedAliyah]?.nameHe}`}
            </span>
            <span aria-hidden="true"> · </span>
            <span>
              {aliyot[selectedAliyah]?.verseCount} {isEn ? 'verses' : 'פסוקים'}
            </span>
            <span aria-hidden="true"> · </span>
            <span>
              {isEn ? aliyot[selectedAliyah]?.dayNameEn : aliyot[selectedAliyah]?.dayNameHe}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onMarkAliyahComplete(selectedAliyah)}
              className="text-[#9E7422] dark:text-[#D4AF37] hover:underline flex items-center gap-1 font-medium"
            >
              <Check className="w-3.5 h-3.5" />
              {t(lang, 'markAliyahDone')}
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => onResetAliyah(selectedAliyah)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              {t(lang, 'reset')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
