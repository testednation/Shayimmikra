/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sliders, Type, Volume2, Palette, Eye, Layers, Bold, Languages, BookMarked, Target } from 'lucide-react';
import { AppTheme, CommentaryType, DisplaySettings, HebrewFont, ReadingFlow, UILanguage } from '../types';

interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DisplaySettings;
  onChangeSettings: (newSettings: DisplaySettings) => void;
  dailyGoal?: number;
  onUpdateDailyGoal?: (goal: number) => void;
}

const FONTS: { id: HebrewFont; label: string; preview: string; fontClass: string }[] = [
  { id: 'frank', label: 'פרנק-ריהל (Frank Ruhl)', preview: 'בְּרֵאשִׁית בָּרָא', fontClass: 'font-frank' },
  { id: 'david', label: 'דוד ליברה (David)', preview: 'בְּרֵאשִׁית בָּרָא', fontClass: 'font-david' },
  { id: 'noto', label: 'נוטו סריף (Noto)', preview: 'בְּרֵאשִׁית בָּרָא', fontClass: 'font-noto' },
  { id: 'alef', label: 'אלף (Alef)', preview: 'בְּרֵאשִׁית בָּרָא', fontClass: 'font-alef' },
  { id: 'tinos', label: 'טינוס (Tinos)', preview: 'בְּרֵאשִׁית בָּרָא', fontClass: 'font-tinos' },
  { id: 'assistant', label: 'אסיסטנט (Assistant)', preview: 'בְּרֵאשִׁית בָּרָא', fontClass: 'font-assistant' },
  { id: 'rubik', label: 'רוביק (Rubik)', preview: 'בְּרֵאשִׁית בָּרָא', fontClass: 'font-rubik' },
  { id: 'heebo', label: 'היבו (Heebo)', preview: 'בְּרֵאשִׁית בָּרָא', fontClass: 'font-heebo' },
  { id: 'varela', label: 'ורלה (Varela Round)', preview: 'בְּרֵאשִׁית בָּרָא', fontClass: 'font-varela' },
];

export const DisplaySettingsModal: React.FC<DisplaySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onChangeSettings,
  dailyGoal,
  onUpdateDailyGoal,
}) => {
  if (!isOpen) return null;

  const isDark = settings.theme === 'dark';
  const isEn = settings.uiLanguage === 'en';

  const update = <K extends keyof DisplaySettings>(key: K, value: DisplaySettings[K]) => {
    onChangeSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-xl rounded-xl border max-h-[90vh] flex flex-col shadow-2xl transition-all ${
        isDark
          ? 'bg-[#181614] border-[#2C2720] text-[#EDE7DC]'
          : 'bg-[#FCFAF6] border-[#E8DFC8] text-[#24201A]'
      }`} dir={isEn ? 'ltr' : 'rtl'}>
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#9E7422] dark:text-[#D4AF37]" />
            <h2 className="font-frank text-xl font-bold">
              {isEn ? 'Display, Fonts & Layout Settings' : 'הגדרות תצוגה, גופנים ופורמט'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          
          {/* Interface Language */}
          <div>
            <label className="font-bold flex items-center gap-1.5 text-stone-800 dark:text-stone-200 mb-2">
              <Languages className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              {isEn ? 'Interface Language' : 'שפת ממשק'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => update('uiLanguage', 'en')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.uiLanguage === 'en'
                    ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/10 font-bold'
                    : isDark
                    ? 'border-[#2C2720] hover:bg-[#201D19] text-stone-300'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="font-medium text-xs">English</div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                  Full English site labels & instructions
                </div>
              </button>

              <button
                onClick={() => update('uiLanguage', 'he')}
                className={`p-3 rounded-lg border text-right transition-all ${
                  settings.uiLanguage === 'he'
                    ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/10 font-bold'
                    : isDark
                    ? 'border-[#2C2720] hover:bg-[#201D19] text-stone-300'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="font-medium text-xs">עברית (Hebrew)</div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                  ממשק והוראות בעברית
                </div>
              </button>
            </div>
          </div>

          {/* Rashi Commentary Toggle */}
          <div>
            <label className="font-bold flex items-center gap-1.5 text-stone-800 dark:text-stone-200 mb-2">
              <BookMarked className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              {isEn ? 'Rashi Commentary Display' : 'הצגת פירוש רש״י'}
            </label>
            <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
              isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'
            }`}>
              <div>
                <div className="font-medium">
                  {isEn ? 'Show Rashi alongside each verse' : 'הצג פירוש רש״י צמוד לכל פסוק'}
                </div>
                <div className="text-[11px] text-stone-500">
                  {isEn
                    ? 'Fetches and renders Rashi commentary directly beneath each verse with bold keywords'
                    : 'טוען ומציג את פירוש רש״י תחת כל פסוק עם הדגשת דיבור המתחיל'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.showRashi}
                onChange={(e) => update('showRashi', e.target.checked)}
                className="w-4 h-4 accent-[#9E7422] dark:accent-[#D4AF37]"
              />
            </label>
          </div>

          {/* Format Selection: 2x Torah 1x Onkelos Sequential vs Stepper */}
          <div>
            <label className="font-bold flex items-center gap-1.5 text-stone-800 dark:text-stone-200 mb-2">
              <Layers className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              {isEn ? 'Reading Flow Format' : 'תבנית קריאה (פורמט שניים מקרא)'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => update('readingFlow', 'sequential_2x1x')}
                className={`p-3 rounded-lg border transition-all ${isEn ? 'text-left' : 'text-right'} ${
                  settings.readingFlow === 'sequential_2x1x'
                    ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/10 font-bold'
                    : isDark
                    ? 'border-[#2C2720] hover:bg-[#201D19] text-stone-300'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="font-medium text-xs">
                  {isEn ? '2x Torah + 1x Onkelos Flow' : '2x מקרא + 1x תרגום ברצף'}
                </div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                  {isEn
                    ? 'Full printed sequential text: 1st Torah, 2nd Torah, then Onkelos'
                    : 'הטקסט מודפס במלואו: מקרא ראשון, מקרא שני, ותרגום אונקלוס זה תחת זה'}
                </div>
              </button>

              <button
                onClick={() => update('readingFlow', 'stepper')}
                className={`p-3 rounded-lg border transition-all ${isEn ? 'text-left' : 'text-right'} ${
                  settings.readingFlow === 'stepper'
                    ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/10 font-bold'
                    : isDark
                    ? 'border-[#2C2720] hover:bg-[#201D19] text-stone-300'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="font-medium text-xs">
                  {isEn ? 'Compact Stepper Cards' : 'תצוגת צעדים אינטראקטיבית'}
                </div>
                <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
                  {isEn
                    ? 'Single verse block with individual step tracking buttons'
                    : 'כרטיס פסוק קומפקטי עם כפתורי מעקב לחיצים לכל שלב'}
                </div>
              </button>
            </div>
          </div>

          {/* Bold Option for the First Verse */}
          <div>
            <label className="font-bold flex items-center gap-1.5 text-stone-800 dark:text-stone-200 mb-2">
              <Bold className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              {isEn ? 'Bolding Options' : 'אפשרויות הדגשה (Bold)'}
            </label>
            <div className="space-y-2">
              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'
              }`}>
                <div>
                  <div className="font-medium">
                    {isEn ? 'Bold First Torah Verse (מקרא ראשון מודגש)' : 'הדגשת מקרא ראשון ב-Bold'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {isEn
                      ? 'Renders the 1st Torah recitation in bold weight to clearly distinguish it from the 2nd'
                      : 'מציג את הפסוק הראשון של המקרא בכתב מודגש (Bold) להבחנה קלה בין מקרא א׳ למקרא ב׳'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.boldFirstMikra}
                  onChange={(e) => update('boldFirstMikra', e.target.checked)}
                  className="w-4 h-4 accent-[#9E7422] dark:accent-[#D4AF37]"
                />
              </label>

              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'
              }`}>
                <div>
                  <div className="font-medium">
                    {isEn ? 'Bold Opening Verse of Each Aliyah' : 'הדגשת פתיחת עלייה ב-Bold'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {isEn ? 'Prominently bolds the verse that starts each Aliyah' : 'הדגשה בולטת של הפסוק הראשון שפותח כל עלייה מ-7 העליות'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.boldFirstVerseOfAliyah}
                  onChange={(e) => update('boldFirstVerseOfAliyah', e.target.checked)}
                  className="w-4 h-4 accent-[#9E7422] dark:accent-[#D4AF37]"
                />
              </label>
            </div>
          </div>

          {/* Separate Font for Torah (Mikra) */}
          <div>
            <label className="font-bold flex items-center justify-between text-stone-800 dark:text-stone-200 mb-2">
              <span className="flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
                {isEn ? 'Torah Font (Hebrew Scripture)' : 'גופן לתורה (מקרא)'}
              </span>
              <span className="text-[11px] text-stone-500 font-normal">
                {isEn ? 'Original text font' : 'הטקסט העברי המקורי'}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONTS.map((f) => (
                <button
                  key={`torah-${f.id}`}
                  onClick={() => update('fontFamily', f.id)}
                  className={`p-2.5 rounded-lg border transition-all ${isEn ? 'text-left' : 'text-right'} ${
                    settings.fontFamily === f.id
                      ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/10 font-bold'
                      : isDark
                      ? 'border-[#2C2720] hover:bg-[#201D19] text-stone-300'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="font-medium text-xs">{f.label}</div>
                  <div className={`text-base mt-0.5 text-[#9E7422] dark:text-[#D4AF37] ${f.fontClass}`} dir="rtl">
                    {f.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Distinct Font for Onkelos (Targum) */}
          <div>
            <label className="font-bold flex items-center justify-between text-stone-800 dark:text-stone-200 mb-2">
              <span className="flex items-center gap-1.5">
                <Type className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
                {isEn ? 'Targum Onkelos Font (Distinct)' : 'גופן נפרד לתרגום אונקלוס'}
              </span>
              <span className="text-[11px] text-stone-500 font-normal">
                {isEn ? 'Different font for translation' : 'גופן מבדל לתרגום הארמי'}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONTS.map((f) => (
                <button
                  key={`onkelos-${f.id}`}
                  onClick={() => update('onkelosFont', f.id)}
                  className={`p-2.5 rounded-lg border transition-all ${isEn ? 'text-left' : 'text-right'} ${
                    settings.onkelosFont === f.id
                      ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/10 font-bold'
                      : isDark
                      ? 'border-[#2C2720] hover:bg-[#201D19] text-stone-300'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="font-medium text-xs">{f.label}</div>
                  <div className={`text-base mt-0.5 text-stone-700 dark:text-stone-300 ${f.fontClass}`} dir="rtl">
                    {f.preview}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-stone-800 dark:text-stone-200">
                {isEn ? 'Font Size (Torah)' : 'גודל אותיות מקרא'}
              </label>
              <span className="font-mono tabular-nums text-stone-500">
                {settings.fontSize}px
              </span>
            </div>
            <input
              type="range"
              min="18"
              max="36"
              step="1"
              value={settings.fontSize}
              onChange={(e) => update('fontSize', parseInt(e.target.value, 10))}
              className="w-full accent-[#9E7422] dark:accent-[#D4AF37] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-1 font-mono">
              <span>18px</span>
              <span>26px</span>
              <span>36px</span>
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="font-bold flex items-center gap-1.5 text-stone-800 dark:text-stone-200 mb-2">
              <Palette className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              {isEn ? 'Theme (Reading Style)' : 'ערכת נושא (סגנון הקריאה)'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'parchment' as AppTheme, label: isEn ? 'Parchment' : 'קלף עתיק', desc: isEn ? 'Warm ivory & ink' : 'גווני שנהב ודיו' },
                { id: 'sefer' as AppTheme, label: isEn ? 'Classic Book' : 'ספר קלאסי', desc: isEn ? 'Crisp white page' : 'דף לבן צחור' },
                { id: 'dark' as AppTheme, label: isEn ? 'Night Study' : 'לימוד לילה', desc: isEn ? 'Deep obsidian' : 'אוקיאנוס כהה' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => update('theme', t.id)}
                  className={`p-3 rounded-lg border transition-all ${isEn ? 'text-left' : 'text-right'} ${
                    settings.theme === t.id
                      ? 'border-[#9E7422] dark:border-[#D4AF37] bg-amber-500/10 font-bold'
                      : isDark
                      ? 'border-[#2C2720] hover:bg-[#201D19] text-stone-300'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="font-medium text-xs">{t.label}</div>
                  <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text toggles: Teamim, Nikkud, English */}
          <div>
            <label className="font-bold flex items-center gap-1.5 text-stone-800 dark:text-stone-200 mb-2">
              <Eye className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              {isEn ? 'Vocalization & English Translation' : 'סימני קריאה ותרגום'}
            </label>
            <div className="space-y-2">
              
              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'
              }`}>
                <div>
                  <div className="font-medium">
                    {isEn ? 'Cantillation Marks (טעמי המקרא)' : 'טעמי המקרא (נגינות)'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {isEn ? 'Shows traditional cantillation notes' : 'הצגת הטעמים כפי שמופיעים בחומש'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showTeamim}
                  onChange={(e) => update('showTeamim', e.target.checked)}
                  className="w-4 h-4 accent-[#9E7422] dark:accent-[#D4AF37]"
                />
              </label>

              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'
              }`}>
                <div>
                  <div className="font-medium">
                    {isEn ? 'Vowel Points (ניקוד מלא)' : 'ניקוד מלא'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {isEn ? 'Toggle vowel points (nikkud)' : 'הסרת ניקוד מאפשרת קריאה בסגנון ספר תורה'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showNikkud}
                  onChange={(e) => update('showNikkud', e.target.checked)}
                  className="w-4 h-4 accent-[#9E7422] dark:accent-[#D4AF37]"
                />
              </label>

              <label className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'
              }`}>
                <div>
                  <div className="font-medium">
                    {isEn ? 'English Translation Line' : 'תרגום לאנגלית (English)'}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {isEn ? 'Display English translation line under each verse' : 'להבנת פשט הפסוקים'}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.showEnglish}
                  onChange={(e) => update('showEnglish', e.target.checked)}
                  className="w-4 h-4 accent-[#9E7422] dark:accent-[#D4AF37]"
                />
              </label>

            </div>
          </div>

          {/* Daily Study Goal Configuration */}
          {onUpdateDailyGoal && dailyGoal !== undefined && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>{isEn ? 'Daily Study Goal' : 'יעד לימוד יומי'}</span>
              </label>
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">
                      {isEn ? 'Target Verses per Day' : 'מספר פסוקים ליום'}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {isEn
                        ? '18-25 verses daily covers the entire Parasha by Shabbat'
                        : 'יעד מומלץ של 18-25 פסוקים ליום להשלמת הפרשה'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateDailyGoal(Math.max(1, dailyGoal - 1))}
                      className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={dailyGoal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val > 0) onUpdateDailyGoal(val);
                      }}
                      className={`w-16 h-8 text-center text-sm font-bold font-mono rounded-lg border focus:outline-none ${
                        isDark ? 'bg-stone-900 border-stone-700 text-amber-400' : 'bg-stone-50 border-stone-300 text-amber-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateDailyGoal(Math.min(300, dailyGoal + 1))}
                      className="w-8 h-8 rounded-lg border border-stone-300 dark:border-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[5, 10, 18, 25, 36, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onUpdateDailyGoal(num)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                        dailyGoal === num
                          ? 'border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/40'
                          : isDark
                          ? 'border-stone-700 bg-stone-800/60 text-stone-300 hover:border-stone-600'
                          : 'border-stone-200 bg-stone-100 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {num === 18 ? `${num} (ח״י)` : num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-white bg-[#9E7422] dark:bg-[#D4AF37] dark:text-stone-950 rounded-lg hover:opacity-90 transition-opacity"
          >
            {isEn ? 'Save & Close' : 'שמור וסגור'}
          </button>
        </div>

      </div>
    </div>
  );
};
