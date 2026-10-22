import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Bell, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { DateAlarm, CATEGORY_CONFIG } from '../types/alarm';
import { formatTime12 } from '../utils/dateUtils';

interface CalendarViewProps {
  alarms: DateAlarm[];
  onOpenNewAlarm: (prefill?: Partial<DateAlarm>) => void;
  onTriggerAlarmPreview: (alarm: DateAlarm) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  alarms,
  onOpenNewAlarm,
  onTriggerAlarmPreview,
}) => {
  // Start view on current date or near upcoming Dec 2026
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 1)); // Oct 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-12-22');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToDec2026 = () => {
    setCurrentDate(new Date(2026, 11, 1)); // December 2026
    setSelectedDateStr('2026-12-22');
  };

  // Compute calendar days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const daysArray: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const dateStr = prevMonthDate.toISOString().split('T')[0];
    daysArray.push({ day: d, isCurrentMonth: false, dateStr });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysArray.push({ day: d, isCurrentMonth: true, dateStr });
  }

  // Next month padding to fill 35 or 42 cells
  const remainingCells = 42 - daysArray.length;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    const dateStr = nextMonthDate.toISOString().split('T')[0];
    daysArray.push({ day: d, isCurrentMonth: false, dateStr });
  }

  // Get alarms for a specific date
  const getAlarmsForDate = (dateStr: string) => {
    return alarms.filter((a) => {
      if (a.targetDate === dateStr) return true;
      // Handle yearly recurrence (same month and day)
      if (a.recurrence === 'yearly') {
        const [, m1, d1] = a.targetDate.split('-');
        const [, m2, d2] = dateStr.split('-');
        return m1 === m2 && d1 === d2;
      }
      return false;
    });
  };

  const selectedDateAlarms = getAlarmsForDate(selectedDateStr);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6">
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Interactive Alarm Calendar
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Click on any date to inspect scheduled alarms or create a new date-specific wake-up chime.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-rose-50 border border-rose-200/80 rounded-xl transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={goToDec2026}
            className="px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
          >
            Dec 2026 (BFF Bday)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monthly Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-rose-200/80 shadow-xs">
          {/* Month & Nav Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-rose-100">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 text-xs font-semibold text-slate-400">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {daysArray.map((cell, idx) => {
              const dateAlarms = getAlarmsForDate(cell.dateStr);
              const isSelected = selectedDateStr === cell.dateStr;
              const isBffDay = cell.dateStr === '2026-12-22';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[72px] sm:min-h-[84px] p-1.5 rounded-2xl flex flex-col justify-between text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'ring-2 ring-rose-500 bg-rose-50/70 shadow-xs'
                      : cell.isCurrentMonth
                      ? 'hover:bg-rose-50/40 bg-white/60'
                      : 'text-slate-300 bg-slate-50/40 opacity-40 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-medium rounded-full w-6 h-6 flex items-center justify-center tabular-nums ${
                        isSelected
                          ? 'bg-rose-500 text-white font-bold'
                          : isBffDay
                          ? 'bg-pink-100 text-pink-700 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {cell.day}
                    </span>
                    {isBffDay && <span className="text-xs">🎂</span>}
                  </div>

                  {/* Alarm Indicators */}
                  <div className="space-y-1 w-full overflow-hidden">
                    {dateAlarms.slice(0, 2).map((a) => (
                      <div
                        key={a.id}
                        className="truncate text-[10px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1 bg-rose-100/80 text-rose-800"
                        title={`${a.title} (${formatTime12(a.targetTime)})`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span className="truncate">{a.title}</span>
                      </div>
                    ))}
                    {dateAlarms.length > 2 && (
                      <span className="text-[9px] text-slate-500 pl-1">
                        +{dateAlarms.length - 2} more
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Date Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-rose-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div>
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
                  Selected Date
                </span>
                <h4 className="text-lg font-bold text-slate-900 font-display">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => onOpenNewAlarm({ targetDate: selectedDateStr })}
                className="p-2 text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-2xs cursor-pointer"
                title="Add alarm for this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of alarms on selected date */}
            <div className="mt-4 space-y-3">
              {selectedDateAlarms.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-rose-300 stroke-[1.5]" />
                  <p className="text-xs font-medium text-slate-600">No alarms set for this day</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click + to schedule an alarm</p>
                  <button
                    onClick={() => onOpenNewAlarm({ targetDate: selectedDateStr })}
                    className="mt-3 px-3 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  >
                    + Add Date Alarm
                  </button>
                </div>
              ) : (
                selectedDateAlarms.map((alarm) => {
                  const cat = CATEGORY_CONFIG[alarm.category] || CATEGORY_CONFIG.general;
                  return (
                    <div
                      key={alarm.id}
                      className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{alarm.title}</span>
                        <span className="text-xs font-mono font-semibold text-rose-600 tabular-nums">
                          {formatTime12(alarm.targetTime)}
                        </span>
                      </div>
                      {alarm.note && (
                        <p className="text-xs text-slate-600 italic">"{alarm.note}"</p>
                      )}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                        <button
                          onClick={() => onTriggerAlarmPreview(alarm)}
                          className="text-[11px] text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Bell className="w-3 h-3" />
                          <span>Test Ring</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
