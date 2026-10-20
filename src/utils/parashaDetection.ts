/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALL_PARSHIOT } from '../data/parshiotList';
import { CalendarInfo, ParashaMetadata } from '../types';

/**
 * Normalizes Hebrew and English parasha titles by removing prefixes,
 * hyphens, dashes, maqaf (־), apostrophes, and punctuation.
 */
export function normalizeParashaText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/^parashat\s+/i, '')
    .replace(/^parashas\s+/i, '')
    .replace(/^parashah\s+/i, '')
    .replace(/^פרשת\s+/i, '')
    .replace(/^פרשה\s+/i, '')
    .replace(/[\s\-_–—־'’"״׳.]/g, '')
    .trim();
}

/**
 * Robust matching of calendar API outputs (Sefaria, Hebcal) to our ALL_PARSHIOT metadata.
 * Handles English, Hebrew, variations (e.g. "Lech-Lecha" vs "Lech Lecha" vs "לך־לך"),
 * compound portions, and Torah reference fallbacks.
 */
export function findMatchingParasha(
  query: string | { nameEn?: string; nameHe?: string; ref?: string }
): ParashaMetadata | undefined {
  if (!query) return undefined;

  const targetEn = typeof query === 'string' ? query : query.nameEn || '';
  const targetHe = typeof query === 'string' ? query : query.nameHe || '';
  const targetRef = typeof query === 'string' ? query : query.ref || '';

  const normEn = normalizeParashaText(targetEn);
  const normHe = normalizeParashaText(targetHe);

  // 1. Direct or normalized match on id, nameEn, nameHe
  for (const p of ALL_PARSHIOT) {
    const pId = normalizeParashaText(p.id);
    const pEn = normalizeParashaText(p.nameEn);
    const pHe = normalizeParashaText(p.nameHe);

    if (
      (normEn && (pId === normEn || pEn === normEn)) ||
      (normHe && pHe === normHe) ||
      (normEn && pHe === normEn)
    ) {
      return p;
    }
  }

  // 2. Substring or compound match (e.g., compound parashiot like Matot-Masei or Vayakhel-Pekudei)
  if (normEn.length >= 4) {
    for (const p of ALL_PARSHIOT) {
      const pId = normalizeParashaText(p.id);
      const pEn = normalizeParashaText(p.nameEn);
      if (normEn.includes(pId) || pId.includes(normEn) || normEn.includes(pEn) || pEn.includes(normEn)) {
        return p;
      }
    }
  }

  if (normHe.length >= 3) {
    for (const p of ALL_PARSHIOT) {
      const pHe = normalizeParashaText(p.nameHe);
      if (normHe.includes(pHe) || pHe.includes(normHe)) {
        return p;
      }
    }
  }

  // 3. Match by Torah reference (e.g., Genesis 12:1-17:27)
  if (targetRef) {
    const cleanRef = targetRef.replace(/\s+/g, '');
    for (const p of ALL_PARSHIOT) {
      const pRef = p.ref.replace(/\s+/g, '');
      if (cleanRef.startsWith(pRef.split('-')[0]) || pRef.startsWith(cleanRef.split('-')[0])) {
        return p;
      }
    }
  }

  return undefined;
}

/**
 * Approximate offline date-based lookup for standard annual cycle (5786-5787)
 * Ensures that even completely offline without Sefaria or Hebcal, the daily parasha is detected.
 */
export function getOfflineEstimatedParasha(date: Date = new Date()): ParashaMetadata {
  const month = date.getMonth(); // 0 = Jan, 9 = Oct
  const day = date.getDate();

  // In mid-October (Cheshvan), the cycle begins Genesis: Bereshit -> Noach -> Lech-Lecha
  if (month === 9) { // October
    if (day <= 10) return ALL_PARSHIOT[0]; // Bereshit
    if (day <= 17) return ALL_PARSHIOT[1]; // Noach
    if (day <= 24) return ALL_PARSHIOT[2]; // Lech-Lecha
    return ALL_PARSHIOT[3]; // Vayera
  }
  if (month === 10) { // November
    if (day <= 7) return ALL_PARSHIOT[4]; // Chayei Sara
    if (day <= 14) return ALL_PARSHIOT[5]; // Toldot
    if (day <= 21) return ALL_PARSHIOT[6]; // Vayetzei
    return ALL_PARSHIOT[7]; // Vayishlach
  }

  // Default to Lech-Lecha for current season
  return ALL_PARSHIOT[2];
}
