/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineIndicatorProps {
  lang?: 'en' | 'he';
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang = 'en' }) => {
  const isOnline = useOnlineStatus();
  const isEn = lang === 'en';

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 sm:left-6 z-50 flex items-center gap-2.5 rounded-xl bg-stone-900/95 dark:bg-stone-900/95 text-stone-100 border border-amber-500/30 px-3.5 py-2 text-xs font-medium shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="relative flex items-center justify-center">
        <WifiOff className="w-4 h-4 text-amber-400" />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
      </div>
      <div>
        <p className="font-semibold text-amber-300 text-[11px] uppercase tracking-wider font-sans">
          {isEn ? 'Offline Mode Active' : 'מצב אופליין פעיל'}
        </p>
        <p className="text-[11px] text-stone-300 font-sans">
          {isEn ? 'All cached Torah texts and notes are ready to study' : 'כל הטקסטים וההערות השמורים זמינים ללימוד מלא'}
        </p>
      </div>
    </div>
  );
};
