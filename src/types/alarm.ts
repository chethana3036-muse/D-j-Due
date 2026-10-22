export type AlarmCategory =
  | 'bff_birthday'
  | 'romance'
  | 'milestone'
  | 'self_care'
  | 'exam_work'
  | 'travel'
  | 'general';

export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type SoundTheme =
  | 'peach_blossom'
  | 'kawaii_twinkle'
  | 'dreamy_harp'
  | 'sunrise_melody'
  | 'gentle_bell';

export interface SmartSnoozeConfig {
  enabled: boolean;
  challengeType: 'affirmation' | 'riddle' | 'trivia' | 'custom';
  question?: string;
  expectedAnswer?: string;
}

export interface DateAlarm {
  id: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
  targetTime: string; // HH:MM (24h)
  category: AlarmCategory;
  recurrence: RecurrenceType;
  recurrenceEndDate?: string | null; // YYYY-MM-DD or null
  repeatDays?: number[]; // [0=Sun, 1=Mon, ..., 6=Sat] for weekly
  enabled: boolean;
  note: string;
  soundTheme: SoundTheme;
  vibeColor: string;
  cuteGreeting?: string;
  suggestedMission?: string;
  aiPersonalizedMessage?: string; // AI generated encouraging message
  smartSnoozeChallenge?: SmartSnoozeConfig;
  snoozedUntil?: number | null; // timestamp in ms
}

export interface UserSchedulePreferences {
  chronotype: 'early_bird' | 'night_owl' | 'balanced';
  morningBufferMinutes: number; // e.g. 45 min
  encouragementTone: 'gentle_sweet' | 'energetic_hype' | 'mindful_cozy';
  preferredSnoozeDuration: number; // 5, 10, 15, 20
  favoriteMorningRitual: string;
}

export interface SoundOption {
  id: SoundTheme;
  name: string;
  description: string;
  icon: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: 'peach_blossom', name: 'Peach Blossom Chime', description: 'Soft sweet marimba melody', icon: '🌸' },
  { id: 'kawaii_twinkle', name: 'Kawaii Twinkle', description: 'Sparkling celestial glockenspiel', icon: '✨' },
  { id: 'dreamy_harp', name: 'Dreamy Harp', description: 'Gentle cascading acoustic roll', icon: '🎵' },
  { id: 'sunrise_melody', name: 'Sunrise Glow', description: 'Warm uplifting morning triad', icon: '☀️' },
  { id: 'gentle_bell', name: 'Gentle Crystal Bell', description: 'Calm ambient resonance', icon: '🔔' },
];

export const CATEGORY_CONFIG: Record<
  AlarmCategory,
  { label: string; icon: string; bg: string; text: string; border: string; defaultColor: string }
> = {
  bff_birthday: {
    label: "BFF Birthday",
    icon: "🎂",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    defaultColor: "#FB7185",
  },
  romance: {
    label: "Date & Love",
    icon: "💖",
    bg: "bg-pink-50",
    text: "text-pink-700",
    border: "border-pink-200",
    defaultColor: "#F472B6",
  },
  milestone: {
    label: "Milestone",
    icon: "🎉",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    defaultColor: "#F59E0B",
  },
  self_care: {
    label: "Self-Care & Glow",
    icon: "✨",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    defaultColor: "#FB923C",
  },
  exam_work: {
    label: "Exam & Study",
    icon: "📝",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    defaultColor: "#A78BFA",
  },
  travel: {
    label: "Trip & Travel",
    icon: "✈️",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    defaultColor: "#2DD4BF",
  },
  general: {
    label: "General Date",
    icon: "⏰",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    defaultColor: "#94A3B8",
  },
};
