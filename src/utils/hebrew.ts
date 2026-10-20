/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Converts a positive number to traditional Hebrew gematria notation.
 * e.g. 1 -> א׳, 15 -> ט״ו, 16 -> ט״ז, 24 -> כ״ד, 100 -> ק׳
 */
export function toHebrewNumeral(num: number): string {
  if (num <= 0) return '';

  const values: [number, string][] = [
    [400, 'ת'],
    [300, 'ש'],
    [200, 'ר'],
    [100, 'ק'],
    [90, 'צ'],
    [80, 'פ'],
    [70, 'ע'],
    [60, 'ס'],
    [50, 'נ'],
    [40, 'מ'],
    [30, 'ל'],
    [20, 'כ'],
    [10, 'י'],
    [9, 'ט'],
    [8, 'ח'],
    [7, 'ז'],
    [6, 'ו'],
    [5, 'ה'],
    [4, 'ד'],
    [3, 'ג'],
    [2, 'ב'],
    [1, 'א'],
  ];

  let result = '';
  let n = num;

  while (n > 0) {
    if (n === 15) {
      result += 'טו';
      break;
    } else if (n === 16) {
      result += 'טז';
      break;
    }

    for (const [val, letter] of values) {
      if (n >= val) {
        result += letter;
        n -= val;
        break;
      }
    }
  }

  // Add gershayim (double quote before last char) or geresh (apostrophe if single char)
  if (result.length === 1) {
    return result + '׳';
  } else if (result.length > 1) {
    return result.slice(0, -1) + '״' + result.slice(-1);
  }
  return result;
}

/**
 * Removes cantillation / teamim accents (\u0591 - \u05AF), retaining vowels (nikkud).
 */
export function stripTeamim(text: string): string {
  if (!text) return '';
  return text.replace(/[\u0591-\u05AF]/g, '');
}

/**
 * Removes both cantillation and vowels (nikkud) to produce unvocalized Torah scroll script (כתב סת״ם).
 */
export function stripNikkud(text: string): string {
  if (!text) return '';
  // Remove cantillation and vowel points (\u0591-\u05BD, \u05BF-\u05C7)
  return text.replace(/[\u0591-\u05BD\u05BF-\u05C5\u05C7]/g, '');
}

/**
 * Cleans Sefaria HTML tags such as <big>, <b>, <i>, <small>, footnotes, etc.
 */
export function cleanHtml(text: string): string {
  if (!text) return '';
  // Remove footnotes and markers first
  let cleaned = text.replace(/<sup class="footnote-marker">.*?<\/sup>/gi, '');
  cleaned = cleaned.replace(/<i class="footnote">.*?<\/i>/gi, '');
  // Replace HTML break/paragraph tags
  cleaned = cleaned.replace(/<br\s*\/?>/gi, ' ');
  // Keep <b> tags if useful or strip all tags
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, '');
  // Normalize whitespace
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Extract clean text specifically for Web Speech synthesis
 */
export function textToSpeechVoice(text: string): string {
  const plain = cleanHtml(text);
  // Remove maqaf, paseq, and Sof Pasuq
  return plain.replace(/[־׀׃]/g, ' ').trim();
}

/**
 * Play a gentle tactile confirmation chime using Web Audio API
 */
export function playStepChime(type: 'step' | 'complete' | 'aliyah') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'step') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === 'complete') {
      // Verse complete chord
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.3);
      });
    } else if (type === 'aliyah') {
      // Aliyah completion fanfare
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
      });
    }
  } catch {
    // AudioContext blocked or not allowed yet, ignore
  }
}
