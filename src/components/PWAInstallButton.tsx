/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Smartphone, X, Check, Apple } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AppTheme, UILanguage } from '../types';

interface PWAInstallButtonProps {
  theme?: AppTheme;
  lang?: UILanguage;
  variant?: 'header' | 'modal' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  theme = 'parchment',
  lang = 'en',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const isEn = lang === 'en';

  // If already installed in standalone mode, do not display
  if (isInstalled) {
    if (variant === 'modal') {
      return (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{isEn ? 'App is installed on this device and ready offline.' : 'האפליקציה מותקנת במכשיר זה וזמינה לשימוש אופליין.'}</span>
        </div>
      );
    }
    return null;
  }

  // Handle click
  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // General instructions fallback
      setShowIOSGuide(true);
    }
  };

  const buttonContent = (
    <>
      <Download className="w-3.5 h-3.5" />
      <span>{isEn ? 'Install App' : 'התקן אפליקציה'}</span>
    </>
  );

  return (
    <>
      {variant === 'header' ? (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors border-amber-600/30 text-[#9E7422] dark:text-[#D4AF37] hover:bg-amber-500/10"
          title={isEn ? 'Install Shnayim Mikra as a desktop or mobile app for offline access' : 'התקן את האפליקציה במכשיר לגישה ללא אינטרנט'}
        >
          {buttonContent}
        </button>
      ) : variant === 'banner' ? (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#9E7422] dark:bg-[#D4AF37] text-white dark:text-stone-950 text-xs font-semibold shadow-xs hover:opacity-90 transition-opacity"
        >
          {buttonContent}
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          {buttonContent}
        </button>
      )}

      {/* iOS / General installation modal guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-sm rounded-xl p-6 shadow-2xl border text-right ${
            theme === 'dark' ? 'bg-[#1C1A18] border-[#312B22] text-stone-100' : 'bg-[#FCFAF6] border-[#E8DFC8] text-stone-900'
          }`} dir={isEn ? 'ltr' : 'rtl'}>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#9E7422] dark:text-[#D4AF37]" />
                <h3 className="font-frank text-base font-bold">
                  {isEn ? 'Install on Device' : 'התקנה על גבי המכשיר'}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
              {isIOS ? (
                <>
                  <p className="font-medium text-stone-800 dark:text-stone-200">
                    {isEn ? 'To install on iPhone or iPad:' : 'להתקנה ב-iPhone או iPad:'}
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-stone-600 dark:text-stone-300">
                    <li>
                      {isEn
                        ? 'Tap the Share icon at the bottom of Safari.'
                        : 'לחץ על כפתור השיתוף (Share) בסרגל Safari למטה.'}
                    </li>
                    <li>
                      {isEn
                        ? 'Scroll down and tap "Add to Home Screen".'
                        : 'גלול ובחר באפשרות ״הוסף למסך הבית״ (Add to Home Screen).'}
                    </li>
                    <li>
                      {isEn
                        ? 'Tap "Add" in the top corner to complete.'
                        : 'לחץ על ״הוסף״ (Add) בפינה העליונה.'}
                    </li>
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-medium text-stone-800 dark:text-stone-200">
                    {isEn
                      ? 'To install this web application for 100% offline access:'
                      : 'להתקנת האפליקציה לשימוש אופליין מלא:'}
                  </p>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>
                      {isEn
                        ? 'On Chrome / Edge: Click the install icon in the address bar, or open the browser menu (⋮) and select "Install Shnayim Mikra".'
                        : 'ב-Chrome או Edge: לחץ על סמל ההתקנה בשורת הכתובת, או פתח את תפריט הדפדפן (⋮) ובחר ״התקן את שנים מקרא״.'}
                    </li>
                    <li>
                      {isEn
                        ? 'On Android: Tap the three dots (⋮) and choose "Install app" or "Add to Home screen".'
                        : 'ב-Android: לחץ על שלוש הנקודות (⋮) ובחר ״התקנת אפליקציה״ או ״הוספה למסך הבית״.'}
                    </li>
                  </ul>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-2 w-full py-2 text-xs font-semibold rounded-lg bg-[#9E7422] text-white dark:bg-[#D4AF37] dark:text-stone-950 hover:opacity-90"
            >
              {isEn ? 'Got It' : 'הבנתי'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
