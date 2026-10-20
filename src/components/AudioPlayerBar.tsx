/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, Pause, Square, SkipForward, SkipBack, Volume2, X } from 'lucide-react';
import { AppTheme, VerseItem } from '../types';

interface AudioPlayerBarProps {
  currentVerse: VerseItem;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onNextVerse: () => void;
  onPrevVerse: () => void;
  speed: number;
  onChangeSpeed: (newSpeed: number) => void;
  theme: AppTheme;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentVerse,
  isPlaying,
  onTogglePlay,
  onStop,
  onNextVerse,
  onPrevVerse,
  speed,
  onChangeSpeed,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl rounded-xl border shadow-2xl p-3 flex items-center justify-between gap-3 backdrop-blur-md transition-all ${
      isDark
        ? 'bg-[#181614]/95 border-[#383126] text-[#EDE7DC]'
        : 'bg-[#FCFAF6]/95 border-[#E2D5BE] text-[#24201A]'
    }`}>
      
      {/* Current verse indicator */}
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="p-2 rounded-lg bg-amber-500/15 text-[#9E7422] dark:text-[#D4AF37] shrink-0">
          <Volume2 className="w-4 h-4" />
        </div>
        <div className="text-right truncate">
          <div className="font-bold text-xs truncate">
            הקראה: פסוק {currentVerse.verseHebrew}
          </div>
          <div className="text-[10px] text-stone-500 truncate">
            {currentVerse.id} · עליית {currentVerse.aliyahName}
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onPrevVerse}
          className="p-1.5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
          title="פסוק קודם"
          aria-label="פסוק קודם"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          className={`p-2 rounded-full transition-transform active:scale-95 ${
            isDark
              ? 'bg-[#D4AF37] text-stone-950 hover:bg-[#E5C158]'
              : 'bg-[#9E7422] text-white hover:bg-[#85611B]'
          }`}
          title={isPlaying ? 'השהה' : 'המשך הקראה'}
          aria-label={isPlaying ? 'השהה' : 'המשך הקראה'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        <button
          onClick={onNextVerse}
          className="p-1.5 rounded-md hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
          title="פסוק הבא"
          aria-label="פסוק הבא"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Speed toggle */}
        <button
          onClick={() => {
            const nextSpeed = speed === 1 ? 0.85 : speed === 0.85 ? 1.15 : 1;
            onChangeSpeed(nextSpeed);
          }}
          className="px-2 py-1 text-[11px] font-mono font-medium rounded border border-stone-300 dark:border-stone-700 hover:bg-stone-200/50 dark:hover:bg-stone-800"
          title="מהירות הקראה"
        >
          {speed}x
        </button>

        {/* Close / Stop */}
        <button
          onClick={onStop}
          className="p-1.5 rounded-md text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          title="סגור נגן"
          aria-label="סגור נגן"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
