import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Copy, Check, Gift, Calendar, Plus, Clock } from 'lucide-react';
import { DateAlarm } from '../types/alarm';
import { formatFriendlyDate } from '../utils/dateUtils';
import confetti from 'canvas-confetti';

interface BFFCelebrationHubProps {
  bffAlarm?: DateAlarm;
  onOpenNewAlarm: (prefill?: Partial<DateAlarm>) => void;
  bffCozyImgSrc?: string;
  birthdayImgSrc?: string;
}

export const BFFCelebrationHub: React.FC<BFFCelebrationHubProps> = ({
  bffAlarm,
  onOpenNewAlarm,
  bffCozyImgSrc,
  birthdayImgSrc,
}) => {
  const [friendName, setFriendName] = useState('Chloe');
  const [vibe, setVibe] = useState('sweet & loving');
  const [wishes, setWishes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Target date default: 2026-12-22
  const targetDateStr = bffAlarm?.targetDate || '2026-12-22';

  // Compute days remaining
  const today = new Date('2026-10-22');
  const targetDate = new Date(targetDateStr);
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const handleCelebrateConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FB7185', '#F472B6', '#FDE047', '#FDA4AF', '#F43F5E'],
    });
  };

  const handleGenerateWishes = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/friendship-wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendName, vibe, occasion: 'Birthday' }),
      });
      const data = await res.json();
      if (data.wishes && Array.isArray(data.wishes)) {
        setWishes(data.wishes);
      }
    } catch (err) {
      console.error('Failed to generate wishes:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Generate initial wishes
    handleGenerateWishes();
  }, []);

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const milestoneChecklist = [
    { title: '100 Days Out', desc: 'Brainstorm gift wishlist and secret celebration ideas 🎈', done: true },
    { title: '30 Days Out', desc: 'Order custom birthday cake and reserve cozy café 🍰', done: true },
    { title: '1 Week Out', desc: 'Gather Polaroid photos, print memory album and sweet cards 💌', done: false },
    { title: 'Night Before', desc: 'Verify Déjà Due alarm so you are first to call at midnight! ⏰', done: false },
    { title: 'Day of Celebration (Dec 22)', desc: 'Shower her with warm hugs, birthday songs, and endless love! 🎀', done: false },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Celebration Showcase */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-rose-100 via-pink-50 to-peach-100 border border-rose-200/80 p-6 sm:p-8 lg:p-10 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text & Countdown */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 bg-white/80 border border-rose-200/60 rounded-full px-3 py-1 w-fit shadow-2xs">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>Best Friend Celebration Headquarters</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-display">
              BFF's Birthday Alarm: <br />
              <span className="text-rose-600">22nd Dec 2026 🎂</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 max-w-lg leading-relaxed">
              Never worry about forgetting your best friend's big day. Déjà Due will ring with a gentle,
              warm chime right on time so you can be the very first person to wish her!
            </p>

            {/* Countdown Metric Box */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-rose-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Countdown to BFF's Birthday
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {daysRemaining} <span className="text-lg font-normal text-rose-600">days to go</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Target: {formatFriendlyDate(targetDateStr)} · Yearly Recurrence Enabled
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCelebrateConfetti}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Throw Confetti</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onOpenNewAlarm({
                      title: "BFF's Birthday! 🎂",
                      targetDate: '2026-12-22',
                      targetTime: '08:30',
                      category: 'bff_birthday',
                      recurrence: 'yearly',
                      note: 'Call BFF first thing in the morning with strawberry cake!',
                    })
                  }
                  className="px-4 py-2 text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Update Alarm</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Image Art Card */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-md border-2 border-white aspect-4/3 group">
              {bffCozyImgSrc ? (
                <img
                  src={bffCozyImgSrc}
                  alt="Best Friends Celebrating"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-rose-200 to-pink-100 flex items-center justify-center text-4xl">
                  👯‍♀️
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
                <p className="text-white text-xs font-medium drop-shadow-sm">
                  "Side by side or miles apart, real friends are always close to the heart." 🌸
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Section: AI Birthday Wishes & Milestone Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Wishes Studio (7 cols) */}
        <div className="lg:col-span-7 bg-white/95 rounded-3xl p-6 border border-rose-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                AI Sweet Birthday Wishes Generator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personalized, heartfelt messages crafted with Gemini AI to send to your bestie.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-rose-500" />
          </div>

          {/* Inputs for Custom Wish */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bestie's Name or Nickname
              </label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="e.g. Chloe, Sarah, Mia..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 bg-rose-50/30 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Celebration Vibe
              </label>
              <select
                value={vibe}
                onChange={(e) => setVibe(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-rose-200 bg-rose-50/30 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="sweet & loving">Sweet & Heartfelt 💖</option>
                <option value="funny & chaotic besties">Funny & Silly 😂</option>
                <option value="aesthetic & poetic">Aesthetic & Poetic ✨</option>
                <option value="hype & party girl">Hype & Celebration 🎉</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateWishes}
            disabled={isGenerating}
            className="w-full py-2.5 px-4 text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isGenerating ? (
              <span>Generating Heartwarming Wishes...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate New Wishes with Gemini AI</span>
              </>
            )}
          </button>

          {/* Generated Wishes List */}
          <div className="space-y-3 pt-2">
            {wishes.map((wish, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100/80 relative group hover:border-rose-200 transition-colors"
              >
                <p className="text-xs text-slate-700 leading-relaxed pr-10">"{wish}"</p>
                <button
                  onClick={() => copyToClipboard(wish, idx)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white shadow-2xs hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-colors cursor-pointer"
                  title="Copy wish"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Milestone Checklist (5 cols) */}
        <div className="lg:col-span-5 bg-white/95 rounded-3xl p-6 border border-rose-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                Celebration Roadmap
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Countdown timeline computed by Python engine
              </p>
            </div>
            <Gift className="w-5 h-5 text-rose-500" />
          </div>

          <div className="space-y-3">
            {milestoneChecklist.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50/40 border border-rose-100/70"
              >
                <div className="mt-0.5 w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold shrink-0">
                  {idx + 1}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{item.title}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Birthday Cake Mini Spotlight */}
          {birthdayImgSrc && (
            <div className="mt-4 rounded-2xl overflow-hidden border border-rose-100 shadow-2xs">
              <img
                src={birthdayImgSrc}
                alt="Birthday Cake"
                className="w-full h-32 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
