/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ALL_PARSHIOT } from '../data/parshiotList';
import { SAMPLE_NOACH_RISHON } from '../data/sampleParsha';
import { AliyahData, CalendarInfo, ParashaMetadata, VerseItem } from '../types';
import { cleanHtml, toHebrewNumeral } from '../utils/hebrew';
import { findMatchingParasha, getOfflineEstimatedParasha } from '../utils/parashaDetection';

const CACHE_PREFIX = 'shnayim_mikra_parsha_v2_';
const CALENDAR_CACHE_KEY = 'shnayim_mikra_calendar_v3';

const ALIYAH_NAMES: { he: string; en: string }[] = [
  { he: 'ראשון', en: 'First' },
  { he: 'שני', en: 'Second' },
  { he: 'שלישי', en: 'Third' },
  { he: 'רביעי', en: 'Fourth' },
  { he: 'חמישי', en: 'Fifth' },
  { he: 'ששי', en: 'Sixth' },
  { he: 'שביעי', en: 'Seventh' },
  { he: 'מפטיר', en: 'Maftir' },
];

const ALIYAH_DAYS: { he: string; en: string }[] = [
  { he: 'יום ראשון', en: 'Sunday' },
  { he: 'יום שני', en: 'Monday' },
  { he: 'יום שלישי', en: 'Tuesday' },
  { he: 'יום רביעי', en: 'Wednesday' },
  { he: 'יום חמישי', en: 'Thursday' },
  { he: 'יום ששי', en: 'Friday' },
  { he: 'שבת קודש', en: 'Shabbat' },
  { he: 'שבת קודש', en: 'Shabbat' },
];

export async function getCurrentCalendarParasha(): Promise<CalendarInfo> {
  // Check local cache first
  try {
    const cached = localStorage.getItem(CALENDAR_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Cache valid for 6 hours
      if (Date.now() - parsed.timestamp < 6 * 3600 * 1000 && parsed.data?.parashaNameEn) {
        return parsed.data;
      }
    }
  } catch {
    // ignore storage error
  }

  // 1. Try Sefaria Calendars API
  try {
    const res = await fetch('https://www.sefaria.org/api/calendars');
    if (res.ok) {
      const data = await res.json();
      const parashaItem = data.calendar_items?.find(
        (item: { title?: { en?: string; he?: string } }) =>
          item.title?.en === 'Parashat Hashavua' ||
          item.title?.he === 'פרשת השבוע' ||
          item.title?.en === 'Chok LeYisrael'
      );

      if (parashaItem?.displayValue?.en) {
        const rawEn = parashaItem.displayValue.en;
        const rawHe = parashaItem.displayValue.he || '';
        const matched = findMatchingParasha({ nameEn: rawEn, nameHe: rawHe, ref: parashaItem.ref });

        const info: CalendarInfo = {
          parashaNameEn: matched ? matched.nameEn : rawEn,
          parashaNameHe: matched ? matched.nameHe : rawHe,
          ref: matched ? matched.ref : parashaItem.ref || 'Genesis 12:1-17:27',
          heDate: data.date,
          israelOrDiaspora: 'diaspora',
        };

        try {
          localStorage.setItem(CALENDAR_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: info }));
        } catch {
          // ignore
        }
        return info;
      }
    }
  } catch (err) {
    console.warn('Could not load Sefaria calendar API, trying Hebcal fallback:', err);
  }

  // 2. Try Hebcal Shabbat / Leyning API fallback
  try {
    const res = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=281184');
    if (res.ok) {
      const data = await res.json();
      const parshaItem = data.items?.find((item: { category?: string }) => item.category === 'parashat');
      if (parshaItem?.title) {
        const rawTitle = parshaItem.title.replace(/^Parashat\s+/i, '');
        const rawHebrew = (parshaItem.hebrew || '').replace(/^פרשת\s+/i, '');
        const matched = findMatchingParasha({ nameEn: rawTitle, nameHe: rawHebrew });

        const info: CalendarInfo = {
          parashaNameEn: matched ? matched.nameEn : rawTitle,
          parashaNameHe: matched ? matched.nameHe : rawHebrew,
          ref: matched ? matched.ref : parshaItem.leyning?.torah || 'Genesis 12:1-17:27',
          heDate: parshaItem.hdate,
          israelOrDiaspora: 'diaspora',
        };

        try {
          localStorage.setItem(CALENDAR_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: info }));
        } catch {
          // ignore
        }
        return info;
      }
    }
  } catch (err) {
    console.warn('Could not load Hebcal calendar fallback:', err);
  }

  // 3. Robust offline algorithmic fallback based on current date
  const fallbackParasha = getOfflineEstimatedParasha();
  return {
    parashaNameEn: fallbackParasha.nameEn,
    parashaNameHe: fallbackParasha.nameHe,
    ref: fallbackParasha.ref,
    israelOrDiaspora: 'diaspora',
  };
}

export async function loadParashaVerses(
  parasha: ParashaMetadata,
  onProgress?: (msg: string) => void
): Promise<{ verses: VerseItem[]; aliyot: AliyahData[] }> {
  const cacheKey = `${CACHE_PREFIX}${parasha.id}`;

  // 1. Try local cache
  try {
    const cachedStr = localStorage.getItem(cacheKey);
    if (cachedStr) {
      const cachedObj = JSON.parse(cachedStr);
      if (cachedObj.verses && cachedObj.verses.length > 0) {
        return cachedObj;
      }
    }
  } catch {
    // ignore
  }

  onProgress?.('טוען פסוקים מתוך ספריא...');

  // 2. Fetch live data
  try {
    const refParam = parasha.ref.replace(/\s+/g, '.');
    const [torahRes, onkelosRes, rashiRes] = await Promise.allSettled([
      fetch(`https://www.sefaria.org/api/texts/${refParam}?context=0`).then(r => r.json()),
      fetch(`https://www.sefaria.org/api/texts/Onkelos_${refParam}?context=0`).then(r => r.json()),
      fetch(`https://www.sefaria.org/api/texts/Rashi_on_${refParam}?context=0`).then(r => r.json()),
    ]);

    const torahData = torahRes.status === 'fulfilled' ? torahRes.value : null;
    const onkelosData = onkelosRes.status === 'fulfilled' ? onkelosRes.value : null;
    const rashiData = rashiRes.status === 'fulfilled' ? rashiRes.value : null;

    if (!torahData || !torahData.he) {
      throw new Error('Could not retrieve Torah text');
    }

    const startChapter = torahData.sections?.[0] || 1;
    const startVerse = torahData.sections?.[1] || 1;

    // Handle whether torahData.he is 1D or 2D array
    const is2D = Array.isArray(torahData.he[0]);
    const chaptersHe: string[][] = is2D ? torahData.he : [torahData.he];
    const chaptersEn: string[][] = Array.isArray(torahData.text?.[0]) ? torahData.text : [torahData.text || []];
    const onkelosChapters: string[][] = Array.isArray(onkelosData?.he?.[0]) ? onkelosData.he : (onkelosData?.he ? [onkelosData.he] : []);
    const rashiChapters = rashiData?.he || [];

    // Alts mapping for Aliyot
    // Map of `${cIdx}:${vIdx}` -> aliyah index
    const altsMap = new Map<string, number>();
    if (torahData.alts && Array.isArray(torahData.alts)) {
      for (let c = 0; c < torahData.alts.length; c++) {
        const chapArr = torahData.alts[c];
        if (Array.isArray(chapArr)) {
          chapArr.forEach((v, vIdx) => {
            if (v && v.aliyah_he) {
              const matchedIdx = ALIYAH_NAMES.findIndex(a => a.he === v.aliyah_he || v.aliyah_he.includes(a.he));
              if (matchedIdx !== -1) {
                altsMap.set(`${c}:${vIdx}`, matchedIdx);
              }
            }
          });
        }
      }
    }

    const verses: VerseItem[] = [];
    let currentAliyah = 0;

    for (let c = 0; c < chaptersHe.length; c++) {
      const chapterNum = startChapter + c;
      const chapHe = chaptersHe[c] || [];
      const chapEn = chaptersEn[c] || [];
      const chapOnk = onkelosChapters[c] || [];
      const chapRashi = Array.isArray(rashiChapters[c]) ? rashiChapters[c] : [];

      for (let v = 0; v < chapHe.length; v++) {
        const verseNum = c === 0 ? startVerse + v : v + 1;
        const altsKey = `${c}:${v}`;

        if (altsMap.has(altsKey)) {
          currentAliyah = altsMap.get(altsKey)!;
        }

        const hebrewText = chapHe[v] || '';
        const englishText = cleanHtml(chapEn[v] || '');
        const onkelosText = chapOnk[v] || '';

        // Combine Rashi comments for this verse
        let rashiCombined = '';
        if (chapRashi && chapRashi[v]) {
          const rItem = chapRashi[v];
          if (Array.isArray(rItem)) {
            rashiCombined = rItem.join(' ');
          } else if (typeof rItem === 'string') {
            rashiCombined = rItem;
          }
        }

        const verseId = `${parasha.chumashEn} ${chapterNum}:${verseNum}`;

        verses.push({
          id: verseId,
          chapter: chapterNum,
          verse: verseNum,
          verseHebrew: toHebrewNumeral(verseNum),
          aliyahIndex: currentAliyah,
          aliyahName: ALIYAH_NAMES[currentAliyah]?.he || 'ראשון',
          mikraHebrew: hebrewText,
          targumHebrew: onkelosText || hebrewText,
          rashiText: rashiCombined,
          englishText: englishText,
        });
      }
    }

    // Build Aliyot metadata summary
    const aliyot: AliyahData[] = [];
    for (let a = 0; a < 7; a++) {
      const aliyahVerses = verses.filter(v => v.aliyahIndex === a);
      if (aliyahVerses.length > 0) {
        aliyot.push({
          index: a,
          nameHe: ALIYAH_NAMES[a].he,
          nameEn: ALIYAH_NAMES[a].en,
          dayOfWeek: a,
          dayNameHe: ALIYAH_DAYS[a].he,
          dayNameEn: ALIYAH_DAYS[a].en,
          verseCount: aliyahVerses.length,
          startVerseId: aliyahVerses[0].id,
          endVerseId: aliyahVerses[aliyahVerses.length - 1].id,
        });
      }
    }

    // If no alts were provided by Sefaria, partition verses into 7 roughly equal aliyot
    if (aliyot.length <= 1 && verses.length > 7) {
      const chunk = Math.ceil(verses.length / 7);
      for (let i = 0; i < verses.length; i++) {
        const aIdx = Math.min(6, Math.floor(i / chunk));
        verses[i].aliyahIndex = aIdx;
        verses[i].aliyahName = ALIYAH_NAMES[aIdx].he;
      }
      aliyot.length = 0;
      for (let a = 0; a < 7; a++) {
        const aliyahVerses = verses.filter(v => v.aliyahIndex === a);
        if (aliyahVerses.length > 0) {
          aliyot.push({
            index: a,
            nameHe: ALIYAH_NAMES[a].he,
            nameEn: ALIYAH_NAMES[a].en,
            dayOfWeek: a,
            dayNameHe: ALIYAH_DAYS[a].he,
            dayNameEn: ALIYAH_DAYS[a].en,
            verseCount: aliyahVerses.length,
            startVerseId: aliyahVerses[0].id,
            endVerseId: aliyahVerses[aliyahVerses.length - 1].id,
          });
        }
      }
    }

    const result = { verses, aliyot };
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch {
      // Storage might be full, skip caching
    }

    return result;
  } catch (error) {
    console.warn('Failed to fetch from Sefaria API, checking fallback:', error);

    // Fallback to bundled sample if Noach or Bereshit
    if (parasha.id === 'Noach' || parasha.id === 'Bereshit') {
      const verses = SAMPLE_NOACH_RISHON.map(v => ({
        ...v,
        verseHebrew: toHebrewNumeral(v.verse),
      }));

      const aliyot: AliyahData[] = [
        {
          index: 0,
          nameHe: 'ראשון',
          nameEn: 'First',
          dayOfWeek: 0,
          dayNameHe: 'יום ראשון',
          dayNameEn: 'Sunday',
          verseCount: verses.length,
          startVerseId: verses[0].id,
          endVerseId: verses[verses.length - 1].id,
        },
      ];

      return { verses, aliyot };
    }

    throw error;
  }
}

/**
 * Fetches Rashi commentary on-demand for a single verse from Sefaria API.
 */
export async function fetchVerseRashi(verseId: string): Promise<string> {
  const refParam = verseId.replace(/\s+/g, '.');
  try {
    const res = await fetch(`https://www.sefaria.org/api/texts/Rashi_on_${refParam}?context=0`);
    if (!res.ok) return '';
    const data = await res.json();
    if (data.he) {
      if (Array.isArray(data.he)) {
        return data.he.filter(Boolean).join(' ');
      }
      return typeof data.he === 'string' ? data.he : '';
    }
  } catch (err) {
    console.warn(`Could not load Rashi for ${verseId}:`, err);
  }
  return '';
}
