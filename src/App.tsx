import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { AlarmList } from './components/AlarmList';
import { CalendarView } from './components/CalendarView';
import { BFFCelebrationHub } from './components/BFFCelebrationHub';
import { AIScheduleAdvisor } from './components/AIScheduleAdvisor';
import { PythonProjectStudio } from './components/PythonProjectStudio';
import { AlarmModal } from './components/AlarmModal';
import { RingingAlarmModal } from './components/RingingAlarmModal';
import { DateAlarm, UserSchedulePreferences } from './types/alarm';
import { cuteAudioSynth } from './utils/audioSynth';
import { isAlarmExpired } from './utils/dateUtils';

const MASCOT_IMG = '/src/assets/images/deja_due_mascot_1792690262036.jpg';
const BIRTHDAY_IMG = '/src/assets/images/birthday_celebration_art_1792690262265.jpg';
const BFF_COZY_IMG = '/src/assets/images/bff_friendship_cozy_1792690262964.jpg';

const DEFAULT_PREFERENCES: UserSchedulePreferences = {
  chronotype: 'early_bird',
  morningBufferMinutes: 45,
  encouragementTone: 'gentle_sweet',
  preferredSnoozeDuration: 10,
  favoriteMorningRitual: 'Iced oat matcha & journaling 🍵',
};

const INITIAL_ALARMS: DateAlarm[] = [
  {
    id: 'alarm-bff-2026',
    title: "BFF's 21st Birthday! 🎂",
    targetDate: '2026-12-22',
    targetTime: '08:30',
    category: 'bff_birthday',
    recurrence: 'yearly',
    enabled: true,
    note: 'Call Chloe first thing in the morning with strawberry cake and our polaroids! 🍓',
    soundTheme: 'peach_blossom',
    vibeColor: '#FB7185',
    cuteGreeting: 'Happy 21st Birthday to your bestie!! Make today magical with hugs and sweet cake 🍰✨',
    suggestedMission: 'Send a birthday voice memo and heartfelt memory collage! 💖',
    aiPersonalizedMessage: 'Good morning sunshine! Today is Chloe’s special day—you two make the world brighter together! 🎂🌸',
    smartSnoozeChallenge: {
      enabled: true,
      challengeType: 'affirmation',
      question: 'What is your favorite memory with your bestie? 🌸',
    },
  },
  {
    id: 'alarm-daily-hydration',
    title: 'Daily Glow Up & Hydration 🍵',
    targetDate: '2026-10-23',
    targetTime: '07:30',
    category: 'self_care',
    recurrence: 'daily',
    recurrenceEndDate: '2026-12-31',
    enabled: true,
    note: 'Sip warm lemon water, 5 min gentle stretch, and facial mist.',
    soundTheme: 'sunrise_melody',
    vibeColor: '#FB923C',
    cuteGreeting: 'Good morning gorgeous! Today is your time to recharge, glow, and relax ✨🌸',
    aiPersonalizedMessage: 'Rise and shine beautiful! You have 45 cozy minutes to treat yourself with pure care. 🍵',
    smartSnoozeChallenge: {
      enabled: true,
      challengeType: 'riddle',
    },
  },
  {
    id: 'alarm-weekly-pilates',
    title: 'Weekly Pilates & Core Strength 🧘‍♀️',
    targetDate: '2026-10-23',
    targetTime: '08:00',
    category: 'self_care',
    recurrence: 'weekly',
    repeatDays: [1, 3, 5], // Mon, Wed, Fri
    recurrenceEndDate: '2027-04-30',
    enabled: true,
    note: 'Mat, cute workout set, and electrolyte bottle ready!',
    soundTheme: 'kawaii_twinkle',
    vibeColor: '#F472B6',
    cuteGreeting: 'Time to move and feel strong! Your body will thank you 🌸💪',
    aiPersonalizedMessage: 'Let your strength and grace shine today! Stretch, breathe, and enjoy the flow. ✨',
    smartSnoozeChallenge: {
      enabled: false,
      challengeType: 'trivia',
    },
  },
  {
    id: 'alarm-project',
    title: 'Python AI Project Submission 🎓',
    targetDate: '2026-11-15',
    targetTime: '10:00',
    category: 'exam_work',
    recurrence: 'once',
    enabled: true,
    note: 'Verify unit tests output, export PDF report, and submit to portal!',
    soundTheme: 'sunrise_melody',
    vibeColor: '#A78BFA',
    cuteGreeting: 'You got this! All your hard work and brilliant coding is paying off today 🌟📝',
    aiPersonalizedMessage: 'Take a deep confident breath—your Python algorithms and scheduling engine are top-tier! 🎓',
  },
];

export default function App() {
  const [alarms, setAlarms] = useState<DateAlarm[]>(() => {
    try {
      const saved = localStorage.getItem('deja_due_alarms');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return INITIAL_ALARMS;
  });

  const [preferences, setPreferences] = useState<UserSchedulePreferences>(() => {
    try {
      const saved = localStorage.getItem('deja_due_prefs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read prefs from localStorage', e);
    }
    return DEFAULT_PREFERENCES;
  });

  const [activeTab, setActiveTab] = useState<'alarms' | 'calendar' | 'bff' | 'advisor' | 'python'>('alarms');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<DateAlarm | null>(null);
  const [modalPrefill, setModalPrefill] = useState<Partial<DateAlarm> | undefined>(undefined);
  const [ringingAlarm, setRingingAlarm] = useState<DateAlarm | null>(null);
  const [isAiParsing, setIsAiParsing] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('deja_due_alarms', JSON.stringify(alarms));
    } catch (e) {
      console.warn('Failed to save alarms to localStorage', e);
    }
  }, [alarms]);

  useEffect(() => {
    try {
      localStorage.setItem('deja_due_prefs', JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save prefs to localStorage', e);
    }
  }, [preferences]);

  // Background check for alarms firing (runs every 10 seconds)
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentDateStr = now.toISOString().split('T')[0];
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const currentDay = now.getDay();

      alarms.forEach((alarm) => {
        if (!alarm.enabled) return;
        if (isAlarmExpired(alarm, now)) return;

        // Check snoozed state
        if (alarm.snoozedUntil && Math.abs(Date.now() - alarm.snoozedUntil) < 15000) {
          setRingingAlarm(alarm);
          return;
        }

        // Check regular recurrence trigger
        let matchesDate = false;
        if (alarm.recurrence === 'once') {
          matchesDate = alarm.targetDate === currentDateStr;
        } else if (alarm.recurrence === 'daily') {
          matchesDate = true;
        } else if (alarm.recurrence === 'weekly') {
          matchesDate = (alarm.repeatDays || []).includes(currentDay);
        } else if (alarm.recurrence === 'yearly') {
          matchesDate = alarm.targetDate.endsWith(currentDateStr.substring(4));
        } else if (alarm.recurrence === 'monthly') {
          matchesDate = alarm.targetDate.substring(8) === currentDateStr.substring(8);
        }

        if (matchesDate && alarm.targetTime === currentTimeStr && !ringingAlarm) {
          setRingingAlarm(alarm);
        }
      });
    };

    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [alarms, ringingAlarm]);

  // Actions
  const handleToggleAlarm = (id: string) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  };

  const handleEditAlarm = (alarm: DateAlarm) => {
    setEditingAlarm(alarm);
    setModalPrefill(undefined);
    setIsModalOpen(true);
  };

  const handleOpenNewAlarm = (prefill?: Partial<DateAlarm>) => {
    setEditingAlarm(null);
    setModalPrefill(prefill);
    setIsModalOpen(true);
  };

  const handleSaveAlarm = (savedAlarm: DateAlarm) => {
    setAlarms((prev) => {
      const exists = prev.some((a) => a.id === savedAlarm.id);
      if (exists) {
        return prev.map((a) => (a.id === savedAlarm.id ? savedAlarm : a));
      }
      return [savedAlarm, ...prev];
    });
  };

  // AI Prompt handler from hero banner
  const handleAiPromptSubmit = async (promptText: string) => {
    setIsAiParsing(true);
    try {
      const res = await fetch('/api/ai/parse-alarm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await res.json();
      if (data.data) {
        const p = data.data;
        const newAlarm: DateAlarm = {
          id: `alarm-${Date.now()}`,
          title: p.title || 'Special Milestone 🌸',
          targetDate: p.targetDate || '2026-12-22',
          targetTime: p.targetTime || '08:30',
          category: p.category || 'bff_birthday',
          recurrence: p.recurrence || 'yearly',
          recurrenceEndDate: p.recurrenceEndDate || null,
          enabled: true,
          note: p.note || promptText,
          soundTheme: 'peach_blossom',
          vibeColor: p.vibeColor || '#FB7185',
          cuteGreeting: p.cuteGreeting,
          suggestedMission: p.suggestedMission,
          aiPersonalizedMessage: p.cuteGreeting,
          smartSnoozeChallenge: {
            enabled: true,
            challengeType: 'riddle',
          },
        };
        setAlarms((prev) => [newAlarm, ...prev]);
        cuteAudioSynth.playPattern('peach_blossom');
        setActiveTab('alarms');
      }
    } catch (err) {
      console.error('Failed to parse AI prompt:', err);
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleTriggerAlarmPreview = (alarm: DateAlarm) => {
    setRingingAlarm(alarm);
  };

  const handleDismissRinging = () => {
    setRingingAlarm(null);
  };

  const handleSnoozeRinging = (minutes: number) => {
    if (!ringingAlarm) return;
    const snoozeTime = Date.now() + minutes * 60 * 1000;
    setAlarms((prev) =>
      prev.map((a) => (a.id === ringingAlarm.id ? { ...a, snoozedUntil: snoozeTime } : a))
    );
    setRingingAlarm(null);
  };

  const bffAlarm = alarms.find((a) => a.category === 'bff_birthday') || alarms[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/60 via-pink-50/30 to-amber-50/20 text-slate-800 flex flex-col font-sans">
      {/* 3-Zone Contract Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAlarm={() => handleOpenNewAlarm()}
        mascotImgSrc={MASCOT_IMG}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Spotlight Banner */}
        <HeroBanner
          alarms={alarms}
          onTriggerAlarmPreview={handleTriggerAlarmPreview}
          onOpenNewAlarm={handleOpenNewAlarm}
          onAiPromptSubmit={handleAiPromptSubmit}
          isParsingAi={isAiParsing}
          mascotImgSrc={MASCOT_IMG}
          birthdayImgSrc={BIRTHDAY_IMG}
        />

        {/* Tab Content */}
        {activeTab === 'alarms' && (
          <AlarmList
            alarms={alarms}
            onToggleAlarm={handleToggleAlarm}
            onDeleteAlarm={handleDeleteAlarm}
            onEditAlarm={handleEditAlarm}
            onOpenNewAlarm={() => handleOpenNewAlarm()}
            onTriggerAlarmPreview={handleTriggerAlarmPreview}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            alarms={alarms}
            onOpenNewAlarm={handleOpenNewAlarm}
            onTriggerAlarmPreview={handleTriggerAlarmPreview}
          />
        )}

        {activeTab === 'bff' && (
          <BFFCelebrationHub
            bffAlarm={bffAlarm}
            onOpenNewAlarm={handleOpenNewAlarm}
            bffCozyImgSrc={BFF_COZY_IMG}
            birthdayImgSrc={BIRTHDAY_IMG}
          />
        )}

        {activeTab === 'advisor' && (
          <AIScheduleAdvisor
            alarms={alarms}
            preferences={preferences}
            onUpdatePreferences={setPreferences}
            onOpenNewAlarm={handleOpenNewAlarm}
          />
        )}

        {activeTab === 'python' && <PythonProjectStudio alarms={alarms} />}
      </main>

      {/* Quiet Footer */}
      <footer className="mt-auto border-t border-rose-100/80 bg-white/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-rose-600 font-display">Déjà Due</span>
            <span>·</span>
            <span>Smart Date-Specific Alarm & Adaptive Calendar Engine</span>
          </div>
          <div>
            Built with Python 3.10 & Google Gemini AI for Academic Project Submission
          </div>
        </div>
      </footer>

      {/* Create / Edit Modal */}
      <AlarmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAlarm}
        initialData={editingAlarm || modalPrefill}
        userPreferences={preferences}
        existingAlarms={alarms}
      />

      {/* Active Ringing Alarm Overlay Modal with Smart Snooze Challenges */}
      <RingingAlarmModal
        alarm={ringingAlarm}
        onDismiss={handleDismissRinging}
        onSnooze={handleSnoozeRinging}
        mascotImgSrc={MASCOT_IMG}
      />
    </div>
  );
}
