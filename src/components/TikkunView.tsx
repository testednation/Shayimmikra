/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scroll, Type, CheckCircle2, ChevronRight } from 'lucide-react';
import { AppTheme, DisplaySettings, VerseItem, VerseProgress } from '../types';
import { stripNikkud } from '../utils/hebrew';

interface TikkunViewProps {
  verses: VerseItem[];
  progressMap: Record<string, VerseProgress>;
  settings: DisplaySettings;
  theme: AppTheme;
  onExitTikkun: () => void;
  onMarkComplete: (verseId: string) => void;
}

export const TikkunView: React.FC<TikkunViewProps> = ({
  verses,
  progressMap,
  settings,
  theme,
  onExitTikkun,
  onMarkComplete,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDark
          ? 'bg-[#181614] border-[#2C2720]'
          : theme === 'sefer'
          ? 'bg-white border-stone-200'
          : 'bg-[#FAF4E8] border-[#E8DFC8]'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Scroll className="w-5 h-5 text-[#9E7422] dark:text-[#D4AF37]" />
            <h2 className="font-frank text-xl font-bold">תיקון קוראים (Tikkun Korim)</h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            תצוגה דו-טורית להכנת קריאת התורה: עמודת סת״ם כפי שכתובה בספר התורה (ללא ניקוד וטעמים) מול עמודה מנוקדת ומוטעמת.
          </p>
        </div>

        <button
          onClick={onExitTikkun}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto ${
            isDark
              ? 'bg-[#D4AF37] text-stone-950 hover:bg-[#E5C158]'
              : 'bg-[#9E7422] text-white hover:bg-[#85611B]'
          }`}
        >
          חזרה ללימוד רגיל
        </button>
      </div>

      {/* Dual Column Tikkun Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-bold text-xs">
        <div className={`p-3 rounded-lg border text-center ${
          isDark ? 'bg-[#1E1B18] border-[#2E2820] text-[#D4AF37]' : 'bg-[#F2E8D7] border-[#DFCFB5] text-[#9E7422]'
        }`}>
          עמודת ספר תורה (סת״ם - ללא ניקוד וטעמים)
        </div>
        <div className={`p-3 rounded-lg border text-center ${
          isDark ? 'bg-[#1E1B18] border-[#2E2820] text-stone-200' : 'bg-stone-100 border-stone-200 text-stone-800'
        }`}>
          עמודת חומש (מנוקד עם טעמי המקרא)
        </div>
      </div>

      {/* Dual Column Verses List */}
      <div className="space-y-3">
        {verses.map((verse) => {
          const prog = progressMap[verse.id];
          const isDone = prog?.mikra1 && prog?.mikra2 && prog?.targum;
          const stamText = stripNikkud(verse.mikraHebrew);

          return (
            <div
              key={verse.id}
              className={`rounded-xl border p-4 sm:p-5 transition-all grid grid-cols-1 md:grid-cols-2 gap-6 ${
                isDone
                  ? isDark
                    ? 'bg-[#191816]/70 border-[#2A2620]'
                    : 'bg-[#FAF8F3] border-stone-200'
                  : isDark
                  ? 'bg-[#181614] border-[#2C2720]'
                  : 'bg-white border-stone-200 shadow-xs'
              }`}
            >
              {/* Column 1: Stam Torah Scroll */}
              <div className="space-y-2 border-b md:border-b-0 md:border-l border-stone-200 dark:border-stone-800 pb-4 md:pb-0 md:pl-6 text-right">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-bold text-[#9E7422] dark:text-[#D4AF37]">
                    פסוק {verse.verseHebrew}
                  </span>
                  <span>ספר תורה</span>
                </div>
                <div
                  className="font-frank leading-relaxed text-stone-900 dark:text-stone-100 tracking-wide select-none"
                  style={{ fontSize: `${settings.fontSize}px` }}
                >
                  {stamText}
                </div>
              </div>

              {/* Column 2: Pointed Torah with Cantillation */}
              <div className="space-y-2 text-right">
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>עליה {verse.aliyahName}</span>
                  <button
                    onClick={() => onMarkComplete(verse.id)}
                    className={`flex items-center gap-1 font-medium transition-colors ${
                      isDone
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isDone ? 'נקרא' : 'סמן כנקרא'}</span>
                  </button>
                </div>
                <div
                  className="font-frank leading-relaxed text-stone-900 dark:text-stone-100 hebrew-vocalized"
                  style={{ fontSize: `${settings.fontSize}px` }}
                  dangerouslySetInnerHTML={{ __html: verse.mikraHebrew }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
