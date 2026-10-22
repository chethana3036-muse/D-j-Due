import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Clock, Bell, ArrowRight } from 'lucide-react';
import { DateAlarm } from '../types/alarm';
import { calculateTimeRemaining, formatFriendlyDate, formatTime12 } from '../utils/dateUtils';

interface HeroBannerProps {
  alarms: DateAlarm[];
  onTriggerAlarmPreview: (alarm: DateAlarm) => void;
  onOpenNewAlarm: (prefill?: Partial<DateAlarm>) => void;
  onAiPromptSubmit: (promptText: string) => Promise<void>;
  isParsingAi: boolean;
  mascotImgSrc?: string;
  birthdayImgSrc?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  alarms,
  onTriggerAlarmPreview,
  onOpenNewAlarm,
  onAiPromptSubmit,
  isParsingAi,
  mascotImgSrc,
  birthdayImgSrc,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [promptInput, setPromptInput] = useState('');

  // Live digital clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Find the next upcoming alarm (prioritizing enabled ones)
  const activeAlarms = alarms.filter((a) => a.enabled);
  const nextAlarm = activeAlarms.length > 0
    ? [...activeAlarms].sort((a, b) => {
        const remA = calculateTimeRemaining(a, currentTime);
        const remB = calculateTimeRemaining(b, currentTime);
        return remA.totalSeconds - remB.totalSeconds;
      })[0]
    : alarms[0];

  const nextAlarmRemaining = nextAlarm ? calculateTimeRemaining(nextAlarm, currentTime) : null;

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim() || isParsingAi) return;
    onAiPromptSubmit(promptInput.trim());
    setPromptInput('');
  };

  const samplePrompts = [
    'Set an alarm for 22nd dec 2026 as my bffs bday at 8:30am with cupcake reminder 🎂',
    'Set an alarm tomorrow morning at 7:00 am for morning pilates & iced matcha 🍵',
    'Exam Day alarm on 15th Nov at 7:30 am with study notes reminder 📝',
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-100/70 via-pink-50/80 to-peach-100/60 p-6 sm:p-8 lg:p-10 border border-rose-200/60 shadow-sm shadow-rose-200/30 mb-8">
      {/* Background Soft Blobs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-gradient-to-br from-pink-300/20 to-rose-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-gradient-to-tr from-amber-200/20 to-peach-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Greeting, Live Clock, Natural Language AI Input */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-xs font-medium text-rose-600 bg-rose-50/90 border border-rose-200/60 rounded-full px-3 py-1 w-fit shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Clock Alarm Urgency meets Calendar Date Precision</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 font-display leading-[1.15]">
              Never miss a milestone <br />
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                on any exact date.
              </span>
            </h1>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Normal alarms only repeat weekly. Calendars send quiet pings you easily sleep through.
              Déjà Due sets real ringing alarms for any specific calendar day—like your bestie's birthday!
            </p>
          </div>

          {/* AI Natural Language Scheduler Form */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-rose-200/80 shadow-sm">
            <form onSubmit={handlePromptSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g. Set an alarm for 22nd dec 2026 as my bffs bday at 8:30am..."
                  className="w-full pl-3 pr-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none focus:ring-0"
                />
              </div>
              <button
                type="submit"
                disabled={isParsingAi || !promptInput.trim()}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer active:scale-98"
              >
                {isParsingAi ? (
                  <>
                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                    <span>AI Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Schedule</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Prompt Suggestions */}
            <div className="mt-2 pt-2 border-t border-rose-50 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-500 scrollbar-none">
              <span className="shrink-0 text-rose-500 font-medium">Try:</span>
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPromptInput(sample)}
                  className="shrink-0 truncate max-w-[240px] px-2 py-0.5 rounded-md hover:bg-rose-50 hover:text-rose-700 transition-colors text-left text-slate-600"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Live Clock Strip */}
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-mono tabular-nums text-slate-700 bg-white/70 px-2.5 py-1 rounded-lg border border-rose-100 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true,
                })}
              </span>
            </div>
            <span>·</span>
            <span>
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>·</span>
            <span className="text-rose-600 font-medium">{activeAlarms.length} Active Date Alarms</span>
          </div>
        </div>

        {/* Right Column: Next Spotlight Card (e.g. Dec 22 BFF Bday Countdown) */}
        <div className="lg:col-span-5">
          {nextAlarm ? (
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-rose-200 shadow-md shadow-rose-200/30 relative overflow-hidden group">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎂</span>
                  <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                    Next Date Milestone
                  </span>
                </div>
                {nextAlarmRemaining && (
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 tabular-nums">
                    {nextAlarmRemaining.formattedCountdown}
                  </span>
                )}
              </div>

              {/* Title & Date */}
              <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900 font-display">{nextAlarm.title}</h3>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>{formatFriendlyDate(nextAlarm.targetDate)}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>{formatTime12(nextAlarm.targetTime)}</span>
                  </span>
                </div>
              </div>

              {/* Countdown Ticker Box */}
              {nextAlarmRemaining && (
                <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                  <div className="bg-rose-50/70 rounded-xl p-2 border border-rose-100">
                    <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                      {nextAlarmRemaining.days}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Days</div>
                  </div>
                  <div className="bg-rose-50/70 rounded-xl p-2 border border-rose-100">
                    <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                      {nextAlarmRemaining.hours}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Hours</div>
                  </div>
                  <div className="bg-rose-50/70 rounded-xl p-2 border border-rose-100">
                    <div className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                      {nextAlarmRemaining.minutes}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Mins</div>
                  </div>
                  <div className="bg-rose-50/70 rounded-xl p-2 border border-rose-100">
                    <div className="text-lg font-bold text-rose-600 font-mono tabular-nums">
                      {nextAlarmRemaining.seconds}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Secs</div>
                  </div>
                </div>
              )}

              {/* Note / Cute greeting preview */}
              {nextAlarm.note && (
                <div className="mt-3 text-xs text-slate-600 italic bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                  "{nextAlarm.note}"
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onTriggerAlarmPreview(nextAlarm)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Test Ring Now</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenNewAlarm()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <span>All Alarms</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 rounded-3xl p-8 border border-rose-200 text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-rose-100 flex items-center justify-center text-2xl">
                🌸
              </div>
              <p className="text-sm font-semibold text-slate-800">No date alarms yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Add an alarm for Dec 22, 2026 or any special date!
              </p>
              <button
                onClick={() => onOpenNewAlarm()}
                className="mt-3 px-4 py-1.5 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-full"
              >
                + Create Date Alarm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
