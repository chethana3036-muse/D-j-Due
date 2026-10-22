import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Clock,
  Sun,
  Moon,
  Coffee,
  Heart,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { DateAlarm, UserSchedulePreferences } from '../types/alarm';
import { formatTime12 } from '../utils/dateUtils';

interface AIScheduleAdvisorProps {
  alarms: DateAlarm[];
  preferences: UserSchedulePreferences;
  onUpdatePreferences: (updated: UserSchedulePreferences) => void;
  onOpenNewAlarm: (prefill?: Partial<DateAlarm>) => void;
}

export const AIScheduleAdvisor: React.FC<AIScheduleAdvisorProps> = ({
  alarms,
  preferences,
  onUpdatePreferences,
  onOpenNewAlarm,
}) => {
  const [chronotype, setChronotype] = useState(preferences.chronotype);
  const [morningBuffer, setMorningBuffer] = useState(preferences.morningBufferMinutes);
  const [tone, setTone] = useState(preferences.encouragementTone);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = () => {
    onUpdatePreferences({
      ...preferences,
      chronotype,
      morningBufferMinutes: morningBuffer,
      encouragementTone: tone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  // Compute learned metrics from alarms
  const totalAlarms = alarms.length;
  const activeAlarms = alarms.filter((a) => a.enabled);
  const bffAlarms = alarms.filter((a) => a.category === 'bff_birthday');
  const recurringAlarms = alarms.filter((a) => a.recurrence !== 'once');

  // AI Generated Schedule Recommendations tailored to the user
  const aiRecommendations = [
    {
      title: "BFF Birthday Eve Midnight Call 🌙",
      time: "23:55",
      date: "2026-12-21",
      category: "bff_birthday" as const,
      recurrence: "yearly" as const,
      reasoning: "Wake up 5 minutes before midnight so you are the very first person to text and call your bestie!",
      encouragingMessage: "Almost midnight! Get ready to shower your favorite person with birthday love! 🎂✨",
    },
    {
      title: "Gentle Morning Hydration & Stretch 🍵",
      time: chronotype === 'early_bird' ? "07:15" : "08:15",
      date: "2026-10-23",
      category: "self_care" as const,
      recurrence: "daily" as const,
      reasoning: `Matches your ${morningBuffer}m morning buffer so you never feel rushed before your day begins.`,
      encouragingMessage: "Good morning sunshine! Take a deep breath, sip warm water, and glow effortlessly today 🌸",
    },
    {
      title: "Friday Evening Unwind & Gratitude ✨",
      time: "19:00",
      date: "2026-10-24",
      category: "self_care" as const,
      recurrence: "weekly" as const,
      repeatDays: [5], // Friday
      reasoning: "A calming routine to mark the end of the work week and transition into cozy weekend mode.",
      encouragingMessage: "Happy Friday gorgeous! You worked so hard this week—time to completely relax! 🕯️💖",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-peach-100 border border-rose-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-white/80 border border-rose-200/60 rounded-full px-3 py-1 w-fit shadow-2xs">
              <Brain className="w-3.5 h-3.5 text-rose-500" />
              <span>Adaptive Routine & Chronotype Learner</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
              AI Schedule & Preference Advisor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Déjà Due learns your wake-up preferences, morning routines, and milestone calendar to suggest
              optimal alarm times and craft personalized, uplifting messages.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/90 border border-rose-200 shadow-xs text-center shrink-0">
            <div className="text-2xl font-black text-rose-600 font-mono tabular-nums">
              {morningBuffer} min
            </div>
            <div className="text-[11px] font-medium text-slate-500 mt-0.5">
              Learned Morning Prep Buffer
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Preferences Configurator & Learned Routine Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Preferences Form (7 cols) */}
        <div className="lg:col-span-7 bg-white/95 rounded-3xl p-6 border border-rose-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Your Personal Sleep & Wake Preferences
            </h3>
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>

          {/* Chronotype Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Natural Sleep Chronotype
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'early_bird', label: 'Early Bird', icon: '🌅', desc: '6:00 - 7:30 AM' },
                { id: 'balanced', label: 'Balanced', icon: '☀️', desc: '7:30 - 8:30 AM' },
                { id: 'night_owl', label: 'Night Owl', icon: '🌙', desc: '8:30 - 10:00 AM' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChronotype(c.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    chronotype === c.id
                      ? 'border-rose-500 bg-rose-50/80 ring-1 ring-rose-500 shadow-xs'
                      : 'border-slate-200 hover:border-rose-200 bg-white'
                  }`}
                >
                  <div className="text-lg">{c.icon}</div>
                  <div className="text-xs font-bold text-slate-800 mt-1">{c.label}</div>
                  <div className="text-[10px] text-slate-500">{c.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Morning Prep Buffer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">
                Morning Buffer Before First Obligation
              </label>
              <span className="font-mono font-bold text-rose-600 tabular-nums">
                {morningBuffer} minutes
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[30, 45, 60, 75].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setMorningBuffer(mins)}
                  className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
                    morningBuffer === mins
                      ? 'bg-rose-500 text-white font-bold border-rose-500 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">
              The AI uses this buffer to calculate when you should wake up before an event or appointment.
            </p>
          </div>

          {/* Encouragement Tone */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Wake-Up Message Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'gentle_sweet', label: 'Gentle & Sweet', icon: '🌸', desc: 'Soft & loving' },
                { id: 'energetic_hype', label: 'Energetic Hype', icon: '🔥', desc: 'Upbeat & cheerful' },
                { id: 'mindful_cozy', label: 'Mindful Cozy', icon: '🍵', desc: 'Peaceful & grounded' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    tone === t.id
                      ? 'border-rose-500 bg-rose-50/80 ring-1 ring-rose-500 shadow-xs'
                      : 'border-slate-200 hover:border-rose-200 bg-white'
                  }`}
                >
                  <div className="text-lg">{t.icon}</div>
                  <div className="text-xs font-bold text-slate-800 mt-1">{t.label}</div>
                  <div className="text-[10px] text-slate-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-between border-t border-rose-100">
            {savedSuccess ? (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Preferences updated for AI!</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                AI continuously adapts to newly created alarms
              </span>
            )}
            <button
              type="button"
              onClick={handleSavePreferences}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Update AI Preferences
            </button>
          </div>
        </div>

        {/* Right: AI Learned Insights & Recommended Alarms (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Insights Card */}
          <div className="bg-white/95 rounded-3xl p-5 border border-rose-200/80 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>Schedule Intelligence Insights</span>
            </h4>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                <span>Active Date Alarms</span>
                <span className="font-mono font-bold text-rose-700">{activeAlarms.length} of {totalAlarms}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-pink-50/60 border border-pink-100 flex items-center justify-between">
                <span>Recurring Routines</span>
                <span className="font-mono font-bold text-pink-700">{recurringAlarms.length}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                <span>Friendship Milestones</span>
                <span className="font-mono font-bold text-amber-700">{bffAlarms.length}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic pt-1">
              "Your schedule leans towards wholesome morning starts with special focus on BFF milestones in late December."
            </p>
          </div>

          {/* AI Recommended Alarms */}
          <div className="bg-white/95 rounded-3xl p-5 border border-rose-200/80 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-display">
              AI Recommended Routines
            </h4>

            <div className="space-y-3">
              {aiRecommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-rose-50/40 border border-rose-100/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{rec.title}</span>
                    <span className="text-xs font-mono font-semibold text-rose-600 tabular-nums">
                      {formatTime12(rec.time)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{rec.reasoning}</p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 capitalize">{rec.recurrence}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onOpenNewAlarm({
                          title: rec.title,
                          targetTime: rec.time,
                          targetDate: rec.date,
                          category: rec.category,
                          recurrence: rec.recurrence,
                          repeatDays: rec.repeatDays,
                          cuteGreeting: rec.encouragingMessage,
                          aiPersonalizedMessage: rec.encouragingMessage,
                        })
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add this Alarm</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
