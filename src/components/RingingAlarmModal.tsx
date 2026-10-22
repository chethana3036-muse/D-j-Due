import React, { useEffect, useState } from 'react';
import {
  Bell,
  Heart,
  Sparkles,
  Volume2,
  Clock,
  Coffee,
  Smile,
  CheckCircle2,
  HelpCircle,
  Brain,
} from 'lucide-react';
import { DateAlarm } from '../types/alarm';
import { cuteAudioSynth } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface RingingAlarmModalProps {
  alarm: DateAlarm | null;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  mascotImgSrc?: string;
}

export const RingingAlarmModal: React.FC<RingingAlarmModalProps> = ({
  alarm,
  onDismiss,
  onSnooze,
  mascotImgSrc,
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeQuestion, setChallengeQuestion] = useState('');
  const [challengeHint, setChallengeHint] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluatingAnswer, setEvaluatingAnswer] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!alarm) return;

    // Start audio ringtone loop
    const stopAudio = cuteAudioSynth.startAlarmRingtone(alarm.soundTheme);

    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Prepare challenge question if alarm has one, or default
    if (alarm.smartSnoozeChallenge?.question) {
      setChallengeQuestion(alarm.smartSnoozeChallenge.question);
      setChallengeHint('Answer thoughtfully to unlock your bonus rest');
    } else {
      fetchChallengeQuestion(alarm.smartSnoozeChallenge?.challengeType || 'riddle');
    }

    setShowChallenge(false);
    setUserAnswer('');
    setChallengeFeedback(null);

    return () => {
      stopAudio();
      clearInterval(interval);
    };
  }, [alarm]);

  const fetchChallengeQuestion = async (type: string) => {
    try {
      const res = await fetch('/api/ai/snooze-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeType: type, alarmTitle: alarm?.title }),
      });
      const data = await res.json();
      if (data.question) {
        setChallengeQuestion(data.question);
        setChallengeHint(data.hint || '');
      }
    } catch (e) {
      setChallengeQuestion('What is one sweet thing you look forward to today? 🌸');
      setChallengeHint('Smile and type anything lovely');
    }
  };

  if (!alarm) return null;

  const handleDismissWithCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#FB7185', '#F472B6', '#FBBF24', '#F43F5E', '#A855F7'],
    });
    cuteAudioSynth.stopAlarm();
    onDismiss();
  };

  const handleQuickSnooze = (mins: number) => {
    cuteAudioSynth.stopAlarm();
    onSnooze(mins);
  };

  const handleVerifyChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setEvaluatingAnswer(true);
    try {
      const res = await fetch('/api/ai/evaluate-snooze-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswer,
          question: challengeQuestion,
        }),
      });
      const data = await res.json();
      setChallengeFeedback(data.feedbackMessage);

      // Grant snooze after short celebration
      setTimeout(() => {
        cuteAudioSynth.stopAlarm();
        onSnooze(data.snoozeMinutesGranted || 10);
      }, 1500);
    } catch (err) {
      cuteAudioSynth.stopAlarm();
      onSnooze(10);
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      {/* Pulsing Aura Rings */}
      <div className="absolute w-[460px] h-[460px] rounded-full bg-rose-500/20 blur-3xl animate-pulse pointer-events-none" />

      <div className="relative w-full max-w-lg bg-gradient-to-b from-white via-rose-50/60 to-peach-50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 border-rose-200 overflow-hidden space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Mascot Avatar with Ring Animation */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24">
          <div className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping opacity-75" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-rose-400 to-pink-300 p-1 shadow-lg shadow-rose-300/50 overflow-hidden">
            {mascotImgSrc ? (
              <img
                src={mascotImgSrc}
                alt="Déjà Due Mascot"
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-rose-100 flex items-center justify-center text-3xl">
                🌸
              </div>
            )}
          </div>
        </div>

        {/* Live Ringing Time */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/90 text-rose-700 text-xs font-semibold animate-pulse">
            <Volume2 className="w-3.5 h-3.5" />
            <span>DATE ALARM RINGING NOW</span>
          </div>
          <div className="mt-1 text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight tabular-nums">
            {currentTimeStr || alarm.targetTime}
          </div>
          <div className="text-xs text-slate-500 font-medium">
            {alarm.targetDate} {alarm.recurrence !== 'once' && `· Repeating (${alarm.recurrence})`}
          </div>
        </div>

        {/* Alarm Title & Cheerful Personalized Message */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
            {alarm.title}
          </h2>

          <div className="p-3.5 rounded-2xl bg-white/95 border border-rose-200/80 shadow-xs text-xs text-slate-700 space-y-2">
            <p className="font-semibold text-rose-700 text-sm leading-relaxed">
              {alarm.aiPersonalizedMessage || alarm.cuteGreeting || 'Time to wake up for this special day! 🌸✨'}
            </p>
            {alarm.note && (
              <p className="text-slate-600 italic border-t border-rose-50 pt-1.5">
                "{alarm.note}"
              </p>
            )}
          </div>
        </div>

        {/* Smart Snooze Presets Section */}
        <div className="p-3.5 rounded-2xl bg-white/80 border border-rose-100 space-y-2 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Smart Snooze Presets:</span>
            </span>
            <button
              type="button"
              onClick={() => setShowChallenge(!showChallenge)}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <Brain className="w-3 h-3" />
              <span>{showChallenge ? 'Hide AI Question' : '✨ AI Brain Question (+10m)'}</span>
            </button>
          </div>

          {/* Preset Buttons Grid */}
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSnooze(5)}
              className="py-2 px-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-all border border-rose-100 shadow-2xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
            >
              <span>☕ 5 min</span>
              <span className="text-[9px] font-normal text-rose-500">Quick Sip</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSnooze(10)}
              className="py-2 px-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-all border border-rose-100 shadow-2xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
            >
              <span>🌸 10 min</span>
              <span className="text-[9px] font-normal text-rose-500">Stretch</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSnooze(15)}
              className="py-2 px-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-all border border-rose-100 shadow-2xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
            >
              <span>🛌 15 min</span>
              <span className="text-[9px] font-normal text-rose-500">Snuggle</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickSnooze(20)}
              className="py-2 px-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition-all border border-rose-100 shadow-2xs flex flex-col items-center justify-center cursor-pointer active:scale-95"
            >
              <span>☁️ 20 min</span>
              <span className="text-[9px] font-normal text-rose-500">Dreamland</span>
            </button>
          </div>

          {/* AI Question Snooze Challenge Expansion */}
          {showChallenge && (
            <form onSubmit={handleVerifyChallenge} className="mt-3 pt-3 border-t border-rose-100 space-y-2">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    {challengeQuestion || 'What is one sweet thing you are grateful for today? 🌸'}
                  </div>
                  {challengeHint && (
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Hint: {challengeHint}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white rounded-xl border border-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-400 text-slate-800"
                />
                <button
                  type="submit"
                  disabled={evaluatingAnswer || !userAnswer.trim()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {evaluatingAnswer ? 'Checking...' : 'Earn +10m Snooze'}
                </button>
              </div>

              {challengeFeedback && (
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{challengeFeedback}</span>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Primary Action Button: Wake Up & Celebrate! */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleDismissWithCelebration}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-bold transition-all shadow-md shadow-rose-300/50 cursor-pointer active:scale-98 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Wake Up & Celebrate! 💖</span>
          </button>
        </div>
      </div>
    </div>
  );
};
