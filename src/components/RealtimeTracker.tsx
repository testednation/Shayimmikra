/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, Clock, Gauge, ArrowDown, BookOpen, Layers, Check, Play, Pause, BookMarked, Eye, Sparkles } from 'lucide-react';
import { AppTheme, BookmarkInfo, DisplaySettings, StudyMode, VerseItem, VerseProgress } from '../types';
import { t } from '../utils/translations';

interface RealtimeTrackerProps {
  activeVerse?: VerseItem;
  activeVerseProgress?: VerseProgress;
  totalCompleted: number;
  totalVerses: number;
  currentAliyahCompleted: number;
  currentAliyahTotal: number;
  currentAliyahName: string;
  bookmark: BookmarkInfo | null;
  onSetBookmark: (verse: VerseItem) => void;
  onJumpToBookmark: () => void;
  settings: DisplaySettings;
  studyMode: StudyMode;
  onToggleReadingFlow: () => void;
  onToggleRashi: () => void;
  onToggleDistractionFree?: () => void;
  onToggleFocusMode?: () => void;
  theme: AppTheme;
}

export const RealtimeTracker: React.FC<RealtimeTrackerProps> = ({
  activeVerse,
  activeVerseProgress,
  totalCompleted,
  totalVerses,
  currentAliyahCompleted,
  currentAliyahTotal,
  currentAliyahName,
  bookmark,
  onSetBookmark,
  onJumpToBookmark,
  settings,
  studyMode,
  onToggleReadingFlow,
  onToggleRashi,
  onToggleDistractionFree,
  onToggleFocusMode,
  theme,
}) => {
  const isDark = theme === 'dark';
  const lang = settings.uiLanguage;
  const isEn = lang === 'en';

  // Live session timer
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isCurrentBookmarked = activeVerse && bookmark && bookmark.verseId === activeVerse.id;
  const isRashiActive = studyMode === 'rashi' || settings.showRashi;

  const currentStep = !activeVerseProgress?.mikra1
    ? (isEn ? '1st Mikra' : 'מקרא א׳')
    : !activeVerseProgress?.mikra2
    ? (isEn ? '2nd Mikra' : 'מקרא ב׳')
    : !activeVerseProgress?.targum
    ? (isEn ? 'Targum' : 'תרגום')
    : (isEn ? 'Done' : 'הושלם');

  return (
    <div className={`rounded-xl border p-3.5 mb-6 transition-all duration-200 ${
      isDark
        ? 'bg-[#181614] border-[#2C2720] text-[#EDE7DC]'
        : theme === 'sefer'
        ? 'bg-white border-stone-200 shadow-xs'
        : 'bg-[#FCFAF6] border-[#E8DFC8] shadow-xs'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left/Start Zone: Active Verse & Step Context */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-[#9E7422] dark:text-[#D4AF37] shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>

          <div className="space-y-0.5 text-right">
            <div className="flex items-center gap-2 text-xs font-sans">
              <span className="font-bold text-stone-900 dark:text-stone-100 font-frank text-sm">
                {activeVerse
                  ? isEn
                    ? `Verse ${activeVerse.verse}`
                    : `פסוק ${activeVerse.verseHebrew}`
                  : isEn
                  ? 'Start Learning'
                  : 'מתחיל לימוד'}
              </span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span className="text-stone-500 dark:text-stone-400">
                {isEn
                  ? `${currentAliyahName} Aliyah (${currentAliyahCompleted}/${currentAliyahTotal})`
                  : `עליית ${currentAliyahName} (${currentAliyahCompleted}/${currentAliyahTotal})`}
              </span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                currentStep === (isEn ? 'Done' : 'הושלם')
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-500/15 text-[#9E7422] dark:text-[#D4AF37]'
              }`}>
                {isEn ? `Step: ${currentStep}` : `שלב נוכחי: ${currentStep}`}
              </span>
            </div>

            {/* Micro 3-step live indicator */}
            <div className="flex items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
              <span className={`flex items-center gap-1 ${activeVerseProgress?.mikra1 ? 'text-[#9E7422] dark:text-[#D4AF37] font-bold' : 'opacity-60'}`}>
                1. {isEn ? 'Mikra' : 'מקרא'} {activeVerseProgress?.mikra1 ? '✓' : '○'}
              </span>
              <span>·</span>
              <span className={`flex items-center gap-1 ${activeVerseProgress?.mikra2 ? 'text-[#9E7422] dark:text-[#D4AF37] font-bold' : 'opacity-60'}`}>
                2. {isEn ? 'Mikra' : 'מקרא'} {activeVerseProgress?.mikra2 ? '✓' : '○'}
              </span>
              <span>·</span>
              <span className={`flex items-center gap-1 ${activeVerseProgress?.targum ? 'text-[#9E7422] dark:text-[#D4AF37] font-bold' : 'opacity-60'}`}>
                3. {isEn ? 'Targum' : 'תרגום'} {activeVerseProgress?.targum ? '✓' : '○'}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Zone: Live Session Stopwatch & Pace */}
        <div className="flex items-center gap-4 text-xs font-mono text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-1.5" title={isEn ? 'Session Time' : 'זמן לימוד ברצף'}>
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span className="tabular-nums font-semibold">{formatTime(secondsElapsed)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
            >
              {isTimerRunning ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
            </button>
          </div>

          <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">|</span>

          <div className="flex items-center gap-1.5" title={isEn ? 'Pace' : 'קצב התקדמות'}>
            <Gauge className="w-3.5 h-3.5 text-stone-400" />
            <span className="tabular-nums">
              {secondsElapsed > 60 && totalCompleted > 0
                ? `${Math.round((totalCompleted / (secondsElapsed / 3600)))} ${t(lang, 'versesPerHour')}`
                : `${totalCompleted}/${totalVerses} ${isEn ? 'verses' : 'פסוקים'}`}
            </span>
          </div>
        </div>

        {/* Right Zone: Rashi Toggle, 2x1x Flow Switch & Bookmark Controls */}
        <div className="flex items-center gap-2">
          
          {/* Dedicated Rashi Toggle */}
          <button
            onClick={onToggleRashi}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isRashiActive
                ? 'bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 border-transparent shadow-xs'
                : isDark
                ? 'border-[#332C22] hover:bg-[#221F1B] text-stone-300'
                : 'border-stone-200 hover:bg-stone-100 text-stone-700'
            }`}
            title={isEn ? 'Toggle Rashi commentary alongside each verse' : 'הפעל/כבה פירוש רש״י צמוד לכל פסוק'}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>{isEn ? (isRashiActive ? 'Rashi (On)' : 'Rashi (Off)') : (isRashiActive ? 'רש״י (פעיל)' : 'רש״י (כבוי)')}</span>
          </button>

          {/* Format Toggle: 2x Torah 1x Onkelos */}
          <button
            onClick={onToggleReadingFlow}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              settings.readingFlow === 'sequential_2x1x'
                ? 'bg-amber-500/15 text-[#9E7422] dark:text-[#D4AF37] border-[#9E7422]/30 dark:border-[#D4AF37]/30'
                : isDark
                ? 'border-[#332C22] hover:bg-[#221F1B] text-stone-300'
                : 'border-stone-200 hover:bg-stone-100 text-stone-700'
            }`}
            title={isEn ? 'Toggle 2x Torah + 1x Onkelos vs Stepper' : 'החלף בין תצוגת 2x מקרא + 1x תרגום ברצף לבין תצוגת צעדים'}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t(lang, 'format2x1x')}</span>
          </button>

          {/* Distraction-Free Mode Toggle */}
          {onToggleDistractionFree && (
            <button
              onClick={onToggleDistractionFree}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                studyMode === 'distraction_free'
                  ? 'bg-amber-500/15 text-[#9E7422] dark:text-[#D4AF37] border-[#9E7422]/30 dark:border-[#D4AF37]/30'
                  : isDark
                  ? 'border-[#332C22] hover:bg-[#221F1B] text-stone-300'
                  : 'border-stone-200 hover:bg-stone-100 text-stone-700'
              }`}
              title={isEn ? 'Enter distraction-free mode with just the text' : 'עבור למצב קריאה נקי ללא הסחות דעת עם הטקסט בלבד'}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isEn ? 'Just Text' : 'טקסט בלבד'}</span>
            </button>
          )}

          {/* Focus Mode (Single-verse immersion) Toggle */}
          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                isDark
                  ? 'border-amber-500/40 bg-amber-500/15 text-[#D4AF37] hover:bg-amber-500/25 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                  : 'border-amber-600/40 bg-[#FAF1DC] text-[#9E7422] hover:bg-[#F4E4BF] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              }`}
              title={isEn ? "Focus Mode: Collapse all UI except current verse (Press 'F')" : "מצב מיקוד: בידוד הפסוק הנוכחי לחוויה סוחפת (הקש 'F')"}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="hidden sm:inline">{t(lang, 'focusMode')}</span>
              <kbd className="hidden md:inline text-[9px] px-1 py-0.2 rounded border border-amber-500/40 font-mono">F</kbd>
            </button>
          )}

          {/* Bookmark Current Verse */}
          {activeVerse && (
            <button
              onClick={() => onSetBookmark(activeVerse)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isCurrentBookmarked
                  ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/15 text-[#9E7422] dark:text-[#D4AF37]'
                  : isDark
                  ? 'border-[#332C22] hover:bg-[#221F1B] text-stone-300'
                  : 'border-stone-200 hover:bg-stone-100 text-stone-700'
              }`}
              title={isCurrentBookmarked ? t(lang, 'bookmarkSet') : t(lang, 'setBookmark')}
            >
              {isCurrentBookmarked ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#9E7422] dark:text-[#D4AF37]" />
                  <span className="hidden sm:inline">{t(lang, 'bookmarkSet')}</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden sm:inline">{t(lang, 'setBookmark')}</span>
                </>
              )}
            </button>
          )}

          {/* Jump to existing bookmark if exists */}
          {bookmark && (
            <button
              onClick={onJumpToBookmark}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isDark
                  ? 'border-[#3D3529] bg-[#221F1B] text-[#D4AF37] hover:bg-[#2C2722]'
                  : 'border-[#DFCDB3] bg-[#F7EFE1] text-[#9E7422] hover:bg-[#EFE4CF]'
              }`}
              title={`${t(lang, 'jumpToBookmark')}: ${bookmark.verseId}`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>{isEn ? `Bookmark (${bookmark.verse})` : `חזור לסימנייה (${bookmark.verseHebrew})`}</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
