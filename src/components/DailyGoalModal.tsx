/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  CheckCircle2,
  Sparkles,
  Trophy,
  Minus,
  Plus,
  Flame,
  Info,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppTheme, UILanguage } from '../types';
import { t } from '../utils/translations';

interface DailyGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyGoal: number;
  todayCompletedCount: number;
  onSaveGoal: (newGoal: number) => void;
  theme: AppTheme;
  lang: UILanguage;
}

const PRESETS = [
  { value: 5, labelEn: '5 (Quick)', labelHe: '5 (קצר)', descEn: '~5 mins', descHe: 'כ-5 דקות' },
  { value: 10, labelEn: '10 (Steady)', labelHe: '10 (עקבי)', descEn: '~10 mins', descHe: 'כ-10 דקות' },
  { value: 18, labelEn: '18 (Chai)', labelHe: '18 (ח״י)', isRecommended: true, descEn: 'Weekly Pace', descHe: 'קצב שבועי' },
  { value: 25, labelEn: '25 (Deep)', labelHe: '25 (מעמיק)', descEn: 'Recommended', descHe: 'מומלץ' },
  { value: 36, labelEn: '36 (2x Chai)', labelHe: '36 (כפול ח״י)', descEn: 'Thorough', descHe: 'יסודי' },
  { value: 50, labelEn: '50 (Intensive)', labelHe: '50 (אינטנסיבי)', descEn: 'Fast Track', descHe: 'מסלול מהיר' },
];

export const DailyGoalModal: React.FC<DailyGoalModalProps> = ({
  isOpen,
  onClose,
  dailyGoal,
  todayCompletedCount,
  onSaveGoal,
  theme,
  lang,
}) => {
  const [goal, setGoal] = useState<number>(dailyGoal);

  useEffect(() => {
    setGoal(dailyGoal);
  }, [dailyGoal, isOpen]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  const percent = Math.min(100, Math.round((todayCompletedCount / goal) * 100));
  const isGoalMet = todayCompletedCount >= goal;
  const remaining = Math.max(0, goal - todayCompletedCount);

  // SVG circular calculations (radius = 42, circumference ~263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const handleSave = () => {
    const valid = Math.max(1, Math.min(500, goal));
    onSaveGoal(valid);
    if (todayCompletedCount >= valid) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F59E0B', '#10B981', '#E5DAC6'],
      });
    }
    onClose();
  };

  const handleQuickAdjust = (delta: number) => {
    setGoal((prev) => Math.max(1, Math.min(300, prev + delta)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all flex flex-col max-h-[92vh] ${
          isDark
            ? 'bg-[#181614] border-[#2E2822] text-[#EDE7DC]'
            : 'bg-[#FCFAF6] border-[#E8DFC8] text-[#24201A]'
        }`}
        dir={isEn ? 'ltr' : 'rtl'}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-frank text-xl font-bold">
                {t(lang, 'dailyGoalTitle')}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t(lang, 'dailyGoalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Progress Ring Card */}
          <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center gap-6 ${
            isGoalMet
              ? isDark
                ? 'bg-amber-950/20 border-amber-600/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                : 'bg-amber-50/80 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
              : isDark
              ? 'bg-[#1F1C18] border-[#332C24]'
              : 'bg-[#F6EFE4] border-[#E2D5BE]'
          }`}>
            
            {/* SVG Circular Progress Ring */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="modalGoalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={isDark ? 'text-stone-800' : 'text-stone-300'}
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="url(#modalGoalGrad)"
                  strokeWidth="8.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>

              {/* Center Content in Ring */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {isGoalMet ? (
                  <Check className="w-6 h-6 text-amber-500 animate-bounce" />
                ) : (
                  <span className="font-mono text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400">
                    {percent}%
                  </span>
                )}
                <span className="text-[10px] text-stone-500 font-mono tabular-nums">
                  {todayCompletedCount}/{goal}
                </span>
              </div>
            </div>

            {/* Status & Motivational Copy */}
            <div className="flex-1 text-center sm:text-left sm:rtl:text-right space-y-2">
              <div className="flex items-center justify-center sm:justify-start sm:rtl:justify-start gap-2">
                {isGoalMet ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40">
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    {t(lang, 'goalAchieved')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-500/10 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    {t(lang, 'dailyGoalProgress')}
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-sm font-semibold">
                  {isGoalMet
                    ? t(lang, 'goalAchievedSubtitle')
                    : `${remaining} ${t(lang, 'versesRemaining')}`}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isEn
                    ? `You have completed ${todayCompletedCount} verses today towards your goal of ${goal}.`
                    : `השלמת היום ${todayCompletedCount} פסוקים מתוך יעד של ${goal} פסוקים.`}
                </p>
              </div>

              {/* Progress Bar under text */}
              <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2 overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isGoalMet
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      : 'bg-gradient-to-r from-amber-600 to-amber-500'
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

          </div>

          {/* Goal Selector Controls */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {t(lang, 'setDailyGoal')} ({t(lang, 'versesPerDay')})
            </label>

            {/* Stepper & Number Input */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleQuickAdjust(-5)}
                disabled={goal <= 5}
                className="w-10 h-10 rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
                title="-5"
              >
                -5
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdjust(-1)}
                disabled={goal <= 1}
                className="w-10 h-10 rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="-1"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={goal}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setGoal(val);
                  }}
                  className={`w-28 h-12 text-center text-2xl font-bold font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                    isDark
                      ? 'bg-[#1F1C18] border-[#3D3528] text-amber-400'
                      : 'bg-white border-stone-300 text-amber-900'
                  }`}
                />
                <span className="block text-[10px] text-center text-stone-400 mt-1">
                  {t(lang, 'versesPerDay')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleQuickAdjust(1)}
                disabled={goal >= 300}
                className="w-10 h-10 rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="+1"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickAdjust(5)}
                disabled={goal >= 295}
                className="w-10 h-10 rounded-xl border border-stone-300 dark:border-stone-700 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold"
                title="+5"
              >
                +5
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-stone-500 dark:text-stone-400">
              {isEn ? 'Recommended Presets:' : 'יעדים מומלצים:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => {
                const isSelected = goal === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setGoal(p.value)}
                    className={`relative p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/40 shadow-sm'
                        : isDark
                        ? 'border-stone-800 bg-[#1F1C18] hover:border-stone-700 text-stone-300'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    {p.isRecommended && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-white shadow-xs">
                        {isEn ? 'Recommended' : 'מומלץ'}
                      </span>
                    )}
                    <span className="font-bold text-sm">
                      {isEn ? p.labelEn : p.labelHe}
                    </span>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">
                      {isEn ? p.descEn : p.descHe}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Educational Note */}
          <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
            isDark
              ? 'bg-amber-950/10 border-amber-900/30 text-stone-300'
              : 'bg-amber-50/70 border-amber-200/80 text-stone-700'
          }`}>
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t(lang, 'dailyGoalTip')}
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            {isEn ? 'Cancel' : 'ביטול'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t(lang, 'saveGoal')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
