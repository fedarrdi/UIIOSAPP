import React, { useEffect, useState, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Activity, Calendar, X, Check, ChevronDown, ChevronUp, MessageSquare, Settings, Flame, Trophy } from 'lucide-react';
import { PhoneMockup } from '../components/PhoneMockup';
// --- Types ---
type NoteEntry = {
  quality: number;
  note: string;
  timestamp: string; // ISO string
};
// Supports legacy formats and new format
// v1: number
// v2: { count: number, qualities: number[] }
// v3: { count: number, entries: NoteEntry[] }
type DailyDataV2 = {
  count: number;
  qualities: number[];
};
type DailyDataV3 = {
  count: number;
  entries: NoteEntry[];
};
type DailyHistoryValue = number | DailyDataV2 | DailyDataV3;
type DailyHistory = Record<string, DailyHistoryValue>;
// --- Helper Functions ---
const getTodayString = () => new Date().toISOString().split('T')[0];
const getPastDates = (days: number) => {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};
const getCount = (data: DailyHistoryValue | undefined): number => {
  if (typeof data === 'number') return data;
  if (!data) return 0;
  if ('entries' in data) return data.count;
  if ('count' in data) return data.count;
  return 0;
};
const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};
const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric'
  });
};
const QUALITY_LABELS = {
  1: {
    emoji: '😞',
    text: 'Poor'
  },
  2: {
    emoji: '😐',
    text: 'Okay'
  },
  3: {
    emoji: '🙂',
    text: 'Good'
  },
  4: {
    emoji: '😊',
    text: 'Great'
  },
  5: {
    emoji: '🤩',
    text: 'Amazing'
  }
};

const calculateStreaks = (history: DailyHistory) => {
  const dates = Object.keys(history).sort();
  if (dates.length === 0) return { current: 0, longest: 0 };

  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Calculate Longest Streak
  let maxStreak = 0;
  let currentRun = 0;
  let lastDate: Date | null = null;

  dates.forEach(dateStr => {
    const count = getCount(history[dateStr]);
    if (count > 0) {
      const currentDate = new Date(dateStr);
      if (lastDate) {
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentRun++;
        } else {
          currentRun = 1;
        }
      } else {
        currentRun = 1;
      }
      lastDate = currentDate;
      maxStreak = Math.max(maxStreak, currentRun);
    }
  });

  // Calculate Current Streak
  let currentStreak = 0;
  let checkDate = new Date(); // Start from today

  // Check today first
  const todayStr = checkDate.toISOString().split('T')[0];
  if (getCount(history[todayStr]) > 0) {
    currentStreak++;
  } else {
    // If no activity today, check if streak ended yesterday
    // If yesterday has no activity, streak is 0 (unless we want to be lenient and say streak is maintained until end of today)
    // Common logic: Streak is alive if you did it today OR yesterday. 
    // If you haven't done it today yet, your streak from yesterday is still "active" pending today's action.
    // Let's count backwards from yesterday if today is 0.
  }

  // Robust backward check
  // We need to find the most recent active day. If it's today or yesterday, the streak is alive.
  // If the most recent active day was 2 days ago, streak is broken (0).

  // Simplified approach for "Current Streak":
  // Count consecutive days going backwards from Today.
  // If Today is 0, we allow the streak to continue from Yesterday.

  let streak = 0;
  let d = new Date();
  let missAllowed = true; // Allow today to be missed if we are just checking status

  // Check today
  if (getCount(history[d.toISOString().split('T')[0]]) > 0) {
    streak++;
    missAllowed = false; // We found today, so we continue backwards strictly
  }

  // Go backwards
  while (true) {
    d.setDate(d.getDate() - 1);
    const dStr = d.toISOString().split('T')[0];
    if (getCount(history[dStr]) > 0) {
      streak++;
      missAllowed = false;
    } else {
      if (missAllowed) {
        missAllowed = false; // Used up our "today is empty" allowance
        continue; // Check yesterday
      }
      break;
    }
  }

  // Edge case: If today is 0 and yesterday is 0, streak is 0. 
  // The loop handles this: today(0) -> missAllowed=false -> continue -> yesterday(0) -> break. Streak=0.
  // If today(0) -> yesterday(1) -> streak=1. Correct.

  return { current: streak, longest: maxStreak };
};

const generateMockData = (): DailyHistory => {
  const history: DailyHistory = {};
  const today = new Date();

  // Generate 150 days of data (approx 5 months)
  for (let i = 0; i < 150; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    let shouldHaveActivity = false;

    // Current streak of 7 days (Day 0 to 6)
    if (i < 7) {
      shouldHaveActivity = true;
    }
    // Break the streak at day 7 to ensure it's exactly 7 days
    else if (i === 7) {
      shouldHaveActivity = false;
    }
    // Random activity for the rest of the month (Day 8+)
    else {
      shouldHaveActivity = Math.random() > 0.2; // 80% chance of activity to look "used"
    }

    if (shouldHaveActivity) {
      const count = Math.floor(Math.random() * 10) + 2; // 2 to 12 interactions

      // Create some entries for v3 data
      const entries: NoteEntry[] = [];
      for (let j = 0; j < count; j++) {
        if (Math.random() > 0.7) { // 30% chance of a note
          entries.push({
            quality: Math.floor(Math.random() * 5) + 1,
            note: "Mock interaction note",
            timestamp: new Date(d.getTime() + j * 3600000).toISOString()
          });
        }
      }

      history[dateStr] = {
        count,
        entries
      };
    }
  }
  return history;
};
// --- Components ---
const WidgetModal = ({
  children,
  onClose
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    {/* Backdrop */}
    <motion.div
      initial={{ backdropFilter: 'blur(0px)' }}
      animate={{ backdropFilter: 'blur(12px)' }}
      exit={{ backdropFilter: 'blur(0px)' }}
      className="absolute inset-0 bg-black/70"
      onClick={onClose}
    />

    {/* Modal Content */}
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#2a2a2a] transition-colors"
      >
        <X className="w-5 h-5 text-neutral-400" />
      </button>
      {children}
    </motion.div>
  </motion.div>;
};

const Card = ({
  children,
  className = '',
  delay = 0,
  onClick
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}) => <motion.div
  initial={{
    opacity: 0,
    y: 20
  }}
  animate={{
    opacity: 1,
    y: 0
  }}
  transition={{
    duration: 0.5,
    delay,
    ease: 'easeOut'
  }}
  onClick={onClick}
  className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 relative overflow-hidden ${onClick ? 'cursor-pointer hover:border-[#3a3a3a] transition-colors' : ''} ${className}`}
>
    {children}
  </motion.div>;
const NumberTicker = ({
  value
}: {
  value: number;
}) => {
  return <motion.span key={value} initial={{
    y: 10,
    opacity: 0
  }} animate={{
    y: 0,
    opacity: 1
  }} className="inline-block">
    {value}
  </motion.span>;
};
const MonthMatrix = ({
  year,
  month,
  history
}: {
  year: number;
  month: number;
  history: DailyHistory;
}) => {
  // Get number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Adjust for Monday start (optional, but standard for these graphs)
  // Let's stick to Sunday = 0 for simplicity or match standard
  // If we want Monday = 0: (day + 6) % 7

  // We need to build weeks.
  // Grid: 7 rows (days), N columns (weeks)
  const weeks: (string | null)[][] = [];
  let currentWeek: (string | null)[] = Array(7).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay(); // 0-6 (Sun-Sat)

    // Fill the date
    const dateStr = date.toISOString().split('T')[0];
    currentWeek[dayOfWeek] = dateStr;

    // If Saturday, push week and start new
    if (dayOfWeek === 6 || d === daysInMonth) {
      // If it's the last day but not Saturday, we still push the partial week
      // But we need to make sure we don't push the same week reference twice if logic is loose
      // With this loop, we just push at end of week
    }
  }

  // Re-do loop to be cleaner for "Columns of Weeks"
  // We want an array of Weeks, where each Week is an array of 7 Days (or null)

  const matrix: (string | null)[][] = [];
  let week: (string | null)[] = Array(7).fill(null);

  // Fill initial empty days if first day is not Sunday
  // Actually, the loop 1..daysInMonth is better.

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayIndex = date.getDay(); // 0 (Sun) to 6 (Sat)
    const dateStr = date.toISOString().split('T')[0];

    week[dayIndex] = dateStr;

    if (dayIndex === 6 || d === daysInMonth) {
      matrix.push([...week]); // Push copy
      week = Array(7).fill(null); // Reset
    }
  }

  const getColor = (count: number) => {
    if (!count) return '#2a2a2a';
    if (count <= 2) return '#065f46'; // emerald-800
    if (count <= 5) return '#10b981'; // emerald-500
    return '#34d399'; // emerald-400
  };

  return (
    <div className="flex gap-2">
      {matrix.map((weekData, wIndex) => (
        <div key={wIndex} className="flex flex-col gap-2">
          {weekData.map((dateStr, dIndex) => {
            const count = dateStr ? getCount(history[dateStr]) : 0;
            return (
              <div
                key={dIndex}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${!dateStr ? 'opacity-0' : ''}`}
                style={{
                  backgroundColor: dateStr ? getColor(count) : 'transparent'
                }}
                title={dateStr ? `${dateStr}: ${count}` : ''}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const MonthlyHistory = ({ history }: { history: DailyHistory }) => {
  // 1. Identify range of months
  // Get all dates
  const dates = Object.keys(history).map(d => new Date(d));
  if (dates.length === 0) return <div className="text-neutral-500 text-center py-4">No history yet</div>;

  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(); // Always show up to today

  const months = [];
  const d = new Date(maxDate);
  d.setDate(1); // Start at beginning of current month

  // Go back until minDate
  while (d >= minDate || (d.getMonth() === minDate.getMonth() && d.getFullYear() === minDate.getFullYear())) {
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: d.toLocaleDateString('default', { month: 'long', year: 'numeric' })
    });
    d.setMonth(d.getMonth() - 1);
  }

  // Ensure we have at least one month (current) if history is empty/weird
  if (months.length === 0) {
    const now = new Date();
    months.push({
      year: now.getFullYear(),
      month: now.getMonth(),
      label: now.toLocaleDateString('default', { month: 'long', year: 'numeric' })
    });
  }

  return (
    <div className="w-full overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-8 min-w-max">
        {months.map((m) => (
          <div key={`${m.year}-${m.month}`} className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-neutral-400 sticky left-0">
              {m.label}
            </h3>
            <MonthMatrix year={m.year} month={m.month} history={history} />
          </div>
        ))}
      </div>
    </div>
  );
};

const DotMatrix = ({
  history
}: {
  history: DailyHistory;
}) => {
  const weeks = 13;
  const days = 7;
  const totalDays = weeks * days;
  const dates = getPastDates(totalDays);
  const grid = Array.from({
    length: weeks
  }, (_, wIndex) => {
    return Array.from({
      length: days
    }, (_, dIndex) => {
      const dateIndex = wIndex * days + dIndex;
      if (dateIndex >= dates.length) return null;
      return dates[dateIndex];
    });
  });
  const getColor = (count: number) => {
    if (!count) return '#2a2a2a';
    if (count <= 2) return '#065f46'; // emerald-800
    if (count <= 5) return '#10b981'; // emerald-500
    return '#34d399'; // emerald-400
  };
  return <div className="w-full overflow-x-auto">
    <div className="flex justify-between mb-4 text-xs text-neutral-500 font-medium px-1">
      <span>3 months ago</span>
      <span>Today</span>
    </div>
    <div className="flex gap-2 justify-between min-w-max">
      {grid.map((week, wIndex) => <div key={wIndex} className="flex flex-col gap-2">
        {week.map((date, dIndex) => {
          if (!date) return null;
          const count = getCount(history[date]);
          return <motion.div key={date} initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            delay: wIndex * 0.05 + dIndex * 0.01
          }} className="w-2.5 h-2.5 rounded-full transition-colors duration-300" style={{
            backgroundColor: getColor(count)
          }} title={`${date}: ${count} conversations`} />;
        })}
      </div>)}
    </div>
  </div>;
};
const QualitySlider = ({
  value,
  onChange,
  note,
  onNoteChange,
  onConfirm,
  onCancel
}: {
  value: number;
  onChange: (val: number) => void;
  note: string;
  onNoteChange: (val: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return <motion.div initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} exit={{
    opacity: 0
  }} className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4">
    {/* Backdrop */}
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

    {/* Modal */}
    <motion.div initial={{
      y: '100%'
    }} animate={{
      y: 0
    }} exit={{
      y: '100%'
    }} transition={{
      type: 'spring',
      damping: 25,
      stiffness: 300
    }} className="bg-[#1a1a1a] border border-[#2a2a2a] w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl flex flex-col max-h-[90vh]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">How did it go?</h3>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-[#2a2a2a] transition-colors">
          <X className="w-5 h-5 text-neutral-400" />
        </button>
      </div>

      <div className="overflow-y-auto flex-1 -mx-6 px-6 pb-4">
        {/* Current Selection Display */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-2 transition-all duration-200 transform scale-100">
            {QUALITY_LABELS[value as keyof typeof QUALITY_LABELS].emoji}
          </div>
          <div className="text-lg font-medium text-neutral-300">
            {QUALITY_LABELS[value as keyof typeof QUALITY_LABELS].text}
          </div>
        </div>

        {/* Custom Slider */}
        <div className="relative h-12 mb-8 flex items-center justify-center">
          <div className="absolute inset-x-0 h-2 bg-[#2a2a2a] rounded-full" />
          <input type="range" min="1" max="5" step="1" value={value} onChange={e => onChange(parseInt(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer z-20" />
          {/* Visual Track Indicators */}
          <div className="absolute inset-x-0 flex justify-between px-1 pointer-events-none">
            {[1, 2, 3, 4, 5].map(step => <div key={step} className={`w-2 h-2 rounded-full transition-colors duration-200 ${step <= value ? 'bg-white' : 'bg-[#333]'}`} />)}
          </div>
          {/* Thumb */}
          <motion.div className="absolute h-8 w-8 bg-white rounded-full shadow-lg pointer-events-none z-10" animate={{
            left: `calc(${(value - 1) / 4 * 100}% - 16px)`
          }} transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }} />
        </div>

        {/* Note Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-400 mb-2">
            Add a note <span className="text-neutral-600">(optional)</span>
          </label>
          <div className="relative">
            <textarea value={note} onChange={e => onNoteChange(e.target.value.slice(0, 200))} placeholder="What did you talk about?" className="w-full bg-[#2a2a2a] text-white rounded-xl p-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-neutral-600" />
            <div className="absolute bottom-3 right-3 text-xs text-neutral-500">
              {note.length}/200
            </div>
          </div>
        </div>
      </div>

      <button onClick={onConfirm} className="w-full py-3 bg-white text-black rounded-xl font-semibold text-base hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-auto">
        <Check className="w-4 h-4" />
        Log Interaction
      </button>
    </motion.div>
  </motion.div>;
};
const NotesWidget = ({
  history,
  onClick
}: {
  history: DailyHistory;
  onClick: () => void;
}) => {
  // Flatten and sort notes
  const allNotes = Object.entries(history).flatMap(([date, data]) => {
    if (typeof data === 'number') return []; // Legacy v1
    if ('qualities' in data) return []; // Legacy v2 (no notes)
    if ('entries' in data) {
      return data.entries.map(entry => ({
        ...entry,
        dateStr: date
      }));
    }
    return [];
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4, ease: 'easeOut' }}
    className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl relative overflow-hidden cursor-pointer transition-colors hover:border-[#3a3a3a] p-4"
    onClick={onClick}
  >
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-base font-medium">Notes History</h2>
        <p className="text-[10px] text-neutral-500">
          {allNotes.length === 0
            ? 'No notes yet'
            : `${allNotes.length} conversation${allNotes.length !== 1 ? 's' : ''}`}
        </p>
      </div>
      <div className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center">
        <MessageSquare className="w-4 h-4 text-neutral-400" />
      </div>
    </div>
  </motion.div>;
};
const GoalCompletionModal = ({
  visible,
  onClose,
  count
}: {
  visible: boolean;
  onClose: () => void;
  count: number;
}) => {
  return <AnimatePresence>
    {visible && <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Distorted Backdrop */}
      <motion.div initial={{
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(0,0,0,0)'
      }} animate={{
        backdropFilter: 'blur(16px)',
        backgroundColor: 'rgba(0,0,0,0.8)'
      }} exit={{
        backdropFilter: 'blur(0px)',
        backgroundColor: 'rgba(0,0,0,0)'
      }} className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <motion.div initial={{
        scale: 0.9,
        opacity: 0,
        y: 20
      }} animate={{
        scale: 1,
        opacity: 1,
        y: 0
      }} exit={{
        scale: 0.9,
        opacity: 0,
        y: 20
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 300
      }} className="relative z-10 bg-[#1a1a1a] border border-[#2a2a2a] w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl overflow-hidden">

        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-[#2a2a2a] rounded-full flex items-center justify-center mb-6 border border-[#333] shadow-lg">
            <Trophy className="w-10 h-10 text-emerald-400" />
          </div>

          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">
            Daily Goal Reached!
          </h2>

          <p className="text-neutral-400 mb-8 leading-relaxed">
            You've hit your target of <span className="text-white font-semibold">{count}</span> interactions today. Keep up the momentum!
          </p>

          <button onClick={onClose} className="w-full py-3.5 bg-white text-black rounded-xl font-bold text-base hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-lg shadow-emerald-900/10">
            Awesome
          </button>
        </div>
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
};

// Trophy SVG Components - Line art style inspired by reference image
const TrophySimple = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    {/* Cup body */}
    <path d="M 25 25 L 25 40 Q 25 50, 35 55 L 35 60 L 30 60 L 30 70 L 70 70 L 70 60 L 65 60 L 65 55 Q 75 50, 75 40 L 75 25 Z" />
    {/* Handles */}
    <path d="M 25 30 Q 15 30, 15 40 Q 15 50, 25 50" fill="none" />
    <path d="M 75 30 Q 85 30, 85 40 Q 85 50, 75 50" fill="none" />
    {/* Base */}
    <rect x="25" y="70" width="50" height="5" />
  </svg>
);

const TrophyMedium = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    {/* Cup with more detail */}
    <path d="M 20 20 L 20 35 Q 20 48, 32 53 L 32 60 L 28 60 L 28 72 L 72 72 L 72 60 L 68 60 L 68 53 Q 80 48, 80 35 L 80 20 Z" />
    {/* Decorative handles */}
    <path d="M 20 25 Q 10 25, 8 35 Q 8 45, 20 48" fill="none" />
    <path d="M 80 25 Q 90 25, 92 35 Q 92 45, 80 48" fill="none" />
    {/* Star on cup */}
    <path d="M 50 30 L 52 38 L 60 38 L 54 42 L 56 50 L 50 45 L 44 50 L 46 42 L 40 38 L 48 38 Z" />
    {/* Pedestal base */}
    <rect x="28" y="72" width="44" height="4" />
    <rect x="25" y="76" width="50" height="6" />
  </svg>
);

const TrophyLarge = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    {/* Larger ornate cup */}
    <path d="M 18 18 L 18 32 Q 18 46, 30 52 L 30 58 L 26 58 L 26 70 L 74 70 L 74 58 L 70 58 L 70 52 Q 82 46, 82 32 L 82 18 Z" />
    {/* Ornate handles with curves */}
    <path d="M 18 22 Q 6 22, 5 33 Q 5 44, 18 46" fill="none" strokeWidth="2" />
    <path d="M 82 22 Q 94 22, 95 33 Q 95 44, 82 46" fill="none" strokeWidth="2" />
    {/* Laurel wreath left */}
    <path d="M 15 30 Q 12 35, 15 40 M 13 32 Q 10 35, 13 38" fill="none" strokeWidth="1.5" />
    {/* Laurel wreath right */}
    <path d="M 85 30 Q 88 35, 85 40 M 87 32 Q 90 35, 87 38" fill="none" strokeWidth="1.5" />
    {/* Star with detail */}
    <path d="M 50 28 L 53 37 L 62 37 L 55 42 L 58 51 L 50 46 L 42 51 L 45 42 L 38 37 L 47 37 Z" fill="currentColor" opacity="0.2" />
    <path d="M 50 28 L 53 37 L 62 37 L 55 42 L 58 51 L 50 46 L 42 51 L 45 42 L 38 37 L 47 37 Z" fill="none" />
    {/* Multi-tier pedestal */}
    <rect x="26" y="70" width="48" height="3" />
    <rect x="22" y="73" width="56" height="5" />
    <rect x="20" y="78" width="60" height="6" />
  </svg>
);

const TrophyEpic = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
    {/* Grand ornate cup */}
    <path d="M 15 15 L 15 30 Q 15 45, 28 51 L 28 56 L 24 56 L 24 68 L 76 68 L 76 56 L 72 56 L 72 51 Q 85 45, 85 30 L 85 15 Z" />
    {/* Very ornate handles */}
    <path d="M 15 18 Q 3 18, 2 30 Q 2 42, 15 45" fill="none" strokeWidth="2.2" />
    <path d="M 85 18 Q 97 18, 98 30 Q 98 42, 85 45" fill="none" strokeWidth="2.2" />
    {/* Detailed laurels - left */}
    <path d="M 12 25 Q 8 23, 6 25 M 10 28 Q 6 26, 4 28 M 8 31 Q 4 29, 2 31 M 6 34 Q 3 32, 1 34" fill="none" strokeWidth="1.5" />
    {/* Detailed laurels - right */}
    <path d="M 88 25 Q 92 23, 94 25 M 90 28 Q 94 26, 96 28 M 92 31 Q 96 29, 98 31 M 94 34 Q 97 32, 99 34" fill="none" strokeWidth="1.5" />
    {/* Central star - filled with pattern */}
    <path d="M 50 25 L 54 36 L 65 36 L 56 43 L 60 54 L 50 47 L 40 54 L 44 43 L 35 36 L 46 36 Z" fill="currentColor" opacity="0.3" />
    <path d="M 50 25 L 54 36 L 65 36 L 56 43 L 60 54 L 50 47 L 40 54 L 44 43 L 35 36 L 46 36 Z" fill="none" strokeWidth="1.8" />
    {/* Decorative band on cup */}
    <line x1="20" y1="22" x2="80" y2="22" strokeWidth="1.5" />
    {/* Grand pedestal */}
    <rect x="24" y="68" width="52" height="3" />
    <rect x="20" y="71" width="60" height="4" />
    <rect x="16" y="75" width="68" height="6" />
    <rect x="14" y="81" width="72" height="4" />
    {/* Decorative elements on pedestal */}
    <rect x="32" y="69" width="4" height="2" opacity="0.5" />
    <rect x="48" y="69" width="4" height="2" opacity="0.5" />
    <rect x="64" y="69" width="4" height="2" opacity="0.5" />
  </svg>
);

const TrophyLegendary = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="1.3">
    {/* Massive ornate cup with top star */}
    <path d="M 12 12 L 12 28 Q 12 44, 26 50 L 26 54 L 22 54 L 22 66 L 78 66 L 78 54 L 74 54 L 74 50 Q 88 44, 88 28 L 88 12 Z" />
    {/* Top star ornament */}
    <path d="M 50 5 L 52 10 L 57 10 L 53 13 L 55 18 L 50 15 L 45 18 L 47 13 L 43 10 L 48 10 Z" fill="currentColor" opacity="0.4" />
    <path d="M 50 5 L 52 10 L 57 10 L 53 13 L 55 18 L 50 15 L 45 18 L 47 13 L 43 10 L 48 10 Z" strokeWidth="1.5" />
    {/* Extremely ornate handles */}
    <path d="M 12 15 Q 0 15, -1 28 Q -1 41, 12 44" fill="none" strokeWidth="2.5" />
    <path d="M 88 15 Q 100 15, 101 28 Q 101 41, 88 44" fill="none" strokeWidth="2.5" />
    {/* Full laurel wreaths - left side */}
    <path d="M 10 20 Q 5 18, 3 20 M 8 23 Q 3 21, 1 23 M 6 26 Q 1 24, -1 26 M 4 29 Q 0 27, -2 29 M 2 32 Q -1 30, -3 32 M 1 35 Q -2 33, -4 35" fill="none" strokeWidth="1.3" />
    {/* Full laurel wreaths - right side */}
    <path d="M 90 20 Q 95 18, 97 20 M 92 23 Q 97 21, 99 23 M 94 26 Q 99 24, 101 26 M 96 29 Q 100 27, 102 29 M 98 32 Q 101 30, 103 32 M 99 35 Q 102 33, 104 35" fill="none" strokeWidth="1.3" />
    {/* Multiple stars on cup */}
    <path d="M 50 22 L 54 34 L 66 34 L 56 41 L 60 53 L 50 46 L 40 53 L 44 41 L 34 34 L 46 34 Z" fill="currentColor" opacity="0.4" />
    <path d="M 50 22 L 54 34 L 66 34 L 56 41 L 60 53 L 50 46 L 40 53 L 44 41 L 34 34 L 46 34 Z" strokeWidth="2" />
    {/* Decorative bands */}
    <line x1="16" y1="18" x2="84" y2="18" strokeWidth="1.5" />
    <line x1="18" y1="24" x2="82" y2="24" strokeWidth="1" opacity="0.5" />
    {/* Epic multi-tier pedestal */}
    <rect x="22" y="66" width="56" height="2" />
    <rect x="18" y="68" width="64" height="4" />
    <rect x="14" y="72" width="72" height="5" />
    <rect x="10" y="77" width="80" height="6" />
    <rect x="8" y="83" width="84" height="5" />
    {/* Pedestal decorations */}
    <rect x="26" y="67" width="3" height="1" opacity="0.6" />
    <rect x="38" y="67" width="3" height="1" opacity="0.6" />
    <rect x="50" y="67" width="3" height="1" opacity="0.6" />
    <rect x="62" y="67" width="3" height="1" opacity="0.6" />
    <rect x="74" y="67" width="3" height="1" opacity="0.6" />
  </svg>
);

const StreakMilestoneModal = ({
  visible,
  onClose,
  days,
  isNewBest
}: {
  visible: boolean;
  onClose: () => void;
  days: number;
  isNewBest: boolean;
}) => {
  const getMilestoneData = (d: number) => {
    if (isNewBest) return {
      accent: '#FF6B35',
      accentGlow: 'rgba(255, 107, 53, 0.3)',
      TrophyComponent: TrophyEpic,
      title: 'New Record!',
      subtitle: `${d} day streak — your best yet`,
      buttonText: 'Keep it Burning',
      trophySize: 'w-32 h-32',
      showRibbon: true,
      particles: 12
    };
    if (d >= 365) return {
      accent: '#A855F7',
      accentGlow: 'rgba(168, 85, 247, 0.3)',
      TrophyComponent: TrophyLegendary,
      title: 'Legendary!',
      subtitle: '365 days of pure dedication',
      buttonText: 'Unstoppable',
      trophySize: 'w-36 h-36',
      showRibbon: true,
      particles: 16
    };
    if (d >= 180) return {
      accent: '#3B82F6',
      accentGlow: 'rgba(59, 130, 246, 0.3)',
      TrophyComponent: TrophyEpic,
      title: '6 Month Streak!',
      subtitle: 'Half a year of consistency',
      buttonText: 'Amazing',
      trophySize: 'w-32 h-32',
      showRibbon: true,
      particles: 10
    };
    if (d >= 90) return {
      accent: '#FACC15',
      accentGlow: 'rgba(250, 204, 21, 0.3)',
      TrophyComponent: TrophyLarge,
      title: '3 Month Streak!',
      subtitle: '90 days of showing up',
      buttonText: 'Excellent',
      trophySize: 'w-28 h-28',
      showRibbon: false,
      particles: 8
    };
    if (d >= 30) return {
      accent: '#CBD5E1',
      accentGlow: 'rgba(203, 213, 225, 0.3)',
      TrophyComponent: TrophyMedium,
      title: '1 Month Streak!',
      subtitle: '30 consecutive days',
      buttonText: 'Keep Going',
      trophySize: 'w-24 h-24',
      showRibbon: false,
      particles: 6
    };
    if (d >= 7) return {
      accent: '#B45309',
      accentGlow: 'rgba(180, 83, 9, 0.3)',
      TrophyComponent: TrophySimple,
      title: '1 Week Streak!',
      subtitle: '7 days in a row',
      buttonText: 'Nice Work',
      trophySize: 'w-20 h-20',
      showRibbon: false,
      particles: 4
    };
    return {
      accent: '#FFFFFF',
      accentGlow: 'rgba(255, 255, 255, 0.2)',
      TrophyComponent: TrophySimple,
      title: `${d} Day Streak!`,
      subtitle: 'You\'re on fire!',
      buttonText: 'Continue',
      trophySize: 'w-20 h-20',
      showRibbon: false,
      particles: 3
    };
  };

  const data = getMilestoneData(days);
  const TrophyIcon = data.TrophyComponent;

  return <AnimatePresence>
    {visible && <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4"
    >
      {/* Premium Backdrop */}
      <motion.div
        initial={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' }}
        animate={{ backdropFilter: 'blur(16px)', backgroundColor: 'rgba(0,0,0,0.85)' }}
        exit={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(0,0,0,0)' }}
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative z-10 bg-gradient-to-b from-[#1a1a1a] to-[#141414] border border-[#2a2a2a] w-full max-w-[380px] rounded-3xl p-10 text-center shadow-2xl overflow-hidden"
      >
        {/* Ambient Glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] pointer-events-none"
          style={{ backgroundColor: data.accentGlow }}
        />

        {/* Floating Particles */}
        {Array.from({ length: data.particles }).map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: 0,
              scale: 0,
              x: 0,
              y: 0
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: (Math.random() - 0.5) * 200,
              y: -100 - Math.random() * 100
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 2
            }}
            className="absolute top-1/2 left-1/2 w-1 h-1 rounded-full"
            style={{ backgroundColor: data.accent }}
          />
        ))}

        <div className="relative z-10 flex flex-col items-center">
          {/* Trophy Container */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              damping: 12,
              stiffness: 200,
              delay: 0.1
            }}
            className="mb-8 relative"
          >
            {/* Glow effect behind trophy */}
            <div
              className={`absolute inset-0 ${data.trophySize} blur-2xl opacity-50`}
              style={{ backgroundColor: data.accent }}
            />

            <TrophyIcon
              className={`${data.trophySize} relative z-10 drop-shadow-2xl`}
              style={{ color: data.accent }}
            />

            {/* Ribbon decoration for special milestones */}
            {data.showRibbon && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: data.accent, color: '#000' }}
              >
                ★
              </motion.div>
            )}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-3 tracking-tight"
            style={{ color: data.accent }}
          >
            {data.title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-neutral-400 text-base font-medium mb-10 leading-relaxed max-w-[280px]"
          >
            {data.subtitle}
          </motion.p>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            style={{
              backgroundColor: data.accent,
              color: '#000',
              boxShadow: `0 10px 40px ${data.accentGlow}`
            }}
          >
            {data.buttonText}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
};

export function CounterPage() {
  // --- State ---
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [history, setHistory] = useState<DailyHistory>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(10);
  const [streaks, setStreaks] = useState({ current: 0, longest: 0 });
  const [showGoalPopup, setShowGoalPopup] = useState(false);
  // Streak Popup State
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [streakMilestone, setStreakMilestone] = useState(0);
  const [isNewBestStreak, setIsNewBestStreak] = useState(false);
  const isFirstLoad = useRef(true);

  // Modal State
  const [showSlider, setShowSlider] = useState(false);
  const [quality, setQuality] = useState(3);
  const [note, setNote] = useState('');
  // Widget Modal State
  const [openModal, setOpenModal] = useState<'today' | 'lifetime' | 'activity' | 'notes' | 'settings' | null>(null);
  // Long press state
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [contextMenuNote, setContextMenuNote] = useState<string | null>(null);
  // --- Effects ---
  useEffect(() => {
    // Load from localStorage
    const savedTotal = parseInt(localStorage.getItem('social-tracker-total') || '0');
    const savedGoal = parseInt(localStorage.getItem('social-tracker-daily-goal') || '10');
    const lastDate = localStorage.getItem('social-tracker-last-date');
    const today = getTodayString();

    // FORCE MOCK DATA for demo purposes
    // This overrides local storage to show the requested scenario
    const initialHistory = generateMockData();

    setHistory(initialHistory);
    setTotalCount(savedTotal);
    setDailyGoal(savedGoal);
    // Reset today count if it's a new day
    if (lastDate === today) {
      const savedToday = parseInt(localStorage.getItem('social-tracker-today') || '0');
      setTodayCount(savedToday);
    } else {
      // If we generated mock data including today, we should set todayCount from it
      if (initialHistory[today]) {
        setTodayCount(getCount(initialHistory[today]));
      } else {
        setTodayCount(0);
      }
      localStorage.setItem('social-tracker-last-date', today);
    }
    setIsLoaded(true);

    // Check for debug URL params
    const params = new URLSearchParams(window.location.search);
    const debugStreak = params.get('debug_streak');
    const debugNewBest = params.get('debug_new_best');

    if (debugStreak) {
      setTimeout(() => {
        setStreakMilestone(parseInt(debugStreak));
        setIsNewBestStreak(debugNewBest === 'true');
        setShowStreakPopup(true);
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    // Save to localStorage
    localStorage.setItem('social-tracker-history', JSON.stringify(history));
    localStorage.setItem('social-tracker-total', totalCount.toString());
    localStorage.setItem('social-tracker-today', todayCount.toString());
    localStorage.setItem('social-tracker-daily-goal', dailyGoal.toString());
    localStorage.setItem('social-tracker-last-date', getTodayString());

    // Recalculate streaks whenever history changes
    const newStreaks = calculateStreaks(history);
    setStreaks(newStreaks);

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    // Check for milestones (real logic)
    // We only want to show this if the streak INCREASED today (meaning we just did an action)
    // But for simplicity, we can check if current streak matches a milestone and we haven't shown it today?
    // Or just rely on the fact that this effect runs when `history` changes.

    // Milestones: 7, 30, 90, 180, 365
    const milestones = [7, 30, 90, 180, 365];
    if (milestones.includes(newStreaks.current)) {
      // Simple check: if todayCount > 0 (meaning we did something today)
      if (todayCount > 0) {
        setStreakMilestone(newStreaks.current);
        setShowStreakPopup(true);
      }
    }

    // Check for New Best Streak
    // We need to store the previous best to know if we beat it.
    const savedMaxStreak = parseInt(localStorage.getItem('social-tracker-max-streak') || '0');
    if (newStreaks.current > savedMaxStreak && newStreaks.current > 0) {
      localStorage.setItem('social-tracker-max-streak', newStreaks.current.toString());
      setIsNewBestStreak(true);
      setStreakMilestone(newStreaks.current);
      setShowStreakPopup(true);
    } else if (newStreaks.longest > savedMaxStreak) {
      // Sync max streak if we missed it (e.g. from history calc)
      localStorage.setItem('social-tracker-max-streak', newStreaks.longest.toString());
    }

  }, [todayCount, totalCount, history, dailyGoal, isLoaded]);
  // --- Handlers ---
  const handleStartIncrement = () => {
    setQuality(3); // Reset to default "Good"
    setNote(''); // Reset note
    setShowSlider(true);
  };
  const handleConfirmIncrement = () => {
    const today = getTodayString();
    const timestamp = new Date().toISOString();
    const trimmedNote = note.trim();

    setTodayCount(prev => prev + 1);
    setTotalCount(prev => prev + 1);
    setHistory(prev => {
      const currentDayData = prev[today];
      let newCount = 1;
      let newEntries: NoteEntry[] = [];

      // Only create entry if note has content
      const shouldAddEntry = trimmedNote.length > 0;
      const newEntry: NoteEntry | null = shouldAddEntry ? {
        quality,
        note: trimmedNote,
        timestamp
      } : null;

      // Handle different data versions
      if (typeof currentDayData === 'number') {
        // v1: just a number
        newCount = currentDayData + 1;
        newEntries = newEntry ? [newEntry] : [];
      } else if (currentDayData && 'qualities' in currentDayData) {
        // v2: qualities array
        newCount = currentDayData.count + 1;
        newEntries = newEntry ? [newEntry] : [];
      } else if (currentDayData && 'entries' in currentDayData) {
        // v3: entries array
        newCount = currentDayData.count + 1;
        newEntries = newEntry ? [...currentDayData.entries, newEntry] : currentDayData.entries;
      } else {
        // New day
        newEntries = newEntry ? [newEntry] : [];
      }
      return {
        ...prev,
        [today]: {
          count: newCount,
          entries: newEntries
        }
      };
    });

    // Check for goal completion
    // We use todayCount + 1 because state updates are async and we want to catch the transition
    if (todayCount + 1 === dailyGoal) {
      setShowGoalPopup(true);
    }

    setShowSlider(false);
  };

  // --- Long Press Handlers ---
  const handleNotePress = (timestamp: string) => {
    const timer = setTimeout(() => {
      setContextMenuNote(timestamp);
    }, 500); // 500ms hold to show menu
    setLongPressTimer(timer);
  };

  const handleNotePressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleDeleteNote = (timestamp: string) => {
    setHistory(prev => {
      const newHistory = { ...prev };

      // Find and remove the note from the correct day
      for (const [date, data] of Object.entries(newHistory)) {
        if (typeof data === 'number' || 'qualities' in data) continue;
        if ('entries' in data) {
          const noteIndex = data.entries.findIndex(entry => entry.timestamp === timestamp);
          if (noteIndex !== -1) {
            const newEntries = data.entries.filter(entry => entry.timestamp !== timestamp);

            if (newEntries.length === 0) {
              // If no entries left, remove the date entirely
              delete newHistory[date];
            } else {
              newHistory[date] = {
                count: data.count,
                entries: newEntries
              };
            }
            break;
          }
        }
      }

      return newHistory;
    });
    setContextMenuNote(null);
  };

  if (!isLoaded) return null;
  return <PhoneMockup>
  return <main className="h-screen w-full bg-[#0a0a0a] text-white p-6 pb-40 font-sans selection:bg-white/20">
        <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <header className="flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold tracking-tight">Social Tracker</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-1.5 rounded-full">
            <Flame className={`w-4 h-4 ${streaks.current > 0 ? 'text-orange-500 fill-orange-500' : 'text-neutral-600'}`} />
            <span className={`text-sm font-bold ${streaks.current > 0 ? 'text-orange-500' : 'text-neutral-600'}`}>
              {streaks.current}
            </span>
          </div>
          <button
            onClick={() => setOpenModal('settings')}
            className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center hover:border-[#3a3a3a] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </header>

      {/* Top Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today Widget */}
        <Card className="aspect-square flex flex-col justify-between" delay={0.1} onClick={() => setOpenModal('today')}>
          <div className="absolute top-4 right-4">
            <Calendar className="w-4 h-4 text-neutral-600" />
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            {/* Progress Ring Background */}
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="#2a2a2a" strokeWidth="4" fill="transparent" />
              <circle cx="48" cy="48" r="40" stroke={todayCount >= dailyGoal ? '#10b981' : 'white'} strokeWidth="4" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - Math.min(todayCount, dailyGoal) / dailyGoal * 251.2} className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold tracking-tighter">
                <NumberTicker value={todayCount} />
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium">Today</h2>
            <p className="text-xs text-neutral-500">Daily interactions</p>
          </div>
        </Card>

        {/* Total Widget */}
        <Card className="aspect-square flex flex-col justify-between" delay={0.2} onClick={() => setOpenModal('lifetime')}>
          <div className="absolute top-4 right-4">
            <Users className="w-4 h-4 text-neutral-600" />
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="text-5xl font-bold tracking-tighter block">
                <NumberTicker value={totalCount} />
              </span>
              <span className="text-sm text-neutral-500 mt-1 block">
                Total
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-medium">Lifetime</h2>
            <p className="text-xs text-neutral-500">Total conversations</p>
          </div>
        </Card>
      </div>

      {/* History Widget */}
      <Card className="w-full" delay={0.3} onClick={() => setOpenModal('activity')}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium">Activity History</h2>
            <p className="text-xs text-neutral-500">
              Past 90 days performance
            </p>
          </div>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#2a2a2a]" />
            <div className="w-2 h-2 rounded-full bg-[#065f46]" />
            <div className="w-2 h-2 rounded-full bg-[#10b981]" />
            <div className="w-2 h-2 rounded-full bg-[#34d399]" />
          </div>
        </div>

        <DotMatrix history={history} />

        <div className="mt-6 pt-6 border-t border-[#2a2a2a] flex justify-end items-center">
          <div className="text-xl font-bold">
            {Object.keys(history).length}{' '}
            <span className="text-sm font-normal text-neutral-500">
              active days
            </span>
          </div>
        </div>
      </Card>

      {/* Notes History Widget */}
      <NotesWidget history={history} onClick={() => setOpenModal('notes')} />
    </div>

    {/* Floating Action Button */}
    <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <motion.button whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.9
      }} onClick={handleStartIncrement} className="w-16 h-16 bg-[#1a1a1a] border border-[#333] rounded-full flex items-center justify-center text-white shadow-2xl pointer-events-auto group" aria-label="Add interaction">
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>
    </div>

    {/* Quality Slider Modal */}
    <AnimatePresence>
      {showSlider && <QualitySlider value={quality} onChange={setQuality} note={note} onNoteChange={setNote} onConfirm={handleConfirmIncrement} onCancel={() => setShowSlider(false)} />}
    </AnimatePresence>

    {/* Streak Milestone Modal */}
    <StreakMilestoneModal
      visible={showStreakPopup}
      onClose={() => setShowStreakPopup(false)}
      days={streakMilestone}
      isNewBest={isNewBestStreak}
    />

    {/* Goal Completion Modal */}
    <GoalCompletionModal visible={showGoalPopup} onClose={() => setShowGoalPopup(false)} count={dailyGoal} />

    {/* Widget Modals */}
    <AnimatePresence>
      {openModal === 'today' && (
        <WidgetModal onClose={() => setOpenModal(null)}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                <Calendar className="w-6 h-6 text-neutral-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Today's Activity</h2>
                <p className="text-sm text-neutral-500">Your daily progress</p>
              </div>
            </div>

            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="#2a2a2a" strokeWidth="8" fill="transparent" />
                  <circle cx="96" cy="96" r="80" stroke={todayCount >= dailyGoal ? '#10b981' : 'white'} strokeWidth="8" fill="transparent" strokeDasharray={502.4} strokeDashoffset={502.4 - Math.min(todayCount, dailyGoal) / dailyGoal * 502.4} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-7xl font-bold tracking-tighter">
                    {todayCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2a2a2a]/50 rounded-2xl p-6 border border-[#2a2a2a]">
                <div className="text-sm text-neutral-500 mb-2">Goal Progress</div>
                <div className="text-3xl font-bold">{Math.min((todayCount / dailyGoal) * 100, 100).toFixed(0)}%</div>
                <div className="text-xs text-neutral-600 mt-1">Based on {dailyGoal}/day</div>
              </div>
              <div className="bg-[#2a2a2a]/50 rounded-2xl p-6 border border-[#2a2a2a]">
                <div className="text-sm text-neutral-500 mb-2">Remaining</div>
                <div className="text-3xl font-bold">{Math.max(dailyGoal - todayCount, 0)}</div>
                <div className="text-xs text-neutral-600 mt-1">To reach goal</div>
              </div>
            </div>
          </div>
        </WidgetModal>
      )}

      {openModal === 'lifetime' && (
        <WidgetModal onClose={() => setOpenModal(null)}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                <Users className="w-6 h-6 text-neutral-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Lifetime Stats</h2>
                <p className="text-sm text-neutral-500">All-time achievements</p>
              </div>
            </div>

            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-8xl font-bold tracking-tighter mb-4">{totalCount}</div>
                <div className="text-xl text-neutral-500">Total Conversations</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2a2a2a]/50 rounded-2xl p-6 border border-[#2a2a2a]">
                <div className="text-sm text-neutral-500 mb-2">Active Days</div>
                <div className="text-3xl font-bold">{Object.keys(history).length}</div>
                <div className="text-xs text-neutral-600 mt-1">Days tracked</div>
              </div>
              <div className="bg-[#2a2a2a]/50 rounded-2xl p-6 border border-[#2a2a2a]">
                <div className="text-sm text-neutral-500 mb-2">Daily Average</div>
                <div className="text-3xl font-bold">
                  {Object.keys(history).length > 0
                    ? (totalCount / Object.keys(history).length).toFixed(1)
                    : '0'}
                </div>
                <div className="text-xs text-neutral-600 mt-1">Interactions/day</div>
              </div>
            </div>
          </div>
        </WidgetModal>
      )}

      {openModal === 'activity' && (
        <WidgetModal onClose={() => setOpenModal(null)}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                <Activity className="w-6 h-6 text-neutral-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Activity History</h2>
                <p className="text-sm text-neutral-500">90-day overview</p>
              </div>
            </div>

            <div className="bg-[#2a2a2a]/30 rounded-2xl p-6 border border-[#2a2a2a]">
              <MonthlyHistory history={history} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#2a2a2a]/50 rounded-2xl p-4 border border-[#2a2a2a] text-center">
                <div className="text-2xl font-bold">{Object.keys(history).length}</div>
                <div className="text-xs text-neutral-500 mt-1">Active Days</div>
              </div>
              <div className="bg-[#2a2a2a]/50 rounded-2xl p-4 border border-[#2a2a2a] text-center">
                <div className="text-2xl font-bold">
                  {Math.max(...Object.values(history).map(v => getCount(v)), 0)}
                </div>
                <div className="text-xs text-neutral-500 mt-1">Best Day</div>
              </div>
              <div className="bg-[#2a2a2a]/50 rounded-2xl p-4 border border-[#2a2a2a] text-center">
                <div className="text-2xl font-bold">
                  {((Object.keys(history).length / 90) * 100).toFixed(0)}%
                </div>
                <div className="text-xs text-neutral-500 mt-1">Consistency</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#2a2a2a]/50 rounded-2xl p-4 border border-[#2a2a2a] text-center flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  <span className="text-2xl font-bold">{streaks.longest}</span>
                </div>
                <div className="text-xs text-neutral-500">Longest Streak</div>
              </div>
              <div className="bg-[#2a2a2a]/50 rounded-2xl p-4 border border-[#2a2a2a] text-center flex flex-col items-center justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-5 h-5 text-orange-500/50" />
                  <span className="text-2xl font-bold">{streaks.current}</span>
                </div>
                <div className="text-xs text-neutral-500">Current Streak</div>
              </div>
            </div>

            <div className="bg-[#2a2a2a]/30 rounded-2xl p-6 border border-[#2a2a2a]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-medium">Intensity Legend</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#2a2a2a]" />
                  <span className="text-xs text-neutral-500">None</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#065f46]" />
                  <span className="text-xs text-neutral-500">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span className="text-xs text-neutral-500">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#34d399]" />
                  <span className="text-xs text-neutral-500">High</span>
                </div>
              </div>
            </div>
          </div>
        </WidgetModal>
      )}

      {openModal === 'notes' && (
        <WidgetModal onClose={() => setOpenModal(null)}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-neutral-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Notes History</h2>
                <p className="text-sm text-neutral-500">All your conversation notes</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
              {(() => {
                const allNotes = Object.entries(history).flatMap(([date, data]) => {
                  if (typeof data === 'number') return [];
                  if ('qualities' in data) return [];
                  if ('entries' in data) {
                    return data.entries.map(entry => ({
                      ...entry,
                      dateStr: date
                    }));
                  }
                  return [];
                }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                if (allNotes.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="w-16 h-16 rounded-full bg-[#2a2a2a]/50 flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-neutral-600" />
                      </div>
                      <p className="text-neutral-500 text-sm">No notes yet</p>
                      <p className="text-neutral-600 text-xs mt-2">
                        Add notes to your interactions to see them here
                      </p>
                    </div>
                  );
                }

                return allNotes.map((note, index) => (
                  <motion.div
                    key={note.timestamp}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#2a2a2a]/50 rounded-xl p-4 border border-[#2a2a2a] select-none"
                    onMouseDown={() => handleNotePress(note.timestamp)}
                    onMouseUp={handleNotePressEnd}
                    onMouseLeave={handleNotePressEnd}
                    onTouchStart={() => handleNotePress(note.timestamp)}
                    onTouchEnd={handleNotePressEnd}
                    onTouchCancel={handleNotePressEnd}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {QUALITY_LABELS[note.quality as keyof typeof QUALITY_LABELS]?.emoji || '🙂'}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-white">
                            {formatDate(note.timestamp)}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {formatTime(note.timestamp)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-neutral-400 bg-[#2a2a2a] px-2 py-1 rounded-full">
                        {QUALITY_LABELS[note.quality as keyof typeof QUALITY_LABELS]?.text}
                      </span>
                    </div>
                    {note.note && (
                      <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
                        {note.note}
                      </p>
                    )}
                    {!note.note && (
                      <p className="text-xs text-neutral-600 italic">No note added</p>
                    )}
                  </motion.div>
                ));
              })()}
            </div>
          </div>
        </WidgetModal>
      )}

      {/* Context Menu for Note Deletion */}
      {contextMenuNote && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setContextMenuNote(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Menu */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl min-w-[200px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleDeleteNote(contextMenuNote)}
              className="w-full px-6 py-4 text-left text-red-400 hover:bg-[#2a2a2a] transition-colors flex items-center gap-3 font-medium"
            >
              <X className="w-5 h-5" />
              Delete Note
            </button>
          </motion.div>
        </motion.div>
      )}

      {openModal === 'settings' && (
        <WidgetModal onClose={() => setOpenModal(null)}>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                <Settings className="w-6 h-6 text-neutral-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-sm text-neutral-500">Customize your goals</p>
              </div>
            </div>

            <div className="bg-[#2a2a2a]/30 rounded-2xl p-6 border border-[#2a2a2a]">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white block mb-3">
                    Daily Goal
                  </label>
                  <p className="text-xs text-neutral-500 mb-4">
                    Set your target number of daily interactions
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-1">{dailyGoal}</div>
                    <div className="text-xs text-neutral-500">interactions per day</div>
                  </div>

                  <div className="relative">
                    {/* Track background */}
                    <div className="absolute inset-x-0 top-1/2 h-2 bg-[#2a2a2a] rounded-full -translate-y-1/2" />

                    {/* Filled track */}
                    <div
                      className="absolute left-0 top-1/2 h-2 bg-white rounded-full -translate-y-1/2 transition-all duration-200"
                      style={{ width: `${((dailyGoal - 1) / 49) * 100}%` }}
                    />

                    {/* Slider input */}
                    <input
                      type="range"
                      min="1"
                      max="50"
                      step="1"
                      value={dailyGoal}
                      onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                      className="relative w-full h-8 appearance-none bg-transparent cursor-pointer z-10"
                      style={{
                        WebkitAppearance: 'none',
                      }}
                    />

                    {/* Custom thumb styling via style tag would go in a CSS file, but we'll use inline */}
                    <style>{`
                        input[type="range"]::-webkit-slider-thumb {
                          appearance: none;
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: white;
                          cursor: pointer;
                          position: relative;
                          z-index: 10;
                        }
                        input[type="range"]::-moz-range-thumb {
                          width: 20px;
                          height: 20px;
                          border-radius: 50%;
                          background: white;
                          cursor: pointer;
                          border: none;
                        }
                      `}</style>
                  </div>

                  {/* Range labels */}
                  <div className="flex justify-between text-xs text-neutral-600 px-1">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
                  <div className="text-xs text-neutral-500 mb-3">Quick presets:</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setDailyGoal(preset)}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${dailyGoal === preset
                          ? 'bg-white text-black'
                          : 'bg-[#2a2a2a] text-neutral-400 hover:bg-[#3a3a3a]'
                          }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setOpenModal(null)}
                className="px-4 py-2 bg-white text-black rounded-full font-medium text-sm hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </div>
        </WidgetModal>
      )}
    </AnimatePresence>
  </main>
  </PhoneMockup>;
}