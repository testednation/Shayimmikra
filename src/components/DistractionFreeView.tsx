/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Type,
  Sun,
  Moon,
  Scroll,
  Layers,
  BookOpen,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { AliyahData, AppTheme, DisplaySettings, ParashaMetadata, VerseItem, VerseProgress } from '../types';
import { getFontClass } from './VerseCard';
import { stripNikkud, stripTeamim } from '../utils/hebrew';

interface DistractionFreeViewProps {
  parasha: ParashaMetadata;
  verses: VerseItem[];
  aliyot: AliyahData[];
  settings: DisplaySettings;
  theme: AppTheme;
  progressMap: Record<string, VerseProgress>;
  onExit: () => void;
  onUpdateStep: (verseId: string, step: 'mikra1' | 'mikra2' | 'targum', value: boolean) => void;
  onMarkComplete: (verseId: string) => void;
  onChangeTheme: (theme: AppTheme) => void;
  onChangeFontSize: (delta: number) => void;
}

export const DistractionFreeView: React.FC<DistractionFreeViewProps> = ({
  parasha,
  verses,
  aliyot,
  settings,
  theme,
  progressMap,
  onExit,
  onUpdateStep,
  onMarkComplete,
  onChangeTheme,
  onChangeFontSize,
}) => {
  const [textLayout, setTextLayout] = useState<'2x1x' | 'torah_only' | 'column'>('2x1x');
  const [showControls, setShowControls] = useState<boolean>(true);
  const mouseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isEn = settings.uiLanguage === 'en';
  const isDark = theme === 'dark';

  // Listen for Escape key to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  // Auto-hide floating controls after 4 seconds of no mouse movement
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
      mouseTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 4000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    };
  }, []);

  const torahFont = getFontClass(settings.fontFamily);
  const onkelosFont = getFontClass(settings.onkelosFont);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto transition-colors duration-300 selection:bg-amber-200 selection:text-amber-950 ${
        theme === 'dark'
          ? 'bg-[#121110] text-[#EFEBE4]'
          : theme === 'sefer'
          ? 'bg-[#F9FAFB] text-[#111827]'
          : 'bg-[#FBF8F3] text-[#24211D]'
      }`}
      dir="rtl"
    >
      {/* Floating Minimalist Control Dock */}
      <aside
        aria-label="Distraction-free reading controls"
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full shadow-xl border backdrop-blur-md text-xs font-sans ${
            theme === 'dark'
              ? 'bg-[#1C1A18]/90 border-[#383125] text-stone-300'
              : 'bg-white/90 border-[#E8DFC8] text-stone-700'
          }`}
        >
          {/* Mode Switch: 2x1x vs Torah Only */}
          <div className="flex items-center rounded-full bg-stone-100 dark:bg-stone-800 p-0.5">
            <button
              onClick={() => setTextLayout('2x1x')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                textLayout === '2x1x'
                  ? 'bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 font-bold'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {isEn ? '2x Torah + 1x Targum' : 'שניים מקרא ואחד תרגום'}
            </button>
            <button
              onClick={() => setTextLayout('torah_only')}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors ${
                textLayout === 'torah_only'
                  ? 'bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 font-bold'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
              }`}
            >
              {isEn ? 'Torah Only' : 'מקרא בלבד'}
            </button>
          </div>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700" />

          {/* Font Size controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChangeFontSize(-2)}
              className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
              title={isEn ? 'Decrease font size' : 'הקטן גופן'}
            >
              <span className="font-bold text-xs">A-</span>
            </button>
            <span className="text-[11px] font-mono tabular-nums text-stone-400">
              {settings.fontSize}px
            </span>
            <button
              onClick={() => onChangeFontSize(2)}
              className="p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
              title={isEn ? 'Increase font size' : 'הגדל גופן'}
            >
              <span className="font-bold text-xs">A+</span>
            </button>
          </div>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700" />

          {/* Theme switcher */}
          <button
            onClick={() => {
              const next: AppTheme = theme === 'parchment' ? 'dark' : theme === 'dark' ? 'sefer' : 'parchment';
              onChangeTheme(next);
            }}
            className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
            title={isEn ? 'Toggle theme' : 'החלף מצב צבע'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          <div className="w-px h-4 bg-stone-300 dark:bg-stone-700" />

          {/* Exit Distraction Free */}
          <button
            onClick={onExit}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-rose-500 hover:text-white transition-colors"
            title={isEn ? 'Exit Distraction-Free Mode (Esc)' : 'יציאה ממצב ללא הסחות דעת (Esc)'}
          >
            <X className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">{isEn ? 'Exit' : 'יציאה'}</span>
          </button>
        </div>
      </aside>

      {/* Main Distraction-Free Pure Reading Surface */}
      <main className="max-w-3xl mx-auto px-6 py-20 sm:py-24 space-y-12">
        
        {/* Parasha Header */}
        <header className="text-center space-y-2 pb-8 border-b border-stone-200/50 dark:border-stone-800/50">
          <h1 className="font-frank text-3xl sm:text-4xl font-bold tracking-tight text-[#9E7422] dark:text-[#D4AF37]">
            פרשת {parasha.nameHe}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 font-sans">
            {parasha.chumashHe} · {parasha.nameEn}
          </p>
        </header>

        {/* Verses by Aliyah */}
        {aliyot.map((aliyah) => {
          const aliyahVerses = verses.filter((v) => v.aliyahIndex === aliyah.index);
          if (aliyahVerses.length === 0) return null;

          return (
            <section key={aliyah.index} className="space-y-6">
              
              {/* Subtle Aliyah Title */}
              <div className="pt-6 pb-2 border-b border-stone-200/40 dark:border-stone-800/40 flex items-center justify-between text-xs text-stone-500 font-sans">
                <span className="font-bold text-[#9E7422] dark:text-[#D4AF37] text-sm font-frank">
                  עליית {aliyah.nameHe}
                </span>
                <span className="text-[11px] opacity-70">
                  {aliyahVerses.length} {isEn ? 'verses' : 'פסוקים'}
                </span>
              </div>

              {/* Text Body */}
              <div className="space-y-8">
                {aliyahVerses.map((verse) => {
                  let displayMikra = verse.mikraHebrew;
                  if (!settings.showTeamim && settings.showNikkud) {
                    displayMikra = stripTeamim(displayMikra);
                  } else if (!settings.showNikkud) {
                    displayMikra = stripNikkud(displayMikra);
                  }

                  let displayTargum = verse.targumHebrew;
                  if (!settings.showNikkud) {
                    displayTargum = stripNikkud(displayTargum);
                  }

                  const prog = progressMap[verse.id];
                  const isDone = prog?.mikra1 && prog?.mikra2 && prog?.targum;

                  if (textLayout === 'torah_only') {
                    // Continuous pure Torah text with subtle verse markers
                    return (
                      <div
                        key={verse.id}
                        onClick={() => onMarkComplete(verse.id)}
                        className={`group relative transition-opacity duration-200 cursor-pointer ${
                          isDone ? 'opacity-90' : 'opacity-100'
                        }`}
                      >
                        <span className="inline-block font-sans text-xs font-bold text-[#9E7422] dark:text-[#D4AF37] ml-2 select-none">
                          [{verse.verseHebrew}]
                        </span>
                        <span
                          className={`${torahFont} text-right leading-loose transition-colors text-stone-900 dark:text-stone-100`}
                          style={{ fontSize: `${settings.fontSize}px` }}
                          dangerouslySetInnerHTML={{ __html: displayMikra }}
                        />
                      </div>
                    );
                  }

                  // 2x Torah + 1x Onkelos flow
                  return (
                    <article
                      key={verse.id}
                      className="group relative space-y-2 pb-6 border-b border-stone-200/30 dark:border-stone-800/30"
                    >
                      {/* Verse marker & quick complete badge */}
                      <div className="flex items-center justify-between text-xs font-sans text-stone-400">
                        <span className="font-bold text-[#9E7422] dark:text-[#D4AF37] text-sm font-frank">
                          פסוק {verse.verseHebrew}
                        </span>
                        <button
                          onClick={() => onMarkComplete(verse.id)}
                          className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded transition-colors ${
                            isDone
                              ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                              : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>{isDone ? (isEn ? 'Completed' : 'הושלם') : (isEn ? 'Mark' : 'סמן')}</span>
                        </button>
                      </div>

                      {/* 1st Mikra */}
                      <div
                        className={`${torahFont} text-right leading-loose text-stone-900 dark:text-stone-100 ${
                          settings.boldFirstMikra ? 'font-bold' : 'font-normal'
                        }`}
                        style={{ fontSize: `${settings.fontSize}px` }}
                        dangerouslySetInnerHTML={{ __html: displayMikra }}
                      />

                      {/* 2nd Mikra */}
                      <div
                        className={`${torahFont} text-right leading-loose text-stone-900/90 dark:text-stone-100/90 font-normal`}
                        style={{ fontSize: `${settings.fontSize}px` }}
                        dangerouslySetInnerHTML={{ __html: displayMikra }}
                      />

                      {/* 3rd Onkelos */}
                      <div
                        className={`${onkelosFont} text-right leading-relaxed text-[#7A5B18] dark:text-[#E2C372] pt-1`}
                        style={{ fontSize: `${Math.max(16, settings.fontSize - 2)}px` }}
                        dangerouslySetInnerHTML={{ __html: displayTargum }}
                      />
                    </article>
                  );
                })}
              </div>

            </section>
          );
        })}

        {/* Minimalist End of Parasha marker */}
        <div className="text-center py-12 space-y-3">
          <p className="font-frank text-xl text-[#9E7422] dark:text-[#D4AF37]">
            חֲזַק חֲזַק וְנִתְחַזֵּק
          </p>
          <button
            onClick={onExit}
            className="px-5 py-2 rounded-full border border-stone-300 dark:border-stone-700 text-xs font-sans text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {isEn ? 'Return to Standard Mode' : 'חזרה לתצוגה הרגילה'}
          </button>
        </div>

      </main>
    </div>
  );
};
