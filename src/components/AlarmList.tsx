import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  Volume2,
  Plus,
  Repeat,
  Heart,
  AlertCircle,
  Brain,
} from 'lucide-react';
import { DateAlarm, AlarmCategory, CATEGORY_CONFIG, SOUND_OPTIONS } from '../types/alarm';
import { calculateTimeRemaining, formatFriendlyDate, formatTime12 } from '../utils/dateUtils';
import { cuteAudioSynth } from '../utils/audioSynth';

interface AlarmListProps {
  alarms: DateAlarm[];
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
  onEditAlarm: (alarm: DateAlarm) => void;
  onOpenNewAlarm: () => void;
  onTriggerAlarmPreview: (alarm: DateAlarm) => void;
}

export const AlarmList: React.FC<AlarmListProps> = ({
  alarms,
  onToggleAlarm,
  onDeleteAlarm,
  onEditAlarm,
  onOpenNewAlarm,
  onTriggerAlarmPreview,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [playingTheme, setPlayingTheme] = useState<string | null>(null);

  const filterOptions = [
    { id: 'all', label: 'All Alarms', icon: '⏰' },
    { id: 'bff_birthday', label: 'BFF Birthdays', icon: '🎂' },
    { id: 'romance', label: 'Romance & Dates', icon: '💖' },
    { id: 'self_care', label: 'Self-Care & Glow', icon: '✨' },
    { id: 'milestone', label: 'Milestones', icon: '🎉' },
    { id: 'exam_work', label: 'Exams & Study', icon: '📝' },
    { id: 'travel', label: 'Travel & Trips', icon: '✈️' },
  ];

  const filteredAlarms = alarms.filter((alarm) => {
    if (selectedFilter === 'all') return true;
    return alarm.category === selectedFilter;
  });

  const handleTestChime = (soundTheme: any) => {
    setPlayingTheme(soundTheme);
    cuteAudioSynth.playPattern(soundTheme);
    setTimeout(() => {
      setPlayingTheme(null);
    }, 1200);
  };

  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Date-Specific & Recurring Alarms
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Wake up to specific calendar milestones, daily self-care, or weekly routines with smart snooze challenges.
          </p>
        </div>

        <button
          onClick={onOpenNewAlarm}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-full shadow-xs cursor-pointer active:scale-98 transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Date Alarm</span>
        </button>
      </div>

      {/* Filter Tabs / Segmented Control */}
      <div className="flex items-center gap-1.5 p-1 bg-white/70 backdrop-blur-sm rounded-2xl border border-rose-100 overflow-x-auto scrollbar-none shadow-2xs">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelectedFilter(opt.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === opt.id
                ? 'bg-rose-500 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/50'
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      {/* Alarm Cards List */}
      {filteredAlarms.length === 0 ? (
        <div className="bg-white/80 rounded-3xl p-10 border border-rose-200/80 text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-3xl">
            🌸
          </div>
          <h3 className="text-base font-semibold text-slate-800">No alarms found in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {selectedFilter === 'all'
              ? 'Start by scheduling your first date-specific alarm, like your best friend’s birthday or an upcoming trip!'
              : 'Try creating a date alarm for this category.'}
          </p>
          <button
            onClick={onOpenNewAlarm}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Alarm</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlarms.map((alarm) => {
            const timeRemaining = calculateTimeRemaining(alarm);
            const categoryConfig = CATEGORY_CONFIG[alarm.category] || CATEGORY_CONFIG.general;
            const soundConfig = SOUND_OPTIONS.find((s) => s.id === alarm.soundTheme) || SOUND_OPTIONS[0];

            return (
              <div
                key={alarm.id}
                className={`relative rounded-3xl p-5 border transition-all duration-200 ${
                  alarm.enabled && !timeRemaining.isExpired
                    ? 'bg-white/95 border-rose-200/80 shadow-xs hover:shadow-md hover:border-rose-300'
                    : 'bg-white/60 border-slate-200 opacity-60'
                }`}
              >
                {/* Top Row: Category Tag, Recurrence, and Toggle */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-rose-50">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-lg">{categoryConfig.icon}</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {categoryConfig.label}
                    </span>

                    {/* Recurrence pill */}
                    {alarm.recurrence !== 'once' && (
                      <span className="flex items-center gap-1 text-[10px] text-rose-600 font-medium bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        <Repeat className="w-3 h-3" />
                        <span className="capitalize">
                          {alarm.recurrence === 'weekly' && alarm.repeatDays?.length
                            ? `Weekly (${alarm.repeatDays.map((d) => dayNamesShort[d]).join(', ')})`
                            : alarm.recurrence}
                        </span>
                      </span>
                    )}

                    {/* Recurrence End Date */}
                    {alarm.recurrenceEndDate && (
                      <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                        until {formatFriendlyDate(alarm.recurrenceEndDate)}
                      </span>
                    )}

                    {/* Smart Snooze Tag */}
                    {alarm.smartSnoozeChallenge?.enabled && (
                      <span className="flex items-center gap-0.5 text-[10px] text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded-full border border-pink-100">
                        <Brain className="w-3 h-3" />
                        <span>Snooze Quiz</span>
                      </span>
                    )}
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alarm.enabled && !timeRemaining.isExpired}
                      onChange={() => onToggleAlarm(alarm.id)}
                      disabled={timeRemaining.isExpired}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-pink-500"></div>
                  </label>
                </div>

                {/* Alarm Details */}
                <div className="mt-3.5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">
                      {alarm.title}
                    </h3>

                    {/* Date and Time */}
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        <span>{formatFriendlyDate(alarm.targetDate)}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-mono font-semibold text-slate-900 tabular-nums text-sm">
                        <Clock className="w-3.5 h-3.5 text-rose-500" />
                        <span>{formatTime12(alarm.targetTime)}</span>
                      </span>
                    </div>

                    {/* Countdown Badge */}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-medium tabular-nums ${
                          timeRemaining.isExpired
                            ? 'bg-slate-200 text-slate-600 font-bold'
                            : timeRemaining.isPast
                            ? 'bg-slate-100 text-slate-500'
                            : timeRemaining.days === 0
                            ? 'bg-rose-100 text-rose-700 font-bold animate-pulse'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                        }`}
                      >
                        {timeRemaining.formattedCountdown}
                      </span>

                      {/* Sound theme preview */}
                      <button
                        type="button"
                        onClick={() => handleTestChime(alarm.soundTheme)}
                        title={`Preview ${soundConfig.name}`}
                        className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        <Volume2 className={`w-3 h-3 ${playingTheme === alarm.soundTheme ? 'text-rose-600 animate-spin' : ''}`} />
                        <span className="truncate max-w-[100px]">{soundConfig.name}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Encouraging Message preview or user note */}
                {(alarm.aiPersonalizedMessage || alarm.note) && (
                  <p className="mt-3 text-xs text-slate-600 bg-rose-50/40 p-2 rounded-xl border border-rose-100/60 line-clamp-2 italic">
                    "{alarm.aiPersonalizedMessage || alarm.note}"
                  </p>
                )}

                {/* Bottom Bar: Quick Ring Test, Edit, Delete */}
                <div className="mt-4 pt-3 border-t border-rose-50 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => onTriggerAlarmPreview(alarm)}
                    className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Test Alarm Ring</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditAlarm(alarm)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Alarm"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAlarm(alarm.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Alarm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
