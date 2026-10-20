/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, HelpCircle, BookOpen, Bookmark, Layers, Type, Clock, Keyboard, Sparkles, Check } from 'lucide-react';
import { AppTheme, UILanguage } from '../types';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
  lang: UILanguage;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  theme,
  lang,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-2xl rounded-xl border max-h-[90vh] flex flex-col shadow-2xl transition-all ${
        isDark
          ? 'bg-[#181614] border-[#2C2720] text-[#EDE7DC]'
          : 'bg-[#FCFAF6] border-[#E8DFC8] text-[#24201A]'
      }`} dir={isEn ? 'ltr' : 'rtl'}>
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#9E7422] dark:text-[#D4AF37]" />
            <h2 className="font-frank text-xl font-bold">
              {isEn ? 'How to Use Shnayim Mikra' : 'מדריך והוראות שימוש בשניים מקרא'}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          
          {/* Section 1: What is Shnayim Mikra? */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-[#9E7422] dark:text-[#D4AF37] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{isEn ? 'What is Shnayim Mikra?' : 'מהי מצוות שניים מקרא?'}</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              {isEn ? (
                <>
                  <strong>Shnayim Mikra ve-Echad Targum</strong> (שְׁנַיִם מִקְרָא וְאֶחָד תַּרְגּוּם) is a halachic requirement (Talmud Berakhot 8a, Shulchan Aruch O.C. 285) to read the weekly Torah portion each week:
                  <br />• <strong>Twice</strong> in Hebrew Scripture (2x Mikra)
                  <br />• <strong>Once</strong> in Aramaic translation (1x Targum Onkelos) or with Rashi commentary.
                  <br />Completing it with the congregation is traditionally associated with long life and spiritual blessing.
                </>
              ) : (
                <>
                  מצוות עשה מדברי סופרים לקרוא בכל שבוע את פרשת השבוע: פעמיים את לשון המקרא (שניים מקרא) ופעם אחת את תרגום אונקלוס (ואחד תרגום) או פירוש רש״י.
                  אמרו חכמים במסכת ברכות (ח:): ״לעולם ישלים אדם פרשיותיו עם הציבור... שכל המשלים פרשיותיו עם הציבור מאריכין לו ימיו ושנותיו״.
                </>
              )}
            </p>
          </div>

          {/* Section 2: Study Modes */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              <span>{isEn ? 'Study Modes & Layouts' : 'מצבי לימוד ותבניות קריאה'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600 dark:text-stone-300">
              <div className={`p-3 rounded-lg border ${isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'}`}>
                <div className="font-bold text-stone-900 dark:text-stone-100">
                  {isEn ? '2x Torah + 1x Onkelos Flow' : 'פורמט 2x מקרא + 1x תרגום ברצף'}
                </div>
                <div className="text-[11px] mt-0.5">
                  {isEn
                    ? 'Prints the verse twice in Torah font, followed immediately by Onkelos in its own distinct font, like a printed Chumash.'
                    : 'מדפיס את הפסוק פעמיים ברצף בעברית ואחריו את התרגום בגופן נפרד, בדיוק כפי שמופיע בחומשי שניים מקרא.'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'}`}>
                <div className="font-bold text-stone-900 dark:text-stone-100">
                  {isEn ? 'With Rashi Commentary' : 'מצב לימוד עם רש״י'}
                </div>
                <div className="text-[11px] mt-0.5">
                  {isEn
                    ? 'Fetches and displays classic Rashi commentary directly beneath each verse, with bold header catchphrases.'
                    : 'מציג את פירוש רש״י במלואו מתחת לכל פסוק, עם הדגשת דיבור המתחיל, מתוך מאגר ספריא.'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'}`}>
                <div className="font-bold text-stone-900 dark:text-stone-100">
                  {isEn ? 'Tikkun Korim Mode' : 'מצב תיקון קוראים'}
                </div>
                <div className="text-[11px] mt-0.5">
                  {isEn
                    ? 'Dual-column view comparing unpointed Torah scroll script (Stam) against vocalized text for reader preparation.'
                    : 'תצוגה דו-טורית של ספר תורה (סת״ם ללא ניקוד) מול עמודת חומש מנוקדת עם טעמים להכנת קריאת התורה.'}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'}`}>
                <div className="font-bold text-stone-900 dark:text-stone-100">
                  {isEn ? 'Aliyah by Aliyah' : 'עליה בעליה'}
                </div>
                <div className="text-[11px] mt-0.5">
                  {isEn
                    ? 'Pace yourself by the 7 daily Aliyot according to the Shlah HaKadosh schedule (Sunday to Friday).'
                    : 'חלוקה לפי 7 עליות השבוע בהתאם לסדר השל״ה הקדוש (ראשון ביום א׳ ועד ששי ושביעי ביום ו׳).'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Bookmark & Realtime Tracker */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              <span>{isEn ? 'Bookmarks & Realtime Tracker' : 'סימנייה ומעקב חי'}</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              {isEn ? (
                <>
                  • <strong>Bookmark Where You Left Off</strong>: Click the bookmark icon on any verse or press <kbd className="px-1 border rounded font-mono">B</kbd>. The app remembers your exact verse and shows a "Jump to Bookmark" button in the header and hero.
                  <br />• <strong>Live Stopwatch</strong>: Automatically tracks your active reading session duration and reading velocity (verses per hour).
                </>
              ) : (
                <>
                  • <strong>סימנייה במקום שעצרת</strong>: לחץ על סמל הסימנייה בכל פסוק או לחץ על מקש <kbd className="px-1 border rounded font-mono">B</kbd>. האפליקציה שומרת את הפסוק ומאפשרת לקפוץ אליו מכל מקום.
                  <br />• <strong>שעון לימוד חי</strong>: מודד את משך הלימוד ברצף ומחשב את קצב הקריאה (פסוקים לשעה).
                </>
              )}
            </p>
          </div>

          {/* Section 4: Distraction-Free & Offline Export */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              <span>{isEn ? 'Distraction-Free Mode & Offline Export' : 'קריאה ללא הסחות דעת וייצוא אופליין'}</span>
            </h3>
            <p className="text-stone-600 dark:text-stone-300">
              {isEn ? (
                <>
                  • <strong>Just Text (Zen Mode)</strong>: Click "Just Text" in the navigation or press <kbd className="px-1 border rounded font-mono">Z</kbd> to hide all toolbars, buttons, and chrome for a serene, uninterrupted sacred reading experience with just the text. Press <kbd className="px-1 border rounded font-mono">Esc</kbd> anytime to return.
                  <br />• <strong>Offline Export (.html)</strong>: Click "Offline & Export" in the header to download a single self-contained HTML file of the full Parasha with 2x Mikra, 1x Targum, Rashi, and your notes. It opens on any computer, tablet, or phone completely offline without internet!
                  <br />• <strong>Personal Verse Notes</strong>: Click the pencil icon on any verse to write your personal insights or questions. Notes are auto-saved to your device.
                  <br />• <strong>Install as App (PWA)</strong>: Install directly to your desktop or mobile home screen for 100% offline study.
                </>
              ) : (
                <>
                  • <strong>מצב קריאה ללא הסחות דעת (טקסט בלבד)</strong>: לחץ על ״טקסט בלבד״ בסרגל או הקש על מקש <kbd className="px-1 border rounded font-mono">Z</kbd> לקבלת תצוגת קריאה נקייה ומרווחת ללא כפתורים, תפריטים או הסחות דעת. לחיצה על <kbd className="px-1 border rounded font-mono">Esc</kbd> תחזיר לתצוגה הרגילה.
                  <br />• <strong>ייצוא דף אינטרנט אופליין (.html)</strong>: לחץ על ״אופליין וייצוא״ כדי להוריד קובץ HTML מלא ועצמאי של הפרשה עם 2x מקרא, 1x תרגום, רש״י וההערות שלך, שנפתח בכל מכשיר ללא חיבור לאינטרנט.
                  <br />• <strong>הערות אישיות לכל פסוק</strong>: לחץ על סמל העט בפסוק כדי להוסיף ביאור או חידוש שנשמר אוטומטית במכשיר.
                  <br />• <strong>התקנת אפליקציה (PWA)</strong>: התקן ישירות למסך הבית במחשב או בטלפון לשימוש מלא ללא צורך ברשת.
                </>
              )}
            </p>
          </div>

          {/* Section 5: Keyboard Shortcuts */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              <span>{isEn ? 'Keyboard Shortcuts' : 'קיצורי מקשים ללימוד מהיר'}</span>
            </h3>
            <div className={`p-3.5 rounded-lg border font-mono text-xs space-y-1.5 ${
              isDark ? 'border-[#2C2720] bg-[#1E1B18]' : 'border-stone-200 bg-white'
            }`}>
              <div className="flex items-center justify-between">
                <span><kbd className="px-1.5 py-0.5 border rounded">Space</kbd> / <kbd className="px-1.5 py-0.5 border rounded">Enter</kbd></span>
                <span className="font-sans text-stone-600 dark:text-stone-300">
                  {isEn ? 'Advance step & jump to next verse' : 'השלם שלב ומעבר לפסוק הבא'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span><kbd className="px-1.5 py-0.5 border rounded">Z</kbd></span>
                <span className="font-sans text-stone-600 dark:text-stone-300">
                  {isEn ? 'Toggle Just Text (Distraction-Free) mode' : 'הפעל/כבה מצב ללא הסחות דעת (טקסט בלבד)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span><kbd className="px-1.5 py-0.5 border rounded">B</kbd></span>
                <span className="font-sans text-stone-600 dark:text-stone-300">
                  {isEn ? 'Bookmark / unbookmark active verse' : 'קבע או הסר סימנייה בפסוק הנוכחי'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span><kbd className="px-1.5 py-0.5 border rounded">O</kbd></span>
                <span className="font-sans text-stone-600 dark:text-stone-300">
                  {isEn ? 'Open Offline & Export modal' : 'פתח חלון ייצוא אופליין'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span><kbd className="px-1.5 py-0.5 border rounded">R</kbd></span>
                <span className="font-sans text-stone-600 dark:text-stone-300">
                  {isEn ? 'Toggle Rashi commentary display' : 'הפעל/כבה פירוש רש״י'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span><kbd className="px-1.5 py-0.5 border rounded">1</kbd>, <kbd className="px-1.5 py-0.5 border rounded">2</kbd>, <kbd className="px-1.5 py-0.5 border rounded">3</kbd></span>
                <span className="font-sans text-stone-600 dark:text-stone-300">
                  {isEn ? 'Mark Mikra 1, Mikra 2, Targum' : 'סמן מקרא א׳, מקרא ב׳, תרגום'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span><kbd className="px-1.5 py-0.5 border rounded">↓</kbd> / <kbd className="px-1.5 py-0.5 border rounded">↑</kbd></span>
                <span className="font-sans text-stone-600 dark:text-stone-300">
                  {isEn ? 'Navigate between verses' : 'דפדוף בין פסוקים'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-white bg-[#9E7422] dark:bg-[#D4AF37] dark:text-stone-950 rounded-lg hover:opacity-90 transition-opacity"
          >
            {isEn ? 'Got it, let’s learn!' : 'הבנתי, בוא נלמד!'}
          </button>
        </div>

      </div>
    </div>
  );
};
