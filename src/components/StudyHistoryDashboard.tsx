/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  BarChart3,
  TrendingUp,
  Award,
  Calendar,
  Flame,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
  RefreshCw,
  Printer,
  ChevronDown,
  Target
} from 'lucide-react';
import { AppTheme, ParashaMetadata, UILanguage } from '../types';
import {
  DailyStudyRecord,
  WeeklyStudyRecord,
  getDailyStudyHistory,
  getWeeklyStudyHistory,
  getAllParashiotStats,
  getGlobalStudyMetrics,
  ensureInitialHistoryBaseline,
  clearStudyHistory,
  formatDateKey
} from '../utils/historyTracking';
import { t } from '../utils/translations';

interface StudyHistoryDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  activeParasha: ParashaMetadata;
  currentCompletedVerses: number;
  totalVersesInActiveParasha: number;
  aliyahCompletion: Record<number, { completed: number; total: number }>;
  theme: AppTheme;
  lang: UILanguage;
  onSelectParasha: (parasha: ParashaMetadata) => void;
  dailyGoal?: number;
  onOpenDailyGoal?: () => void;
}

type TimeRangeOption = '7d' | '14d' | '30d' | '8w';
type ChumashFilter = 'all' | 'studied' | 'Genesis' | 'Exodus' | 'Leviticus' | 'Numbers' | 'Deuteronomy';
type SortOption = 'order' | 'rate' | 'verses';

export const StudyHistoryDashboard: React.FC<StudyHistoryDashboardProps> = ({
  isOpen,
  onClose,
  activeParasha,
  currentCompletedVerses,
  totalVersesInActiveParasha,
  aliyahCompletion,
  theme,
  lang,
  onSelectParasha,
  dailyGoal = 18,
  onOpenDailyGoal,
}) => {
  const isDark = theme === 'dark';
  const isEn = lang === 'en';

  const [timeRange, setTimeRange] = useState<TimeRangeOption>('14d');
  const [metricType, setMetricType] = useState<'completed' | 'all'>('completed');
  const [chumashFilter, setChumashFilter] = useState<ChumashFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('order');
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  // Ensure initial baseline on mount
  useEffect(() => {
    if (isOpen) {
      ensureInitialHistoryBaseline(activeParasha.id, currentCompletedVerses);
    }
  }, [isOpen, activeParasha.id, currentCompletedVerses]);

  // Load metrics & data
  const globalMetrics = useMemo(() => {
    return getGlobalStudyMetrics(activeParasha.id, currentCompletedVerses);
  }, [activeParasha.id, currentCompletedVerses, isOpen]);

  const dailyHistory7 = useMemo(() => getDailyStudyHistory(7), [isOpen]);
  const dailyHistory14 = useMemo(() => getDailyStudyHistory(14), [isOpen]);
  const dailyHistory30 = useMemo(() => getDailyStudyHistory(30), [isOpen]);
  const weeklyHistory8 = useMemo(() => getWeeklyStudyHistory(8), [isOpen]);

  const currentChartData = useMemo(() => {
    switch (timeRange) {
      case '7d':
        return dailyHistory7;
      case '14d':
        return dailyHistory14;
      case '30d':
        return dailyHistory30;
      default:
        return dailyHistory14;
    }
  }, [timeRange, dailyHistory7, dailyHistory14, dailyHistory30]);

  const allParashiotSummaries = useMemo(() => {
    return getAllParashiotStats(activeParasha.id);
  }, [activeParasha.id, isOpen]);

  // Filtered and sorted parashiot
  const filteredParashiot = useMemo(() => {
    let list = allParashiotSummaries;

    if (chumashFilter === 'studied') {
      list = list.filter((p) => p.completedVerses > 0 || p.parashaId === activeParasha.id);
    } else if (chumashFilter !== 'all') {
      list = list.filter((p) => p.chumashEn === chumashFilter);
    }

    // Sort
    if (sortOption === 'rate') {
      return [...list].sort((a, b) => b.completionRate - a.completionRate);
    } else if (sortOption === 'verses') {
      return [...list].sort((a, b) => b.completedVerses - a.completedVerses);
    }
    return list;
  }, [allParashiotSummaries, chumashFilter, sortOption, activeParasha.id]);

  if (!isOpen) return null;

  // Chart math for Daily/Weekly Bar Chart
  const isWeekly = timeRange === '8w';
  const barCount = isWeekly ? weeklyHistory8.length : currentChartData.length;
  
  const getBarValues = (index: number) => {
    if (isWeekly) {
      const item = weeklyHistory8[index];
      return {
        completed: item?.versesCompleted || 0,
        total: item?.versesStudied || 0,
        label: item?.weekLabel || '',
        subLabel: item?.weekRange || '',
        parashiot: item?.parashiot || [],
      };
    } else {
      const item = currentChartData[index];
      if (!item) return { completed: 0, total: 0, label: '', subLabel: '', parashiot: [] };
      const d = new Date(item.date);
      const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Shabbat'];
      const dayNamesHe = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'שבת'];
      const dayLabel = isEn ? dayNamesEn[d.getDay()] : dayNamesHe[d.getDay()];
      const dateNum = `${d.getMonth() + 1}/${d.getDate()}`;
      return {
        completed: item.versesCompleted,
        total: item.versesStudied,
        label: dayLabel,
        subLabel: dateNum,
        parashiot: item.parashiot,
      };
    }
  };

  const maxVal = Math.max(
    ...Array.from({ length: barCount }, (_, i) => {
      const val = getBarValues(i);
      return metricType === 'completed' ? val.completed : Math.max(val.total, val.completed);
    }),
    20 // Minimum ceiling for nice proportions
  );

  // Round maxVal up to multiple of 10
  const yAxisCeiling = Math.ceil(maxVal / 10) * 10;
  const yTicks = [0, Math.round(yAxisCeiling * 0.25), Math.round(yAxisCeiling * 0.5), Math.round(yAxisCeiling * 0.75), yAxisCeiling];

  // Active parasha completion rate
  const activeParashaRate = totalVersesInActiveParasha > 0
    ? Math.round((currentCompletedVerses / totalVersesInActiveParasha) * 100)
    : 0;

  // Chart dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 16;
  const paddingTop = 24;
  const paddingBottom = 42;
  const chartInnerWidth = svgWidth - paddingLeft - paddingRight;
  const chartInnerHeight = svgHeight - paddingTop - paddingBottom;
  const slotWidth = chartInnerWidth / barCount;
  const barWidth = Math.min(32, Math.max(10, slotWidth * 0.62));

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isDark
            ? 'bg-[#181613] border-[#383126] text-[#EDE7DC]'
            : theme === 'sefer'
            ? 'bg-white border-stone-300 text-stone-900'
            : 'bg-[#FAF6EF] border-[#DFD5C2] text-[#24201A]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-[#2B251D] bg-[#14120F]' : 'border-[#E7DFCF] bg-[#F4EDE0]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-frank text-xl sm:text-2xl font-bold text-[#9E7422] dark:text-[#D4AF37] leading-tight">
                {t(lang, 'dashboard')}
              </h2>
              <p className="text-xs text-stone-500 font-sans">
                {t(lang, 'dashboardSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className={`p-2 rounded-lg text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors ${
                isDark ? 'hover:bg-[#25201A]' : 'hover:bg-stone-200/60'
              }`}
              title={isEn ? 'Print Study Report' : 'הדפס דוח לימוד'}
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors ${
                isDark ? 'hover:bg-[#25201A]' : 'hover:bg-stone-200/60'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-7">
          
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            
            {/* KPI 1: Total Verses Studied */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isDark
                  ? 'bg-[#1F1C18] border-[#332B22]'
                  : 'bg-white border-[#E8DFD0] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500">
                  {t(lang, 'totalVersesStudied')}
                </span>
                <span className="p-1.5 rounded-md bg-amber-500/10 text-[#9E7422] dark:text-[#D4AF37]">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-frank text-2xl sm:text-3xl font-bold tracking-tight text-[#9E7422] dark:text-[#D4AF37]">
                  {globalMetrics.totalVersesStudied.toLocaleString()}
                </span>
                <span className="text-[11px] text-stone-500">
                  {isEn ? 'actions' : 'פעולות'}
                </span>
              </div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {globalMetrics.totalVersesCompleted} {isEn ? 'completed (2x+1x)' : 'הושלמו (2x+1x)'}
                </span>
              </div>
            </div>

            {/* KPI 2: Active Parasha Completion */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isDark
                  ? 'bg-[#1F1C18] border-[#332B22]'
                  : 'bg-white border-[#E8DFD0] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500">
                  {isEn ? `Parashat ${activeParasha.nameEn}` : `פרשת ${activeParasha.nameHe}`}
                </span>
                <span className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-frank text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {activeParashaRate}%
                </span>
                <span className="text-[11px] text-stone-500">
                  {currentCompletedVerses}/{totalVersesInActiveParasha}
                </span>
              </div>
              {/* Mini progress bar */}
              <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeParashaRate}%` }}
                />
              </div>
            </div>

            {/* KPI 3: Study Streak */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isDark
                  ? 'bg-[#1F1C18] border-[#332B22]'
                  : 'bg-white border-[#E8DFD0] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500">
                  {t(lang, 'studyStreak')}
                </span>
                <span className="p-1.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <Flame className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-frank text-2xl sm:text-3xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
                  {globalMetrics.currentStreakDays}
                </span>
                <span className="text-xs text-stone-500">
                  {isEn ? 'consecutive days' : 'ימים ברצף'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {isEn ? 'Active daily learner' : 'קביעות ללימוד יומי'}
              </p>
            </div>

            {/* KPI 4: Whole Torah Mastery */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isDark
                  ? 'bg-[#1F1C18] border-[#332B22]'
                  : 'bg-white border-[#E8DFD0] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500">
                  {t(lang, 'torahProgress')}
                </span>
                <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-frank text-2xl sm:text-3xl font-bold tracking-tight text-[#9E7422] dark:text-[#D4AF37]">
                  {globalMetrics.overallTorahCompletionRate}%
                </span>
                <span className="text-[11px] text-stone-500">
                  {globalMetrics.parashiotCompletedCount}/54 {isEn ? 'Parashiot' : 'פרשות'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {globalMetrics.parashiotInProgressCount} {isEn ? 'in progress' : 'בתהליך'}
              </p>
            </div>

            {/* KPI 5: Daily Study Goal */}
            <div
              onClick={onOpenDailyGoal}
              className={`p-4 rounded-xl border transition-all ${
                onOpenDailyGoal ? 'cursor-pointer hover:border-amber-500/60 hover:shadow-md' : ''
              } ${
                globalMetrics.todayCompletedCount >= (dailyGoal || 18)
                  ? isDark
                    ? 'bg-amber-950/20 border-amber-600/40'
                    : 'bg-amber-50/80 border-amber-300'
                  : isDark
                  ? 'bg-[#1F1C18] border-[#332B22]'
                  : 'bg-white border-[#E8DFD0] shadow-xs'
              }`}
              title={isEn ? 'Click to adjust daily study goal' : 'לחץ לשינוי יעד לימוד יומי'}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-stone-500">
                  {t(lang, 'dailyGoal')}
                </span>
                <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Target className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-frank text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {globalMetrics.todayCompletedCount}/{dailyGoal || 18}
                </span>
                <span className="text-xs text-stone-500">
                  {globalMetrics.todayCompletedCount >= (dailyGoal || 18)
                    ? (isEn ? 'Achieved!' : 'הושג!')
                    : `${Math.min(100, Math.round((globalMetrics.todayCompletedCount / (dailyGoal || 18)) * 100))}%`}
                </span>
              </div>
              {/* Mini progress bar */}
              <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    globalMetrics.todayCompletedCount >= (dailyGoal || 18)
                      ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((globalMetrics.todayCompletedCount / (dailyGoal || 18)) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>

          </div>

          {/* Section 1: Verses Studied Over Time (Interactive Bar Chart) */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#1B1814] border-[#30281F]' : 'bg-white border-[#E6DDCE] shadow-sm'
            }`}
          >
            {/* Chart Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-frank text-lg font-bold text-[#9E7422] dark:text-[#D4AF37] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>{t(lang, 'dailyStudyChart')}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  {isEn
                    ? 'Total verses completed (2x Mikra + 1x Onkelos) and verse actions over time'
                    : 'פסוקים שהושלמו (שניים מקרא ואחד תרגום) ופעולות לימוד לאורך זמן'}
                </p>
              </div>

              {/* Time Range & Metric Selectors */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Metric toggle */}
                <div className={`flex rounded-lg p-0.5 border text-xs ${
                  isDark ? 'bg-[#14120F] border-stone-700' : 'bg-stone-100 border-stone-200'
                }`}>
                  <button
                    onClick={() => setMetricType('completed')}
                    className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                      metricType === 'completed'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                    }`}
                  >
                    {isEn ? 'Completed Verses' : 'פסוקים שהושלמו'}
                  </button>
                  <button
                    onClick={() => setMetricType('all')}
                    className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                      metricType === 'all'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                    }`}
                  >
                    {isEn ? 'All Actions' : 'כלל הפעולות'}
                  </button>
                </div>

                {/* Time Range Pills */}
                <div className={`flex rounded-lg p-0.5 border text-xs ${
                  isDark ? 'bg-[#14120F] border-stone-700' : 'bg-stone-100 border-stone-200'
                }`}>
                  {(['7d', '14d', '30d', '8w'] as TimeRangeOption[]).map((opt) => {
                    const label =
                      opt === '7d'
                        ? t(lang, 'last7Days')
                        : opt === '14d'
                        ? t(lang, 'last14Days')
                        : opt === '30d'
                        ? t(lang, 'last30Days')
                        : t(lang, 'past8Weeks');
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          setTimeRange(opt);
                          setHoveredBarIndex(null);
                        }}
                        className={`px-2 py-1 rounded-md transition-all font-medium ${
                          timeRange === opt
                            ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900 shadow-xs'
                            : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SVG Bar Chart Visualization */}
            <div className="relative w-full overflow-x-auto pb-2">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[540px] select-none"
              >
                <defs>
                  {/* Bar gradients */}
                  <linearGradient id="barGradientGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E5B94F" />
                    <stop offset="100%" stopColor="#B3861B" />
                  </linearGradient>
                  <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                  <linearGradient id="barGradientSecondary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#64748B" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Horizontal Grid Lines */}
                {yTicks.map((tickVal) => {
                  const y = paddingTop + chartInnerHeight - (tickVal / yAxisCeiling) * chartInnerHeight;
                  return (
                    <g key={tickVal}>
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke={isDark ? '#2D261E' : '#EAE3D5'}
                        strokeDasharray={tickVal === 0 ? '' : '3 3'}
                        strokeWidth="1"
                      />
                      <text
                        x={paddingLeft - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        fontSize="10"
                        fontFamily="ui-sans-serif, system-ui"
                        fill={isDark ? '#78716C' : '#A8A29E'}
                      >
                        {tickVal}
                      </text>
                    </g>
                  );
                })}

                {/* Render Vertical Bars */}
                {Array.from({ length: barCount }).map((_, idx) => {
                  const barData = getBarValues(idx);
                  const val = metricType === 'completed' ? barData.completed : Math.max(barData.total, barData.completed);
                  const isHovered = hoveredBarIndex === idx;
                  const isToday = !isWeekly && idx === barCount - 1;

                  const barH = (val / yAxisCeiling) * chartInnerHeight;
                  const x = paddingLeft + idx * slotWidth + (slotWidth - barWidth) / 2;
                  const y = paddingTop + chartInnerHeight - barH;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      onMouseLeave={() => setHoveredBarIndex(null)}
                    >
                      {/* Background hover slot */}
                      <rect
                        x={paddingLeft + idx * slotWidth + 1}
                        y={paddingTop}
                        width={slotWidth - 2}
                        height={chartInnerHeight}
                        fill={isHovered ? (isDark ? '#332B20' : '#F3EBDD') : 'transparent'}
                        rx="4"
                        className="transition-colors"
                      />

                      {/* Bar Rectangle */}
                      {val > 0 && (
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(barH, 3)}
                          rx="4"
                          fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradientGold)'}
                          className="transition-all duration-300 drop-shadow-xs"
                        />
                      )}

                      {/* Value label on top of bar */}
                      {val > 0 && (barCount <= 14 || isHovered) && (
                        <text
                          x={x + barWidth / 2}
                          y={y - 5}
                          textAnchor="middle"
                          fontSize={barCount <= 7 ? '11' : '10'}
                          fontWeight="bold"
                          fontFamily="ui-sans-serif, system-ui"
                          fill={isHovered ? '#D97706' : (isDark ? '#D4AF37' : '#9E7422')}
                        >
                          {val}
                        </text>
                      )}

                      {/* X-Axis Main Label */}
                      <text
                        x={x + barWidth / 2}
                        y={svgHeight - 20}
                        textAnchor="middle"
                        fontSize={barCount > 14 ? '9' : '11'}
                        fontWeight={isToday || isHovered ? 'bold' : 'normal'}
                        fontFamily="ui-sans-serif, system-ui"
                        fill={
                          isToday
                            ? '#D97706'
                            : isHovered
                            ? (isDark ? '#F5F5F4' : '#1C1917')
                            : (isDark ? '#A8A29E' : '#78716C')
                        }
                      >
                        {barData.label}
                      </text>

                      {/* X-Axis Sub Label (Date) */}
                      <text
                        x={x + barWidth / 2}
                        y={svgHeight - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fontFamily="ui-sans-serif, system-ui"
                        fill={isDark ? '#57534E' : '#A8A29E'}
                      >
                        {barData.subLabel}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip Card when hovering a bar */}
              {hoveredBarIndex !== null && (
                <div
                  className={`mt-2 p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    isDark
                      ? 'bg-[#221D17] border-[#3D3326] text-stone-200'
                      : 'bg-[#F9F4EB] border-[#DED3BD] text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="font-bold">
                        {getBarValues(hoveredBarIndex).label} · {getBarValues(hoveredBarIndex).subLabel}
                      </span>
                      {getBarValues(hoveredBarIndex).parashiot.length > 0 && (
                        <span className="text-stone-500 ml-2">
                          ({getBarValues(hoveredBarIndex).parashiot.join(', ')})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {getBarValues(hoveredBarIndex).completed} {isEn ? 'completed' : 'הושלמו'}
                    </span>
                    <span className="text-stone-500">
                      {getBarValues(hoveredBarIndex).total} {isEn ? 'total steps' : 'צעדים'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Chart Summary Footer */}
            <div className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 ${
              isDark ? 'border-[#2A241C]' : 'border-stone-200'
            }`}>
              <div className="flex items-center gap-4">
                <span>
                  {isEn ? 'Period Total:' : 'סה״כ לתקופה:'}{' '}
                  <strong className="text-stone-800 dark:text-stone-200">
                    {Array.from({ length: barCount }).reduce(
                      (sum: number, _, i: number) => sum + getBarValues(i).completed,
                      0
                    )}{' '}
                    {isEn ? 'verses' : 'פסוקים'}
                  </strong>
                </span>
                <span>
                  {isEn ? 'Daily Average:' : 'ממוצע יומי:'}{' '}
                  <strong className="text-stone-800 dark:text-stone-200">
                    {Math.round(
                      Array.from({ length: barCount }).reduce(
                        (sum: number, _, i: number) => sum + getBarValues(i).completed,
                        0
                      ) / Math.max(1, barCount)
                    )}{' '}
                    {isEn ? 'v/day' : 'פסוקים/יום'}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-amber-500 to-amber-700" />
                <span>{isEn ? 'Verses Studied' : 'פסוקים שנלמדו'}</span>
              </div>
            </div>

          </div>

          {/* Section 2: Completion Rates by Parasha (Horizontal Bar Visualization) */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#1B1814] border-[#30281F]' : 'bg-white border-[#E6DDCE] shadow-sm'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-frank text-lg font-bold text-[#9E7422] dark:text-[#D4AF37] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>{t(lang, 'parashiotCompletionChart')}</span>
                </h3>
                <p className="text-xs text-stone-500">
                  {isEn
                    ? 'Individual completion percentage and verses mastered for each Torah portion'
                    : 'אחוזי השלמה ומספר פסוקים שהושלמו עבור כל אחת מפרשיות התורה'}
                </p>
              </div>

              {/* Chumash Filter & Sorting */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Chumash Select */}
                <select
                  value={chumashFilter}
                  onChange={(e) => setChumashFilter(e.target.value as ChumashFilter)}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    isDark
                      ? 'bg-[#14120F] border-stone-700 text-stone-200'
                      : 'bg-stone-50 border-stone-300 text-stone-800'
                  }`}
                >
                  <option value="all">{t(lang, 'allChumashim')} (54)</option>
                  <option value="studied">{isEn ? 'Studied Only' : 'פרשיות שנלמדו בלבד'}</option>
                  <option value="Genesis">Bereshit / בראשית</option>
                  <option value="Exodus">Shemot / שמות</option>
                  <option value="Leviticus">Vayikra / ויקרא</option>
                  <option value="Numbers">Bamidbar / במדבר</option>
                  <option value="Deuteronomy">Devarim / דברים</option>
                </select>

                {/* Sort selector */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    isDark
                      ? 'bg-[#14120F] border-stone-700 text-stone-200'
                      : 'bg-stone-50 border-stone-300 text-stone-800'
                  }`}
                >
                  <option value="order">{isEn ? 'Torah Order' : 'לפי סדר התורה'}</option>
                  <option value="rate">{isEn ? 'Highest Completion %' : 'לפי אחוז השלמה'}</option>
                  <option value="verses">{isEn ? 'Most Verses' : 'לפי מספר פסוקים'}</option>
                </select>
              </div>
            </div>

            {/* Parashiot Completion Bar Cards List */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {filteredParashiot.map((summary) => {
                const isCurrent = summary.isCurrent;
                const completed = isCurrent
                  ? Math.max(summary.completedVerses, currentCompletedVerses)
                  : summary.completedVerses;
                const rate = summary.versesTotal > 0
                  ? Math.min(100, Math.round((completed / summary.versesTotal) * 100))
                  : 0;
                const is100 = rate === 100;

                return (
                  <div
                    key={summary.parashaId}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? isDark
                          ? 'border-amber-500/40 bg-amber-500/10'
                          : 'border-amber-600/40 bg-amber-500/5 shadow-xs'
                        : isDark
                        ? 'border-[#2C251D] bg-[#14120F] hover:border-stone-700'
                        : 'border-stone-200 bg-stone-50/70 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-frank text-lg font-bold text-[#9E7422] dark:text-[#D4AF37]">
                          {summary.nameHe}
                        </span>
                        <span className="text-xs text-stone-500 font-sans">
                          ({summary.nameEn})
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          isDark ? 'bg-stone-800 text-stone-300' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {summary.chumashHe}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500 text-white shadow-xs">
                            {isEn ? 'Current' : 'נוכחית'}
                          </span>
                        )}
                        {is100 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>{isEn ? 'Finished' : 'הושלמה'}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-stone-500">
                          {completed} / {summary.versesTotal} {isEn ? 'v.' : 'פס׳'}
                        </span>
                        <span className={`font-mono text-sm font-bold tabular-nums min-w-[42px] text-right ${
                          is100
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : rate > 0
                            ? 'text-[#9E7422] dark:text-[#D4AF37]'
                            : 'text-stone-400'
                        }`}>
                          {rate}%
                        </span>

                        {/* Open Parasha Button */}
                        <button
                          onClick={() => {
                            const meta = filteredParashiot.find((p) => p.parashaId === summary.parashaId);
                            if (meta) {
                              onSelectParasha({
                                id: summary.parashaId,
                                nameEn: summary.nameEn,
                                nameHe: summary.nameHe,
                                chumashEn: summary.chumashEn as any,
                                chumashHe: summary.chumashHe as any,
                                ref: '',
                                heRef: '',
                                versesTotal: summary.versesTotal,
                              });
                              onClose();
                            }
                          }}
                          className={`p-1.5 rounded-lg border text-xs transition-all ${
                            isCurrent
                              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                              : isDark
                              ? 'bg-[#1F1C18] border-stone-700 text-stone-300 hover:bg-stone-800'
                              : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
                          }`}
                          title={t(lang, 'jumpToStudy')}
                        >
                          <ChevronRight className={`w-3.5 h-3.5 ${isEn ? '' : 'rotate-180'}`} />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Bar for Completion Rate */}
                    <div className="w-full bg-stone-200 dark:bg-stone-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          is100
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            : rate > 0
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                            : 'bg-transparent'
                        }`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Shlah Schedule Aliyot Distribution (Weekly Pacing) */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDark ? 'bg-[#1B1814] border-[#30281F]' : 'bg-white border-[#E6DDCE] shadow-sm'
            }`}
          >
            <div className="mb-4">
              <h3 className="font-frank text-lg font-bold text-[#9E7422] dark:text-[#D4AF37] flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{t(lang, 'aliyahPacingChart')}</span>
              </h3>
              <p className="text-xs text-stone-500">
                {isEn
                  ? 'Traditional daily distribution: Sunday (Rishon) through Friday (Review & Maftir)'
                  : 'סדר הלימוד היומי המומלץ על פי השל״ה הקדוש: מיום ראשון ועד ליל שבת וערב שבת'}
              </p>
            </div>

            {/* 7 Aliyot Grid Bar Chart */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { idx: 0, he: 'ראשון', en: 'Rishon', dayHe: 'יום ראשון', dayEn: 'Sunday' },
                { idx: 1, he: 'שני', en: 'Sheni', dayHe: 'יום שני', dayEn: 'Monday' },
                { idx: 2, he: 'שלישי', en: 'Shlishi', dayHe: 'יום שלישי', dayEn: 'Tuesday' },
                { idx: 3, he: 'רביעי', en: 'Revi\'i', dayHe: 'יום רביעי', dayEn: 'Wednesday' },
                { idx: 4, he: 'חמישי', en: 'Chamishi', dayHe: 'יום חמישי', dayEn: 'Thursday' },
                { idx: 5, he: 'ששי', en: 'Shishi', dayHe: 'יום ששי', dayEn: 'Friday' },
                { idx: 6, he: 'שביעי', en: 'Shevi\'i', dayHe: 'שבת קודש', dayEn: 'Shabbat' },
              ].map((al) => {
                const info = aliyahCompletion[al.idx] || { completed: 0, total: 1 };
                const pct = info.total > 0 ? Math.round((info.completed / info.total) * 100) : 0;
                const isComplete = pct === 100 && info.total > 0;

                return (
                  <div
                    key={al.idx}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      isComplete
                        ? isDark
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                          : 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                        : isDark
                        ? 'bg-[#14120F] border-stone-800'
                        : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-frank font-bold text-sm text-[#9E7422] dark:text-[#D4AF37]">
                          {al.he}
                        </span>
                        <span className="text-[11px] font-mono font-bold">
                          {pct}%
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 block">
                        {isEn ? al.dayEn : al.dayHe}
                      </span>
                    </div>

                    <div className="mt-3">
                      {/* Vertical or Mini Bar */}
                      <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isComplete ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-stone-500 text-center block">
                        {info.completed}/{info.total} {isEn ? 'v.' : 'פס׳'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer info bar */}
        <div
          className={`flex flex-wrap items-center justify-between px-6 py-3.5 border-t text-xs ${
            isDark ? 'border-[#2B251D] bg-[#14120F] text-stone-400' : 'border-[#E7DFCF] bg-[#F4EDE0] text-stone-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9E7422] dark:text-[#D4AF37]" />
            <span>
              {isEn
                ? 'All study progress is automatically stored locally and persists across sessions.'
                : 'כל נתוני ההתקדמות נשמרים מקומית באופן רציף ואוטומטי.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm(isEn ? 'Are you sure you want to reset your study history?' : 'האם לאפס את היסטוריית הלימוד?')) {
                  clearStudyHistory();
                  onClose();
                }
              }}
              className="text-stone-400 hover:text-red-500 transition-colors text-xs"
            >
              {isEn ? 'Reset History' : 'איפוס היסטוריה'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg font-medium bg-[#9E7422] dark:bg-[#D4AF37] text-white hover:opacity-90 transition-opacity"
            >
              {isEn ? 'Close' : 'סגור'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
