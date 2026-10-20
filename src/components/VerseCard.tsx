/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Check, Copy, CheckCheck, Bookmark, BookmarkCheck, BookMarked, ChevronDown, ChevronUp, Loader2, PenLine, StickyNote } from 'lucide-react';
import { AppTheme, DisplaySettings, HebrewFont, StudyMode, VerseItem, VerseProgress } from '../types';
import { cleanHtml, stripNikkud, stripTeamim } from '../utils/hebrew';
import { fetchVerseRashi } from '../services/sefariaService';
import { loadVerseNote, saveVerseNote } from '../utils/storage';
import { t } from '../utils/translations';

interface VerseCardProps {
  verse: VerseItem;
  progress: VerseProgress;
  settings: DisplaySettings;
  studyMode?: StudyMode;
  isActive: boolean;
  isBookmarked: boolean;
  onUpdateStep: (step: 'mikra1' | 'mikra2' | 'targum', value: boolean) => void;
  onMarkComplete: () => void;
  onSelectVerse: () => void;
  onToggleBookmark: () => void;
  isPlayingAudio: boolean;
  onPlayAudio: () => void;
}

export function getFontClass(font: HebrewFont): string {
  switch (font) {
    case 'frank':
      return 'font-frank';
    case 'david':
      return 'font-david';
    case 'noto':
      return 'font-noto';
    case 'alef':
      return 'font-alef';
    case 'tinos':
      return 'font-tinos';
    case 'assistant':
      return 'font-assistant';
    case 'rubik':
      return 'font-rubik';
    case 'heebo':
      return 'font-heebo';
    case 'varela':
      return 'font-varela';
    case 'system':
    default:
      return 'font-frank';
  }
}

export const VerseCard: React.FC<VerseCardProps> = ({
  verse,
  progress,
  settings,
  studyMode = 'verse',
  isActive,
  isBookmarked,
  onUpdateStep,
  onMarkComplete,
  onSelectVerse,
  onToggleBookmark,
  isPlayingAudio,
  onPlayAudio,
}) => {
  const [copied, setCopied] = useState(false);
  const [rashiText, setRashiText] = useState<string>(verse.rashiText || '');
  const [isLoadingRashi, setIsLoadingRashi] = useState<boolean>(false);
  const attemptedRashiRef = useRef<Record<string, boolean>>({});
  const [isRashiExpanded, setIsRashiExpanded] = useState<boolean>(true);
  const [noteText, setNoteText] = useState<string>(() => loadVerseNote(verse.id));
  const [isNoteOpen, setIsNoteOpen] = useState<boolean>(false);

  useEffect(() => {
    setNoteText(loadVerseNote(verse.id));
    if (verse.rashiText) {
      setRashiText(verse.rashiText);
    }
  }, [verse.id, verse.rashiText]);

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNoteText(val);
    saveVerseNote(verse.id, val);
  };

  const isDark = settings.theme === 'dark';
  const isEn = settings.uiLanguage === 'en';
  const isAllComplete = progress.mikra1 && progress.mikra2 && progress.targum;

  // Determine if Rashi should be displayed
  const shouldShowRashi =
    studyMode === 'rashi' ||
    settings.showRashi ||
    settings.commentary === 'rashi' ||
    settings.commentary === 'both';

  // Automatically fetch Rashi for this verse if toggled on and not already cached
  useEffect(() => {
    if (
      shouldShowRashi &&
      !verse.rashiText &&
      !rashiText &&
      !isLoadingRashi &&
      !attemptedRashiRef.current[verse.id]
    ) {
      attemptedRashiRef.current[verse.id] = true;
      setIsLoadingRashi(true);
      fetchVerseRashi(verse.id)
        .then((text) => {
          setRashiText(text || '');
          setIsLoadingRashi(false);
        })
        .catch(() => {
          setIsLoadingRashi(false);
        });
    }
  }, [shouldShowRashi, verse.id, verse.rashiText, rashiText, isLoadingRashi]);

  // Format Mikra text based on settings
  let displayMikra = verse.mikraHebrew;
  if (!settings.showTeamim && settings.showNikkud) {
    displayMikra = stripTeamim(displayMikra);
  } else if (!settings.showNikkud) {
    displayMikra = stripNikkud(displayMikra);
  }

  // Format Targum text based on settings
  let displayTargum = verse.targumHebrew;
  if (!settings.showNikkud) {
    displayTargum = stripNikkud(displayTargum);
  }

  // Distinct fonts for Torah vs Onkelos
  const torahFontClass = getFontClass(settings.fontFamily);
  const onkelosFontClass = getFontClass(settings.onkelosFont);

  // Line height class
  const leadingClass =
    settings.lineHeight === 'tight'
      ? 'leading-normal'
      : settings.lineHeight === 'relaxed'
      ? 'leading-loose'
      : 'leading-relaxed';

  // Handle copy text
  const handleCopy = () => {
    const textToCopy = `${verse.id}\n${cleanHtml(verse.mikraHebrew)}\n\nתרגום:\n${cleanHtml(verse.targumHebrew)}${
      rashiText ? `\n\nרש״י:\n${cleanHtml(rashiText)}` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const is2x1xFlow = settings.readingFlow === 'sequential_2x1x';
  const onkelosFontSize = Math.max(15, settings.fontSize + settings.onkelosSizeDelta);

  return (
    <article
      id={`verse-${verse.id.replace(/[\s:]/g, '-')}`}
      onClick={onSelectVerse}
      className={`relative rounded-xl border transition-all duration-300 mb-5 overflow-hidden ${
        isActive
          ? isDark
            ? 'bg-gradient-to-b from-[#241E16] via-[#1D1812] to-[#171410] border-[#D4AF37]/80 shadow-[0_0_32px_rgba(212,175,55,0.26),0_12px_28px_-6px_rgba(0,0,0,0.8)] ring-2 ring-[#D4AF37]'
            : settings.theme === 'sefer'
            ? 'bg-gradient-to-b from-[#FFFDF8] via-[#FFF9ED] to-[#FFF3DE] border-[#C59B27] shadow-[0_0_28px_rgba(212,175,55,0.30),0_10px_25px_-5px_rgba(158,116,34,0.20)] ring-2 ring-[#9E7422]'
            : 'bg-gradient-to-b from-[#FFFDF8] via-[#FAF2DF] to-[#F4E6C7] border-[#9E7422] shadow-[0_0_30px_rgba(212,175,55,0.34),0_10px_25px_-5px_rgba(158,116,34,0.24)] ring-2 ring-[#9E7422]'
          : isDark
          ? 'bg-[#181614] border-[#2C2720] hover:border-[#42392C] shadow-xs'
          : settings.theme === 'sefer'
          ? 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
          : 'bg-[#FCFAF6] border-[#E8DFC8] hover:border-[#D5C7AB] shadow-xs'
      }`}
    >
      {/* Radiant Glowing Top Light Bar for Active Verse */}
      {isActive && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-[#D4AF37] to-amber-500 shadow-[0_0_12px_rgba(212,175,55,0.9)] z-20 pointer-events-none" />
      )}

      {/* Side Active Focus Pillar */}
      {isActive && (
        <div className={`absolute top-0 bottom-0 ${isEn ? 'left-0' : 'right-0'} w-1 bg-gradient-to-b from-amber-400 via-[#D4AF37] to-amber-600 shadow-[0_0_8px_rgba(212,175,55,0.8)] z-20 pointer-events-none`} />
      )}

      {/* Visual bookmark ribbon badge if bookmarked */}
      {isBookmarked && (
        <div className={`absolute top-0 ${isEn ? 'left-8' : 'right-8'} z-10 bg-[#9E7422] dark:bg-[#D4AF37] text-white dark:text-stone-950 px-2.5 py-0.5 rounded-b text-[10px] font-sans font-bold shadow-xs flex items-center gap-1`}>
          <Bookmark className="w-2.5 h-2.5 fill-current" />
          <span>{isEn ? 'Bookmarked' : 'סימנייה'}</span>
        </div>
      )}

      {/* Top Metadata Header & Fast Actions */}
      <div className={`px-5 py-3 border-b flex items-center justify-between gap-4 text-xs transition-colors ${
        isActive
          ? isDark
            ? 'bg-[#2B2319] border-[#D4AF37]/35 text-amber-100/90'
            : settings.theme === 'sefer'
            ? 'bg-[#FFF3D6] border-amber-300/80 text-amber-950'
            : 'bg-[#F2E2BE] border-[#DFC08D] text-amber-950'
          : isDark
          ? 'bg-[#1D1A17] border-[#2A251E] text-stone-400'
          : settings.theme === 'sefer'
          ? 'bg-stone-50 border-stone-200 text-stone-500'
          : 'bg-[#F7EFE1]/70 border-[#E8DFC8] text-stone-600'
      }`}>
        <div className="flex items-center gap-2 font-sans flex-wrap">
          {/* Active status glowing pulse pill */}
          {isActive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-[#8B6514] dark:text-[#E8C564] border border-amber-500/40 shadow-[0_0_10px_rgba(212,175,55,0.35)] animate-in fade-in duration-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span>{isEn ? 'Studying Now' : 'בלימוד עכשיו'}</span>
            </span>
          )}

          <span className="font-bold text-[#9E7422] dark:text-[#D4AF37] font-frank text-sm">
            {isEn ? `Verse ${verse.verse}` : `פסוק ${verse.verseHebrew}`}
          </span>
          <span aria-hidden="true" className="opacity-60">·</span>
          <span>{isEn ? `Ch. ${verse.chapter}` : `פרק ${verse.chapter}`}</span>
          <span aria-hidden="true" className="opacity-60">·</span>
          <span>{isEn ? `${verse.aliyahName} Aliyah` : `עליית ${verse.aliyahName}`}</span>
          {is2x1xFlow && (
            <>
              <span aria-hidden="true" className="opacity-60">·</span>
              <span className={`text-[10px] font-mono ${isActive ? 'text-amber-800/80 dark:text-amber-300/80 font-semibold' : 'text-stone-400'}`}>
                {isEn ? '2x Torah + 1x Onkelos' : '2x מקרא + 1x תרגום'}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Rashi toggle button directly on card */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRashiExpanded(!isRashiExpanded);
              if (!rashiText && !isLoadingRashi) {
                setIsLoadingRashi(true);
                fetchVerseRashi(verse.id).then((t) => {
                  setRashiText(t);
                  setIsLoadingRashi(false);
                });
              }
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
              shouldShowRashi && isRashiExpanded
                ? 'bg-amber-500/15 text-[#9E7422] dark:text-[#D4AF37] font-medium'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
            title={isEn ? 'Toggle Rashi commentary for this verse' : 'הצג/הסתר פירוש רש״י'}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isEn ? 'Rashi' : 'רש״י'}</span>
            {isRashiExpanded ? <ChevronUp className="w-2.5 h-2.5 opacity-60" /> : <ChevronDown className="w-2.5 h-2.5 opacity-60" />}
          </button>

          {/* Bookmark Toggle button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark();
            }}
            className={`p-1.5 rounded-md transition-colors ${
              isBookmarked
                ? 'text-[#9E7422] dark:text-[#D4AF37] bg-amber-500/10'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
            title={isBookmarked ? (isEn ? 'Remove bookmark' : 'הסר סימנייה') : (isEn ? 'Bookmark this verse' : 'שמור סימנייה בפסוק זה')}
            aria-label="Bookmark"
          >
            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>

          {/* User Note Toggle button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsNoteOpen(!isNoteOpen);
            }}
            className={`p-1.5 rounded-md transition-colors relative ${
              noteText.trim()
                ? 'text-[#9E7422] dark:text-[#D4AF37] bg-amber-500/15 font-semibold'
                : isNoteOpen
                ? 'text-stone-700 dark:text-stone-200 bg-stone-200/60 dark:bg-stone-800'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
            title={noteText.trim() ? (isEn ? 'View or edit your note' : 'הצג או ערוך הערה') : (isEn ? 'Add personal note' : 'הוסף הערה אישית')}
            aria-label="Notes"
          >
            <PenLine className="w-3.5 h-3.5" />
            {noteText.trim() && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#9E7422] dark:bg-[#D4AF37] ring-1 ring-white dark:ring-stone-900" />
            )}
          </button>

          {/* Audio Recitation button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlayAudio();
            }}
            className={`p-1.5 rounded-md transition-colors ${
              isPlayingAudio
                ? 'text-[#9E7422] dark:text-[#D4AF37] bg-amber-500/10'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
            }`}
            title={isPlayingAudio ? (isEn ? 'Stop audio' : 'עצור הקראה') : (isEn ? 'Listen in Hebrew' : 'הקרא פסוק בעברית')}
            aria-label="Listen"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Copy button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            title={isEn ? 'Copy text' : 'העתק פסוק ותרגום'}
            aria-label="Copy"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Single-click complete all 3 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkComplete();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
              isAllComplete
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800'
            }`}
          >
            <Check className="w-3 h-3" />
            <span>{isAllComplete ? (isEn ? 'Done' : 'הושלם') : (isEn ? 'Complete All' : 'השלם הכל')}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: 2x Torah 1x Onkelos Flow or Stepper Flow */}
      {is2x1xFlow ? (
        /* Sequential 2x Torah, 1x Onkelos Printed Layout */
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Pass 1: Torah First Recitation (With Bold Option) */}
          <div className="space-y-1.5 pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-[#9E7422] dark:text-[#D4AF37] font-sans flex items-center gap-1.5">
                <span>{isEn ? '1st Mikra (Hebrew)' : 'מקרא ראשון (פעם א׳)'}</span>
                {settings.boldFirstMikra && (
                  <span className="text-[10px] text-stone-400 font-normal">
                    · {isEn ? 'Bold' : 'מודגש'}
                  </span>
                )}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStep('mikra1', !progress.mikra1);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                  progress.mikra1
                    ? 'bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 font-medium'
                    : isDark
                    ? 'bg-[#221F1B] text-stone-300 hover:bg-[#2C2722] border border-[#3A332A]'
                    : 'bg-[#F2E8D7] text-stone-800 hover:bg-[#EBDDC7] border border-[#DFCDB3]'
                }`}
              >
                <Check className={`w-3 h-3 ${progress.mikra1 ? 'opacity-100' : 'opacity-40'}`} />
                <span>{progress.mikra1 ? (isEn ? 'Read' : 'נקרא') : (isEn ? 'Mark 1st Mikra' : 'סמן מקרא א׳')}</span>
              </button>
            </div>

            <div
              className={`${torahFontClass} ${leadingClass} text-right text-stone-900 dark:text-stone-100 hebrew-vocalized transition-colors ${
                settings.boldFirstMikra ? 'font-bold tracking-tight' : 'font-normal'
              }`}
              style={{ fontSize: `${settings.fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: displayMikra }}
            />
          </div>

          {/* Pass 2: Torah Second Recitation */}
          <div className="space-y-1.5 pb-3 border-b border-stone-200/60 dark:border-stone-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold text-stone-600 dark:text-stone-400 font-sans">
                {isEn ? '2nd Mikra (Hebrew)' : 'מקרא שני (פעם ב׳)'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateStep('mikra2', !progress.mikra2);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                  progress.mikra2
                    ? 'bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 font-medium'
                    : isDark
                    ? 'bg-[#221F1B] text-stone-300 hover:bg-[#2C2722] border border-[#3A332A]'
                    : 'bg-[#F2E8D7] text-stone-800 hover:bg-[#EBDDC7] border border-[#DFCDB3]'
                }`}
              >
                <Check className={`w-3 h-3 ${progress.mikra2 ? 'opacity-100' : 'opacity-40'}`} />
                <span>{progress.mikra2 ? (isEn ? 'Read' : 'נקרא') : (isEn ? 'Mark 2nd Mikra' : 'סמן מקרא ב׳')}</span>
              </button>
            </div>

            <div
              className={`${torahFontClass} ${leadingClass} text-right text-stone-900 dark:text-stone-100 hebrew-vocalized transition-colors font-normal`}
              style={{ fontSize: `${settings.fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: displayMikra }}
            />
          </div>

          {/* Pass 3: Onkelos Translation (In its own distinct font!) */}
          {(settings.commentary === 'onkelos' || settings.commentary === 'both') && (
            <div className={`p-4 rounded-lg border transition-colors space-y-1.5 ${
              isDark
                ? 'bg-[#1E1B18] border-[#312B22]'
                : settings.theme === 'sefer'
                ? 'bg-stone-50 border-stone-200'
                : 'bg-[#FAF4E8] border-[#E5DAC6]'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-bold text-[#9E7422] dark:text-[#D4AF37] font-sans">
                  {isEn ? 'Targum Onkelos (Pass 3)' : 'תרגום אונקלוס (פעם ג׳)'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStep('targum', !progress.targum);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                    progress.targum
                      ? 'bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 font-medium'
                      : isDark
                      ? 'bg-[#26221E] text-stone-300 hover:bg-[#302B25] border border-[#3E352B]'
                      : 'bg-[#EDE2CD] text-stone-800 hover:bg-[#E4D5BC] border border-[#D9C6A7]'
                  }`}
                >
                  <Check className={`w-3 h-3 ${progress.targum ? 'opacity-100' : 'opacity-40'}`} />
                  <span>{progress.targum ? (isEn ? 'Read' : 'נקרא') : (isEn ? 'Mark Targum' : 'סמן תרגום')}</span>
                </button>
              </div>

              {/* Rendered in Onkelos's distinct font! */}
              <div
                className={`${onkelosFontClass} leading-relaxed text-right text-stone-800 dark:text-stone-200 transition-colors`}
                style={{ fontSize: `${onkelosFontSize}px` }}
                dangerouslySetInnerHTML={{ __html: displayTargum }}
              />
            </div>
          )}

          {/* Rashi Commentary Section (Displayed when Rashi toggle is active) */}
          {(shouldShowRashi && isRashiExpanded) && (
            <div className={`p-4 rounded-lg border transition-colors space-y-2 ${
              isDark
                ? 'bg-[#191715] border-[#332A1F]'
                : 'bg-[#F9F5EC] border-[#E5DAC4]'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-400 font-sans flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Rashi Commentary on this Verse' : 'פירוש רש״י על הפסוק'}</span>
                </span>
                {isLoadingRashi && (
                  <span className="flex items-center gap-1 text-[10px] text-stone-400">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>{isEn ? 'Fetching Rashi...' : 'טוען רש״י...'}</span>
                  </span>
                )}
              </div>

              {rashiText ? (
                <div
                  className="font-noto leading-relaxed text-right text-sm text-stone-800 dark:text-stone-200 space-y-1.5"
                  dangerouslySetInnerHTML={{ __html: rashiText }}
                />
              ) : !isLoadingRashi ? (
                <div className="text-[11px] text-stone-400 dark:text-stone-500 italic text-right">
                  {isEn ? 'No Rashi commentary on this specific verse' : 'אין פירוש רש״י על פסוק זה'}
                </div>
              ) : null}
            </div>
          )}

          {/* Optional English translation */}
          {settings.showEnglish && verse.englishText && (
            <div className="text-xs text-stone-500 dark:text-stone-400 font-sans leading-relaxed text-left border-t border-stone-200 dark:border-stone-800/80 pt-2" dir="ltr">
              <span className="font-semibold text-stone-600 dark:text-stone-300 mr-2">Translation:</span>
              {verse.englishText}
            </div>
          )}

        </div>
      ) : (
        /* Stepper Flow */
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Mikra (Hebrew Torah Verse) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                {isEn ? 'Torah (Mikra)' : 'מקרא (תורה)'}
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStep('mikra1', !progress.mikra1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                    progress.mikra1
                      ? 'bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 shadow-xs'
                      : isDark
                      ? 'bg-[#221F1B] text-stone-300 hover:bg-[#2C2722] border border-[#3A332A]'
                      : 'bg-[#F2E8D7] text-stone-800 hover:bg-[#EBDDC7] border border-[#DFCDB3]'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${progress.mikra1 ? 'opacity-100' : 'opacity-40'}`} />
                  <span>{isEn ? '1st Mikra' : 'מקרא ראשון'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStep('mikra2', !progress.mikra2);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
                    progress.mikra2
                      ? 'bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 shadow-xs'
                      : isDark
                      ? 'bg-[#221F1B] text-stone-300 hover:bg-[#2C2722] border border-[#3A332A]'
                      : 'bg-[#F2E8D7] text-stone-800 hover:bg-[#EBDDC7] border border-[#DFCDB3]'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${progress.mikra2 ? 'opacity-100' : 'opacity-40'}`} />
                  <span>{isEn ? '2nd Mikra' : 'מקרא שני'}</span>
                </button>
              </div>
            </div>

            {/* Hebrew Torah Text */}
            <div
              className={`${torahFontClass} ${leadingClass} text-right text-stone-900 dark:text-stone-100 hebrew-vocalized transition-colors ${
                settings.boldFirstMikra && !progress.mikra1 ? 'font-bold' : 'font-normal'
              }`}
              style={{ fontSize: `${settings.fontSize}px` }}
              dangerouslySetInnerHTML={{ __html: displayMikra }}
            />
          </div>

          {/* Targum Onkelos */}
          {(settings.commentary === 'onkelos' || settings.commentary === 'both') && (
            <div className={`p-4 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#1E1B18] border-[#312B22]'
                : settings.theme === 'sefer'
                ? 'bg-stone-50 border-stone-200'
                : 'bg-[#FAF4E8] border-[#E5DAC6]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9E7422] dark:text-[#D4AF37]">
                  {isEn ? 'Targum Onkelos' : 'תרגום אונקלוס'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStep('targum', !progress.targum);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium text-xs transition-all ${
                    progress.targum
                      ? 'bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 shadow-xs'
                      : isDark
                      ? 'bg-[#26221E] text-stone-300 hover:bg-[#302B25] border border-[#3E352B]'
                      : 'bg-[#EDE2CD] text-stone-800 hover:bg-[#E4D5BC] border border-[#D9C6A7]'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${progress.targum ? 'opacity-100' : 'opacity-40'}`} />
                  <span>{isEn ? 'Targum' : 'אחד תרגום'}</span>
                </button>
              </div>

              {/* Rendered in Onkelos font */}
              <div
                className={`${onkelosFontClass} leading-relaxed text-right text-stone-800 dark:text-stone-200`}
                style={{ fontSize: `${onkelosFontSize}px` }}
                dangerouslySetInnerHTML={{ __html: displayTargum }}
              />
            </div>
          )}

          {/* Rashi Commentary in Stepper Mode */}
          {(shouldShowRashi && isRashiExpanded) && (
            <div className={`p-4 rounded-lg border text-sm transition-colors space-y-2 ${
              isDark
                ? 'bg-[#1A1816] border-[#2E2820] text-stone-300'
                : 'bg-[#F8F5EE] border-[#E6DDCD] text-stone-800'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-400 font-sans flex items-center gap-1.5">
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Rashi on Verse' : 'רש״י על הפסוק'}</span>
                </span>
                {isLoadingRashi && (
                  <span className="flex items-center gap-1 text-[10px] text-stone-400">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>{isEn ? 'Loading...' : 'טוען...'}</span>
                  </span>
                )}
              </div>

              {rashiText ? (
                <div
                  className="font-noto leading-relaxed text-right text-sm"
                  dangerouslySetInnerHTML={{ __html: rashiText }}
                />
              ) : !isLoadingRashi ? (
                <div className="text-[11px] text-stone-400 dark:text-stone-500 italic text-right">
                  {isEn ? 'No Rashi commentary on this specific verse' : 'אין פירוש רש״י על פסוק זה'}
                </div>
              ) : null}
            </div>
          )}

          {/* Optional English translation */}
          {settings.showEnglish && verse.englishText && (
            <div className="text-xs text-stone-500 dark:text-stone-400 font-sans leading-relaxed text-left border-t border-stone-200 dark:border-stone-800/80 pt-3" dir="ltr">
              <span className="font-semibold text-stone-600 dark:text-stone-300 mr-2">Translation:</span>
              {verse.englishText}
            </div>
          )}

        </div>
      )}

      {/* User Note Collapsed Preview (if note exists and editor is closed) */}
      {noteText.trim() && !isNoteOpen && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsNoteOpen(true);
          }}
          className={`mx-5 mb-4 p-2.5 rounded-lg border text-xs font-sans flex items-start gap-2.5 cursor-pointer transition-colors ${
            isDark
              ? 'bg-[#221E18] border-[#383024] text-stone-300 hover:bg-[#2A251D]'
              : 'bg-[#F9F5EC] border-[#E8DFC8] text-stone-800 hover:bg-[#F3EBD9]'
          }`}
        >
          <PenLine className="w-3.5 h-3.5 text-[#9E7422] dark:text-[#D4AF37] shrink-0 mt-0.5" />
          <div className="flex-1 overflow-hidden">
            <span className="font-bold text-[11px] text-[#9E7422] dark:text-[#D4AF37] ml-1">
              {isEn ? 'Personal Note:' : 'הערה אישית:'}
            </span>
            <span className="line-clamp-2 text-stone-600 dark:text-stone-300">{noteText}</span>
          </div>
          <span className="text-[10px] text-stone-400 shrink-0 font-medium">{isEn ? 'Edit' : 'ערוך'}</span>
        </div>
      )}

      {/* User Note Textarea Editor (when isNoteOpen is true) */}
      {isNoteOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`p-4 border-t transition-colors ${
            isDark
              ? 'bg-[#161412] border-[#2A241C]'
              : 'bg-[#FAF6EE] border-[#E8DFC8]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#9E7422] dark:text-[#D4AF37] font-sans flex items-center gap-1.5">
              <PenLine className="w-3 h-3" />
              <span>{isEn ? 'Personal Study Note (Saved locally to your device)' : 'הערת לימוד אישית (נשמרת מקומית במכשיר)'}</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-400 font-sans">
                {noteText.trim() ? (isEn ? 'Auto-saved' : 'נשמר אוטומטית') : ''}
              </span>
              <button
                onClick={() => setIsNoteOpen(false)}
                className="text-[10px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 underline font-sans"
              >
                {isEn ? 'Close' : 'סגור'}
              </button>
            </div>
          </div>
          <textarea
            value={noteText}
            onChange={handleNoteChange}
            placeholder={
              isEn
                ? 'Add your thoughts, insights, or questions on this verse...'
                : 'כתוב כאן פירוש, חידוש, או הערה אישית על הפסוק...'
            }
            rows={3}
            className={`w-full p-2.5 text-xs rounded-lg border font-sans resize-y focus:outline-none focus:ring-1 focus:ring-[#9E7422] dark:focus:ring-[#D4AF37] transition-all ${
              isDark
                ? 'bg-[#1C1A18] border-[#383125] text-stone-200 placeholder-stone-600'
                : 'bg-white border-[#DCD3C0] text-stone-800 placeholder-stone-400'
            }`}
            dir={isEn ? 'ltr' : 'rtl'}
          />
        </div>
      )}

      {/* Tactile 3-Step Completion Progress Bar at bottom of card */}
      <div className={`grid grid-cols-3 h-1.5 w-full transition-colors ${isActive ? 'bg-amber-200/60 dark:bg-amber-950/60' : 'bg-stone-200 dark:bg-stone-800/80'}`}>
        <div className={`transition-colors duration-300 ${progress.mikra1 ? 'bg-[#9E7422] dark:bg-[#D4AF37]' : ''}`} />
        <div className={`transition-colors duration-300 ${progress.mikra2 ? 'bg-[#9E7422] dark:bg-[#D4AF37]' : ''}`} />
        <div className={`transition-colors duration-300 ${progress.targum ? 'bg-[#9E7422] dark:bg-[#D4AF37]' : ''}`} />
      </div>
    </article>
  );
};
