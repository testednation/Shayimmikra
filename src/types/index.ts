/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StudyMode = 'verse' | 'aliyah' | 'rashi' | 'continuous' | 'tikkun' | 'distraction_free';
export type CommentaryType = 'onkelos' | 'rashi' | 'both' | 'translation_only';
export type AppTheme = 'parchment' | 'sefer' | 'dark';
export type HebrewFont = 'frank' | 'david' | 'noto' | 'alef' | 'tinos' | 'assistant' | 'rubik' | 'heebo' | 'varela' | 'system';
export type ReadingFlow = 'stepper' | 'sequential_2x1x';
export type UILanguage = 'en' | 'he';

export interface VerseNote {
  verseId: string;
  text: string;
  updatedAt: number;
}

export interface BookmarkInfo {
  parashaId: string;
  verseId: string;
  chapter: number;
  verse: number;
  verseHebrew: string;
  aliyahName: string;
  savedAt: number;
}

export interface DisplaySettings {
  fontSize: number; // in px (e.g. 26)
  lineHeight: 'tight' | 'normal' | 'relaxed';
  fontFamily: HebrewFont; // Font for Torah (Mikra)
  onkelosFont: HebrewFont; // Distinct font for Targum Onkelos!
  onkelosSizeDelta: number; // Font size difference for Onkelos (e.g. -2px)
  readingFlow: ReadingFlow; // 'stepper' or 'sequential_2x1x' (2x Torah, 1x Onkelos)
  boldFirstMikra: boolean; // Bold option for the first verse (מקרא ראשון מודגש)
  boldFirstVerseOfAliyah: boolean; // Bold the very first verse of each Aliyah
  showTeamim: boolean; // Cantillation marks (טעמי המקרא)
  showNikkud: boolean; // Vowels (ניקוד)
  showEnglish: boolean; // English verse translation
  commentary: CommentaryType;
  showRashi: boolean; // Dedicated Rashi commentary toggle
  theme: AppTheme;
  uiLanguage: UILanguage; // English or Hebrew interface language
  autoAdvanceOnStepComplete: boolean;
  playAudioChime: boolean;
  voiceSpeed: number; // 0.8 to 1.2
}

export interface VerseItem {
  id: string; // e.g. "Genesis 6:9"
  chapter: number;
  verse: number;
  verseHebrew: string; // e.g. "ט׳"
  aliyahIndex: number; // 0 to 6 (Rishon to Shevi'i), 7 for Maftir
  aliyahName: string; // e.g. "ראשון"
  mikraHebrew: string; // Full pointed text with teamim
  targumHebrew: string; // Targum Onkelos text
  rashiText?: string; // Rashi commentary
  englishText: string; // Translation
}

export interface AliyahData {
  index: number; // 0..6
  nameHe: string; // ראשון, שני, שלישי...
  nameEn: string;
  dayOfWeek: number; // 0 = Sunday (Rishon), 1 = Monday (Sheni), etc.
  dayNameHe: string; // יום ראשון
  dayNameEn: string; // Sunday
  verseCount: number;
  startVerseId: string;
  endVerseId: string;
}

export interface ParashaMetadata {
  id: string; // e.g. "Noach"
  nameEn: string;
  nameHe: string;
  chumashEn: 'Genesis' | 'Exodus' | 'Leviticus' | 'Numbers' | 'Deuteronomy';
  chumashHe: 'בראשית' | 'שמות' | 'ויקרא' | 'במדבר' | 'דברים';
  ref: string; // e.g. "Genesis 6:9-11:32"
  heRef: string;
  versesTotal: number;
}

export interface VerseProgress {
  mikra1: boolean;
  mikra2: boolean;
  targum: boolean;
  rashiRead?: boolean;
}

export interface ParashaProgress {
  parashaId: string;
  verses: Record<string, VerseProgress>; // key: verse.id
  lastStudiedVerseId?: string;
  updatedAt: number;
}

export interface CalendarInfo {
  parashaNameEn: string;
  parashaNameHe: string;
  ref: string;
  heDate?: string;
  israelOrDiaspora: 'diaspora' | 'israel';
}
