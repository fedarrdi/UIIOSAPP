import React, { useEffect, useState, useRef, Component } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Activity, Calendar, X, Check, ChevronDown, ChevronUp, MessageSquare, Settings } from 'lucide-react';
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
  const getOpacity = (count: number) => {
    if (!count) return 0.1;
    if (count <= 2) return 0.3;
    if (count <= 5) return 0.6;
    return 1;
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
          }} className="w-2.5 h-2.5 rounded-full bg-white transition-colors duration-300" style={{
            opacity: getOpacity(count)
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

        <button onClick={onConfirm} className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 mt-auto">
          <Check className="w-5 h-5" />
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
export function CounterPage() {
  // --- State ---
  const [todayCount, setTodayCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [history, setHistory] = useState<DailyHistory>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(10);
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
    const savedHistory = JSON.parse(localStorage.getItem('social-tracker-history') || '{}');
    const savedTotal = parseInt(localStorage.getItem('social-tracker-total') || '0');
    const savedGoal = parseInt(localStorage.getItem('social-tracker-daily-goal') || '10');
    const lastDate = localStorage.getItem('social-tracker-last-date');
    const today = getTodayString();
    setHistory(savedHistory);
    setTotalCount(savedTotal);
    setDailyGoal(savedGoal);
    // Reset today count if it's a new day
    if (lastDate === today) {
      const savedToday = parseInt(localStorage.getItem('social-tracker-today') || '0');
      setTodayCount(savedToday);
    } else {
      setTodayCount(0);
      localStorage.setItem('social-tracker-last-date', today);
    }
    setIsLoaded(true);
  }, []);
  useEffect(() => {
    if (!isLoaded) return;
    // Save to localStorage
    localStorage.setItem('social-tracker-history', JSON.stringify(history));
    localStorage.setItem('social-tracker-total', totalCount.toString());
    localStorage.setItem('social-tracker-today', todayCount.toString());
    localStorage.setItem('social-tracker-daily-goal', dailyGoal.toString());
    localStorage.setItem('social-tracker-last-date', getTodayString());
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
  return <main className="min-h-screen w-full bg-[#0a0a0a] text-white p-6 pb-40 font-sans selection:bg-white/20">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <header className="flex justify-between items-center py-4">
          <h1 className="text-3xl font-bold tracking-tight">Social Tracker</h1>
          <button
            onClick={() => setOpenModal('settings')}
            className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center hover:border-[#3a3a3a] hover:bg-[#2a2a2a] transition-colors cursor-pointer"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5 text-neutral-400" />
          </button>
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
                <circle cx="48" cy="48" r="40" stroke="white" strokeWidth="4" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - Math.min(todayCount, dailyGoal) / dailyGoal * 251.2} className="transition-all duration-1000 ease-out" />
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
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-white/30" />
              <div className="w-2 h-2 rounded-full bg-white/60" />
              <div className="w-2 h-2 rounded-full bg-white" />
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
                    <circle cx="96" cy="96" r="80" stroke="white" strokeWidth="8" fill="transparent" strokeDasharray={502.4} strokeDashoffset={502.4 - Math.min(todayCount, dailyGoal) / dailyGoal * 502.4} className="transition-all duration-1000 ease-out" />
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
                <DotMatrix history={history} />
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

              <div className="bg-[#2a2a2a]/30 rounded-2xl p-6 border border-[#2a2a2a]">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium">Intensity Legend</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/10" />
                    <span className="text-xs text-neutral-500">None</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/30" />
                    <span className="text-xs text-neutral-500">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/60" />
                    <span className="text-xs text-neutral-500">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white" />
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
                          className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                            dailyGoal === preset
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
    </main>;
}