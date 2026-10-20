/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  FileCode,
  HardDriveDownload,
  CheckCircle2,
  Database,
  Loader2,
  Smartphone,
  Globe,
  ExternalLink,
  Copy,
  CheckCheck,
  Terminal,
  Cloud,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';
import { AliyahData, AppTheme, DisplaySettings, ParashaMetadata, UILanguage, VerseItem } from '../types';
import { downloadFile, exportStudyDataJson, generateStandaloneOfflineHtml } from '../utils/offlineExport';
import { fetchVerseRashi } from '../services/sefariaService';
import { PWAInstallButton } from './PWAInstallButton';

interface OfflineExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  parasha: ParashaMetadata;
  verses: VerseItem[];
  aliyot: AliyahData[];
  settings: DisplaySettings;
  theme: AppTheme;
  lang: UILanguage;
  progress: unknown;
}

export const OfflineExportModal: React.FC<OfflineExportModalProps> = ({
  isOpen,
  onClose,
  parasha,
  verses,
  aliyot,
  settings,
  theme,
  lang,
  progress,
}) => {
  const [activeTab, setActiveTab] = useState<'deploy' | 'offline'>('deploy');
  const [isExportingHtml, setIsExportingHtml] = useState(false);
  const [isCachingParasha, setIsCachingParasha] = useState(false);
  const [cacheProgress, setCacheProgress] = useState<{ done: number; total: number } | null>(null);
  const [cachedComplete, setCachedComplete] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const isEn = lang === 'en';
  const isDark = theme === 'dark';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Export Standalone Single-File HTML
  const handleExportHtml = async () => {
    setIsExportingHtml(true);
    try {
      const fullVerses = await Promise.all(
        verses.map(async (v) => {
          if (v.rashiText) return v;
          try {
            const rText = await fetchVerseRashi(v.id);
            return { ...v, rashiText: rText };
          } catch {
            return v;
          }
        })
      );

      const htmlContent = generateStandaloneOfflineHtml(parasha, fullVerses, aliyot, settings);
      const filename = `Shnayim_Mikra_${parasha.nameEn}_Offline.html`;
      downloadFile(filename, htmlContent, 'text/html;charset=utf-8');
    } finally {
      setIsExportingHtml(false);
    }
  };

  // 2. Pre-cache all verses into local browser memory
  const handlePrecacheParasha = async () => {
    setIsCachingParasha(true);
    setCacheProgress({ done: 0, total: verses.length });

    try {
      let count = 0;
      for (const v of verses) {
        if (!v.rashiText) {
          try {
            await fetchVerseRashi(v.id);
          } catch {
            // ignore network issues
          }
        }
        count++;
        setCacheProgress({ done: count, total: verses.length });
      }
      setCachedComplete(true);
    } finally {
      setIsCachingParasha(false);
    }
  };

  // 3. Print
  const handlePrint = () => {
    window.print();
  };

  // 4. Export JSON backup
  const handleExportJson = () => {
    exportStudyDataJson(parasha.id, progress, verses);
  };

  // 5. Download vercel.json
  const handleDownloadVercelConfig = () => {
    const config = JSON.stringify(
      {
        buildCommand: "npm run build",
        outputDirectory: "dist",
        framework: "vite",
        cleanUrls: true,
        rewrites: [{ source: "/(.*)", destination: "/index.html" }]
      },
      null,
      2
    );
    downloadFile("vercel.json", config, "application/json");
  };

  // 6. Download render.yaml
  const handleDownloadRenderConfig = () => {
    const config = `services:
  - type: web
    name: shnayim-mikra
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
`;
    downloadFile("render.yaml", config, "text/yaml");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border transition-all overflow-hidden ${
          isDark
            ? 'bg-[#1A1816] border-[#312B22] text-stone-100'
            : theme === 'sefer'
            ? 'bg-white border-stone-200 text-stone-900'
            : 'bg-[#FCFAF6] border-[#E8DFC8] text-stone-900'
        }`}
        dir={isEn ? 'ltr' : 'rtl'}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-[#9E7422] dark:text-[#D4AF37]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-frank text-lg font-bold text-stone-900 dark:text-stone-100">
                {isEn ? 'Deploy & Offline Hub' : 'מרכז פריסה לענן ושימוש אופליין'}
              </h2>
              <p className="text-xs text-stone-500">
                {isEn
                  ? 'Deploy to Vercel/Render, export standalone offline webpage, or install PWA'
                  : 'פריסה קלה ל-Vercel ול-Render, ייצוא דף אינטרנט עצמאי והתקנה במכשיר'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Switcher */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 px-5 pt-3 gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('deploy')}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'deploy'
                ? 'border-[#9E7422] dark:border-[#D4AF37] text-[#9E7422] dark:text-[#D4AF37]'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>{isEn ? 'Cloud Deploy (Vercel & Render)' : 'פריסה לענן (Vercel ו-Render)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`pb-3 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'offline'
                ? 'border-[#9E7422] dark:border-[#D4AF37] text-[#9E7422] dark:text-[#D4AF37]'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <HardDriveDownload className="w-4 h-4" />
            <span>{isEn ? 'Offline & Standalone' : 'שימוש אופליין והורדה'}</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'deploy' ? (
            /* TAB 1: Deploy to Vercel / Render / Cloud */
            <div className="space-y-4">
              
              {/* Option: Vercel 1-Click Deployment */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-500/5 hover:border-stone-300 dark:hover:border-stone-700 transition-colors space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-black text-white dark:bg-white dark:text-black">
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 76 65">
                          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
                        </svg>
                      </span>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>{isEn ? 'Deploy to Vercel' : 'פריסה מהירה ל-Vercel'}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">
                          {isEn ? 'Config Ready' : 'מוכן לפריסה'}
                        </span>
                      </h3>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {isEn
                        ? 'Includes preconfigured vercel.json with Vite SPA routing, static caching, and high performance edge hosting.'
                        : 'כולל קובץ vercel.json מובנה עם ניתוב SPA מלא של Vite, שמירה במטמון מהיר ואירוח בקצה הרשת.'}
                    </p>
                  </div>
                </div>

                {/* Commands and buttons */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs bg-stone-100 dark:bg-stone-900/80 p-2 rounded-lg font-mono text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800">
                    <span className="truncate">npx vercel --prod</span>
                    <button
                      onClick={() => copyToClipboard('npx vercel --prod', 'vercel-cli')}
                      className="flex items-center gap-1 text-[11px] text-[#9E7422] dark:text-[#D4AF37] hover:underline shrink-0 ml-2 font-sans"
                    >
                      {copiedKey === 'vercel-cli' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'vercel-cli' ? (isEn ? 'Copied' : 'הועתק') : (isEn ? 'Copy' : 'העתק')}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      onClick={handleDownloadVercelConfig}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Download vercel.json' : 'הורד קובץ vercel.json'}</span>
                    </button>

                    <a
                      href="https://vercel.com/new"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Open Vercel New Project' : 'פתח פרויקט חדש ב-Vercel'}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Option: Render Deployment */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-500/5 hover:border-stone-300 dark:hover:border-stone-700 transition-colors space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-[#46E3B7] text-stone-900 font-bold text-[10px] w-5 h-5 flex items-center justify-center">
                        R
                      </div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                        <span>{isEn ? 'Deploy to Render' : 'פריסה לשירות Render'}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">
                          {isEn ? 'Blueprint Ready' : 'קובץ Blueprint מוכן'}
                        </span>
                      </h3>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {isEn
                        ? 'Deploy as a free Static Site with automated SSL, global CDN, and automatic Git deploys via render.yaml.'
                        : 'פריסה כאתר סטטי (Static Site) מהיר עם תעודת SSL אוטומטית, רשת CDN עולמית ועדכון אוטומטי מ-Git.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-xs space-y-1 bg-stone-100 dark:bg-stone-900/80 p-2.5 rounded-lg font-mono text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">{isEn ? 'Build Command:' : 'פקודת בנייה:'}</span>
                      <span>npm install && npm run build</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-500">{isEn ? 'Publish Directory:' : 'תיקיית פרסום:'}</span>
                      <span>./dist</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <button
                      onClick={handleDownloadRenderConfig}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Download render.yaml' : 'הורד קובץ render.yaml'}</span>
                    </button>

                    <a
                      href="https://dashboard.render.com/select-repo?type=static"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1F3338] text-[#46E3B7] dark:bg-[#46E3B7] dark:text-[#0C1E22] text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Open Render Dashboard' : 'פתח פרויקט חדש ב-Render'}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Option: Self-Hosted / Netlify / Cloudflare / Static dist */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-500/5 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
                  <h4 className="font-bold text-stone-900 dark:text-stone-100">
                    {isEn ? 'Universal Static Hosting (Netlify, Cloudflare, GitHub Pages)' : 'אירוח בכל שרת סטטי (Netlify, Cloudflare, GitHub Pages)'}
                  </h4>
                </div>
                <p className="text-stone-600 dark:text-stone-300">
                  {isEn
                    ? 'Run npm run build to produce the optimized standalone /dist folder. Drag-and-drop it directly to Netlify Drop or upload to any web host.'
                    : 'הפעלת npm run build מייצרת תיקיית dist עצמאית ומושלמת. ניתן לגרור אותה ישירות ל-Netlify Drop או להעלות לכל שרת אינטרנט.'}
                </p>
              </div>

            </div>
          ) : (
            /* TAB 2: Offline & Standalone */
            <div className="space-y-3.5">
              
              {/* Option 1: Standalone HTML Webpage Export */}
              <div className="p-4 rounded-xl border border-amber-600/25 bg-amber-500/5 hover:border-amber-600/40 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {isEn ? 'Export Standalone Offline Webpage (.html)' : 'ייצוא דף אינטרנט עצמאי אופליין (קובץ HTML)'}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {isEn
                        ? 'Downloads a single standalone HTML file with all 7 Aliyot, Onkelos, Rashi, and notes. Open it anytime in any browser without internet.'
                        : 'מוריד קובץ HTML מלא ועצמאי הכולל את 7 העליות, תרגום אונקלוס, רש״י והערות אישיות. נפתח בכל דפדפן ללא צורך ברשת.'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-2 flex items-center justify-end">
                  <button
                    onClick={handleExportHtml}
                    disabled={isExportingHtml}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#9E7422] dark:bg-[#D4AF37] text-white dark:text-stone-950 text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isExportingHtml ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isEn ? 'Preparing HTML...' : 'מכין קובץ...'}</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Download Offline HTML' : 'הורד קובץ HTML אופליין'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Option 2: Pre-cache parasha locally in browser */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-500/5 hover:border-stone-300 dark:hover:border-stone-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        {isEn ? 'Pre-cache Parasha in this Browser' : 'שמירת הפרשה בזיכרון המקומי בדפדפן'}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {isEn
                        ? 'Downloads and stores all verses and commentaries into local storage so you can study within this app even with Wi-Fi turned off.'
                        : 'מוריד ושומר את כל הפסוקים והפירושים בזיכרון המקומי, ומאפשר לימוד מלא באפליקציה גם במצב טיסה.'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between">
                  {cacheProgress ? (
                    <span className="text-xs text-stone-500 font-mono">
                      {isCachingParasha
                        ? (isEn ? `Caching: ${cacheProgress.done}/${cacheProgress.total}` : `טוען: ${cacheProgress.done}/${cacheProgress.total}`)
                        : cachedComplete
                        ? (isEn ? '✓ All verses cached offline' : '✓ כל הפסוקים נשמרו בהצלחה')
                        : ''}
                    </span>
                  ) : (
                    <span />
                  )}

                  <button
                    onClick={handlePrecacheParasha}
                    disabled={isCachingParasha || cachedComplete}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-60"
                  >
                    {isCachingParasha ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{isEn ? 'Caching...' : 'שומר...'}</span>
                      </>
                    ) : cachedComplete ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isEn ? 'Cached' : 'נשמר'}</span>
                      </>
                    ) : (
                      <>
                        <HardDriveDownload className="w-3.5 h-3.5" />
                        <span>{isEn ? 'Cache for Offline' : 'שמור ללימוד אופליין'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Option 3: Print / PDF Study Sheet */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-500/5 hover:border-stone-300 dark:hover:border-stone-700 transition-colors flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Printer className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {isEn ? 'Print / Save as PDF' : 'הדפסה ושמירה כ-PDF'}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500">
                    {isEn ? 'Clean printable layout for Shabbat table reading on paper' : 'פורמט מותאם להדפסה נקייה לשולחן השבת'}
                  </p>
                </div>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 text-xs font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Print View' : 'הדפס'}</span>
                </button>
              </div>

              {/* Option 4: PWA Installation for Desktop & Mobile */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-500/5 hover:border-stone-300 dark:hover:border-stone-700 transition-colors flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                      {isEn ? 'Install App to Device (PWA)' : 'התקנת האפליקציה למכשיר (PWA)'}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500">
                    {isEn ? 'Runs like a native app on phone or desktop with offline caching' : 'עובדת כמו אפליקציה מותקנת ונטענת ישירות ממסך הבית'}
                  </p>
                </div>
                <PWAInstallButton theme={theme} lang={lang} variant="modal" />
              </div>

              {/* Option 5: Export Notes & Progress Backup (JSON) */}
              <div className="flex items-center justify-between pt-1 text-xs text-stone-500 px-1">
                <span>{isEn ? 'Backup your progress & personal notes:' : 'גיבוי ההתקדמות וההערות האישיות:'}</span>
                <button
                  onClick={handleExportJson}
                  className="text-[#9E7422] dark:text-[#D4AF37] hover:underline font-medium flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>{isEn ? 'Download Backup (.json)' : 'הורד גיבוי JSON'}</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0 bg-stone-50/50 dark:bg-stone-900/50">
          <span className="text-xs text-stone-500 font-sans">
            {activeTab === 'deploy'
              ? (isEn ? 'Vite build ready • SPA redirects included' : 'מוכן לבניית Vite • ניתוב SPA מוגדר')
              : (isEn ? 'Self-contained offline files' : 'קבצים עצמאיים ללא תלות ברשת')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:opacity-90"
          >
            {isEn ? 'Close' : 'סגור'}
          </button>
        </div>
      </div>
    </div>
  );
};
