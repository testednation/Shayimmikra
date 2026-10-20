/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppTheme, BookmarkInfo, DisplaySettings, ParashaProgress, VerseProgress } from '../types';
import { recordStudyEvent } from './historyTracking';

const PROGRESS_KEY_PREFIX = 'sm_prog_v1_';
const SETTINGS_KEY = 'sm_settings_v2';
const ACTIVE_PARASHA_KEY = 'sm_active_parasha_v1';
const BOOKMARK_KEY = 'sm_bookmark_v2';

export const DEFAULT_SETTINGS: DisplaySettings = {
  fontSize: 26,
  lineHeight: 'relaxed',
  fontFamily: 'frank',
  onkelosFont: 'david',
  onkelosSizeDelta: -2,
  readingFlow: 'sequential_2x1x', // default to requested 2x Torah, 1x Onkelos format!
  boldFirstMikra: true, // bold first verse option!
  boldFirstVerseOfAliyah: true,
  showTeamim: true,
  showNikkud: true,
  showEnglish: false,
  commentary: 'onkelos',
  showRashi: false,
  theme: 'parchment',
  uiLanguage: 'en',
  autoAdvanceOnStepComplete: true,
  playAudioChime: true,
  voiceSpeed: 1.0,
};

export function loadSettings(): DisplaySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: DisplaySettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function loadBookmark(): BookmarkInfo | null {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return null;
}

export function saveBookmark(bookmark: BookmarkInfo): void {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmark));
  } catch {
    // ignore
  }
}

export function clearBookmark(): void {
  try {
    localStorage.removeItem(BOOKMARK_KEY);
  } catch {
    // ignore
  }
}

const NOTES_KEY_PREFIX = 'sm_note_v1_';

export function loadVerseNote(verseId: string): string {
  try {
    return localStorage.getItem(`${NOTES_KEY_PREFIX}${verseId}`) || '';
  } catch {
    return '';
  }
}

export function saveVerseNote(verseId: string, note: string): void {
  try {
    if (!note.trim()) {
      localStorage.removeItem(`${NOTES_KEY_PREFIX}${verseId}`);
    } else {
      localStorage.setItem(`${NOTES_KEY_PREFIX}${verseId}`, note);
    }
  } catch {
    // ignore
  }
}

export function deleteVerseNote(verseId: string): void {
  try {
    localStorage.removeItem(`${NOTES_KEY_PREFIX}${verseId}`);
  } catch {
    // ignore
  }
}


export function loadParashaProgress(parashaId: string): ParashaProgress {
  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY_PREFIX}${parashaId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {
    parashaId,
    verses: {},
    updatedAt: Date.now(),
  };
}

export function saveParashaProgress(progress: ParashaProgress): void {
  try {
    localStorage.setItem(`${PROGRESS_KEY_PREFIX}${progress.parashaId}`, JSON.stringify(progress));
  } catch {
    // ignore
  }
}

export function updateVerseProgress(
  parashaId: string,
  verseId: string,
  step: 'mikra1' | 'mikra2' | 'targum',
  value: boolean
): ParashaProgress {
  const current = loadParashaProgress(parashaId);
  const verseProg = current.verses[verseId] || { mikra1: false, mikra2: false, targum: false };

  const updatedVerse: VerseProgress = {
    ...verseProg,
    [step]: value,
  };

  const updated: ParashaProgress = {
    ...current,
    verses: {
      ...current.verses,
      [verseId]: updatedVerse,
    },
    lastStudiedVerseId: verseId,
    updatedAt: Date.now(),
  };

  saveParashaProgress(updated);
  const isDone = updatedVerse.mikra1 && updatedVerse.mikra2 && updatedVerse.targum;
  recordStudyEvent(parashaId, isDone);
  return updated;
}

export function markVerseComplete(parashaId: string, verseId: string): ParashaProgress {
  const current = loadParashaProgress(parashaId);
  const updated: ParashaProgress = {
    ...current,
    verses: {
      ...current.verses,
      [verseId]: { mikra1: true, mikra2: true, targum: true },
    },
    lastStudiedVerseId: verseId,
    updatedAt: Date.now(),
  };
  saveParashaProgress(updated);
  recordStudyEvent(parashaId, true);
  return updated;
}

export function markAliyahComplete(parashaId: string, verseIds: string[]): ParashaProgress {
  const current = loadParashaProgress(parashaId);
  const newVerses = { ...current.verses };
  verseIds.forEach(id => {
    newVerses[id] = { mikra1: true, mikra2: true, targum: true };
    recordStudyEvent(parashaId, true);
  });

  const updated: ParashaProgress = {
    ...current,
    verses: newVerses,
    lastStudiedVerseId: verseIds[verseIds.length - 1],
    updatedAt: Date.now(),
  };
  saveParashaProgress(updated);
  return updated;
}

export function resetAliyahProgress(parashaId: string, verseIds: string[]): ParashaProgress {
  const current = loadParashaProgress(parashaId);
  const newVerses = { ...current.verses };
  verseIds.forEach(id => {
    delete newVerses[id];
  });

  const updated: ParashaProgress = {
    ...current,
    verses: newVerses,
    updatedAt: Date.now(),
  };
  saveParashaProgress(updated);
  return updated;
}

export function loadSavedParashaId(defaultId?: string): string | null {
  try {
    const saved = localStorage.getItem(ACTIVE_PARASHA_KEY);
    if (saved) return saved;
    return defaultId || null;
  } catch {
    return defaultId || null;
  }
}

export function saveActiveParashaId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_PARASHA_KEY, id);
  } catch {
    // ignore
  }
}
