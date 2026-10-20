/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Sliders, ScrollText, BookCheck, HelpCircle, Bookmark, Languages, HardDriveDownload, Eye, BarChart3, Flame, CloudUpload, Sparkles, Target, Check } from 'lucide-react';
import { AppTheme, BookmarkInfo, StudyMode, UILanguage } from '../types';
import { t } from '../utils/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentParashaName: string;
  theme: AppTheme;
  mode: StudyMode;
  lang: UILanguage;
  bookmark: BookmarkInfo | null;
  onJumpToBookmark: () => void;
  onSelectMode: (mode: StudyMode) => void;
  onOpenParashaSelector: () => void;
  onOpenSettings: () => void;
  onOpenHalachaGuide: () => void;
  onOpenInstructions: () => void;
  onOpenOfflineExport: () => void;
  onOpenDashboard: () => void;
  onOpenDailyGoal?: () => void;
  onToggleLanguage: () => void;
  onToggleFocusMode?: () => void;
  progressPercent: number;
  streakDays?: number;
  hasCompletedToday?: boolean;
  dailyGoal?: number;
  todayCompletedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentParashaName,
  theme,
  mode,
  lang,
  bookmark,
  onJumpToBookmark,
  onSelectMode,
  onOpenParashaSelector,
  onOpenSettings,
  onOpenHalachaGuide,
  onOpenInstructions,
  onOpenOfflineExport,
  onOpenDashboard,
  onOpenDailyGoal,
  onToggleLanguage,
  onToggleFocusMode,
  progressPercent,
  streakDays = 0,
  hasCompletedToday = false,
  dailyGoal = 18,
  todayCompletedCount = 0,
}) => {
  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  // Daily Study Goal Progress Ring calculation
  const goal = dailyGoal > 0 ? dailyGoal : 18;
  const goalPercent = Math.min(100, Math.round((todayCompletedCount / goal) * 100));
  const isGoalMet = todayCompletedCount >= goal;
  const ringRadius = 11;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (goalPercent / 100) * ringCircumference;

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b ${
      isDark
        ? 'bg-[#141210]/95 border-[#2D2720] text-[#EDE7DC]'
        : theme === 'sefer'
        ? 'bg-white/95 border-gray-200 text-gray-900'
        : 'bg-[#FAF6EF]/95 border-[#E7DFCF] text-[#24201A]'
    } backdrop-blur-sm`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Zone 1: Wordmark & Parasha Switcher + Daily Streak Counter */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenParashaSelector}
            className="group text-left text-right flex items-center gap-2 focus:outline-none"
            title={isEn ? 'Select Parasha' : 'בחר פרשה'}
          >
            <span className="font-frank text-2xl font-bold tracking-tight text-[#9E7422] dark:text-[#D4AF37] group-hover:opacity-85 transition-opacity">
              {isEn ? 'Shnayim Mikra' : 'שְׁנַיִם מִקְרָא'}
            </span>
            <span className="text-xs text-stone-500 font-sans hidden sm:inline">
              · {currentParashaName}
            </span>
          </button>

          {/* Daily Study Streak Counter Badge */}
          <button
            onClick={onOpenDashboard}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
              hasCompletedToday
                ? 'bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/25 border-amber-500/50 text-amber-900 dark:text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40 hover:scale-105'
                : 'bg-stone-500/10 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-500/40 hover:bg-stone-500/15'
            }`}
            title={
              isEn
                ? `${streakDays} day consecutive study streak! (${hasCompletedToday ? 'Completed verses today' : 'Complete at least 1 verse today to continue streak'}) - Click for Dashboard`
                : `${streakDays} ימי לימוד רצופים! (${hasCompletedToday ? 'השלמת פסוקים היום' : 'השלם לפחות פסוק אחד היום לשמירה על הרצף'}) - לחץ לפתיחת מדדים`
            }
            aria-label={`${streakDays} days streak`}
          >
            <Flame
              className={`w-3.5 h-3.5 transition-transform ${
                hasCompletedToday
                  ? 'text-amber-500 fill-amber-500 animate-pulse scale-110 drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]'
                  : 'text-amber-600/70 dark:text-amber-400/70'
              }`}
            />
            <span className="font-bold tabular-nums font-mono text-xs">{streakDays}</span>
            <span className="text-[10px] hidden xs:inline font-sans opacity-90">
              {isEn
                ? (streakDays === 1 ? t(lang, 'streakDaySingular') : t(lang, 'streakDaysSuffix'))
                : (streakDays === 1 ? t(lang, 'streakDaySingular') : t(lang, 'streakDaysSuffix'))}
            </span>
          </button>

          {/* Daily Study Goal Visual Progress Ring Badge */}
          {onOpenDailyGoal && (
            <button
              onClick={onOpenDailyGoal}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer group ${
                isGoalMet
                  ? 'bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/20 border-amber-500/60 text-amber-900 dark:text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/40 hover:scale-105'
                  : 'bg-stone-500/10 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-amber-500/40 hover:bg-stone-500/15'
              }`}
              title={
                isEn
                  ? `Daily Study Goal: ${todayCompletedCount}/${goal} verses completed (${goalPercent}%). ${
                      isGoalMet ? 'Goal reached today! Mazal Tov!' : `${goal - todayCompletedCount} verses left today.`
                    } Click to adjust daily goal.`
                  : `יעד לימוד יומי: ${todayCompletedCount}/${goal} פסוקים הושלמו (${goalPercent}%). ${
                      isGoalMet ? 'היעד הושג היום! יישר כוח!' : `נותרו ${goal - todayCompletedCount} פסוקים היום.`
                    } לחץ לשינוי יעד.`
              }
              aria-label={`Daily study goal progress: ${todayCompletedCount} of ${goal} verses, ${goalPercent} percent`}
            >
              {/* Circular SVG Progress Ring */}
              <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 -rotate-90" viewBox="0 0 28 28">
                  {/* Background Track */}
                  <circle
                    cx="14"
                    cy="14"
                    r={ringRadius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.8"
                    className={isDark ? 'text-stone-700' : 'text-stone-300'}
                  />
                  {/* Active Progress Ring */}
                  <circle
                    cx="14"
                    cy="14"
                    r={ringRadius}
                    fill="none"
                    stroke={isGoalMet ? '#10B981' : '#F59E0B'}
                    strokeWidth="3.2"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                {isGoalMet ? (
                  <Check className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400 absolute" />
                ) : (
                  <Target className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 absolute group-hover:scale-110 transition-transform" />
                )}
              </div>

              {/* Progress Count & Percentage */}
              <div className="flex items-center gap-1 font-mono">
                <span className="font-bold tabular-nums text-xs">
                  {todayCompletedCount}/{goal}
                </span>
                <span className="text-[10px] hidden sm:inline font-sans opacity-85 font-medium">
                  {isGoalMet ? (isEn ? 'Goal!' : 'הושלם!') : `${goalPercent}%`}
                </span>
              </div>
            </button>
          )}
        </div>

        {/* Zone 2: Navigation Links including Rashi & Distraction-Free */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <button
            onClick={() => onSelectMode('verse')}
            className={`whitespace-nowrap transition-colors hover:text-[#9E7422] ${
              mode === 'verse'
                ? 'font-bold text-[#9E7422] dark:text-[#D4AF37] border-b-2 border-[#9E7422] dark:border-[#D4AF37] pb-0.5'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            {t(lang, 'modeVerse')}
          </button>

          <button
            onClick={() => onSelectMode('aliyah')}
            className={`whitespace-nowrap transition-colors hover:text-[#9E7422] ${
              mode === 'aliyah'
                ? 'font-bold text-[#9E7422] dark:text-[#D4AF37] border-b-2 border-[#9E7422] dark:border-[#D4AF37] pb-0.5'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            {t(lang, 'modeAliyah')}
          </button>

          {/* Rashi toggle */}
          <button
            onClick={() => onSelectMode('rashi')}
            className={`whitespace-nowrap transition-colors hover:text-[#9E7422] flex items-center gap-1 ${
              mode === 'rashi'
                ? 'font-bold text-[#9E7422] dark:text-[#D4AF37] border-b-2 border-[#9E7422] dark:border-[#D4AF37] pb-0.5'
                : 'text-stone-600 dark:text-stone-300'
            }`}
            title={isEn ? 'Study with Rashi commentary alongside each verse' : 'לימוד עם פירוש רש״י צמוד לכל פסוק'}
          >
            <span>{t(lang, 'modeRashi')}</span>
          </button>

          {/* Distraction-Free Pure Text Mode */}
          <button
            onClick={() => onSelectMode('distraction_free')}
            className={`whitespace-nowrap transition-colors hover:text-[#9E7422] flex items-center gap-1.5 ${
              mode === 'distraction_free'
                ? 'font-bold text-[#9E7422] dark:text-[#D4AF37] border-b-2 border-[#9E7422] dark:border-[#D4AF37] pb-0.5'
                : 'text-stone-600 dark:text-stone-300'
            }`}
            title={isEn ? 'Distraction-free pure text reading mode' : 'קריאה נקייה ללא הסחות דעת עם הטקסט בלבד'}
          >
            <Eye className="w-3.5 h-3.5 text-[#9E7422] dark:text-[#D4AF37]" />
            <span>{isEn ? 'Just Text' : 'טקסט בלבד'}</span>
          </button>

          <button
            onClick={() => onSelectMode('tikkun')}
            className={`whitespace-nowrap transition-colors hover:text-[#9E7422] ${
              mode === 'tikkun'
                ? 'font-bold text-[#9E7422] dark:text-[#D4AF37] border-b-2 border-[#9E7422] dark:border-[#D4AF37] pb-0.5'
                : 'text-stone-600 dark:text-stone-300'
            }`}
          >
            {t(lang, 'modeTikkun')}
          </button>

          <button
            onClick={onOpenParashaSelector}
            className="whitespace-nowrap text-stone-600 dark:text-stone-300 hover:text-[#9E7422] transition-colors"
          >
            {t(lang, 'allParshiot')}
          </button>

          {/* Study History Dashboard Link */}
          <button
            onClick={onOpenDashboard}
            className="whitespace-nowrap transition-colors hover:text-[#9E7422] flex items-center gap-1.5 text-stone-600 dark:text-stone-300"
            title={isEn ? 'Study history & completion rates dashboard' : 'לוח מדדים, היסטוריית לימוד וגרף אחוזי השלמה'}
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#9E7422] dark:text-[#D4AF37]" />
            <span>{t(lang, 'dashboard')}</span>
          </button>

          {/* Focus Mode single-verse immersion button */}
          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              className="whitespace-nowrap transition-colors hover:text-[#9E7422] flex items-center gap-1.5 text-stone-600 dark:text-stone-300"
              title={isEn ? "Focus Mode: Immersive single-verse study (Press 'F')" : "מצב מיקוד: לימוד סוחף של הפסוק הנוכחי בלבד (הקש 'F')"}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{t(lang, 'focusMode')}</span>
              <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded border border-stone-300 dark:border-stone-700 font-mono">F</kbd>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions (Focus, Dashboard, Offline & Export, PWA Install, Bookmark, Settings, Lang) */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Focus Mode Button */}
          {onToggleFocusMode && (
            <button
              onClick={onToggleFocusMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                isDark
                  ? 'border-amber-500/40 bg-amber-500/15 text-[#D4AF37] hover:bg-amber-500/25 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                  : 'border-amber-600/40 bg-[#FAF1DC] text-[#9E7422] hover:bg-[#F4E4BF] shadow-[0_0_10px_rgba(212,175,55,0.2)]'
              }`}
              title={isEn ? "Focus Mode: Collapse all UI except current verse (Press 'F')" : "מצב מיקוד: בידוד הפסוק הנוכחי לחוויה סוחפת (הקש 'F')"}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="hidden xl:inline">{t(lang, 'focusMode')}</span>
              <kbd className="hidden sm:inline text-[9px] px-1 py-0.2 rounded border border-amber-500/40 font-mono">F</kbd>
            </button>
          )}

          {/* Dashboard Modal Button */}
          <button
            onClick={onOpenDashboard}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all ${
              isDark
                ? 'border-amber-500/30 bg-amber-500/10 text-[#D4AF37] hover:bg-amber-500/20'
                : 'border-amber-600/30 bg-[#F5EEDF] text-[#9E7422] hover:bg-[#EFE4CF]'
            }`}
            title={isEn ? 'Study Dashboard: Bar charts of completion rates & verses' : 'לוח מדדים: גרפי עמודות של אחוזי השלמה ופסוקים'}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t(lang, 'dashboard')}</span>
          </button>
          
          {/* Deploy & Offline Hub Modal Button */}
          <button
            onClick={onOpenOfflineExport}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all ${
              isDark
                ? 'border-[#3D3528] bg-[#1F1C18] text-stone-200 hover:bg-[#28231C]'
                : 'border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200'
            }`}
            title={isEn ? 'Deploy to Vercel/Render, export offline HTML, print, or PWA' : 'פריסה ל-Vercel/Render, ייצוא HTML אופליין, הדפסה והתקנה'}
          >
            <CloudUpload className="w-3.5 h-3.5 text-[#9E7422] dark:text-[#D4AF37]" />
            <span className="hidden md:inline">{isEn ? 'Deploy & Offline' : 'פריסה ואופליין'}</span>
          </button>

          {/* In-App PWA Install Button */}
          <PWAInstallButton theme={theme} lang={lang} variant="header" />

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all ${
              isDark
                ? 'border-[#3D3528] bg-[#1F1C18] text-stone-200 hover:bg-[#28231C]'
                : 'border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200'
            }`}
            title={isEn ? 'החלף לעברית' : 'Switch to English'}
          >
            <Languages className="w-3.5 h-3.5 text-[#9E7422] dark:text-[#D4AF37]" />
            <span>{isEn ? 'EN' : 'עב'}</span>
          </button>

          {/* Bookmark Button */}
          {bookmark && (
            <button
              onClick={onJumpToBookmark}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                isDark
                  ? 'border-[#3D3528] bg-[#1F1C18] text-[#D4AF37] hover:bg-[#28231C]'
                  : 'border-[#E2D5BE] bg-[#F7EFE1] text-[#9E7422] hover:bg-[#EFE4CF]'
              }`}
              title={`${t(lang, 'jumpToBookmark')}: ${bookmark.verseId}`}
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span className="hidden lg:inline">{t(lang, 'bookmark')} ({bookmark.verseHebrew})</span>
            </button>
          )}

          {/* Display & Fonts Settings */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
              isDark
                ? 'bg-[#1F1C18] border-[#383127] text-stone-200 hover:bg-[#28241F]'
                : theme === 'sefer'
                ? 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100'
                : 'bg-[#F5EEDF] border-[#E2D5BE] text-stone-800 hover:bg-[#EFE4CF]'
            }`}
            aria-label={t(lang, 'settingsAndFonts')}
          >
            <Sliders className="w-3.5 h-3.5 text-[#9E7422] dark:text-[#D4AF37]" />
            <span className="hidden sm:inline">{t(lang, 'settingsAndFonts')}</span>
            <span className="font-mono tabular-nums text-[11px] text-stone-500">
              {progressPercent}%
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
