/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, Clock, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { AppTheme } from '../types';

interface HalachaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: AppTheme;
}

export const HalachaGuideModal: React.FC<HalachaGuideModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className={`w-full max-w-2xl rounded-xl border max-h-[88vh] flex flex-col shadow-2xl transition-all ${
        isDark
          ? 'bg-[#181614] border-[#2C2720] text-[#EDE7DC]'
          : 'bg-[#FCFAF6] border-[#E8DFC8] text-[#24201A]'
      }`}>
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#9E7422] dark:text-[#D4AF37]" />
            <h2 className="font-frank text-xl font-bold">הלכות ומנהגי שְׁנַיִם מִקְרָא</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
            aria-label="סגור"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm leading-relaxed">
          
          {/* Section 1: Talmudic Origin */}
          <div className="space-y-2">
            <h3 className="font-frank text-base font-bold text-[#9E7422] dark:text-[#D4AF37] flex items-center gap-1.5">
              <span>מקור המצווה ושכרה</span>
            </h3>
            <blockquote className={`p-4 rounded-lg border-r-2 border-[#9E7422] dark:border-[#D4AF37] font-frank text-base italic ${
              isDark ? 'bg-[#1F1C18]' : 'bg-[#FAF4E8]'
            }`}>
              ״לעולם ישלים אדם פרשיותיו עם הציבור, שְׁנַיִם מִקְרָא וְאֶחָד תַּרְגּוּם, ואפילו עטרות ודיבון, שכל המשלים פרשיותיו עם הציבור מאריכין לו ימיו ושנותיו.״
              <footer className="text-xs text-stone-500 font-sans mt-1 not-italic">— תלמוד בבלי, מסכת ברכות דף ח עמוד א</footer>
            </blockquote>
          </div>

          {/* Section 2: Zmanim / Times */}
          <div className="space-y-2">
            <h3 className="font-frank text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              <span>זמני הקריאה</span>
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-stone-700 dark:text-stone-300 text-xs">
              <li><strong>ממתי מתחילים:</strong> מעת שמתחילים הציבור לקרותה, כלומר מיום ראשון שלאחר תפילת מנחה של שבת (שולחן ערוך רפ״ה:ג).</li>
              <li><strong>לכתחילה:</strong> יש לסיים את הקריאה לפני סעודת ליל שבת או לפני תפילת שחרית של שבת קודש.</li>
              <li><strong>בדיעבד:</strong> יכול להשלים עד מנחה של שבת, ויש אומרים עד יום רביעי הבא, ובדיעבד גמור עד שמחת תורה.</li>
            </ul>
          </div>

          {/* Section 3: Seder HaKria / Order of Reading */}
          <div className="space-y-2">
            <h3 className="font-frank text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
              <span>סדר ואופן הקריאה</span>
            </h3>
            <div className="space-y-2 text-xs text-stone-700 dark:text-stone-300">
              <p>
                <strong>פסוק בפסוק:</strong> המנהג המובחר והנכון ביותר (כמובא במשנה ברורה) לקרוא כל פסוק פעם ראשונה בעברית, פעם שנייה בעברית, ואחר כך התרגום שלו.
              </p>
              <p>
                <strong>עליה בעליה:</strong> יש הנוהגים לקרוא עלייה שלמה פעם ראשונה, שוב עלייה שלמה פעם שנייה, ואחר כך את כל התרגום של אותה עלייה.
              </p>
            </div>
          </div>

          {/* Section 4: Targum & Rashi */}
          <div className="space-y-2">
            <h3 className="font-frank text-base font-bold text-stone-900 dark:text-stone-100">
              תרגום אונקלוס לעומת פירוש רש״י
            </h3>
            <p className="text-xs text-stone-700 dark:text-stone-300">
              מעיקר הדין יש לקרוא תרגום אונקלוס שניתן בסיני (שולחן ערוך רפ״ה:ב). אם קרא פירוש רש״י במקום תרגום יצא ידי חובה, מפני שמפרש את המקרא היטב. וכתב השולחן ערוך: <strong>״וִירֵא שָׁמַיִם יִקְרָא תַּרְגּוּם וְגַם פֵּרוּשׁ רַשִׁ״י״</strong>.
            </p>
          </div>

          {/* Section 5: Daily Schedule by Shlah HaKadosh */}
          <div className={`p-4 rounded-lg border text-xs space-y-2 ${
            isDark ? 'bg-[#1D1B18] border-[#312B22]' : 'bg-stone-50 border-stone-200'
          }`}>
            <h4 className="font-bold text-[#9E7422] dark:text-[#D4AF37] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              סדר הלימוד היומי על פי השל״ה הקדוש
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-sans">
              <div><strong>יום ראשון:</strong> עליית ראשון</div>
              <div><strong>יום שני:</strong> עליית שני</div>
              <div><strong>יום שלישי:</strong> עליית שלישי</div>
              <div><strong>יום רביעי:</strong> עליית רביעי</div>
              <div><strong>יום חמישי:</strong> עליית חמישי</div>
              <div><strong>יום ששי:</strong> עליית ששי, שביעי ומפטיר</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-white bg-[#9E7422] dark:bg-[#D4AF37] dark:text-stone-950 rounded-lg hover:opacity-90 transition-opacity"
          >
            הבנתי, תודה
          </button>
        </div>

      </div>
    </div>
  );
};
