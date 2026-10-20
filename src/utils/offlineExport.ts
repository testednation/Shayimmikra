/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AliyahData, DisplaySettings, ParashaMetadata, VerseItem } from '../types';
import { cleanHtml, stripNikkud, stripTeamim } from './hebrew';
import { loadVerseNote } from './storage';

/**
 * Triggers a file download in the browser.
 */
export function downloadFile(filename: string, content: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a self-contained, standalone offline HTML reader file for the Parasha.
 * This file has zero external dependencies, embedded CSS and JS, and runs completely offline in any browser!
 */
export function generateStandaloneOfflineHtml(
  parasha: ParashaMetadata,
  verses: VerseItem[],
  aliyot: AliyahData[],
  settings: DisplaySettings
): string {
  // Gather user notes for each verse
  const versesWithNotes = verses.map((v) => ({
    ...v,
    userNote: loadVerseNote(v.id),
  }));

  const title = `שנים מקרא - פרשת ${parasha.nameHe} (${parasha.nameEn})`;

  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - מהדורה אופליין</title>
  <style>
    :root {
      --bg: #FAF6EF;
      --card-bg: #FFFFFF;
      --border: #E8DFC8;
      --text: #211E1A;
      --text-muted: #6B645A;
      --accent: #9E7422;
      --accent-soft: #F5ECCE;
      --onkelos-bg: #FAF4E8;
      --rashi-bg: #F9F5EC;
    }
    body.dark {
      --bg: #141210;
      --card-bg: #1C1A18;
      --border: #2D271F;
      --text: #ECE6DB;
      --text-muted: #9A9184;
      --accent: #D4AF37;
      --accent-soft: #2E2514;
      --onkelos-bg: #1E1B18;
      --rashi-bg: #1A1816;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Frank Ruhl Libre', 'David Libre', serif;
      line-height: 1.8;
      padding: 1.5rem;
      transition: background-color 0.2s, color 0.2s;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid var(--border);
    }
    h1 {
      font-size: 2.2rem;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }
    .subtitle {
      font-size: 0.95rem;
      color: var(--text-muted);
    }
    .badge {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.25rem 0.75rem;
      background: var(--accent-soft);
      color: var(--accent);
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: bold;
    }
    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 0.75rem 1rem;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      font-family: system-ui, sans-serif;
      font-size: 0.85rem;
    }
    .btn {
      padding: 0.35rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      background: var(--card-bg);
      color: var(--text);
      cursor: pointer;
      font-size: 0.8rem;
    }
    .btn:hover {
      background: var(--accent-soft);
      border-color: var(--accent);
    }
    .aliyah-header {
      margin: 2.5rem 0 1rem;
      padding: 0.5rem 1rem;
      background: var(--accent-soft);
      border-right: 4px solid var(--accent);
      border-radius: 0.25rem;
      font-size: 1.3rem;
      font-weight: bold;
      color: var(--accent);
    }
    .verse-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.25rem;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .verse-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
      margin-bottom: 0.75rem;
      font-family: system-ui, sans-serif;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .verse-num {
      font-weight: bold;
      color: var(--accent);
      font-size: 0.95rem;
    }
    .steps {
      display: flex;
      gap: 0.5rem;
    }
    .step-chk {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      cursor: pointer;
      user-select: none;
    }
    .step-chk input {
      accent-color: var(--accent);
      cursor: pointer;
    }
    .mikra-text {
      font-size: ${settings.fontSize}px;
      line-height: 1.9;
      margin-bottom: 0.75rem;
    }
    .mikra-first {
      font-weight: ${settings.boldFirstMikra ? 'bold' : 'normal'};
      border-bottom: 1px dashed var(--border);
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .onkelos-block {
      background: var(--onkelos-bg);
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      margin: 0.75rem 0;
      border-right: 3px solid var(--accent);
    }
    .onkelos-label {
      font-family: system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: bold;
      color: var(--accent);
      margin-bottom: 0.25rem;
    }
    .onkelos-text {
      font-size: ${Math.max(16, settings.fontSize - 2)}px;
      line-height: 1.8;
    }
    .rashi-block {
      background: var(--rashi-bg);
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      margin-top: 0.75rem;
      font-size: 0.95rem;
      border: 1px solid var(--border);
    }
    .rashi-label {
      font-family: system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: bold;
      color: #9E7422;
      margin-bottom: 0.25rem;
    }
    .user-note-block {
      margin-top: 0.5rem;
      padding: 0.5rem 0.75rem;
      background: rgba(158, 116, 34, 0.06);
      border-radius: 0.35rem;
      font-family: system-ui, sans-serif;
      font-size: 0.8rem;
    }
    .english-trans {
      direction: ltr;
      text-align: left;
      font-family: system-ui, sans-serif;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
      border-top: 1px dotted var(--border);
      padding-top: 0.4rem;
    }
    @media print {
      body { background: white !important; color: black !important; padding: 0; }
      .controls, .steps { display: none !important; }
      .verse-card { page-break-inside: avoid; border: none; border-bottom: 1px solid #ccc; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>שנים מקרא ואחד תרגום</h1>
      <div class="subtitle">פרשת ${parasha.nameHe} (${parasha.nameEn}) · ${parasha.chumashHe} · ${verses.length} פסוקים</div>
      <div class="badge">מהדורה אופליין עצמאית — פועל ללא צורך באינטרנט</div>
    </header>

    <div class="controls">
      <div>
        <button class="btn" onclick="toggleTheme()">🌓 החלף מצב תצוגה (בהיר/כהה)</button>
        <button class="btn" onclick="window.print()">🖨️ הדפסה / שמירה כ-PDF</button>
      </div>
      <div>
        <span>התקדמות אופליין: </span>
        <span id="progress-stat">0 / ${verses.length} הושלמו</span>
      </div>
    </div>

    <main>
      ${aliyot.map((aliyah) => {
        const aliyahVerses = versesWithNotes.filter((v) => v.aliyahIndex === aliyah.index);
        if (aliyahVerses.length === 0) return '';
        return `
          <div class="aliyah-header">
            עליית ${aliyah.nameHe} (${aliyah.nameEn} Aliyah) — ${aliyahVerses.length} פסוקים
          </div>
          ${aliyahVerses.map((v) => `
            <article class="verse-card" id="v-${v.id.replace(/[\s:]/g, '-')}">
              <div class="verse-header">
                <div>
                  <span class="verse-num">פסוק ${v.verseHebrew}</span>
                  <span>(פרק ${v.chapter})</span>
                </div>
                <div class="steps">
                  <label class="step-chk">
                    <input type="checkbox" onchange="updateStep('${v.id}', 'm1', this.checked)">
                    <span>מקרא א׳</span>
                  </label>
                  <label class="step-chk">
                    <input type="checkbox" onchange="updateStep('${v.id}', 'm2', this.checked)">
                    <span>מקרא ב׳</span>
                  </label>
                  <label class="step-chk">
                    <input type="checkbox" onchange="updateStep('${v.id}', 'tg', this.checked)">
                    <span>תרגום</span>
                  </label>
                </div>
              </div>

              <!-- Pass 1: Torah First Recitation -->
              <div class="mikra-text mikra-first">
                ${v.mikraHebrew}
              </div>

              <!-- Pass 2: Torah Second Recitation -->
              <div class="mikra-text">
                ${v.mikraHebrew}
              </div>

              <!-- Pass 3: Targum Onkelos -->
              <div class="onkelos-block">
                <div class="onkelos-label">תרגום אונקלוס (פעם ג׳)</div>
                <div class="onkelos-text">${v.targumHebrew}</div>
              </div>

              <!-- Rashi Commentary if present -->
              ${v.rashiText ? `
                <div class="rashi-block">
                  <div class="rashi-label">פירוש רש״י על הפסוק</div>
                  <div>${v.rashiText}</div>
                </div>
              ` : ''}

              <!-- User Note if saved -->
              ${v.userNote ? `
                <div class="user-note-block">
                  <strong>הערה אישית: </strong>${v.userNote}
                </div>
              ` : ''}

              ${v.englishText ? `
                <div class="english-trans">
                  <strong>Translation: </strong>${v.englishText}
                </div>
              ` : ''}
            </article>
          `).join('')}
        `;
      }).join('')}
    </main>
  </div>

  <script>
    const STORAGE_KEY = 'sm_offline_prog_${parasha.id}';
    let progress = {};
    try {
      progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch(e) {}

    // Initialize checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(input => {
      const match = input.getAttribute('onchange')?.match(/updateStep\\('([^']+)',\\s*'([^']+)'/);
      if (match) {
        const [_, vId, step] = match;
        if (progress[vId] && progress[vId][step]) {
          input.checked = true;
        }
      }
    });
    updateProgressCounter();

    function updateStep(vId, step, checked) {
      if (!progress[vId]) progress[vId] = {};
      progress[vId][step] = checked;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch(e) {}
      updateProgressCounter();
    }

    function updateProgressCounter() {
      const total = ${verses.length};
      let completed = 0;
      for (const k in progress) {
        if (progress[k]?.m1 && progress[k]?.m2 && progress[k]?.tg) {
          completed++;
        }
      }
      const el = document.getElementById('progress-stat');
      if (el) el.textContent = completed + ' / ' + total + ' הושלמו';
    }

    function toggleTheme() {
      document.body.classList.toggle('dark');
    }
  </script>
</body>
</html>`;
}

/**
 * Exports user notes and progress as a downloadable JSON file.
 */
export function exportStudyDataJson(
  parashaId: string,
  progress: unknown,
  verses: VerseItem[]
): void {
  const notesMap: Record<string, string> = {};
  verses.forEach((v) => {
    const note = loadVerseNote(v.id);
    if (note) notesMap[v.id] = note;
  });

  const exportPayload = {
    app: 'Shnayim Mikra Reader',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    parashaId,
    progress,
    notes: notesMap,
  };

  downloadFile(
    `shnayim_mikra_${parashaId}_backup.json`,
    JSON.stringify(exportPayload, null, 2),
    'application/json'
  );
}
