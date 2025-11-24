import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { MapPin, Coffee, Hotel, Car, Plus, ChevronRight, ChevronLeft, X, Utensils, ShoppingBag, Camera, Star, Train, Bike, CheckCircle2, Plane, Globe, Compass, Map, Sun, Moon, Volume2, VolumeX } from 'lucide-react';
// IMPORTING USER LOGO
import logo from './logo.svg';

// --- SOUND CONTEXT & WEB AUDIO ENGINE ---
const SoundContext = createContext();

const SoundProvider = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef(null);

  // Initialize Audio Context on first interaction
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = useCallback((type) => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        // Crisp UI Click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'hover':
        // Very subtle blip
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        gainNode.gain.setValueAtTime(0.02, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;

      case 'pop':
        // Bubbly Pop (Drag Start)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'plop':
        // Lower Pop (Drop)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'switch':
        // Toggle Switch
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      
      case 'success':
        // Major Chord Arpeggio (Generate)
        const notes = [440, 554.37, 659.25]; // A Major
        notes.forEach((freq, i) => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq, now + (i * 0.05));
          gain2.gain.setValueAtTime(0, now + (i * 0.05));
          gain2.gain.linearRampToValueAtTime(0.1, now + (i * 0.05) + 0.02);
          gain2.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.05) + 0.5);
          
          osc2.start(now + (i * 0.05));
          osc2.stop(now + (i * 0.05) + 0.6);
        });
        break;

      default:
        break;
    }
  }, [isMuted]);

  return (
    <SoundContext.Provider value={{ isMuted, setIsMuted, playSound }}>
      {children}
      {/* Floating Mute Button - MOVED TO BOTTOM LEFT */}
      <div className="fixed bottom-6 left-6 z-50">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all group"
        >
          {isMuted ? (
            <VolumeX className="text-red-400 w-6 h-6" />
          ) : (
            <Volume2 className="text-blue-400 w-6 h-6 group-hover:text-blue-300" />
          )}
        </button>
      </div>
    </SoundContext.Provider>
  );
};

// --- THEME CONTEXT ---
const ThemeContext = createContext();

// Global drag state tracker
let currentDragData = { category: null, blockIndex: null };

// Activity categories
const ACTIVITY_CATEGORIES = [
  { 
    id: 'attraction', 
    name: 'Attraction', 
    icon: Camera, 
    color: 'bg-blue-500',
    defaultTitle: 'Visit Local Attraction',
    defaultDuration: 120
  },
  { 
    id: 'food', 
    name: 'Dining', 
    icon: Utensils, 
    color: 'bg-orange-500',
    defaultTitle: 'Meal Time',
    defaultDuration: 60
  },
  { 
    id: 'accommodation', 
    name: 'Hotel Check-in', 
    icon: Hotel, 
    color: 'bg-purple-500',
    defaultTitle: 'Hotel Check-in/Check-out',
    defaultDuration: 30
  },
  { 
    id: 'transport', 
    name: 'Transportation', 
    icon: Car, 
    color: 'bg-green-500',
    defaultTitle: 'Travel Between Locations',
    defaultDuration: 30
  },
  { 
    id: 'shopping', 
    name: 'Shopping', 
    icon: ShoppingBag, 
    color: 'bg-pink-500',
    defaultTitle: 'Shopping & Browsing',
    defaultDuration: 90
  },
];

const HOURS = Array.from({ length: 25 }, (_, i) => i);

// --- REUSABLE COMPONENTS ---

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { playSound } = useContext(SoundContext);

  const handleToggle = () => {
    playSound('switch');
    toggleTheme();
  };

  return (
    <button 
      onClick={handleToggle}
      className={`w-16 h-9 rounded-full p-1 transition-all duration-300 relative shadow-inner ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}
      aria-label="Toggle Theme"
    >
      <div className={`absolute top-1 left-1 w-7 h-7 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}>
        {isDarkMode ? <Moon size={14} className="text-slate-800" /> : <Sun size={14} className="text-slate-400" />}
      </div>
    </button>
  );
};

// --- LANDING PAGE COMPONENT ---
const LandingPage = ({ onStart }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { playSound } = useContext(SoundContext);
  const [isFlushing, setIsFlushing] = useState(false);

  const handleStartClick = () => {
    playSound('success');
    setIsFlushing(true);
    // Wait for animation (800ms) before changing screen
    setTimeout(() => {
        onStart();
    }, 800);
  };

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white selection:bg-blue-500 selection:text-white' : 'bg-blue-600 text-white selection:bg-blue-200 selection:text-blue-900'}`}>
        
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle />
        </div>

        {/* Background Gradients */}
        <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-b from-blue-50 via-blue-200 to-blue-600'}`} />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] rounded-full blur-[150px] animate-pulse duration-[8s] ${
                isDarkMode 
                ? 'bg-blue-600/20' 
                : 'bg-purple-500/50 mix-blend-multiply' 
            }`} />
            
            <div className={`absolute top-[30%] -right-[20%] w-[70vw] h-[70vw] rounded-full blur-[150px] animate-pulse duration-[10s] ${
                isDarkMode 
                ? 'bg-purple-600/10' 
                : 'bg-blue-600/50 mix-blend-multiply'
            }`} />
            
            <div className={`absolute bottom-0 left-[20%] w-[60vw] h-[60vw] rounded-full blur-[150px] animate-pulse duration-[12s] ${
                isDarkMode 
                ? 'bg-indigo-600/10' 
                : 'bg-indigo-500/50 mix-blend-multiply'
            }`} />
            
            {/* Grid Overlay */}
            <div className={`absolute inset-0 bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] ${isDarkMode ? 'bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]'}`} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 h-screen flex flex-col justify-center items-center text-center">
            {/* Floating Icons - UPDATED COLORS TO MATCH GRADIENT */}
            <div className={`absolute top-1/4 left-[15%] backdrop-blur-lg p-4 rounded-2xl border shadow-2xl animate-[bounce_6s_infinite] ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                {/* Map matches the start of the gradient (Fuchsia) */}
                <Map className={`${isDarkMode ? 'text-fuchsia-500' : 'text-fuchsia-600'} w-8 h-8`} />
            </div>
            <div className={`absolute bottom-1/3 right-[15%] backdrop-blur-lg p-4 rounded-2xl border shadow-2xl animate-[bounce_8s_infinite] delay-1000 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                {/* Compass matches the end of the gradient (Blue) */}
                <Compass className={`${isDarkMode ? 'text-blue-500' : 'text-blue-600'} w-8 h-8`} />
            </div>

            {/* LOGO PLACEMENT - UPDATED GLOW FOR LIGHT MODE */}
            <div className="mb-8 relative animate-in fade-in zoom-in duration-700">
                {/* UPDATED: 'bg-purple-600 opacity-40' for Light Mode.
                   This creates a deep, visible glow against the blue background.
                */}
                <div className={`absolute inset-0 blur-xl rounded-full ${isDarkMode ? 'bg-fuchsia-500 opacity-30' : 'bg-purple-600 opacity-40'}`} />
                <img 
                  src={logo} 
                  alt="Tratlus Logo" 
                  className="relative w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-2xl" 
                />
            </div>

            {/* Badge - UPDATED TEXT */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md mb-8 transition-colors cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/20 border-white/30 hover:bg-white/30 shadow-sm'}`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className={`text-xs font-bold tracking-widest uppercase ${isDarkMode ? 'text-slate-300' : 'text-blue-50'}`}>The Travel Atlas</span>
            </div>

            {/* Main Title - Vivid Fuchsia for Dark Mode */}
            <h1 className={`text-7xl md:text-9xl font-black tracking-tighter mb-6 bg-clip-text text-transparent drop-shadow-sm animate-in fade-in zoom-in-95 duration-1000 px-4 pb-4 ${isDarkMode ? 'bg-gradient-to-r from-fuchsia-500 to-blue-500' : 'bg-gradient-to-r from-fuchsia-600 to-blue-600'}`}>
                TRATLUS
            </h1>

            {/* Subtitle */}
            <p className={`text-xl md:text-2xl max-w-2xl mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 ${isDarkMode ? 'text-slate-400' : 'text-blue-100 drop-shadow-md'}`}>
                Architect your perfect journey with our AAA-grade itinerary engine. 
                Drag, drop, and discover the world with precision.
            </p>

            {/* CTA Button */}
            <button 
                onClick={handleStartClick}
                onMouseEnter={() => playSound('hover')}
                className={`group relative px-10 py-5 rounded-full font-black text-lg tracking-wide overflow-hidden transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 ${isDarkMode ? 'bg-white text-slate-950 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]' : 'bg-slate-900 text-white hover:shadow-[0_0_40px_rgba(30,58,138,0.4)]'}`}
            >
                <span className="relative z-10 flex items-center gap-2">
                    START PLANNING <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </span>
                {/* Vivid Fuchsia for Dark Mode */}
                <div 
                  className={`absolute inset-0 transition-transform duration-[800ms] ease-in-out origin-left ${isFlushing ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 group-active:opacity-100'} ${isDarkMode ? 'bg-gradient-to-r from-fuchsia-500 to-blue-500' : 'bg-gradient-to-r from-fuchsia-600 to-blue-600'}`} 
                />
            </button>

            {/* Feature Pills */}
            <div className="mt-16 flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                {['Smart Drag & Drop', 'Real-time Logistics', 'Global Database', 'AI Powered'].map((feat, i) => (
                    <div key={i} className={`px-6 py-3 rounded-xl backdrop-blur-sm text-sm font-bold transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white' : 'bg-white/10 border border-white/20 text-blue-50 hover:bg-white/20 hover:text-white shadow-sm'}`}>
                        {feat}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

// --- APP COMPONENTS ---

const ActivityBlock = ({ category, onDragStart }) => {
  const cat = ACTIVITY_CATEGORIES.find(c => c.id === category);
  const Icon = cat.icon;
  const { playSound } = useContext(SoundContext);
  
  return (
    <div
      draggable
      onDragStart={(e) => {
        playSound('pop');
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(e, category);
      }}
      className={`${cat.color} text-white p-4 rounded-2xl cursor-move hover:scale-[1.02] hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center gap-4 shadow-lg group ring-1 ring-white/20`}
    >
      <div className="bg-white/20 p-2.5 rounded-xl group-hover:bg-white/30 transition-all backdrop-blur-sm">
        <Icon size={22} />
      </div>
      <span className="font-bold tracking-wide text-sm">{cat.name}</span>
    </div>
  );
};

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
};

const CalendarView = ({ selectedDate, onDateSelect, activities }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { playSound } = useContext(SoundContext);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };
  
  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  
  const previousMonth = () => { playSound('click'); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)); };
  const nextMonth = () => { playSound('click'); setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)); };
  const selectDate = (day) => { playSound('click'); onDateSelect(new Date(year, month, day)); };
  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };
  
  const hasActivities = (day) => {
    const dateKey = new Date(year, month, day).toDateString();
    return activities[dateKey] && activities[dateKey].length > 0;
  };
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  return (
    <div className={`backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 border relative overflow-hidden transition-all hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white/40 border-white/40'}`}>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
      
      <div className="flex items-center justify-between mb-8 pt-4">
        <div>
            <h2 className={`text-3xl font-black bg-clip-text text-transparent tracking-tight pb-2 leading-normal ${isDarkMode ? 'bg-gradient-to-r from-white to-slate-400' : 'bg-gradient-to-r from-slate-800 to-slate-600'}`}>Travel Dates</h2>
            <p className={`font-medium text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Pick a day to plan your adventure</p>
        </div>
        <div className={`flex items-center gap-4 p-1.5 rounded-2xl shadow-sm border backdrop-blur-md ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white/60 border-white/50'}`}>
            <button onClick={previousMonth} className={`p-2 rounded-xl transition-all hover:shadow-md active:scale-90 ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-white text-slate-600 hover:text-blue-600'}`}>
            <ChevronLeft size={20} />
            </button>
            <h3 className={`text-lg font-bold min-w-[140px] text-center ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
            {monthNames[month]} {year}
            </h3>
            <button onClick={nextMonth} className={`p-2 rounded-xl transition-all hover:shadow-md active:scale-90 ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-white text-slate-600 hover:text-blue-600'}`}>
            <ChevronRight size={20} />
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-3 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-3">
        {[...Array(startingDayOfWeek)].map((_, i) => <div key={`empty-${i}`} className="w-full" />)}
        
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const today = isToday(day);
          const hasAct = hasActivities(day);
          const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

          let buttonClass = "bg-white/40 hover:bg-white text-slate-600 hover:shadow-lg hover:scale-105 border border-transparent hover:border-white/60";
          if (isDarkMode) {
              buttonClass = "bg-slate-800/40 hover:bg-slate-700 text-slate-300 hover:shadow-lg hover:scale-105 border border-transparent hover:border-slate-600";
          }

          if (isSelected) {
              buttonClass = "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl scale-105 z-10 ring-4 ring-blue-100";
              if (isDarkMode) buttonClass = "bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl scale-105 z-10 ring-4 ring-slate-700";
          } else if (today) {
             buttonClass = "bg-white border-2 border-blue-200 text-blue-600 font-bold shadow-md";
             if (isDarkMode) buttonClass = "bg-slate-800 border-2 border-blue-500 text-blue-400 font-bold shadow-md";
          }

          return (
            <button
              key={day}
              onClick={() => selectDate(day)}
              className={`
                w-full h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 relative group
                ${buttonClass}
              `}
            >
              <span className={`text-sm ${isSelected ? 'font-bold' : 'font-semibold'}`}>{day}</span>
              {hasAct && (
                <div className="flex gap-1 absolute bottom-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-green-500/70'}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const DayView = ({ date, blocks, onDrop, onDeleteBlock, onEditBlock, onBackToCalendar, onUpdateBlock }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { playSound } = useContext(SoundContext);
  const timelineRef = useRef(null);
  const [draggingBlock, setDraggingBlock] = useState(null);
  const [ghostPreview, setGhostPreview] = useState(null);

  const COMPACT_PIXELS_PER_HOUR = 40;
  const SNAP_MINUTES = 30;
  const MAX_MINUTES_IN_DAY = 1440;
  const VERTICAL_CLEARANCE = 10;

  const isInteracting = draggingBlock !== null || ghostPreview !== null;

  const isConflicting = (startTime, duration, excludeIndex = null) => {
    const proposedEnd = startTime + duration;
    return blocks.some((block, idx) => {
      if (excludeIndex !== null && idx === parseInt(excludeIndex)) return false;
      const blockStart = block.startTime;
      const blockEnd = blockStart + block.duration;
      return startTime < blockEnd && proposedEnd > blockStart;
    });
  };

  const handleTimelineDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    const category = currentDragData.category;
    const blockIndex = currentDragData.blockIndex;

    if (!category && blockIndex === null) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top - VERTICAL_CLEARANCE;
    const minutes = Math.round((y / COMPACT_PIXELS_PER_HOUR) * 60 / SNAP_MINUTES) * SNAP_MINUTES;
      
    if (category && blockIndex === null) {
      const cat = ACTIVITY_CATEGORIES.find(c => c.id === category);
      const proposedStartTime = Math.max(0, Math.min(minutes, MAX_MINUTES_IN_DAY - cat.defaultDuration));
      setGhostPreview({ category, startTime: proposedStartTime, duration: cat.defaultDuration, isValid: !isConflicting(proposedStartTime, cat.defaultDuration) });
    } else if (blockIndex !== null) {
      const block = blocks[parseInt(blockIndex)];
      const proposedStartTime = Math.max(0, Math.min(minutes, MAX_MINUTES_IN_DAY - block.duration));
      setGhostPreview({ category: block.category, startTime: proposedStartTime, duration: block.duration, isValid: !isConflicting(proposedStartTime, block.duration, parseInt(blockIndex)) });
    }
  };

  const handleTimelineDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    playSound('plop');
    const category = currentDragData.category;
    const blockIndex = currentDragData.blockIndex;
    
    if (!ghostPreview || ghostPreview.isValid === false) { handleDragEnd(); return; }
    
    if (category && blockIndex === null) {
      const cat = ACTIVITY_CATEGORIES.find(c => c.id === category);
      onDrop({ category, title: cat.defaultTitle, location: '', duration: ghostPreview.duration, notes: '', startTime: ghostPreview.startTime }, date);
    } else if (blockIndex !== null) {
      const block = blocks[parseInt(blockIndex)];
      onUpdateBlock(date, parseInt(blockIndex), { ...block, startTime: ghostPreview.startTime, duration: ghostPreview.duration });
    }
    handleDragEnd();
  };

  const handleDragEnd = () => { setGhostPreview(null); setDraggingBlock(null); currentDragData = { category: null, blockIndex: null }; };
  const handleBlockDragStart = (e, index) => { playSound('pop'); e.dataTransfer.setData('blockIndex', index.toString()); e.dataTransfer.effectAllowed = 'move'; currentDragData = { category: null, blockIndex: index }; setTimeout(() => setDraggingBlock(index), 0); };
  const handleDragLeave = (e) => { if (e.currentTarget.contains(e.relatedTarget)) return; setGhostPreview(null); };
  
  const handleResize = (e, index, direction) => {
    e.preventDefault();
    const startY = e.clientY;
    const block = blocks[index];
    const startDuration = block.duration;
    const startTime = block.startTime;

    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaMinutes = Math.round((deltaY / COMPACT_PIXELS_PER_HOUR) * 60 / SNAP_MINUTES) * SNAP_MINUTES;
      if (direction === 'bottom') {
        const newDuration = Math.max(SNAP_MINUTES, Math.min(startDuration + deltaMinutes, MAX_MINUTES_IN_DAY - startTime));
        onUpdateBlock(date, index, { ...block, duration: newDuration });
      } else if (direction === 'top') {
        const newStartTime = Math.max(0, Math.min(startTime + deltaMinutes, startTime + startDuration - SNAP_MINUTES));
        const newDuration = startDuration + (startTime - newStartTime);
        onUpdateBlock(date, index, { ...block, startTime: newStartTime, duration: newDuration });
      }
    };
    const onMouseUp = () => { document.removeEventListener('mousemove', onMouseMove); document.removeEventListener('mouseup', onMouseUp); };
    document.addEventListener('mousemove', onMouseMove); document.addEventListener('mouseup', onMouseUp);
  };
  
  const CompactTimelineBlock = ({ block, index }) => {
    const cat = ACTIVITY_CATEGORIES.find(c => c.id === block.category);
    const Icon = cat.icon;
    const height = (block.duration / 60) * COMPACT_PIXELS_PER_HOUR;
    const top = (block.startTime / 60) * COMPACT_PIXELS_PER_HOUR + VERTICAL_CLEARANCE; 
    const isBeingDragged = draggingBlock === index;
    
    return (
      <div
        draggable
        onDragStart={(e) => handleBlockDragStart(e, index)}
        style={{ height: `${height - 2}px`, top: `${top + 1}px` }} 
        className={`
          ${cat.color} text-white rounded-xl px-2 shadow-lg transition-all 
          absolute left-1 right-1 group flex flex-col justify-center overflow-hidden
          ring-1 ring-white/20 backdrop-blur-sm
          ${isInteracting ? 'pointer-events-none' : 'cursor-move hover:scale-[1.01] hover:ring-2 hover:ring-white/50 hover:shadow-xl hover:z-10'}
          ${isBeingDragged ? 'opacity-40 scale-95' : 'opacity-100'}
        `}
        onClick={() => { playSound('click'); onEditBlock(date, index); }}
      >
        <div onMouseDown={(e) => { e.stopPropagation(); if (!isInteracting) handleResize(e, index, 'top'); }} className={`absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-20 ${isInteracting ? 'hidden' : ''}`} />
        <div className="flex items-center justify-between relative z-0 w-full px-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="bg-black/10 p-1 rounded-lg flex-shrink-0 backdrop-blur-md"><Icon size={12} className="text-white" /></div>
            <div className="flex-1 min-w-0 flex justify-between items-center pr-1">
              <div className="font-bold text-xs truncate leading-tight drop-shadow-md">{block.title || cat.defaultTitle}</div>
              
              <div className="text-[10px] opacity-90 whitespace-nowrap font-semibold flex-shrink-0 ml-2 tracking-tight">
                {formatTime(block.startTime)} - {formatTime(block.startTime + block.duration)}
              </div>
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); playSound('click'); onDeleteBlock(date, index); }} className={`opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/20 hover:bg-red-500 text-white rounded-md p-1 flex-shrink-0 ml-1 backdrop-blur-md hover:shadow-md hover:scale-110 ${isInteracting ? 'hidden' : ''}`}><X size={12} /></button>
        </div>
        {height > 45 && block.location && <div className="text-[10px] opacity-95 flex items-center gap-1 mt-1 truncate pl-8 font-medium text-blue-50"><MapPin size={9} />{block.location}</div>}
        <div onMouseDown={(e) => { e.stopPropagation(); if (!isInteracting) handleResize(e, index, 'bottom'); }} className={`absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize z-20 ${isInteracting ? 'hidden' : ''}`} />
      </div>
    );
  };
  
  return (
    // UPDATED DAYVIEW SHADOW: significantly stronger light mode shadow (Deep Blue 90%)
    <div className={`backdrop-blur-xl rounded-[2.5rem] p-6 border flex flex-col h-[800px] relative overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/60 border-slate-700 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]' : 'bg-white/40 border-white/40 shadow-sm hover:shadow-[0_30px_80px_-12px_rgba(29,78,216,0.9)]'}`}>
      {/* Gradient inside rounded container */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" />
      
      <div className="flex items-center justify-between mb-6 z-10 pt-4">
        <div>
          <button onClick={() => { playSound('click'); onBackToCalendar(); }} className="text-xs font-extrabold text-slate-500 hover:text-blue-600 mb-1 flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-wider"><ChevronLeft size={14} />Back to Calendar</button>
          <h3 className={`font-black text-3xl tracking-tight pb-1 bg-clip-text ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        </div>
        <div className={`text-right px-5 py-2.5 rounded-2xl border shadow-sm backdrop-blur-md ${isDarkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-white/60 border-white/60'}`}>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Activities</div>
          <div className={`text-2xl font-black leading-none ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{blocks.length}</div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .dark-scrollbar::-webkit-scrollbar { width: 8px; }
        .dark-scrollbar::-webkit-scrollbar-track { background: ${isDarkMode ? '#0f172a' : '#eff6ff'}; }
        .dark-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? 'rgba(255,255,255,0.2)' : '#ffffff'}; border-radius: 4px; }
        .dark-scrollbar::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? 'rgba(255,255,255,0.4)' : '#f8fafc'}; }
      `}} />

      {/* Main Timeline Container */}
      <div className={`flex-1 overflow-y-auto relative dark-scrollbar rounded-3xl border shadow-inner ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-blue-100 bg-blue-50'}`}>
        <div className="flex min-h-full relative" style={{ height: `${(24 * COMPACT_PIXELS_PER_HOUR) + (2 * VERTICAL_CLEARANCE)}px` }}>
            
            <div className={`w-16 flex-shrink-0 relative border-r z-10 ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-blue-200 bg-blue-100/60'}`}>
                {/* UPDATED TIME LABEL COLOR FOR LIGHT MODE (text-slate-900 instead of blue) */}
                {HOURS.map(hour => (<div key={hour} style={{ top: `${(hour * COMPACT_PIXELS_PER_HOUR) + VERTICAL_CLEARANCE}px` }} className="absolute right-0 w-full text-right pr-3"><span className={`text-[10px] font-bold block -translate-y-1/2 ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{hour === 0 || hour === 24 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}</span></div>))}
            </div>

            <div className={`flex-1 relative ${isDarkMode ? 'bg-slate-900' : 'bg-blue-50'}`}>
                <div ref={timelineRef} onDrop={handleTimelineDrop} onDragOver={handleTimelineDragOver} onDragLeave={handleDragLeave} onDragEnd={handleDragEnd} className="absolute inset-0">
                    {HOURS.map(hour => (<div key={`h-${hour}`} style={{ top: `${(hour * COMPACT_PIXELS_PER_HOUR) + VERTICAL_CLEARANCE}px` }} className={`absolute left-0 right-0 border-t w-full ${isDarkMode ? 'border-slate-700/50' : 'border-blue-100'}`} />))}
                    {HOURS.filter(h => h < 24).map(hour => (<div key={`m-${hour}`} style={{ top: `${(hour * COMPACT_PIXELS_PER_HOUR) + (COMPACT_PIXELS_PER_HOUR / 2) + VERTICAL_CLEARANCE}px` }} className={`absolute left-0 right-0 border-t border-dashed ${isDarkMode ? 'border-slate-800/50' : 'border-blue-100/70'}`} />))}
                    
                    {ghostPreview && (() => {
                      const cat = ACTIVITY_CATEGORIES.find(c => c.id === ghostPreview.category);
                      return (<div style={{ height: `${(ghostPreview.duration / 60) * COMPACT_PIXELS_PER_HOUR}px`, top: `${(ghostPreview.startTime / 60) * COMPACT_PIXELS_PER_HOUR + VERTICAL_CLEARANCE}px` }} className={`${ghostPreview.isValid ? cat.color : 'bg-red-500'} absolute left-1 right-1 rounded-xl z-50 flex items-center justify-center opacity-70 ring-2 ring-white border-2 border-dashed border-white/60 pointer-events-none`}> <cat.icon size={24} className="text-white animate-pulse" /></div>);
                    })()}
                    
                    {blocks.length === 0 && !ghostPreview ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none">
                            <div className={`p-8 rounded-full mb-4 shadow-sm backdrop-blur-md animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-white/80'}`}><Plus size={40} className="opacity-40 text-slate-400" /></div>
                            <p className="text-sm font-bold uppercase tracking-wider opacity-60 text-slate-500">Drop activities here</p>
                        </div>
                    ) : (
                        blocks.map((block, idx) => <CompactTimelineBlock key={idx} block={block} index={idx} />)
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const ActivityModal = ({ block, onSave, onClose }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { playSound } = useContext(SoundContext);
  const [formData, setFormData] = useState(block || { title: '', location: '', duration: 60, notes: '', category: 'attraction', startTime: 540 });
  const roundToHalfHour = (num, min = 0) => Math.max(min, Math.ceil(num / 30) * 30);
  const handleBlur = (field) => { if (field === 'duration') setFormData(prev => ({ ...prev, duration: roundToHalfHour(prev.duration, 30) })); else if (field === 'startTime') setFormData(prev => ({ ...prev, startTime: roundToHalfHour(prev.startTime, 0) % 1440 })); };

  // --- THEME VARIABLES FOR MODAL ---
  const modalBg = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const borderCol = isDarkMode ? 'border-slate-700' : 'border-white/20';
  const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDarkMode ? 'bg-slate-800' : 'bg-slate-50';
  const inputRing = isDarkMode ? 'ring-slate-700' : 'ring-slate-200';
  const inputText = isDarkMode ? 'text-slate-200' : 'text-slate-700';
  const closeBtn = isDarkMode ? 'text-slate-500 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className={`${modalBg} rounded-[2rem] shadow-2xl max-w-lg w-full p-8 border ${borderCol} scale-100 transition-all ring-1 ring-black/5 relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="flex items-center justify-between mb-8 pt-2">
            <div>
                <h2 className={`text-2xl font-black ${textPrimary} tracking-tight`}>Edit Activity</h2>
                <p className={`${textSecondary} font-medium text-sm`}>Customize your itinerary details</p>
            </div>
            <button onClick={() => { playSound('click'); onClose(); }} className={`${closeBtn} p-2 rounded-full transition-all`}>
                <X size={24} />
            </button>
        </div>
        <div className="space-y-6">
          <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Activity Name</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={`w-full px-5 py-4 ${inputBg} border-0 ring-1 ${inputRing} rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold ${inputText} placeholder-slate-400 shadow-sm`} placeholder="e.g., Visit Eiffel Tower" />
          </div>
          <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Location</label>
              <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-400" size={20} />
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className={`w-full pl-12 pr-5 py-4 ${inputBg} border-0 ring-1 ${inputRing} rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold ${inputText} shadow-sm`} placeholder="e.g., Paris, France" />
              </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Start Time</label>
                <input type="time" value={`${Math.floor(formData.startTime / 60).toString().padStart(2, '0')}:${(formData.startTime % 60).toString().padStart(2, '0')}`} onChange={(e) => { const [h, m] = e.target.value.split(':').map(Number); setFormData({ ...formData, startTime: h * 60 + m }); }} onBlur={() => handleBlur('startTime')} className={`w-full px-5 py-4 ${inputBg} border-0 ring-1 ${inputRing} rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold ${inputText} shadow-sm`} />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Duration (min)</label>
                <input type="number" value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })} onBlur={() => handleBlur('duration')} className={`w-full px-5 py-4 ${inputBg} border-0 ring-1 ${inputRing} rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-bold ${inputText} shadow-sm`} min="30" step="30" />
            </div>
          </div>
          <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 ml-1">Notes</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className={`w-full px-5 py-4 ${inputBg} border-0 ring-1 ${inputRing} rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium ${inputText} shadow-sm resize-none`} rows="3" placeholder="Add any special notes..." />
          </div>
        </div>
        <div className="flex gap-4 mt-10">
            <button onClick={() => { playSound('click'); onClose(); }} className={`flex-1 px-6 py-4 border-2 ${isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-100 text-slate-600 hover:bg-slate-50'} rounded-2xl transition-all font-bold text-sm uppercase tracking-wide`}>Cancel</button>
            <button onClick={() => { playSound('success'); onSave(formData); }} className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all font-bold text-sm uppercase tracking-wide">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

const FoodPreferencesScreen = ({ onBack, onNext, preferences, setPreferences }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { playSound } = useContext(SoundContext);
  const cuisineTypes = ['Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai', 'French', 'Mediterranean', 'American', 'Korean', 'Vietnamese', 'Greek', 'African'];
  const dietaryRestrictions = ['Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'];

  const toggleCuisine = (c) => { playSound('click'); setPreferences(p => ({ ...p, cuisines: p.cuisines.includes(c) ? p.cuisines.filter(x => x !== c) : [...p.cuisines, c] })); };
  const toggleDietary = (d) => { playSound('click'); setPreferences(p => ({ ...p, dietary: p.dietary.includes(d) ? p.dietary.filter(x => x !== d) : [...p.dietary, d] })); };

  return (
    <div className="max-w-6xl mx-auto">
      <div className={`backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white/40 border-white/40'}`}>
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400" />
        
        <button onClick={() => { playSound('click'); onBack(); }} className={`text-sm font-bold mb-6 flex items-center gap-2 hover:-translate-x-1 transition-all w-fit px-4 py-2 rounded-full shadow-sm pt-4 ${isDarkMode ? 'text-slate-400 hover:text-orange-400 bg-slate-800/50' : 'text-slate-500 hover:text-orange-600 bg-white/50'}`}>
          <ChevronLeft size={16} /> Back to Itinerary
        </button>

        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3 drop-shadow-sm pt-2 pb-3 leading-normal">Culinary Preferences</h2>
          <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Curate your perfect dining experience</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-10">
          {/* Interactive Circles */}
          <div className={`lg:col-span-7 relative rounded-[2rem] p-8 border shadow-inner ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white/30 border-white/40'}`}>
             <div className="flex flex-col lg:flex-row justify-around items-start gap-8 mt-4">
                
                {/* CUISINE WHEEL */}
                <div className="text-center w-full">
                    <h3 className={`font-black mb-6 flex items-center justify-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}><Utensils size={20} className="text-orange-500"/> Favorite Cuisines</h3>
                    <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                        {cuisineTypes.map((cuisine, index) => {
                            const angle = (index / cuisineTypes.length) * 2 * Math.PI - Math.PI / 2;
                            const radius = 100; 
                            const xPct = 50 + (radius / 500 * 100 * 2) * Math.cos(angle);
                            const yPct = 50 + (radius / 500 * 100 * 2) * Math.sin(angle);

                            const cuisineColors = {
                                'Italian': 'from-red-500 to-green-500', 'Chinese': 'from-red-600 to-yellow-500', 'Japanese': 'from-pink-400 to-red-500', 'Mexican': 'from-green-600 to-red-600',
                                'Indian': 'from-orange-500 to-red-600', 'Thai': 'from-green-500 to-yellow-500', 'French': 'from-blue-500 to-red-400', 'Mediterranean': 'from-blue-400 to-yellow-400',
                                'American': 'from-red-500 to-blue-600', 'Korean': 'from-red-500 to-orange-500', 'Vietnamese': 'from-yellow-500 to-green-500', 'Greek': 'from-blue-500 to-white',
                                'African': 'from-orange-600 to-yellow-500'
                            };
                            return (
                                <button key={cuisine} onClick={() => toggleCuisine(cuisine)} style={{ left: `calc(${xPct}% - 1.75rem)`, top: `calc(${yPct}% - 1.75rem)` }}
                                  // SMALLER SIZE: w-14 h-14, text-[9px]
                                  className={`absolute w-14 h-14 rounded-full font-medium text-[9px] transition-all hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer text-white flex items-center justify-center leading-tight ${preferences.cuisines.includes(cuisine) ? `bg-gradient-to-br ${cuisineColors[cuisine]} shadow-lg z-10` : `bg-gradient-to-br ${cuisineColors[cuisine]} opacity-40 shadow-md hover:opacity-70`}`}>
                                  {cuisine}
                                </button>
                            );
                        })}
                    </div>
                </div>
                
                {/* DIETARY WHEEL */}
                <div className="text-center w-full">
                    <h3 className={`font-black mb-6 flex items-center justify-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}><Coffee size={20} className="text-green-500"/> Dietary Restrictions</h3>
                    <div className="relative w-full aspect-square max-w-[380px] mx-auto">
                         {dietaryRestrictions.map((dietary, index) => {
                            let xPct, yPct;
                            if (index === 0) { xPct = 50; yPct = 50; } else {
                                const angle = ((index - 1) / (dietaryRestrictions.length - 1)) * 2 * Math.PI - Math.PI / 2;
                                xPct = 50 + 34 * Math.cos(angle); 
                                yPct = 50 + 34 * Math.sin(angle);
                            }
                            const dietaryColors = {
                                'Vegetarian': 'from-green-500 to-lime-500', 'Vegan': 'from-green-600 to-emerald-600', 'Halal': 'from-teal-500 to-cyan-500',
                                'Kosher': 'from-blue-500 to-indigo-500', 'Gluten-Free': 'from-yellow-500 to-amber-500', 'Dairy-Free': 'from-sky-400 to-blue-400', 'Nut-Free': 'from-orange-400 to-red-400'
                            };
                            return (
                                <button key={dietary} onClick={() => toggleDietary(dietary)} style={{ left: `calc(${xPct}% - 2.5rem)`, top: `calc(${yPct}% - 2.5rem)` }}
                                  className={`absolute w-20 h-20 rounded-full font-medium text-xs transition-all hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer text-white flex items-center justify-center leading-tight ${preferences.dietary.includes(dietary) ? `bg-gradient-to-br ${dietaryColors[dietary]} shadow-lg z-10` : `bg-gradient-to-br ${dietaryColors[dietary]} opacity-40 shadow-md hover:opacity-70`}`}>
                                  {dietary}
                                </button>
                            );
                        })}
                    </div>
                </div>
             </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className={`p-6 rounded-[2rem] shadow-sm border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-white/60'}`}>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">Food Allergies</label>
                <input type="text" value={preferences.allergies} onChange={(e) => setPreferences({ ...preferences, allergies: e.target.value })} className={`w-full px-5 py-4 border-0 ring-1 rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-bold placeholder-slate-300 ${isDarkMode ? 'bg-slate-900 ring-slate-700 text-slate-200' : 'bg-white ring-slate-200 text-slate-700'}`} placeholder="e.g., Peanuts, Shellfish..." />
            </div>

            <div className={`p-6 rounded-[2rem] shadow-sm border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-white/60'}`}>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">Price Range</label>
                <div className="flex gap-3">
                    {[1, 2, 3, 4].map(l => (
                        <button key={l} onClick={() => { playSound('click'); setPreferences({ ...preferences, priceRange: [1, l] }); }} className={`flex-1 h-12 rounded-xl font-black text-lg transition-all duration-200 flex items-center justify-center hover:scale-105 ${l <= preferences.priceRange[1] ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg ring-2 ring-orange-200' : isDarkMode ? 'bg-slate-900 text-slate-500 hover:bg-slate-800' : 'bg-white text-slate-300 hover:bg-slate-50'}`}>{'$'.repeat(l)}</button>
                    ))}
                </div>
            </div>

            {/* UPDATED: Max Distance Label Color to match Daily Budget (white/60) */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-[2rem] shadow-lg text-white relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <label className="block text-xs font-extrabold uppercase tracking-wider text-white/60 mb-2">Max Distance</label>
                <div className="text-5xl font-black mb-4 tracking-tighter">{preferences.maxDistance} <span className="text-2xl font-bold text-orange-100">min</span></div>
                <input type="range" min="5" max="60" step="5" value={preferences.maxDistance} onChange={(e) => setPreferences({ ...preferences, maxDistance: parseInt(e.target.value) })} className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-white hover:accent-orange-100" />
            </div>
          </div>
        </div>

        <div className="flex gap-5">
          <button onClick={() => { playSound('click'); onBack(); }} className={`px-8 py-4 border-2 rounded-2xl transition-all font-bold text-sm uppercase tracking-wide ${isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>Back</button>
          <button onClick={() => { playSound('click'); onNext(); }} className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] active:scale-95 transition-all font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2">Find Places to Stay <ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
};

const AccommodationScreen = ({ onBack, onNext, preferences, setPreferences }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { playSound } = useContext(SoundContext);
  const types = [
    { id: 'hotel', name: 'Hotel', icon: Hotel }, { id: 'hostel', name: 'Hostel', icon: Coffee },
    { id: 'airbnb', name: 'Airbnb', icon: Hotel }, { id: 'resort', name: 'Resort', icon: Star },
    { id: 'vacation', name: 'Rental', icon: Hotel }
  ];
  const amenities = ['WiFi', 'Parking', 'Pool', 'Gym', 'Breakfast', 'AC', 'Kitchen', 'Laundry'];

  const toggleType = (t) => { playSound('click'); setPreferences(p => ({ ...p, types: p.types.includes(t) ? p.types.filter(x => x !== t) : [...p.types, t] })); };
  const toggleAmenity = (a) => { playSound('click'); setPreferences(p => ({ ...p, amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a] })); };

  return (
    <div className="max-w-6xl mx-auto">
        <div className={`backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white/40 border-white/40'}`}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400" />
            
            <button onClick={() => { playSound('click'); onBack(); }} className={`text-sm font-bold mb-6 flex items-center gap-2 hover:-translate-x-1 transition-all w-fit px-4 py-2 rounded-full shadow-sm pt-4 ${isDarkMode ? 'text-slate-400 hover:text-purple-400 bg-slate-800/50' : 'text-slate-500 hover:text-purple-600 bg-white/50'}`}>
                <ChevronLeft size={16} /> Back to Food
            </button>

            <div className="mb-10 text-center">
                <h2 className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 pt-2 pb-3 leading-normal">Where to Stay?</h2>
                <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Find your home away from home</p>
            </div>

            <div className="space-y-8 mb-10">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {types.map(t => {
                        const Icon = t.icon;
                        const isSel = preferences.types.includes(t.id);
                        return (
                            <button key={t.id} onClick={() => toggleType(t.id)} className={`p-4 rounded-3xl transition-all duration-300 text-left relative overflow-hidden group flex flex-col items-center justify-center gap-2 h-32 ${isSel ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-xl scale-[1.02]' : isDarkMode ? 'bg-slate-800/60 hover:bg-slate-700 text-slate-400' : 'bg-white/60 hover:bg-white text-slate-600 hover:shadow-lg hover:-translate-y-1'}`}>
                                <div className={`p-3 rounded-2xl ${isSel ? 'bg-white/20' : isDarkMode ? 'bg-slate-900 group-hover:bg-slate-800' : 'bg-purple-50 group-hover:bg-purple-100'} transition-colors`}><Icon size={28} /></div>
                                <span className="font-bold text-sm">{t.name}</span>
                            </button>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`p-8 rounded-[2rem] shadow-sm border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-white/60'}`}>
                         <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-6">Star Rating</label>
                         <div className="flex justify-between items-center gap-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <button key={s} onClick={() => { playSound('click'); setPreferences({...preferences, minStars: s}); }} className={`flex-1 aspect-square rounded-2xl flex items-center justify-center font-black text-lg transition-all border hover:scale-110 ${preferences.minStars <= s ? 'bg-yellow-400 text-white shadow-lg rotate-3 border-transparent' : isDarkMode ? 'bg-slate-900 text-slate-600 hover:bg-slate-800 border-slate-800' : 'bg-white text-slate-300 hover:bg-slate-50 border-slate-100'}`}>
                                    {s}<span className="text-[10px] ml-0.5 align-top">★</span>
                                </button>
                            ))}
                         </div>
                    </div>

                    {/* UPDATED: Price Range Slider + Label Color (white/60) */}
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-[2rem] shadow-lg text-white relative overflow-hidden group flex flex-col justify-center">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-white/60 mb-2">Price / Night</label>
                         <div className="text-4xl font-black mb-4 tracking-tighter">${preferences.maxPrice}</div>
                        {/* UPDATED SLIDER LOGIC: min=25, step=25, max=1000 */}
                        <input type="range" min="25" max="1000" step="25" value={preferences.maxPrice} onChange={(e) => setPreferences({...preferences, maxPrice: parseInt(e.target.value)})} className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-white hover:accent-purple-100" />
                    </div>
                </div>

                <div className={`p-8 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white/30 border-white/40'}`}>
                     {/* UPDATED: Must-Haves text color to match Star Rating (text-slate-400) */}
                     <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2"><Plus size={14}/> Must-Haves</label>
                     <div className="flex flex-wrap gap-3">
                        {amenities.map(a => {
                            const isSel = preferences.amenities.includes(a);
                            return (
                                <button key={a} onClick={() => toggleAmenity(a)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${isSel ? 'bg-slate-800 text-white shadow-lg scale-105' : isDarkMode ? 'bg-slate-900 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-500 hover:bg-slate-100 shadow-sm hover:shadow'}`}>
                                    {a}
                                </button>
                            );
                        })}
                     </div>
                </div>
            </div>

            <div className="flex gap-5">
                <button onClick={() => { playSound('click'); onBack(); }} className={`px-8 py-4 border-2 rounded-2xl transition-all font-bold text-sm uppercase tracking-wide ${isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>Back</button>
                <button onClick={() => { playSound('click'); onNext(); }} className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.01] active:scale-95 transition-all font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2">Transport Options <ChevronRight size={18} /></button>
            </div>
        </div>
    </div>
  );
};

const TransportationScreen = ({ onBack, onNext, preferences, setPreferences }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { playSound } = useContext(SoundContext);
  const modes = [
    { id: 'rideshare', name: 'Rideshare', icon: Car, desc: 'Uber/Lyft' },
    { id: 'public', name: 'Transit', icon: Train, desc: 'Bus/Metro' },
    { id: 'rental', name: 'Rental', icon: KeyIcon, desc: 'Self-drive' },
    { id: 'flight', name: 'Flight', icon: Plane, desc: 'Inter-city' },
    { id: 'bike', name: 'Bike', icon: Bike, desc: 'Eco-friendly' },
    { id: 'walk', name: 'Walk', icon: MapPin, desc: 'Scenic' },
  ];
  function KeyIcon(props) { return <div {...props} className="border-2 border-current rounded w-5 h-3" /> }
  const toggleMode = (m) => { playSound('click'); setPreferences(p => ({ ...p, modes: p.modes.includes(m) ? p.modes.filter(x => x !== m) : [...p.modes, m] })); };

  return (
    <div className="max-w-6xl mx-auto">
        <div className={`backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border relative overflow-hidden ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white/40 border-white/40'}`}>
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-teal-400 to-cyan-400" />
             
             <button onClick={() => { playSound('click'); onBack(); }} className={`text-sm font-bold mb-6 flex items-center gap-2 hover:-translate-x-1 transition-all w-fit px-4 py-2 rounded-full shadow-sm pt-4 ${isDarkMode ? 'text-slate-400 hover:text-teal-400 bg-slate-800/50' : 'text-slate-500 hover:text-teal-600 bg-white/50'}`}>
                <ChevronLeft size={16} /> Back to Accommodation
            </button>

            <div className="mb-10">
                <h2 className="text-4xl font-black bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-3 pt-2 pb-3 leading-normal">Getting Around</h2>
                <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Select your preferred wheels (or wings)</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {modes.map(m => {
                        const Icon = m.icon;
                        const isSel = preferences.modes.includes(m.id);
                        return (
                            <button key={m.id} onClick={() => toggleMode(m.id)} className={`p-6 rounded-3xl transition-all duration-300 text-left relative overflow-hidden group ${isSel ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-xl scale-[1.02]' : isDarkMode ? 'bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:shadow-lg' : 'bg-white/70 hover:bg-white text-slate-600 hover:shadow-lg'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${isSel ? 'bg-white/20' : isDarkMode ? 'bg-slate-900 group-hover:bg-slate-800' : 'bg-teal-50 group-hover:bg-teal-100'} transition-colors`}><Icon size={24} /></div>
                                    {isSel && <div className="bg-white/20 p-1 rounded-full"><CheckCircle2 size={16} /></div>}
                                </div>
                                <div className="font-bold text-lg">{m.name}</div>
                                <div className={`text-xs font-medium mt-1 ${isSel ? 'text-teal-100' : 'text-slate-400'}`}>{m.desc}</div>
                            </button>
                        );
                    })}
                </div>
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className={`p-6 rounded-[2rem] shadow-sm border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-white/60'}`}>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">Priority</label>
                        <div className="flex flex-col gap-2">
                            {['Speed', 'Cost', 'Comfort'].map(p => {
                                const isSel = preferences.priority === p.toLowerCase();
                                return (
                                    <button key={p} onClick={() => { playSound('click'); setPreferences({...preferences, priority: p.toLowerCase()}); }} className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-between px-6 ${isSel ? 'bg-slate-800 text-white shadow-lg scale-105' : isDarkMode ? 'bg-slate-900 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                                        {p}
                                        {isSel && <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-6 rounded-[2rem] shadow-lg text-white relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        {/* UPDATED: Daily Budget Label Color (white/60) */}
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-white/60 mb-2">Daily Budget</label>
                        <div className="text-5xl font-black mb-4 tracking-tighter">${preferences.budget}</div>
                        <input type="range" min="10" max="200" step="10" value={preferences.budget} onChange={(e) => setPreferences({...preferences, budget: parseInt(e.target.value)})} className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-white hover:accent-teal-100" />
                    </div>
                </div>
            </div>

            <div className="flex gap-5">
                <button onClick={() => { playSound('click'); onBack(); }} className={`px-8 py-4 border-2 rounded-2xl transition-all font-bold text-sm uppercase tracking-wide ${isDarkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:border-slate-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'}`}>Back</button>
                <button onClick={() => { playSound('click'); onNext(); }} className="flex-1 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl hover:shadow-xl hover:shadow-teal-500/30 hover:scale-[1.01] active:scale-95 transition-all font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2">Review Trip <ChevronRight size={18} /></button>
            </div>
        </div>
    </div>
  );
};

const ReviewScreen = ({ onBack, activities, foodPrefs, accommPrefs, transportPrefs }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { playSound } = useContext(SoundContext);
  
  const totalDays = Object.values(activities).filter(dayActivities => dayActivities.length > 0).length;
  const totalActivities = Object.values(activities).reduce((sum, day) => sum + day.length, 0);

  return (
    <div className="max-w-5xl mx-auto">
      {/* BACKGROUND: Kept the Gradient you liked (Blue 100-700). 
         BLOBS: Updated Light Mode to use Teal-300/Fuchsia-300 with mix-blend-overlay for a sharp, distinct neon pop.
      */}
      <div className={`rounded-[3rem] shadow-2xl overflow-hidden relative min-h-[600px] transition-all duration-500 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-blue-100 via-blue-400 to-blue-700 text-white shadow-[0_20px_60px_-15px_rgba(30,58,138,0.5)] border border-blue-300'}`}>
         <div className={`absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none ${isDarkMode ? 'opacity-5' : 'opacity-20 mix-blend-overlay'}`} />
         
         {/* BREATHING BLOBS - Light Mode Update:
            Using Teal-300 and Fuchsia-300 with mix-blend-overlay creates a very distinct "electric" color pop 
            against the blue gradient without being muddy.
         */}
         <div className={`absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse duration-[4s] ${
            isDarkMode 
            ? 'bg-blue-500 opacity-20' 
            : 'bg-teal-300 mix-blend-overlay opacity-100' 
         }`} />

         <div className={`absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full blur-[100px] animate-pulse delay-700 duration-[6s] ${
            isDarkMode 
            ? 'bg-purple-500 opacity-20' 
            : 'bg-fuchsia-300 mix-blend-overlay opacity-100'
         }`} />

         <div className="p-12 relative z-10 pt-16">
            <button onClick={() => { playSound('click'); onBack(); }} className={`text-sm font-bold mb-8 flex items-center gap-2 transition-all w-fit px-4 py-2 rounded-full ${isDarkMode ? 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10' : 'text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 shadow-sm'}`}>
                <ChevronLeft size={16} /> Edit Details
            </button>

            <div className="text-center mb-16">
                {/* LIGHT MODE TEXT UPDATE: New Pink -> Purple -> Blue Gradient for better distinction and less "blobby" look */}
                <h2 className={`text-6xl font-black bg-clip-text text-transparent mb-4 drop-shadow-2xl tracking-tighter pb-3 leading-tight ${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 drop-shadow-sm'}`}>Ready for Takeoff?</h2>
                <p className={`text-xl max-w-lg mx-auto ${isDarkMode ? 'text-slate-400' : 'text-blue-100'}`}>Your personalized itinerary is generated below.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Stat Cards - UPDATED LIGHT MODE TEXT for Contrast & Vibrancy */}
                <div className={`backdrop-blur-md p-8 rounded-[2rem] border text-center transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/15' : 'bg-white/10 border-white/20 shadow-lg hover:bg-white/20'}`}>
                    <div className={`text-5xl font-black mb-2 ${isDarkMode ? 'text-blue-400' : 'bg-clip-text text-transparent bg-gradient-to-b from-pink-600 to-purple-600'}`}>{totalDays}</div>
                    <div className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-blue-100'}`}>Days</div>
                </div>
                <div className={`backdrop-blur-md p-8 rounded-[2rem] border text-center transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/15' : 'bg-white/10 border-white/20 shadow-lg hover:bg-white/20'}`}>
                    <div className={`text-5xl font-black mb-2 ${isDarkMode ? 'text-purple-400' : 'bg-clip-text text-transparent bg-gradient-to-b from-pink-600 to-purple-600'}`}>{totalActivities}</div>
                    <div className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-blue-100'}`}>Activities</div>
                </div>
                <div className={`backdrop-blur-md p-8 rounded-[2rem] border text-center transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-white/10 border-white/10 hover:bg-white/15' : 'bg-white/10 border-white/20 shadow-lg hover:bg-white/20'}`}>
                    <div className={`text-5xl font-black mb-2 ${isDarkMode ? 'text-pink-400' : 'bg-clip-text text-transparent bg-gradient-to-b from-pink-600 to-purple-600'}`}>${transportPrefs.budget + accommPrefs.maxPrice}</div>
                    <div className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-blue-100'}`}>Est. Daily Cost</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {/* Detail Cards */}
                <div className={`p-8 rounded-[2rem] border space-y-6 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white/10 border-white/20 shadow-sm'}`}>
                    <h3 className={`font-bold text-xl flex items-center gap-3 text-white`}><Utensils className="text-orange-400"/> Dining Profile</h3>
                    <div className="flex flex-wrap gap-2">
                        {foodPrefs.cuisines.map(c => <span key={c} className={`px-3 py-1 rounded-lg text-xs font-bold ${isDarkMode ? 'bg-orange-500/20 text-orange-500' : 'bg-white/20 text-white'}`}>{c}</span>)}
                    </div>
                    <div className={`flex justify-between items-end border-t pt-4 ${isDarkMode ? 'border-white/10' : 'border-white/20'}`}>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-blue-200'}`}>Price Range</span>
                        <span className="text-orange-400 font-black text-xl">{'$'.repeat(foodPrefs.priceRange[1])}</span>
                    </div>
                </div>

                <div className={`p-8 rounded-[2rem] border space-y-6 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white/10 border-white/20 shadow-sm'}`}>
                    <h3 className={`font-bold text-xl flex items-center gap-3 text-white`}><Hotel className="text-purple-400"/> Stay & Travel</h3>
                    <div className="flex flex-wrap gap-2">
                        {accommPrefs.types.map(t => <span key={t} className={`px-3 py-1 rounded-lg text-xs font-bold ${isDarkMode ? 'bg-purple-500/20 text-purple-500' : 'bg-white/20 text-white'}`}>{t}</span>)}
                        {transportPrefs.modes.map(t => <span key={t} className={`px-3 py-1 rounded-lg text-xs font-bold ${isDarkMode ? 'bg-teal-500/20 text-teal-500' : 'bg-white/20 text-white'}`}>{t}</span>)}
                    </div>
                    <div className={`flex justify-between items-end border-t pt-4 ${isDarkMode ? 'border-white/10' : 'border-white/20'}`}>
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-500' : 'text-blue-200'}`}>Comfort Level</span>
                        <span className="text-purple-400 font-black text-xl">{accommPrefs.minStars}+ Stars</span>
                    </div>
                </div>
            </div>

            {/* GENERATE ITINERARY BUTTON - FORCED GRADIENT IN ALL MODES */}
            <button 
                onClick={() => playSound('success')}
                className={`w-full py-8 rounded-3xl font-black text-2xl text-white shadow-xl hover:scale-[1.02] active:scale-95 transition-all relative overflow-hidden group shadow-[0_20px_50px_-12px_rgba(124,58,237,0.5)] ${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600'}`}
            >
                <span className="relative z-10 flex items-center justify-center gap-3">GENERATE ITINERARY <span className="text-3xl">✨</span></span>
                {/* UPDATED FLOOD: Using the Pink->Blue gradient for Dark Mode Hover to match light text style */}
                <div className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out ${isDarkMode ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600' : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'}`} />
            </button>
         </div>
      </div>
    </div>
  );
};

const MainApp = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { playSound } = useContext(SoundContext);
  const [showLanding, setShowLanding] = useState(true);
  const [activities, setActivities] = useState({});
  const [editingActivity, setEditingActivity] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([1]);
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [foodPreferences, setFoodPreferences] = useState({ cuisines: [], dietary: [], allergies: '', priceRange: [1, 3], minRating: 3.5, maxDistance: 15, mealsPerDay: 3 });
  const [accommodationPreferences, setAccommodationPreferences] = useState({ types: [], minStars: 3, maxStars: 5, minPrice: 50, maxPrice: 400, amenities: [], maxTravelTime: 20, rooms: 1 });
  const [transportationPreferences, setTransportationPreferences] = useState({ modes: [], priority: 'cost', budget: 50, accessibility: 'none' });

  const handleDragStart = (e, category) => { e.dataTransfer.setData('category', category); currentDragData = { category, blockIndex: null }; };
  const handleDrop = (newActivity, date) => {
    const dateKey = date.toDateString();
    setActivities(prev => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), newActivity] }));
    setEditingActivity({ date: dateKey, index: (activities[dateKey] || []).length, block: newActivity });
  };
  const handleDeleteBlock = (date, index) => { const k = date.toDateString(); setActivities(p => ({ ...p, [k]: p[k].filter((_, i) => i !== index) })); };
  const handleEditBlock = (date, index) => { setEditingActivity({ date: date.toDateString(), index, block: activities[date.toDateString()][index] }); };
  const handleUpdateBlock = (date, index, updated) => { const k = date.toDateString(); setActivities(p => ({ ...p, [k]: p[k].map((b, i) => i === index ? updated : b) })); };
  const handleSaveActivity = (data) => {
    if (editingActivity) setActivities(p => ({ ...p, [editingActivity.date]: p[editingActivity.date].map((b, i) => i === editingActivity.index ? data : b) }));
    setEditingActivity(null);
  };
  
  const goToStep = (s) => { const max = Math.max(...completedSteps, 1); if (s <= max + 1 || s === 1) { playSound('click'); setCurrentStep(s); if (!completedSteps.includes(s)) setCompletedSteps([...completedSteps, s]); } };
  const advanceStep = (n) => { if (!completedSteps.includes(n)) setCompletedSteps([...completedSteps, n]); playSound('success'); setCurrentStep(n); };

  const hasActivities = Object.values(activities).some(dayActs => dayActs.length > 0);

  if (showLanding) {
    return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    // Updated LIGHT MODE gradient to match Landing Page's deeper blue (Blue 50 -> Blue 200 -> Blue 600)
    <div className={`min-h-screen bg-fixed transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`} style={{ background: isDarkMode ? 'linear-gradient(to bottom, #0f172a, #172554)' : 'linear-gradient(to bottom, #eff6ff, #93c5fd, #1d4ed8)' }}>
        {/* Main App Background Blobs - Updated for Light Mode visibility */}
        <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
             <div className={`absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-600/40'}`} />
             <div className={`absolute top-[40%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] ${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-600/40'}`} />
             <div className={`absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full blur-[120px] ${isDarkMode ? 'bg-indigo-900/20' : 'bg-pink-600/40'}`} />
        </div>

      <header className={`sticky top-0 z-50 backdrop-blur-md border-b shadow-sm ${isDarkMode ? 'bg-slate-900/70 border-slate-800' : 'bg-white/70 border-white/50'}`}>
        {/* HEADER LAYOUT FIX: Grid for perfect center alignment */}
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 items-center">
            
            {/* LEFT: Logo - REPLACED MapPin WITH IMAGE, REMOVED CONTAINER */}
            <div className="flex items-center gap-3 justify-start cursor-pointer" onClick={() => goToStep(1)}>
               {/* REPLACED: No Container, just Image */}
               <img src={logo} alt="Tratlus Logo" className="w-10 h-10 object-contain" />
              
              {/* UPDATED HEADER TITLE: Vivid Fuchsia for Dark Mode */}
              <h1 className={`text-2xl font-black bg-clip-text text-transparent tracking-tight ${isDarkMode ? 'bg-gradient-to-r from-fuchsia-500 to-blue-500' : 'bg-gradient-to-r from-fuchsia-600 to-blue-600'}`}>Tratlus</h1>
            </div>
            
            {/* CENTER: Navigation Pills */}
            <div className="flex justify-center">
                <div className={`hidden md:flex items-center gap-1 p-1.5 rounded-full border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100/50 border-white/50'}`}>
                {['Itinerary', 'Food', 'Stay', 'Travel', 'Review'].map((step, i) => {
                    const s = i + 1;
                    const isC = currentStep === s;
                    const isD = completedSteps.includes(s);
                    return (
                    <button key={step} disabled={!isD && !isC} onClick={() => (isD || isC) && goToStep(s)} 
                        className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${isC ? (isDarkMode ? 'bg-slate-700 text-white shadow-md scale-105' : 'bg-white text-slate-800 shadow-md scale-105') : isD ? (isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50') : (isDarkMode ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 cursor-not-allowed')}`}>
                        {step}
                    </button>
                    );
                })}
                </div>
            </div>
            
            {/* RIGHT: Theme Toggle (Anchored to right) */}
            <div className="flex justify-end">
                <ThemeToggle />
            </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {currentStep === 1 && (
          <div className="animate-in slide-in-from-bottom-8 fade-in duration-500">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className={`text-5xl font-black mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Plan Your Journey</h2>
                    <p className={`font-medium text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Drag and drop activities to craft your perfect day.</p>
                </div>
                
                <div className={`transition-all duration-500 ${hasActivities ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  <button onClick={() => advanceStep(2)} className={`px-8 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 ${isDarkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
                    Next Step <ChevronRight size={18}/>
                  </button>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${viewMode === 'day' ? 'lg:grid-cols-4' : ''} gap-8`}>
              {viewMode === 'day' && (
                <div className="lg:col-span-1 animate-in slide-in-from-left-8 duration-500 delay-100">
                  <div className={`backdrop-blur-xl rounded-[2rem] shadow-xl p-6 sticky top-28 border ${isDarkMode ? 'bg-slate-900/60 border-slate-700' : 'bg-white/60 border-white/60'}`}>
                    <h3 className={`font-black text-lg mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}><Plus className="text-blue-500" strokeWidth={3} /> Add Activities</h3>
                    <div className="space-y-3">
                      {ACTIVITY_CATEGORIES.map(cat => <ActivityBlock key={cat.id} category={cat.id} onDragStart={handleDragStart} />)}
                    </div>
                  </div>
                </div>
              )}

              <div className={`${viewMode === 'day' ? 'lg:col-span-3' : 'w-full'} transition-all duration-500`}>
                {viewMode === 'calendar' ? 
                  <CalendarView selectedDate={selectedDate} onDateSelect={(d) => { setSelectedDate(d); setViewMode('day'); }} activities={activities} /> : 
                  <DayView date={selectedDate} blocks={activities[selectedDate.toDateString()] || []} onDrop={handleDrop} onDeleteBlock={handleDeleteBlock} onEditBlock={handleEditBlock} onBackToCalendar={() => setViewMode('calendar')} onUpdateBlock={handleUpdateBlock} />
                }
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && <div className="animate-in zoom-in-95 fade-in duration-500"><FoodPreferencesScreen onBack={() => goToStep(1)} onNext={() => advanceStep(3)} preferences={foodPreferences} setPreferences={setFoodPreferences} /></div>}
        {currentStep === 3 && <div className="animate-in zoom-in-95 fade-in duration-500"><AccommodationScreen onBack={() => goToStep(2)} onNext={() => advanceStep(4)} preferences={accommodationPreferences} setPreferences={setAccommodationPreferences} /></div>}
        {currentStep === 4 && <div className="animate-in zoom-in-95 fade-in duration-500"><TransportationScreen onBack={() => goToStep(3)} onNext={() => advanceStep(5)} preferences={transportationPreferences} setPreferences={setTransportationPreferences} /></div>}
        {currentStep === 5 && <div className="animate-in zoom-in-95 fade-in duration-500"><ReviewScreen onBack={() => goToStep(4)} activities={activities} foodPrefs={foodPreferences} accommPrefs={accommodationPreferences} transportPrefs={transportationPreferences} /></div>}
      </main>

      {editingActivity && <ActivityModal block={editingActivity.block} onSave={handleSaveActivity} onClose={() => setEditingActivity(null)} />}
    </div>
  );
};

export default function Tratlus() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <SoundProvider>
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
        <MainApp />
      </ThemeContext.Provider>
    </SoundProvider>
  );
}