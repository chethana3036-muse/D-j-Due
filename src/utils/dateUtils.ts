import { DateAlarm } from '../types/alarm';

export interface TimeRemaining {
  isPast: boolean;
  isToday: boolean;
  isExpired: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formattedCountdown: string;
}

export function isAlarmExpired(alarm: DateAlarm, now: Date = new Date()): boolean {
  if (!alarm.recurrenceEndDate) return false;
  const [endYear, endMonth, endDay] = alarm.recurrenceEndDate.split('-').map(Number);
  const endDateTime = new Date(endYear, endMonth - 1, endDay, 23, 59, 59);
  return now.getTime() > endDateTime.getTime();
}

export function parseTargetDateTime(alarm: DateAlarm, now: Date = new Date()): Date {
  const [year, month, day] = alarm.targetDate.split('-').map(Number);
  const [hour, minute] = alarm.targetTime.split(':').map(Number);

  const baseTarget = new Date(year, month - 1, day, hour, minute, 0, 0);

  if (alarm.recurrence === 'once') {
    return baseTarget;
  }

  if (alarm.recurrence === 'daily') {
    const todayTarget = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
    if (todayTarget.getTime() < now.getTime()) {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hour, minute, 0, 0);
    }
    return todayTarget;
  }

  if (alarm.recurrence === 'weekly') {
    const activeDays = (alarm.repeatDays && alarm.repeatDays.length > 0)
      ? alarm.repeatDays
      : [baseTarget.getDay()];

    for (let offset = 0; offset <= 7; offset++) {
      const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, minute, 0, 0);
      if (activeDays.includes(candidate.getDay()) && candidate.getTime() > now.getTime()) {
        return candidate;
      }
    }
    return baseTarget;
  }

  if (alarm.recurrence === 'yearly') {
    const currentYearTarget = new Date(now.getFullYear(), month - 1, day, hour, minute, 0, 0);
    if (currentYearTarget.getTime() < now.getTime()) {
      return new Date(now.getFullYear() + 1, month - 1, day, hour, minute, 0, 0);
    }
    return currentYearTarget;
  }

  if (alarm.recurrence === 'monthly') {
    const currentMonthTarget = new Date(now.getFullYear(), now.getMonth(), day, hour, minute, 0, 0);
    if (currentMonthTarget.getTime() < now.getTime()) {
      return new Date(now.getFullYear(), now.getMonth() + 1, day, hour, minute, 0, 0);
    }
    return currentMonthTarget;
  }

  return baseTarget;
}

export function calculateTimeRemaining(alarm: DateAlarm, now: Date = new Date()): TimeRemaining {
  if (isAlarmExpired(alarm, now)) {
    return {
      isPast: true,
      isToday: false,
      isExpired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: -1,
      formattedCountdown: 'Recurrence Expired',
    };
  }

  // Check if snoozed
  if (alarm.snoozedUntil && alarm.snoozedUntil > now.getTime()) {
    const diff = alarm.snoozedUntil - now.getTime();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return {
      isPast: false,
      isToday: true,
      isExpired: false,
      days: 0,
      hours: 0,
      minutes,
      seconds,
      totalSeconds,
      formattedCountdown: `Snoozed (${minutes}m ${seconds}s)`,
    };
  }

  const target = parseTargetDateTime(alarm, now);
  const diffMs = target.getTime() - now.getTime();
  const isPast = diffMs < 0;
  const totalSeconds = Math.max(0, Math.floor(Math.abs(diffMs) / 1000));

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const isToday =
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate();

  let formattedCountdown = '';
  if (isPast) {
    formattedCountdown = 'Passed';
  } else if (days > 0) {
    formattedCountdown = `${days}d ${hours}h left`;
  } else if (hours > 0) {
    formattedCountdown = `${hours}h ${minutes}m left`;
  } else {
    formattedCountdown = `${minutes}m ${seconds}s left`;
  }

  return {
    isPast,
    isToday,
    isExpired: false,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: diffMs,
    formattedCountdown,
  };
}

export function formatFriendlyDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatTime12(timeStr: string): string {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  } catch {
    return timeStr;
  }
}
