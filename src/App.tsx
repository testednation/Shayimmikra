/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ALL_PARSHIOT } from './data/parshiotList';
import {
  AliyahData,
  AppTheme,
  BookmarkInfo,
  DisplaySettings,
  ParashaMetadata,
  ParashaProgress,
  ReadingFlow,
  StudyMode,
  UILanguage,
  VerseItem,
} from './types';
import {
  getCurrentCalendarParasha,
  loadParashaVerses,
} from './services/sefariaService';
import {
  DEFAULT_SETTINGS,
  clearBookmark,
  loadBookmark,
  loadParashaProgress,
  loadSavedParashaId,
  loadSettings,
  markAliyahComplete,
  markVerseComplete,
  resetAliyahProgress,
  saveActiveParashaId,
  saveBookmark,
  saveSettings,
  updateVerseProgress,
} from './utils/storage';
import { playStepChime, textToSpeechVoice } from './utils/hebrew';
import { Header } from './components/Header';
import { ParchmentHero } from './components/ParchmentHero';
import { RealtimeTracker } from './components/RealtimeTracker';
import { AliyahNavigation } from './components/AliyahNavigation';
import { VerseCard } from './components/VerseCard';
import { ParashaSelectorModal } from './components/ParashaSelectorModal';
import { DisplaySettingsModal } from './components/DisplaySettingsModal';
import { HalachaGuideModal } from './components/HalachaGuideModal';
import { InstructionsModal } from './components/InstructionsModal';
import { TikkunView } from './components/TikkunView';
import { DistractionFreeView } from './components/DistractionFreeView';
import { FocusModeView } from './components/FocusModeView';
import { DailyGoalModal } from './components/DailyGoalModal';
import { OfflineExportModal } from './components/OfflineExportModal';
import { StudyHistoryDashboard } from './components/StudyHistoryDashboard';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { Sparkles, Loader2, ArrowUp } from 'lucide-react';
import { t } from './utils/translations';
import { getConsecutiveStudyStreak, ensureInitialHistoryBaseline, loadDailyStudyGoal, saveDailyStudyGoal } from './utils/historyTracking';
import { findMatchingParasha, getOfflineEstimatedParasha } from './utils/parashaDetection';

export default function App() {
  const [settings, setSettings] = useState<DisplaySettings>(() => loadSettings());
  const [activeParasha, setActiveParasha] = useState<ParashaMetadata>(() => {
    const defaultParasha = getOfflineEstimatedParasha();
    const savedId = loadSavedParashaId();
    if (savedId) {
      const found = ALL_PARSHIOT.find((p) => p.id === savedId);
      if (found) return found;
    }
    return defaultParasha;
  });
  const [currentWeeklyParashaId, setCurrentWeeklyParashaId] = useState<string>(() => {
    return getOfflineEstimatedParasha().id;
  });
  const [verses, setVerses] = useState<VerseItem[]>([]);
  const [aliyot, setAliyot] = useState<AliyahData[]>([]);
  const [selectedAliyah, setSelectedAliyah] = useState<number | 'all'>('all');
  const [progress, setProgress] = useState<ParashaProgress>(() => loadParashaProgress(activeParasha.id));
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('Loading verses...');
  const [studyMode, setStudyMode] = useState<StudyMode>('verse');
  const [activeVerseIndex, setActiveVerseIndex] = useState<number>(0);
  const [bookmark, setBookmark] = useState<BookmarkInfo | null>(() => loadBookmark());
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [dailyGoal, setDailyGoal] = useState<number>(() => loadDailyStudyGoal());

  // Audio recitation state
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioVerseIndex, setAudioVerseIndex] = useState<number>(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Modals
  const [isParashaModalOpen, setIsParashaModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isHalachaModalOpen, setIsHalachaModalOpen] = useState<boolean>(false);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState<boolean>(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isDailyGoalModalOpen, setIsDailyGoalModalOpen] = useState<boolean>(false);

  // Sync theme, direction, and language to html/body
  useEffect(() => {
    document.body.className = `theme-${settings.theme} antialiased`;
    document.documentElement.lang = settings.uiLanguage;
    document.documentElement.dir = settings.uiLanguage === 'en' ? 'ltr' : 'rtl';
  }, [settings.theme, settings.uiLanguage]);

  // Load calendar parasha on startup with robust matching and automatic sync
  useEffect(() => {
    getCurrentCalendarParasha()
      .then((cal) => {
        const matched = findMatchingParasha(cal) || ALL_PARSHIOT.find(
          (p) =>
            p.nameEn.toLowerCase() === cal.parashaNameEn.toLowerCase() ||
            p.nameHe === cal.parashaNameHe ||
            p.id.toLowerCase() === cal.parashaNameEn.toLowerCase()
        );
        if (matched) {
          setCurrentWeeklyParashaId(matched.id);
          // If the user has not explicitly chosen a different parasha to study, sync to current week
          const userSavedId = loadSavedParashaId();
          if (!userSavedId) {
            setActiveParasha(matched);
          }
        }
      })
      .catch((err) => console.warn('Could not load weekly calendar:', err));
  }, []);

  // Load Parasha data when activeParasha.id or uiLanguage changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    const msg = settings.uiLanguage === 'en'
      ? `Loading Parashat ${activeParasha.nameEn}...`
      : `טוען את פרשת ${activeParasha.nameHe}...`;
    setLoadingMessage(msg);

    loadParashaVerses(activeParasha, (m) => {
      if (!isCancelled) setLoadingMessage(m);
    })
      .then((data) => {
        if (isCancelled) return;
        setVerses(data.verses);
        setAliyot(data.aliyot);
        setProgress(loadParashaProgress(activeParasha.id));
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('Failed to load parasha:', err);
        setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeParasha.id, settings.uiLanguage]);

  // Calculate day of week (0 = Sunday = Rishon, etc.)
  const todayDayOfWeek = new Date().getDay();
  const todayAliyahIndex = Math.min(6, todayDayOfWeek);

  // Calculate total completed verses
  const completedVersesCount = verses.filter((v) => {
    const p = progress.verses[v.id];
    return p?.mikra1 && p?.mikra2 && p?.targum;
  }).length;

  const totalVersesCount = verses.length;
  const progressPercent =
    totalVersesCount > 0 ? Math.round((completedVersesCount / totalVersesCount) * 100) : 0;

  // Ensure study history baseline exists on initial load
  useEffect(() => {
    ensureInitialHistoryBaseline(activeParasha.id, completedVersesCount);
  }, [activeParasha.id]);

  // Calculate daily consecutive study streak (days with at least 1 verse completed)
  const streakInfo = React.useMemo(() => {
    return getConsecutiveStudyStreak(completedVersesCount);
  }, [completedVersesCount, progress]);

  // Calculate completion per aliyah
  const aliyahCompletion = React.useMemo(() => {
    const map: Record<number, { completed: number; total: number }> = {};
    aliyot.forEach((a) => {
      const aVerses = verses.filter((v) => v.aliyahIndex === a.index);
      const done = aVerses.filter((v) => {
        const p = progress.verses[v.id];
        return p?.mikra1 && p?.mikra2 && p?.targum;
      }).length;
      map[a.index] = { completed: done, total: aVerses.length };
    });
    return map;
  }, [aliyot, verses, progress]);

  // Handle step updates
  const handleUpdateStep = useCallback(
    (verseId: string, step: 'mikra1' | 'mikra2' | 'targum', value: boolean) => {
      const updated = updateVerseProgress(activeParasha.id, verseId, step, value);
      setProgress(updated);

      if (settings.playAudioChime && value) {
        const verseProg = updated.verses[verseId];
        if (verseProg?.mikra1 && verseProg?.mikra2 && verseProg?.targum) {
          playStepChime('complete');
        } else {
          playStepChime('step');
        }
      }

      // Check if this step finished the whole Parasha or Aliyah!
      const allDone = verses.every((v) => {
        const p = updated.verses[v.id];
        return p?.mikra1 && p?.mikra2 && p?.targum;
      });

      if (allDone && verses.length > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#B8860B', '#F5ECCE', '#1E3A8A'],
        });
      }
    },
    [activeParasha.id, settings.playAudioChime, verses]
  );

  // Single-click mark complete
  const handleMarkComplete = useCallback(
    (verseId: string) => {
      const updated = markVerseComplete(activeParasha.id, verseId);
      setProgress(updated);
      if (settings.playAudioChime) {
        playStepChime('complete');
      }
    },
    [activeParasha.id, settings.playAudioChime]
  );

  // Mark entire aliyah complete
  const handleMarkAliyahComplete = (aliyahIdx: number) => {
    const aVerses = verses.filter((v) => v.aliyahIndex === aliyahIdx);
    const updated = markAliyahComplete(
      activeParasha.id,
      aVerses.map((v) => v.id)
    );
    setProgress(updated);
    if (settings.playAudioChime) {
      playStepChime('aliyah');
    }
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#D4AF37', '#B8860B', '#E5DAC6'],
    });
  };

  // Reset aliyah progress
  const handleResetAliyah = (aliyahIdx: number) => {
    const aVerses = verses.filter((v) => v.aliyahIndex === aliyahIdx);
    const updated = resetAliyahProgress(
      activeParasha.id,
      aVerses.map((v) => v.id)
    );
    setProgress(updated);
  };

  // Daily study goal updater
  const handleSaveDailyGoal = useCallback((newGoal: number) => {
    setDailyGoal(newGoal);
    saveDailyStudyGoal(newGoal);
  }, []);

  // Bookmark functions
  const handleSetBookmark = useCallback((verse: VerseItem) => {
    if (bookmark && bookmark.verseId === verse.id) {
      clearBookmark();
      setBookmark(null);
    } else {
      const newBookmark: BookmarkInfo = {
        parashaId: activeParasha.id,
        verseId: verse.id,
        chapter: verse.chapter,
        verse: verse.verse,
        verseHebrew: verse.verseHebrew,
        aliyahName: verse.aliyahName,
        savedAt: Date.now(),
      };
      saveBookmark(newBookmark);
      setBookmark(newBookmark);
      if (settings.playAudioChime) {
        playStepChime('step');
      }
    }
  }, [activeParasha.id, bookmark, settings.playAudioChime]);

  const handleJumpToBookmark = useCallback(() => {
    if (!bookmark) return;

    if (bookmark.parashaId !== activeParasha.id) {
      const targetParasha = ALL_PARSHIOT.find((p) => p.id === bookmark.parashaId);
      if (targetParasha) {
        setActiveParasha(targetParasha);
        saveActiveParashaId(targetParasha.id);
        setSelectedAliyah('all');
      }
    }

    setTimeout(() => {
      const element = document.getElementById(`verse-${bookmark.verseId.replace(/[\s:]/g, '-')}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const idx = verses.findIndex((v) => v.id === bookmark.verseId);
        if (idx !== -1) {
          setActiveVerseIndex(idx);
        }
      }
    }, 150);
  }, [bookmark, activeParasha.id, verses]);

  const handleToggleReadingFlow = () => {
    const nextFlow: ReadingFlow = settings.readingFlow === 'sequential_2x1x' ? 'stepper' : 'sequential_2x1x';
    const updated: DisplaySettings = { ...settings, readingFlow: nextFlow };
    setSettings(updated);
    saveSettings(updated);
  };

  const handleToggleRashi = () => {
    const nextShowRashi = !settings.showRashi;
    const updated: DisplaySettings = { ...settings, showRashi: nextShowRashi };
    if (nextShowRashi && studyMode !== 'rashi') {
      setStudyMode('rashi');
    } else if (!nextShowRashi && studyMode === 'rashi') {
      setStudyMode('verse');
    }
    setSettings(updated);
    saveSettings(updated);
  };

  const handleToggleLanguage = () => {
    const nextLang: UILanguage = settings.uiLanguage === 'en' ? 'he' : 'en';
    const updated: DisplaySettings = { ...settings, uiLanguage: nextLang };
    setSettings(updated);
    saveSettings(updated);
  };

  // Jump to specific Aliyah
  const handleJumpToAliyah = (aliyahIdx: number) => {
    setSelectedAliyah(aliyahIdx);
    const firstVerse = verses.find((v) => v.aliyahIndex === aliyahIdx);
    if (firstVerse) {
      const element = document.getElementById(`verse-${firstVerse.id.replace(/[\s:]/g, '-')}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Jump to last studied verse
  const handleJumpToLastVerse = () => {
    const lastId = progress.lastStudiedVerseId;
    if (lastId) {
      const element = document.getElementById(`verse-${lastId.replace(/[\s:]/g, '-')}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
    }
    const firstUnread = verses.find((v) => {
      const p = progress.verses[v.id];
      return !(p?.mikra1 && p?.mikra2 && p?.targum);
    });
    if (firstUnread) {
      const element = document.getElementById(`verse-${firstUnread.id.replace(/[\s:]/g, '-')}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Keyboard shortcut listener for rapid study
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const activeVerse = verses[activeVerseIndex];
      if (!activeVerse) return;

      const p = progress.verses[activeVerse.id] || { mikra1: false, mikra2: false, targum: false };

      if (e.code === 'Space') {
        e.preventDefault();
        if (!p.mikra1) {
          handleUpdateStep(activeVerse.id, 'mikra1', true);
        } else if (!p.mikra2) {
          handleUpdateStep(activeVerse.id, 'mikra2', true);
        } else if (!p.targum) {
          handleUpdateStep(activeVerse.id, 'targum', true);
          if (settings.autoAdvanceOnStepComplete && activeVerseIndex < verses.length - 1) {
            setActiveVerseIndex((prev) => prev + 1);
            const nextVerse = verses[activeVerseIndex + 1];
            if (nextVerse) {
              const el = document.getElementById(`verse-${nextVerse.id.replace(/[\s:]/g, '-')}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        } else {
          if (activeVerseIndex < verses.length - 1) {
            setActiveVerseIndex((prev) => prev + 1);
            const nextVerse = verses[activeVerseIndex + 1];
            if (nextVerse) {
              const el = document.getElementById(`verse-${nextVerse.id.replace(/[\s:]/g, '-')}`);
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }
        }
      } else if (e.key === 'f' || e.key === 'F') {
        // 'F' toggles Focus Mode (collapses all UI except the active verse)
        e.preventDefault();
        setIsFocusMode((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isFocusMode) {
          e.preventDefault();
          setIsFocusMode(false);
        }
      } else if (e.key === 'b' || e.key === 'B') {
        handleSetBookmark(activeVerse);
      } else if (e.key === 'r' || e.key === 'R') {
        // 'R' toggles Rashi commentary
        handleToggleRashi();
      } else if (e.key === 'z' || e.key === 'Z') {
        // 'Z' toggles Distraction-Free (Just Text) mode
        setStudyMode((prev) => (prev === 'distraction_free' ? 'verse' : 'distraction_free'));
      } else if (e.key === 'o' || e.key === 'O') {
        // 'O' opens Offline & Export modal
        setIsOfflineModalOpen((prev) => !prev);
      } else if (e.key === '1') {
        handleUpdateStep(activeVerse.id, 'mikra1', !p.mikra1);
      } else if (e.key === '2') {
        handleUpdateStep(activeVerse.id, 'mikra2', !p.mikra2);
      } else if (e.key === '3') {
        handleUpdateStep(activeVerse.id, 'targum', !p.targum);
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        if (activeVerseIndex < verses.length - 1) {
          setActiveVerseIndex((prev) => prev + 1);
          const nextVerse = verses[activeVerseIndex + 1];
          if (nextVerse) {
            const el = document.getElementById(`verse-${nextVerse.id.replace(/[\s:]/g, '-')}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        if (activeVerseIndex > 0) {
          setActiveVerseIndex((prev) => prev - 1);
          const prevVerse = verses[activeVerseIndex - 1];
          if (prevVerse) {
            const el = document.getElementById(`verse-${prevVerse.id.replace(/[\s:]/g, '-')}`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVerseIndex, verses, progress, handleUpdateStep, handleSetBookmark, handleToggleRashi, settings.autoAdvanceOnStepComplete, isFocusMode]);

  // Audio Speech Synthesis function
  const playVerseAudio = useCallback(
    (index: number) => {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      const verse = verses[index];
      if (!verse) {
        setIsPlayingAudio(false);
        return;
      }

      setAudioVerseIndex(index);
      setIsPlayingAudio(true);

      const text = textToSpeechVoice(verse.mikraHebrew);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = settings.voiceSpeed;

      utterance.onend = () => {
        if (index < verses.length - 1) {
          playVerseAudio(index + 1);
        } else {
          setIsPlayingAudio(false);
        }
      };

      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [verses, settings.voiceSpeed]
  );

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const handleTogglePlayAudio = () => {
    if (isPlayingAudio) {
      stopAudio();
    } else {
      playVerseAudio(audioVerseIndex);
    }
  };

  // Filtered verses according to selected Aliyah
  const displayedVerses = React.useMemo(() => {
    if (selectedAliyah === 'all') return verses;
    return verses.filter((v) => v.aliyahIndex === selectedAliyah);
  }, [verses, selectedAliyah]);

  const activeVerse = verses[activeVerseIndex] || verses[0];
  const activeVerseProg = activeVerse ? progress.verses[activeVerse.id] : undefined;
  const isEn = settings.uiLanguage === 'en';

  // Focus Mode (via 'F' key): Collapses all UI elements except the active verse being studied
  if (isFocusMode && activeVerse) {
    return (
      <>
        <FocusModeView
          verse={activeVerse}
          progress={activeVerseProg || { mikra1: false, mikra2: false, targum: false }}
          settings={settings}
          studyMode={studyMode}
          theme={settings.theme}
          lang={settings.uiLanguage}
          parashaName={isEn ? activeParasha.nameEn : activeParasha.nameHe}
          activeVerseIndex={activeVerseIndex}
          totalVerses={totalVersesCount}
          isBookmarked={bookmark?.verseId === activeVerse.id}
          isPlayingAudio={isPlayingAudio && audioVerseIndex === activeVerseIndex}
          onExitFocusMode={() => setIsFocusMode(false)}
          onNextVerse={() => {
            if (activeVerseIndex < verses.length - 1) {
              setActiveVerseIndex((prev) => prev + 1);
            }
          }}
          onPrevVerse={() => {
            if (activeVerseIndex > 0) {
              setActiveVerseIndex((prev) => prev - 1);
            }
          }}
          onUpdateStep={(step, val) => handleUpdateStep(activeVerse.id, step, val)}
          onMarkComplete={() => handleMarkComplete(activeVerse.id)}
          onToggleBookmark={() => handleSetBookmark(activeVerse)}
          onPlayAudio={() => {
            if (isPlayingAudio && audioVerseIndex === activeVerseIndex) {
              stopAudio();
            } else {
              playVerseAudio(activeVerseIndex);
            }
          }}
          onChangeTheme={(newTheme) => {
            const updated = { ...settings, theme: newTheme };
            setSettings(updated);
            saveSettings(updated);
          }}
          onChangeFontSize={(delta) => {
            const updated = { ...settings, fontSize: Math.min(44, Math.max(18, settings.fontSize + delta)) };
            setSettings(updated);
            saveSettings(updated);
          }}
        />

        {/* Display Settings Modal in case requested */}
        {isSettingsModalOpen && (
          <DisplaySettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            settings={settings}
            onChangeSettings={(s: DisplaySettings) => {
              setSettings(s);
              saveSettings(s);
            }}
            dailyGoal={dailyGoal}
            onUpdateDailyGoal={handleSaveDailyGoal}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      
      {/* Header */}
      <Header
        currentParashaName={isEn ? activeParasha.nameEn : activeParasha.nameHe}
        theme={settings.theme}
        mode={studyMode}
        lang={settings.uiLanguage}
        bookmark={bookmark}
        onJumpToBookmark={handleJumpToBookmark}
        onSelectMode={(m) => {
          setStudyMode(m);
          if (m === 'rashi') {
            const updated = { ...settings, showRashi: true };
            setSettings(updated);
            saveSettings(updated);
          }
        }}
        onOpenParashaSelector={() => setIsParashaModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenHalachaGuide={() => setIsHalachaModalOpen(true)}
        onOpenInstructions={() => setIsInstructionsModalOpen(true)}
        onOpenOfflineExport={() => setIsOfflineModalOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenDailyGoal={() => setIsDailyGoalModalOpen(true)}
        onToggleLanguage={handleToggleLanguage}
        onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
        progressPercent={progressPercent}
        streakDays={streakInfo.streakDays}
        hasCompletedToday={streakInfo.hasCompletedToday}
        dailyGoal={dailyGoal}
        todayCompletedCount={streakInfo.todayCompletedCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Hero Section with Weekly Pacing, Progress and Bookmark */}
        <ParchmentHero
          parasha={activeParasha}
          aliyot={aliyot}
          completedCount={completedVersesCount}
          totalVerses={totalVersesCount}
          theme={settings.theme}
          lang={settings.uiLanguage}
          todayAliyahIndex={todayAliyahIndex}
          bookmark={bookmark}
          onJumpToBookmark={handleJumpToBookmark}
          onJumpToAliyah={handleJumpToAliyah}
          onJumpToLastVerse={handleJumpToLastVerse}
          onOpenParashaSelector={() => setIsParashaModalOpen(true)}
          onOpenDashboard={() => setIsDashboardOpen(true)}
          currentWeeklyParashaId={currentWeeklyParashaId}
          onSelectWeeklyParasha={() => {
            const p = ALL_PARSHIOT.find((item) => item.id === currentWeeklyParashaId);
            if (p) {
              setActiveParasha(p);
              saveActiveParashaId(p.id);
              setSelectedAliyah('all');
              setActiveVerseIndex(0);
            }
          }}
        />

        {/* Realtime Tracker Strip with Rashi toggle */}
        <RealtimeTracker
          activeVerse={activeVerse}
          activeVerseProgress={activeVerseProg}
          totalCompleted={completedVersesCount}
          totalVerses={totalVersesCount}
          currentAliyahCompleted={activeVerse ? aliyahCompletion[activeVerse.aliyahIndex]?.completed || 0 : 0}
          currentAliyahTotal={activeVerse ? aliyahCompletion[activeVerse.aliyahIndex]?.total || 0 : 0}
          currentAliyahName={activeVerse ? (isEn ? aliyot[activeVerse.aliyahIndex]?.nameEn || activeVerse.aliyahName : activeVerse.aliyahName) : 'First'}
          bookmark={bookmark}
          onSetBookmark={handleSetBookmark}
          onJumpToBookmark={handleJumpToBookmark}
          settings={settings}
          studyMode={studyMode}
          onToggleReadingFlow={handleToggleReadingFlow}
          onToggleRashi={handleToggleRashi}
          onToggleDistractionFree={() => setStudyMode((prev) => prev === 'distraction_free' ? 'verse' : 'distraction_free')}
          onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
          theme={settings.theme}
        />

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#9E7422] dark:text-[#D4AF37]" />
            <p className="text-sm font-frank text-stone-600 dark:text-stone-300">
              {loadingMessage}
            </p>
          </div>
        ) : studyMode === 'distraction_free' ? (
          /* Distraction-Free Pure Text Mode (Just the Text) */
          <DistractionFreeView
            parasha={activeParasha}
            verses={displayedVerses}
            aliyot={aliyot}
            settings={settings}
            theme={settings.theme}
            progressMap={progress.verses}
            onExit={() => setStudyMode('verse')}
            onUpdateStep={(vId, step, val) => handleUpdateStep(vId, step, val)}
            onMarkComplete={handleMarkComplete}
            onChangeTheme={(newTheme) => {
              const updated = { ...settings, theme: newTheme };
              setSettings(updated);
              saveSettings(updated);
            }}
            onChangeFontSize={(delta) => {
              const updated = { ...settings, fontSize: Math.min(44, Math.max(18, settings.fontSize + delta)) };
              setSettings(updated);
              saveSettings(updated);
            }}
          />
        ) : studyMode === 'tikkun' ? (
          /* Tikkun Korim Mode */
          <TikkunView
            verses={displayedVerses}
            progressMap={progress.verses}
            settings={settings}
            theme={settings.theme}
            onExitTikkun={() => setStudyMode('verse')}
            onMarkComplete={handleMarkComplete}
          />
        ) : (
          /* Standard Study Mode: Verse-by-Verse or Aliyah-by-Aliyah */
          <div>
            {/* Aliyot Segmented Navigation */}
            <AliyahNavigation
              aliyot={aliyot}
              selectedAliyah={selectedAliyah}
              onSelectAliyah={setSelectedAliyah}
              theme={settings.theme}
              lang={settings.uiLanguage}
              aliyahCompletion={aliyahCompletion}
              onMarkAliyahComplete={handleMarkAliyahComplete}
              onResetAliyah={handleResetAliyah}
            />

            {/* Keyboard shortcut helper strip */}
            <div className="hidden sm:flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 mb-4 px-1">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">Space</kbd> {isEn ? 'advance step' : 'להשלמת שלב'}
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">B</kbd> {isEn ? 'bookmark' : 'סימנייה'}
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">R</kbd> {isEn ? 'toggle Rashi' : 'הפעל רש״י'}
                </span>
                <button
                  onClick={() => setIsFocusMode(true)}
                  className="flex items-center gap-1 hover:text-[#9E7422] dark:hover:text-[#D4AF37] transition-colors cursor-pointer text-amber-600 dark:text-amber-400 font-medium"
                  title={isEn ? "Focus Mode: Collapse all UI except active verse (Press 'F')" : "מצב מיקוד: בידוד הפסוק הנוכחי לחוויה סוחפת (הקש 'F')"}
                >
                  <kbd className="px-1.5 py-0.5 rounded border border-amber-500/50 bg-amber-500/10 font-mono">F</kbd> {isEn ? 'Focus Mode' : 'מצב מיקוד'}
                </button>
                <span>
                  <kbd className="px-1 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">1</kbd> <kbd className="px-1 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">2</kbd> <kbd className="px-1 py-0.5 rounded border border-stone-300 dark:border-stone-700 font-mono">3</kbd> {isEn ? 'direct mark' : 'לסימון'}
                </span>
              </div>
              <span className="font-mono tabular-nums">
                {isEn ? `Showing ${displayedVerses.length} of ${totalVersesCount} verses` : `מציג ${displayedVerses.length} מתוך ${totalVersesCount} פסוקים`}
              </span>
            </div>

            {/* List of Verses */}
            <div className="space-y-4">
              {displayedVerses.map((verse, idx) => {
                const prog = progress.verses[verse.id] || {
                  mikra1: false,
                  mikra2: false,
                  targum: false,
                };
                const isGlobalIndex = verses.findIndex((v) => v.id === verse.id);

                return (
                  <VerseCard
                    key={verse.id}
                    verse={verse}
                    progress={prog}
                    settings={settings}
                    studyMode={studyMode}
                    isActive={isGlobalIndex === activeVerseIndex}
                    isBookmarked={bookmark?.verseId === verse.id}
                    onUpdateStep={(step, val) => handleUpdateStep(verse.id, step, val)}
                    onMarkComplete={() => handleMarkComplete(verse.id)}
                    onSelectVerse={() => setActiveVerseIndex(isGlobalIndex)}
                    onToggleBookmark={() => handleSetBookmark(verse)}
                    isPlayingAudio={isPlayingAudio && audioVerseIndex === isGlobalIndex}
                    onPlayAudio={() => {
                      if (isPlayingAudio && audioVerseIndex === isGlobalIndex) {
                        stopAudio();
                      } else {
                        playVerseAudio(isGlobalIndex);
                      }
                    }}
                  />
                );
              })}
            </div>

            {/* Aliyah Bottom Completion Card */}
            {selectedAliyah !== 'all' && (
              <div className={`mt-8 p-6 rounded-xl border text-center space-y-3 ${
                settings.theme === 'dark'
                  ? 'bg-[#181614] border-[#2C2720]'
                  : 'bg-[#FCFAF6] border-[#E8DFC8]'
              }`}>
                <h3 className="font-frank text-lg font-bold text-stone-900 dark:text-stone-100">
                  {isEn
                    ? `Finished ${aliyot[selectedAliyah]?.nameEn} Aliyah?`
                    : `סיימת את עליית ${aliyot[selectedAliyah]?.nameHe}?`}
                </h3>
                <p className="text-xs text-stone-500">
                  {isEn
                    ? 'Yasher Koach! Mark the entire aliyah complete or proceed to the next one.'
                    : 'חזק וברוך! באפשרותך לסמן את העלייה כולה כהושלמה או להמשיך לעלייה הבאה.'}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleMarkAliyahComplete(selectedAliyah)}
                    className="px-4 py-2 text-xs font-medium text-white bg-[#9E7422] dark:bg-[#D4AF37] dark:text-stone-950 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    {isEn ? 'Mark Aliyah Complete' : 'סמן את כל העלייה כהושלמה'}
                  </button>
                  {selectedAliyah < 6 && (
                    <button
                      onClick={() => handleJumpToAliyah(selectedAliyah + 1)}
                      className="px-4 py-2 text-xs font-medium border border-stone-300 dark:border-stone-700 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                    >
                      {isEn ? `Continue to ${aliyot[selectedAliyah + 1]?.nameEn} Aliyah` : `המשך לעליית ${aliyot[selectedAliyah + 1]?.nameHe}`}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Floating Audio Recitation Player Bar */}
      {isPlayingAudio && verses[audioVerseIndex] && (
        <AudioPlayerBar
          currentVerse={verses[audioVerseIndex]}
          isPlaying={isPlayingAudio}
          onTogglePlay={handleTogglePlayAudio}
          onStop={stopAudio}
          onNextVerse={() => {
            if (audioVerseIndex < verses.length - 1) {
              playVerseAudio(audioVerseIndex + 1);
            }
          }}
          onPrevVerse={() => {
            if (audioVerseIndex > 0) {
              playVerseAudio(audioVerseIndex - 1);
            }
          }}
          speed={settings.voiceSpeed}
          onChangeSpeed={(sp) => {
            const updated = { ...settings, voiceSpeed: sp };
            setSettings(updated);
            saveSettings(updated);
            if (speechUtteranceRef.current) {
              speechUtteranceRef.current.rate = sp;
            }
          }}
          theme={settings.theme}
        />
      )}

      {/* Parasha Selection Modal */}
      <ParashaSelectorModal
        isOpen={isParashaModalOpen}
        onClose={() => setIsParashaModalOpen(false)}
        activeParashaId={activeParasha.id}
        currentWeeklyParashaId={currentWeeklyParashaId}
        onSelectParasha={(p) => {
          setActiveParasha(p);
          saveActiveParashaId(p.id);
          setSelectedAliyah('all');
          setActiveVerseIndex(0);
        }}
        theme={settings.theme}
      />

      {/* Display & Typography Settings Modal */}
      <DisplaySettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onChangeSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        dailyGoal={dailyGoal}
        onUpdateDailyGoal={handleSaveDailyGoal}
      />

      {/* Halacha Guide Modal */}
      <HalachaGuideModal
        isOpen={isHalachaModalOpen}
        onClose={() => setIsHalachaModalOpen(false)}
        theme={settings.theme}
      />

      {/* English / Hebrew Instructions Modal */}
      <InstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={() => setIsInstructionsModalOpen(false)}
        theme={settings.theme}
        lang={settings.uiLanguage}
      />

      {/* Offline Export & PWA Installation Modal */}
      <OfflineExportModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
        parasha={activeParasha}
        verses={verses}
        aliyot={aliyot}
        settings={settings}
        theme={settings.theme}
        lang={settings.uiLanguage}
        progress={progress}
      />

      {/* Study History & Analytics Dashboard Modal */}
      <StudyHistoryDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        activeParasha={activeParasha}
        currentCompletedVerses={completedVersesCount}
        totalVersesInActiveParasha={totalVersesCount}
        aliyahCompletion={aliyahCompletion}
        theme={settings.theme}
        lang={settings.uiLanguage}
        dailyGoal={dailyGoal}
        onOpenDailyGoal={() => setIsDailyGoalModalOpen(true)}
        onSelectParasha={(p) => {
          setActiveParasha(p);
          saveActiveParashaId(p.id);
          setSelectedAliyah('all');
          setActiveVerseIndex(0);
        }}
      />

      {/* Daily Study Goal Configuration Modal */}
      <DailyGoalModal
        isOpen={isDailyGoalModalOpen}
        onClose={() => setIsDailyGoalModalOpen(false)}
        dailyGoal={dailyGoal}
        todayCompletedCount={streakInfo.todayCompletedCount}
        onSaveGoal={handleSaveDailyGoal}
        theme={settings.theme}
        lang={settings.uiLanguage}
      />

      {/* Floating Offline Connectivity Status Indicator */}
      <OfflineIndicator lang={settings.uiLanguage} />

      {/* Footer */}
      <footer className={`border-t py-8 text-center text-xs transition-colors mt-12 ${
        settings.theme === 'dark'
          ? 'border-[#26221C] text-stone-500'
          : 'border-stone-200 text-stone-500'
      }`}>
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          <p className="font-frank text-sm text-[#9E7422] dark:text-[#D4AF37]">
            {isEn
              ? '“A person should always complete his Torah portions with the congregation: twice scripture and once translation.”'
              : '״שְׁנַיִם מִקְרָא וְאֶחָד תַּרְגּוּם — שֶׁכָּל הַמַּשְׁלִים פָּרָשִׁיּוֹתָיו עִם הַצִּבּוּר מַאֲרִיכִין לוֹ יָמָיו וּשְׁנוֹתָיו״'}
          </p>
          <p className="text-[11px] text-stone-400">
            {isEn
              ? 'Powered by Sefaria Open API · Built for Torah learners worldwide'
              : 'הטקסטים מוגשים באדיבות מאגר ספריא (Sefaria Open API) · נבנה באהבה ללומדי התורה'}
          </p>
        </div>
      </footer>

    </div>
  );
}
