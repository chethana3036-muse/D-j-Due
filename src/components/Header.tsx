import React from 'react';
import { Plus, Brain } from 'lucide-react';

interface HeaderProps {
  activeTab: 'alarms' | 'calendar' | 'bff' | 'advisor' | 'python';
  setActiveTab: (tab: 'alarms' | 'calendar' | 'bff' | 'advisor' | 'python') => void;
  onOpenNewAlarm: () => void;
  mascotImgSrc?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewAlarm,
  mascotImgSrc,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-rose-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark with mascot mark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-400 via-pink-400 to-amber-300 p-0.5 shadow-sm shadow-rose-200/50 flex items-center justify-center overflow-hidden">
            {mascotImgSrc ? (
              <img
                src={mascotImgSrc}
                alt="Déjà Due Clock"
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="text-base select-none">🌸</span>
            )}
          </div>
          <button
            onClick={() => setActiveTab('alarms')}
            className="text-xl font-bold tracking-tight text-slate-900 font-display hover:text-rose-600 transition-colors whitespace-nowrap text-left cursor-pointer"
          >
            Déjà Due
          </button>
        </div>

        {/* Zone 2: 5 clean single-line navigation text links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('alarms')}
            className={`whitespace-nowrap pb-1 transition-colors cursor-pointer ${
              activeTab === 'alarms'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Alarms
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`whitespace-nowrap pb-1 transition-colors cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveTab('bff')}
            className={`whitespace-nowrap pb-1 transition-colors cursor-pointer ${
              activeTab === 'bff'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            BFF Hub
          </button>
          <button
            onClick={() => setActiveTab('advisor')}
            className={`whitespace-nowrap pb-1 transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'advisor'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-rose-500" />
            <span>AI Advisor</span>
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`whitespace-nowrap pb-1 transition-colors cursor-pointer ${
              activeTab === 'python'
                ? 'text-rose-600 font-semibold border-b-2 border-rose-500'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Python Studio
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewAlarm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-full shadow-sm shadow-rose-300/40 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set Date Alarm</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-rose-100 bg-rose-50/50 py-2 px-2 text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('alarms')}
          className={`px-2 py-1 rounded-lg shrink-0 ${
            activeTab === 'alarms' ? 'bg-white text-rose-600 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Alarms
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-2 py-1 rounded-lg shrink-0 ${
            activeTab === 'calendar' ? 'bg-white text-rose-600 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('bff')}
          className={`px-2 py-1 rounded-lg shrink-0 ${
            activeTab === 'bff' ? 'bg-white text-rose-600 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          BFF Hub
        </button>
        <button
          onClick={() => setActiveTab('advisor')}
          className={`px-2 py-1 rounded-lg shrink-0 ${
            activeTab === 'advisor' ? 'bg-white text-rose-600 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          AI Advisor
        </button>
        <button
          onClick={() => setActiveTab('python')}
          className={`px-2 py-1 rounded-lg shrink-0 ${
            activeTab === 'python' ? 'bg-white text-rose-600 font-semibold shadow-xs' : 'text-slate-600'
          }`}
        >
          Python
        </button>
      </div>
    </header>
  );
};
