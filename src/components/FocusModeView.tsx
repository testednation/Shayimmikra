/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  Minimize2,
  Type,
  Sun,
  Moon,
  Scroll,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Check,
} from 'lucide-react';
import { AppTheme, DisplaySettings, StudyMode, UILanguage, VerseItem, VerseProgress } from '../types';
import { VerseCard } from './VerseCard';
import { t } from '../utils/translations';

interface FocusModeViewProps {
  verse: VerseItem;
  progress: VerseProgress;
  settings: DisplaySettings;
  studyMode: StudyMode;
  theme: AppTheme;
  lang: UILanguage;
  parashaName: string;
  activeVerseIndex: number;
  totalVerses: number;
  isBookmarked: boolean;
  isPlayingAudio: boolean;
  onExitFocusMode: () => void;
  onNextVerse: () => void;
  onPrevVerse: () => void;
  onUpdateStep: (step: 'mikra1' | 'mikra2' | 'targum', value: boolean) => void;
  onMarkComplete: () => void;
  onToggleBookmark: () => void;
  onPlayAudio: () => void;
  onChangeTheme: (theme: AppTheme) => void;
  onChangeFontSize: (delta: number) => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({
  verse,
  progress,
  settings,
  studyMode,
  theme,
  lang,
  parashaName,
  activeVerseIndex,
  totalVerses,
  isBookmarked,
  isPlayingAudio,
  onExitFocusMode,
  onNextVerse,
  onPrevVerse,
  onUpdateStep,
  onMarkComplete,
  onToggleBookmark,
  onPlayAudio,
  onChangeTheme,
  onChangeFontSize,
}) => {
  const isDark = theme === 'dark';
  const isEn = lang === 'en';
  const isComplete = progress.mikra1 && progress.mikra2 && progress.targum;

  // Listen for Escape or F key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'Escape' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        onExitFocusMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExitFocusMode]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col transition-colors duration-300 ${
        isDark
          ? 'bg-[#12100E] text-[#EDE7DC]'
          : theme === 'sefer'
          ? 'bg-[#FDFCFA] text-gray-900'
          : 'bg-[#F5EFE3] text-[#24201A]'
      }`}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {/* Immersive Top Bar HUD */}
      <header
        className={`sticky top-0 z-30 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-[#171411]/90 border-[#2D2720]'
            : theme === 'sefer'
            ? 'bg-white/90 border-gray-200 shadow-xs'
            : 'bg-[#FAF6EF]/90 border-[#E5DCcb] shadow-xs'
        }`}
      >
        {/* Left/Right: Parasha and Verse Location */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-frank font-bold text-lg text-[#9E7422] dark:text-[#D4AF37]">
              {parashaName}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium border bg-amber-500/10 text-[#9E7422] dark:text-[#D4AF37] border-amber-500/30">
              {isEn ? `Aliyah ${verse.aliyahIndex + 1}` : `עלייה ${verse.aliyahName}`}
            </span>
          </div>

          <span className="text-xs text-stone-500 font-mono hidden sm:inline">
            {isEn
              ? `Verse ${activeVerseIndex + 1} of ${totalVerses}`
              : `פסוק ${activeVerseIndex + 1} מתוך ${totalVerses}`}
          </span>
        </div>

        {/* Center: Glowing Focus Mode Badge with exit trigger */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all ${
              isDark
                ? 'bg-amber-950/40 border-amber-600/40 text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                : 'bg-amber-100/70 border-amber-400 text-amber-900 shadow-[0_0_12px_rgba(212,175,55,0.25)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="font-frank tracking-wide">{t(lang, 'focusMode')}</span>
            <span className="text-[10px] opacity-75 hidden md:inline font-sans">
              · {isEn ? 'Press' : 'הקש'} <kbd className="px-1 py-0.2 rounded border bg-black/10 dark:bg-white/10 font-mono text-[9px]">F</kbd> {isEn ? 'or' : 'או'} <kbd className="px-1 py-0.2 rounded border bg-black/10 dark:bg-white/10 font-mono text-[9px]">Esc</kbd>
            </span>
          </div>
        </div>

        {/* Right/Left: Controls & Exit Button */}
        <div className="flex items-center gap-2">
          {/* Audio speech button */}
          <button
            onClick={onPlayAudio}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              isPlayingAudio
                ? 'border-amber-500 bg-amber-500/20 text-amber-600 dark:text-amber-300 animate-pulse'
                : isDark
                ? 'border-[#332C22] bg-[#1E1B17] text-stone-300 hover:bg-[#2A251F]'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
            }`}
            title={isEn ? 'Read Hebrew Verse Aloud' : 'הקראת הפסוק בקול'}
            aria-label="Audio reading"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Bookmark Button */}
          <button
            onClick={onToggleBookmark}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              isBookmarked
                ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/15 text-[#9E7422] dark:text-[#D4AF37]'
                : isDark
                ? 'border-[#332C22] bg-[#1E1B17] text-stone-300 hover:bg-[#2A251F]'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100'
            }`}
            title={isBookmarked ? t(lang, 'bookmarkSet') : t(lang, 'setBookmark')}
            aria-label="Bookmark"
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
            ) : (
              <Bookmark className="w-4 h-4 text-stone-400" />
            )}
          </button>

          {/* Font Size controls */}
          <div className="hidden sm:flex items-center rounded-lg border overflow-hidden border-stone-300 dark:border-[#332C22]">
            <button
              onClick={() => onChangeFontSize(-2)}
              className="px-2 py-1 text-xs hover:bg-stone-200 dark:hover:bg-[#2A251F] transition-colors"
              title="Decrease font size"
            >
              A-
            </button>
            <button
              onClick={() => onChangeFontSize(2)}
              className="px-2 py-1 text-xs hover:bg-stone-200 dark:hover:bg-[#2A251F] transition-colors border-l dark:border-[#332C22]"
              title="Increase font size"
            >
              A+
            </button>
          </div>

          {/* Theme switcher */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onChangeTheme('parchment')}
              className={`p-1.5 rounded-md border text-xs ${
                theme === 'parchment'
                  ? 'border-[#9E7422] bg-[#EFE3CD] text-[#9E7422]'
                  : 'border-transparent text-stone-500 hover:bg-stone-200/50'
              }`}
              title="Parchment Theme"
            >
              <Scroll className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTheme('sefer')}
              className={`p-1.5 rounded-md border text-xs ${
                theme === 'sefer'
                  ? 'border-gray-400 bg-white text-gray-900 shadow-xs'
                  : 'border-transparent text-stone-500 hover:bg-stone-200/50'
              }`}
              title="Clean Sefer Theme"
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTheme('dark')}
              className={`p-1.5 rounded-md border text-xs ${
                theme === 'dark'
                  ? 'border-[#D4AF37] bg-[#2A241D] text-[#D4AF37]'
                  : 'border-transparent text-stone-500 hover:bg-stone-200/50'
              }`}
              title="Dark Theme"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Exit Focus Mode Button */}
          <button
            onClick={onExitFocusMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-600/30 dark:border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 text-[#9E7422] dark:text-[#D4AF37] font-semibold text-xs transition-all shadow-xs cursor-pointer ml-1"
            title={`${t(lang, 'exitFocusMode')} (Esc / F)`}
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">{t(lang, 'exitFocusMode')}</span>
            <kbd className="px-1.5 py-0.5 rounded border border-amber-500/30 bg-black/10 dark:bg-white/10 text-[10px] font-mono">
              Esc
            </kbd>
          </button>
        </div>
      </header>

      {/* Main Immersive Canvas */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12 max-w-4xl w-full mx-auto">
        {/* Subtle verse context line */}
        <div className="w-full flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-3 px-2 font-frank">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#9E7422] dark:text-[#D4AF37]">
              {verse.id}
            </span>
            <span>·</span>
            <span>{isEn ? `Aliyah ${verse.aliyahIndex + 1}` : `עליית ${verse.aliyahName}`}</span>
          </div>
          <div className="flex items-center gap-3 font-sans">
            <span className="tabular-nums">
              {isEn ? `Verse ${activeVerseIndex + 1} of ${totalVerses}` : `פסוק ${activeVerseIndex + 1} מתוך ${totalVerses}`}
            </span>
            {isComplete && (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                <Check className="w-3.5 h-3.5" />
                {isEn ? 'Completed' : 'הושלם'}
              </span>
            )}
          </div>
        </div>

        {/* The Active Verse Card */}
        <div className="w-full animate-fadeIn transition-all duration-300">
          <VerseCard
            verse={verse}
            progress={progress}
            settings={settings}
            studyMode={studyMode}
            isActive={true}
            isBookmarked={isBookmarked}
            onUpdateStep={onUpdateStep}
            onMarkComplete={onMarkComplete}
            onSelectVerse={() => {}}
            onToggleBookmark={onToggleBookmark}
            isPlayingAudio={isPlayingAudio}
            onPlayAudio={onPlayAudio}
          />
        </div>

        {/* Navigation & Study Stepper Bar */}
        <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border bg-white/70 dark:bg-[#1A1713]/80 border-stone-200 dark:border-[#2D2720] shadow-sm">
          {/* Previous Verse Button */}
          <button
            onClick={onPrevVerse}
            disabled={activeVerseIndex <= 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
              activeVerseIndex <= 0
                ? 'opacity-40 cursor-not-allowed border-stone-200 dark:border-stone-800 text-stone-400'
                : isDark
                ? 'border-[#332C22] bg-[#221E19] text-stone-200 hover:bg-[#2C2720] hover:border-amber-500/40'
                : 'border-stone-300 bg-stone-50 text-stone-800 hover:bg-stone-100 hover:border-amber-600/40'
            }`}
            title={isEn ? 'Previous Verse (ArrowUp or K)' : 'פסוק קודם (חץ למעלה או K)'}
          >
            {isEn ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>{isEn ? 'Previous Verse' : 'פסוק קודם'}</span>
            <kbd className="hidden sm:inline px-1 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-[10px]">
              K
            </kbd>
          </button>

          {/* Stepper Progress Indicator & Spacebar Prompt */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                progress.mikra1 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-500'
              }`}>
                {progress.mikra1 && <Check className="w-3 h-3" />}
                {isEn ? 'Mikra 1' : 'מקרא א׳'}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                progress.mikra2 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-500'
              }`}>
                {progress.mikra2 && <Check className="w-3 h-3" />}
                {isEn ? 'Mikra 2' : 'מקרא ב׳'}
              </span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                progress.targum ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300' : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-500'
              }`}>
                {progress.targum && <Check className="w-3 h-3" />}
                {isEn ? 'Targum' : 'תרגום'}
              </span>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              <kbd className="px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-[10px] bg-stone-100 dark:bg-stone-800">
                Space
              </kbd>{' '}
              {isEn ? 'to advance step or next verse' : 'להשלמת שלב או מעבר לפסוק הבא'}
            </p>
          </div>

          {/* Next Verse Button */}
          <button
            onClick={onNextVerse}
            disabled={activeVerseIndex >= totalVerses - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
              activeVerseIndex >= totalVerses - 1
                ? 'opacity-40 cursor-not-allowed border-stone-200 dark:border-stone-800 text-stone-400'
                : isDark
                ? 'border-[#332C22] bg-[#221E19] text-stone-200 hover:bg-[#2C2720] hover:border-amber-500/40'
                : 'border-stone-300 bg-stone-50 text-stone-800 hover:bg-stone-100 hover:border-amber-600/40'
            }`}
            title={isEn ? 'Next Verse (ArrowDown or J)' : 'פסוק הבא (חץ למטה או J)'}
          >
            <span>{isEn ? 'Next Verse' : 'פסוק הבא'}</span>
            <kbd className="hidden sm:inline px-1 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono text-[10px]">
              J
            </kbd>
            {isEn ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Minimal Footer Shortcuts Reference */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-400 dark:text-stone-500 font-sans">
          <span>
            <kbd className="px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">Space</kbd>{' '}
            {isEn ? 'step' : 'שלב'}
          </span>
          <span>
            <kbd className="px-1 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">1</kbd>{' '}
            <kbd className="px-1 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">2</kbd>{' '}
            <kbd className="px-1 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">3</kbd>{' '}
            {isEn ? 'direct mark' : 'סימון'}
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">B</kbd>{' '}
            {isEn ? 'bookmark' : 'סימנייה'}
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">R</kbd>{' '}
            {isEn ? 'Rashi' : 'רש״י'}
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">F</kbd>{' '}
            / <kbd className="px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">Esc</kbd>{' '}
            {isEn ? 'exit Focus Mode' : 'יציאה ממצב מיקוד'}
          </span>
        </div>
      </main>
    </div>
  );
};
