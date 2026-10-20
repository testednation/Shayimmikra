/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, CheckCircle2, ChevronLeft, Sparkles, BookOpen, Clock, Bookmark, BarChart3 } from 'lucide-react';
import { AliyahData, AppTheme, BookmarkInfo, ParashaMetadata, UILanguage } from '../types';
import { t } from '../utils/translations';

interface ParchmentHeroProps {
  parasha: ParashaMetadata;
  aliyot: AliyahData[];
  completedCount: number;
  totalVerses: number;
  theme: AppTheme;
  lang: UILanguage;
  todayAliyahIndex: number;
  bookmark: BookmarkInfo | null;
  onJumpToBookmark: () => void;
  onJumpToAliyah: (aliyahIndex: number) => void;
  onJumpToLastVerse: () => void;
  onOpenParashaSelector: () => void;
  onOpenDashboard?: () => void;
  currentWeeklyParashaId?: string;
  onSelectWeeklyParasha?: () => void;
}

export const ParchmentHero: React.FC<ParchmentHeroProps> = ({
  parasha,
  aliyot,
  completedCount,
  totalVerses,
  theme,
  lang,
  todayAliyahIndex,
  bookmark,
  onJumpToBookmark,
  onJumpToAliyah,
  onJumpToLastVerse,
  onOpenParashaSelector,
  onOpenDashboard,
  currentWeeklyParashaId,
  onSelectWeeklyParasha,
}) => {
  const isDark = theme === 'dark';
  const isEn = lang === 'en';
  const progressPercent = totalVerses > 0 ? Math.round((completedCount / totalVerses) * 100) : 0;
  const todayAliyah = aliyot[todayAliyahIndex] || aliyot[0];

  return (
    <div className={`relative overflow-hidden rounded-xl border transition-colors mb-6 ${
      isDark
        ? 'bg-[#181614] border-[#2C2720]'
        : theme === 'sefer'
        ? 'bg-white border-stone-200 shadow-xs'
        : 'bg-[#FCFAF6] border-[#E8DFCF] shadow-xs'
    }`}>
      {/* Subtle decorative parchment filigree top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#9E7422]/60 dark:via-[#D4AF37]/60 to-transparent" />

      <div className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Main Title & Editorial Metadata */}
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-sans">
              <span>{isEn ? parasha.chumashEn : parasha.chumashHe}</span>
              <span aria-hidden="true">·</span>
              <span>{isEn ? parasha.ref : parasha.heRef}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {totalVerses} {isEn ? 'verses' : 'פסוקים'}
              </span>
              {currentWeeklyParashaId && parasha.id === currentWeeklyParashaId && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40">
                    <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                    {isEn ? "This Week's Parasha" : 'פרשת השבוע'}
                  </span>
                </>
              )}
            </div>

            {/* Prompt if user is studying a past/future parasha */}
            {currentWeeklyParashaId && parasha.id !== currentWeeklyParashaId && onSelectWeeklyParasha && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>
                  {isEn ? 'Custom selection.' : 'עיון בפרשה אחרת.'}
                </span>
                <button
                  type="button"
                  onClick={onSelectWeeklyParasha}
                  className="font-bold underline hover:opacity-80 cursor-pointer text-amber-700 dark:text-amber-300"
                >
                  {isEn ? "Switch to this week's Parasha" : 'עבור לפרשת השבוע'}
                </button>
              </div>
            )}

            <h1 className="font-frank text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#24201A] dark:text-[#EDE7DC]">
              {isEn ? `Parashat ${parasha.nameEn}` : `פרשת ${parasha.nameHe}`}
              <span className="text-xl sm:text-2xl font-normal text-stone-400 mr-2 ml-2">
                ({isEn ? parasha.nameHe : parasha.nameEn})
              </span>
            </h1>

            <p className="text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed">
              {isEn
                ? 'The weekly mitzvah to complete the Torah portion with the congregation: twice scripture (Mikra x2) and once translation (Targum Onkelos / Rashi).'
                : 'מצוות עשה מדרבנן לסיים את פרשת השבוע עם הציבור: שניים מקרא ואחד תרגום.'}
              {todayAliyah && (
                <span className="block mt-1 text-xs text-amber-800 dark:text-amber-300">
                  {isEn
                    ? `Today's Study (${todayAliyah.dayNameEn}): ${todayAliyah.nameEn} Aliyah (${todayAliyah.verseCount} verses)`
                    : `המלצת הלימוד להיום (${todayAliyah.dayNameHe}): עליית ${todayAliyah.nameHe} (${todayAliyah.verseCount} פסוקים)`}
                </span>
              )}
            </p>

            {/* Saved Bookmark Prompt if available */}
            {bookmark && (
              <div className="flex items-center gap-2 pt-1 text-xs text-stone-600 dark:text-stone-300">
                <Bookmark className="w-3.5 h-3.5 text-[#9E7422] dark:text-[#D4AF37] fill-current" />
                <span>
                  {isEn
                    ? `Bookmark saved: Verse ${bookmark.verse} (${bookmark.verseId} · ${bookmark.aliyahName} Aliyah)`
                    : `סימנייה במקום שעצרת: פסוק ${bookmark.verseHebrew} (${bookmark.verseId} · עליית ${bookmark.aliyahName})`}
                </span>
                <button
                  onClick={onJumpToBookmark}
                  className="text-[#9E7422] dark:text-[#D4AF37] font-semibold underline hover:opacity-85 mr-1"
                >
                  {isEn ? 'Jump to Bookmark' : 'קפוץ לסימנייה'}
                </button>
              </div>
            )}
          </div>

          {/* Progress Card & Actions */}
          <div className={`flex flex-col gap-4 p-5 rounded-lg border lg:w-80 shrink-0 ${
            isDark
              ? 'bg-[#1F1C18] border-[#342D23]'
              : theme === 'sefer'
              ? 'bg-stone-50 border-stone-200'
              : 'bg-[#F6EFE2] border-[#E5DAC6]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {t(lang, 'weeklyProgress')}
                </span>
                {onOpenDashboard && (
                  <button
                    onClick={onOpenDashboard}
                    className="flex items-center gap-1 text-[11px] text-[#9E7422] dark:text-[#D4AF37] hover:underline"
                    title={isEn ? 'View study analytics & bar charts' : 'צפה בלוח המדדים והגרפים'}
                  >
                    <BarChart3 className="w-3 h-3" />
                    <span>{t(lang, 'dashboard')}</span>
                  </button>
                )}
              </div>
              <span className="font-mono tabular-nums text-sm font-bold text-[#9E7422] dark:text-[#D4AF37]">
                {progressPercent}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-stone-200 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#B8860B] to-[#9E7422] dark:from-[#D4AF37] dark:to-[#B8860B] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
              <span>
                {completedCount} {t(lang, 'completedOf')} {totalVerses} {isEn ? 'verses' : 'פסוקים'}
              </span>
              {progressPercent === 100 && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t(lang, 'allCompleted')}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={bookmark ? onJumpToBookmark : onJumpToLastVerse}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors text-center ${
                  isDark
                    ? 'bg-[#D4AF37] text-stone-950 hover:bg-[#E5C158]'
                    : 'bg-[#9E7422] text-white hover:bg-[#85611B]'
                }`}
              >
                {bookmark ? t(lang, 'jumpToBookmark') : t(lang, 'continueReading')}
              </button>

              <button
                onClick={() => onJumpToAliyah(todayAliyahIndex)}
                className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors text-center ${
                  isDark
                    ? 'border-[#3D3528] text-stone-300 hover:bg-[#28231C]'
                    : 'border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {t(lang, 'todayAliyah')}
              </button>
            </div>
          </div>

        </div>

        {/* Traditional Daily Pacing Steps (Sunday to Friday) */}
        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800/80">
          <div className="text-xs text-stone-500 dark:text-stone-400 mb-3 flex items-center justify-between">
            <span className="font-medium">{t(lang, 'dailyPacing')}</span>
            <button
              onClick={onOpenParashaSelector}
              className="text-[#9E7422] dark:text-[#D4AF37] hover:underline transition-all"
            >
              {t(lang, 'changeParasha')}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {aliyot.map((aliyah, idx) => {
              const isToday = idx === todayAliyahIndex;
              return (
                <button
                  key={aliyah.nameEn}
                  onClick={() => onJumpToAliyah(idx)}
                  className={`text-right p-2.5 rounded-lg border text-xs transition-all ${
                    isToday
                      ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/10'
                      : isDark
                      ? 'border-[#2C2720] hover:bg-[#201D19] text-stone-300'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-frank text-sm">
                      {isEn ? aliyah.nameEn : aliyah.nameHe}
                    </span>
                    {isToday && (
                      <span className="text-[10px] text-[#9E7422] dark:text-[#D4AF37] font-sans font-medium">
                        {isEn ? 'Today' : 'היום'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                    {isEn ? aliyah.dayNameEn : aliyah.dayNameHe}
                  </div>
                  <div className="text-[10px] text-stone-400 dark:text-stone-500 font-mono tabular-nums mt-0.5">
                    {aliyah.verseCount} {isEn ? 'verses' : 'פסוקים'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
