import React, { useState, useRef } from 'react';
import { MapPin, Coffee, Hotel, Car, Plus, ChevronRight, ChevronLeft, X, Utensils, ShoppingBag, Camera, Star } from 'lucide-react';

// Global drag state tracker
let currentDragData = { category: null, blockIndex: null };

// Activity categories with enhanced defaults
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

// UPDATED: Hours now go from 0 to 24 to include the bottom "12 AM"
const HOURS = Array.from({ length: 25 }, (_, i) => i);

const ActivityBlock = ({ category, onDragStart }) => {
  const cat = ACTIVITY_CATEGORIES.find(c => c.id === category);
  const Icon = cat.icon;
  
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(e, category);
      }}
      className={`${cat.color} text-white p-4 rounded-xl cursor-move hover:scale-105 hover:shadow-xl transition-all flex items-center gap-3 shadow-lg group`}
    >
      <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-all">
        <Icon size={20} />
      </div>
      <span className="font-semibold">{cat.name}</span>
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
  
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };
  
  const selectDate = (day) => {
    const selected = new Date(year, month, day);
    onDateSelect(selected);
  };
  
  const isToday = (day) => {
    const today = new Date();
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };
  
  const hasActivities = (day) => {
    const dateKey = new Date(year, month, day).toDateString();
    return activities[dateKey] && activities[dateKey].length > 0;
  };
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">Select Your Travel Dates</h2>
      </div>
      
      <div className="flex items-center justify-between mb-3 bg-gradient-to-r from-blue-50 to-purple-50 p-2 rounded-xl">
        <button
          onClick={previousMonth}
          className="p-1.5 hover:bg-white rounded-lg transition-all"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
        <h3 className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 hover:bg-white rounded-lg transition-all"
        >
          <ChevronRight size={20} className="text-gray-700" />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-bold text-gray-600 py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {[...Array(startingDayOfWeek)].map((_, i) => (
          <div key={`empty-${i}`} className="w-full h-12" />
        ))}
        
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const today = isToday(day);
          const hasAct = hasActivities(day);
          
          return (
            <button
              key={day}
              onClick={() => selectDate(day)}
              className={`w-full h-12 rounded-lg flex flex-col items-center justify-center transition-all relative font-semibold text-sm hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer
                ${today ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-105' : 'hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 text-gray-700'}
                ${hasAct ? 'ring-2 ring-green-400 ring-offset-1' : ''}
              `}
            >
              <span>{day}</span>
              {hasAct && (
                <div className="absolute bottom-1 flex gap-0.5">
                  <span className="w-0.5 h-0.5 bg-green-500 rounded-full" />
                  <span className="w-0.5 h-0.5 bg-green-500 rounded-full" />
                  <span className="w-0.5 h-0.5 bg-green-500 rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-600 bg-gray-50 p-2 rounded-xl">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 border border-green-400 rounded" />
          <span>Has activities</span>
        </div>
      </div>
    </div>
  );
};

const DayView = ({ date, blocks, onDrop, onDeleteBlock, onEditBlock, onBackToCalendar, onUpdateBlock }) => {
  const timelineRef = useRef(null);
  const [draggingBlock, setDraggingBlock] = useState(null);
  const [ghostPreview, setGhostPreview] = useState(null);

  // --- CONSTANTS ---
  const COMPACT_PIXELS_PER_HOUR = 40;
  const SNAP_MINUTES = 30;
  const MAX_MINUTES_IN_DAY = 1440;
  const VERTICAL_CLEARANCE = 10; // Buffer for top/bottom visibility

  // Helper to detect if any interaction is happening
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
    const y = e.clientY - rect.top - VERTICAL_CLEARANCE; // Account for clearance in drag calculation
    const minutes = Math.round((y / COMPACT_PIXELS_PER_HOUR) * 60 / SNAP_MINUTES) * SNAP_MINUTES;
      
    if (category && blockIndex === null) {
      const cat = ACTIVITY_CATEGORIES.find(c => c.id === category);
      const proposedStartTime = Math.max(0, Math.min(minutes, MAX_MINUTES_IN_DAY - cat.defaultDuration));
      
      setGhostPreview({
        category,
        startTime: proposedStartTime,
        duration: cat.defaultDuration,
        isValid: !isConflicting(proposedStartTime, cat.defaultDuration)
      });
    } else if (blockIndex !== null) {
      const block = blocks[parseInt(blockIndex)];
      const proposedStartTime = Math.max(0, Math.min(minutes, MAX_MINUTES_IN_DAY - block.duration));
      
      setGhostPreview({
        category: block.category,
        startTime: proposedStartTime,
        duration: block.duration,
        isValid: !isConflicting(proposedStartTime, block.duration, parseInt(blockIndex))
      });
    }
  };

  const handleTimelineDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const category = currentDragData.category;
    const blockIndex = currentDragData.blockIndex;
    
    if (!ghostPreview || ghostPreview.isValid === false) {
      handleDragEnd();
      return;
    }
    
    const finalStartTime = ghostPreview.startTime;
    const finalDuration = ghostPreview.duration;
    
    if (category && blockIndex === null) {
      const cat = ACTIVITY_CATEGORIES.find(c => c.id === category);
      const newActivity = {
        category,
        title: cat.defaultTitle,
        location: '',
        duration: finalDuration,
        notes: '',
        startTime: finalStartTime
      };
      onDrop(newActivity, date);
    } else if (blockIndex !== null) {
      const block = blocks[parseInt(blockIndex)];
      const updatedBlock = { ...block, startTime: finalStartTime, duration: finalDuration };
      onUpdateBlock(date, parseInt(blockIndex), updatedBlock);
    }
    
    handleDragEnd();
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setGhostPreview(null);
  };

  const handleDragEnd = () => {
    setGhostPreview(null);
    setDraggingBlock(null);
    currentDragData = { category: null, blockIndex: null };
  };

  const handleBlockDragStart = (e, index) => {
    e.dataTransfer.setData('blockIndex', index.toString());
    e.dataTransfer.effectAllowed = 'move';
    
    currentDragData = { category: null, blockIndex: index };

    setTimeout(() => {
      setDraggingBlock(index);
    }, 0);
  };

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
        const newDuration = Math.max(
          SNAP_MINUTES, 
          Math.min(startDuration + deltaMinutes, MAX_MINUTES_IN_DAY - startTime)
        );
        onUpdateBlock(date, index, { ...block, duration: newDuration });
      } else if (direction === 'top') {
        const newStartTime = Math.max(0, Math.min(startTime + deltaMinutes, startTime + startDuration - SNAP_MINUTES));
        const newDuration = startDuration + (startTime - newStartTime);
        onUpdateBlock(date, index, { ...block, startTime: newStartTime, duration: newDuration });
      }
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  
  const CompactTimelineBlock = ({ block, index }) => {
    const cat = ACTIVITY_CATEGORIES.find(c => c.id === block.category);
    const Icon = cat.icon;
    const height = (block.duration / 60) * COMPACT_PIXELS_PER_HOUR;
    
    // Adjusted top calculation for vertical clearance
    const top = (block.startTime / 60) * COMPACT_PIXELS_PER_HOUR + VERTICAL_CLEARANCE; 
    
    const isBeingDragged = draggingBlock === index;
    
    return (
      <div
        draggable
        onDragStart={(e) => handleBlockDragStart(e, index)}
        // Block is 1px below line, 1px shorter for visual separation
        style={{ height: `${height - 2}px`, top: `${top + 1}px` }} 
        // UPDATED: Removed 'border-l-4 border-black/10'
        className={`
          ${cat.color} text-white rounded-md px-2 shadow-md transition-all 
          absolute left-1 right-1 group flex flex-col justify-center overflow-hidden
          ring-1 ring-black/5
          ${isInteracting ? 'pointer-events-none' : 'cursor-move hover:ring-2 hover:ring-white/50 hover:shadow-lg hover:z-10'}
          ${isBeingDragged ? 'opacity-40 scale-95' : 'opacity-100'}
        `}
        onClick={() => onEditBlock(date, index)}
      >
        {/* Top Resize Handle */}
        <div
          onMouseDown={(e) => { 
            e.stopPropagation(); 
            if (!isInteracting) handleResize(e, index, 'top'); 
          }}
          className={`absolute top-0 left-0 right-0 h-3 cursor-ns-resize z-20 ${isInteracting ? 'hidden' : ''}`}
        />

        {/* --- FIXED Block Content Layout --- */}
        <div className="flex items-center justify-between relative z-0 w-full">
          {/* Main Content Area (Icon, Title, Time) */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            
            {/* 1. Icon */}
            <div className="bg-black/10 p-1 rounded flex-shrink-0">
              <Icon size={12} />
            </div>
            
            {/* 2. Title and Time (Flexed for single line, justified) */}
            <div className="flex-1 min-w-0 flex justify-between items-center pr-1">
              {/* Title (Left) */}
              <div className="font-bold text-xs truncate leading-tight drop-shadow-sm">
                {block.title || cat.defaultTitle}
              </div>
              {/* Time (Right) - Single line, anchored right */}
              <div className="text-[10px] opacity-90 whitespace-nowrap font-medium flex-shrink-0 ml-2">
                {formatTime(block.startTime)} - {formatTime(block.startTime + block.duration)}
              </div>
            </div>
          </div>
          
          {/* 3. Delete Button (Anchored far right) */}
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteBlock(date, index); }}
            className={`opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-red-500/80 text-white rounded p-1 flex-shrink-0 ml-1 backdrop-blur-sm ${isInteracting ? 'hidden' : ''}`}
          >
            <X size={12} />
          </button>
        </div>
        {/* --- Block Content Layout END --- */}
        
        {/* Location/Notes (Only show if tall enough) */}
        {height > 45 && block.location && (
          <div className="text-[10px] opacity-95 flex items-center gap-1 mt-1 truncate pl-7">
            <MapPin size={9} />
            {block.location}
          </div>
        )}

        {/* Bottom Resize Handle */}
        <div
          onMouseDown={(e) => { 
            e.stopPropagation(); 
            if (!isInteracting) handleResize(e, index, 'bottom'); 
          }}
          className={`absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize z-20 ${isInteracting ? 'hidden' : ''}`}
        />
      </div>
    );
  };
  
  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/50 flex flex-col h-[800px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={onBackToCalendar}
            className="text-xs font-bold text-slate-500 hover:text-blue-600 mb-1 flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-wider"
          >
            <ChevronLeft size={14} />
            Back to Calendar
          </button>
          <h3 className="font-extrabold text-2xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
        </div>
        <div className="text-right bg-white/50 px-4 py-2 rounded-xl border border-white/60 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Activities</div>
          <div className="text-2xl font-black text-slate-700 leading-none">{blocks.length}</div>
        </div>
      </div>
      
      {/* SCROLLING CONTAINER: Now wraps both Times and Grid to ensure sync */}
      <div className="flex-1 overflow-y-auto relative scrollbar-hide rounded-2xl border border-slate-200 bg-slate-50/50">
        <div 
            className="flex min-h-full relative" 
            // UPDATED HEIGHT CALCULATION: 24 hours * height + 2 * clearance (top and bottom)
            style={{ height: `${(24 * COMPACT_PIXELS_PER_HOUR) + (2 * VERTICAL_CLEARANCE)}px` }}
        >
            
            {/* Time Column */}
            <div className="w-14 flex-shrink-0 relative border-r border-slate-200/50 bg-white/30">
                {HOURS.map(hour => (
                    <div
                        key={hour}
                        style={{ top: `${(hour * COMPACT_PIXELS_PER_HOUR) + VERTICAL_CLEARANCE}px` }}
                        className="absolute right-0 w-full text-right pr-2"
                    >
                        <span className="text-[10px] font-bold text-slate-400 block">
                            {/* UPDATED: Logic for 0 and 24 */}
                            {hour === 0 || hour === 24 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
                        </span>
                    </div>
                ))}
            </div>

            {/* Timeline Track */}
            <div className="flex-1 relative">
                <div
                    ref={timelineRef}
                    onDrop={handleTimelineDrop}
                    onDragOver={handleTimelineDragOver}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    className="absolute inset-0"
                >
                    {/* Hour Lines (Solid) */}
                    {HOURS.map(hour => (
                        <div
                            key={`h-${hour}`}
                            style={{ top: `${(hour * COMPACT_PIXELS_PER_HOUR) + VERTICAL_CLEARANCE}px` }}
                            className="absolute left-0 right-0 border-t border-slate-200/80 w-full"
                        />
                    ))}

                    {/* 30 Minute Lines (Dotted) - Don't draw after 24 */}
                    {HOURS.filter(h => h < 24).map(hour => (
                        <div
                            key={`m-${hour}`}
                            style={{ top: `${(hour * COMPACT_PIXELS_PER_HOUR) + (COMPACT_PIXELS_PER_HOUR / 2) + VERTICAL_CLEARANCE}px` }}
                            className="absolute left-0 right-0 border-t border-slate-100 border-dashed"
                        />
                    ))}
                    
                    {/* Ghost Preview */}
                    {ghostPreview && (() => {
                      const cat = ACTIVITY_CATEGORIES.find(c => c.id === ghostPreview.category);
                      const Icon = cat.icon;
                      const isValid = ghostPreview.isValid;
                      const topStyle = (ghostPreview.startTime / 60) * COMPACT_PIXELS_PER_HOUR + VERTICAL_CLEARANCE;
                      
                      return (
                        <div
                          style={{
                            height: `${(ghostPreview.duration / 60) * COMPACT_PIXELS_PER_HOUR}px`,
                            top: `${topStyle}px`,
                          }}
                          className={`
                            ${isValid ? cat.color : 'bg-red-500'} 
                            absolute left-1 right-1 rounded-md z-50 flex items-center justify-center 
                            opacity-60 ring-2 ring-white border-2 border-dashed border-white/50
                            pointer-events-none transition-all duration-75 ease-out
                          `}
                        >
                            <Icon size={24} className="text-white animate-pulse" />
                        </div>
                      );
                    })()}

                    {blocks.length === 0 && !ghostPreview ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 pointer-events-none">
                            <div className="bg-slate-100 p-6 rounded-full mb-4">
                                <Plus size={32} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium">Drag activities from the left sidebar</p>
                        </div>
                    ) : (
                        blocks.map((block, idx) => (
                            <CompactTimelineBlock key={idx} block={block} index={idx} />
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const ActivityModal = ({ block, onSave, onClose }) => {
  const [formData, setFormData] = useState(block || {
    title: '',
    location: '',
    duration: 60,
    notes: '',
    category: 'attraction',
    startTime: 540
  });

  // Helper: Rounds any number UP to the nearest 30
  const roundToHalfHour = (num, min = 0) => {
    const rounded = Math.ceil(num / 30) * 30;
    return Math.max(min, rounded);
  };

  const handleBlur = (field) => {
    if (field === 'duration') {
        setFormData(prev => ({
            ...prev,
            duration: roundToHalfHour(prev.duration, 30) // Min 30 mins
        }));
    } else if (field === 'startTime') {
        setFormData(prev => ({
            ...prev,
            startTime: roundToHalfHour(prev.startTime, 0) % 1440 // Wrap around 24h
        }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border border-white/20 scale-100 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div>
             <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Activity Details
            </h2>
            <p className="text-sm text-gray-500 font-medium">Edit your itinerary item</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Activity Name</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all font-semibold text-gray-800 placeholder-gray-400"
              placeholder="e.g., Visit Eiffel Tower"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Location</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all font-medium"
                placeholder="e.g., Paris, France"
                />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Start Time</label>
              <input
                type="time"
                // Format minutes to HH:MM
                value={`${Math.floor(formData.startTime / 60).toString().padStart(2, '0')}:${(formData.startTime % 60).toString().padStart(2, '0')}`}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  setFormData({ ...formData, startTime: hours * 60 + minutes });
                }}
                onBlur={() => handleBlur('startTime')}
                step="1800" // Hints browser to use 30 min steps (30*60 seconds)
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all font-medium"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Duration (min)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                onBlur={() => handleBlur('duration')}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all font-medium"
                min="30"
                step="30"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all font-medium"
              rows="3"
              placeholder="Add any special notes or requirements..."
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all font-bold shadow-blue-500/25"
          >
            Save Activity
          </button>
        </div>
      </div>
    </div>
  );
};

const FoodPreferencesScreen = ({ onBack, onNext, preferences, setPreferences }) => {
  const cuisineTypes = [
    'Italian', 'Chinese', 'Japanese', 'Mexican', 'Indian', 'Thai',
    'French', 'Mediterranean', 'American', 'Korean', 'Vietnamese', 'Greek',
    'African'
  ];

  const dietaryRestrictions = [
    'Vegetarian', 'Vegan', 'Halal', 'Kosher', 'Gluten-Free', 'Dairy-Free', 'Nut-Free'
  ];

  const toggleCuisine = (cuisine) => {
    setPreferences(prev => ({
      ...prev,
      cuisines: prev.cuisines.includes(cuisine)
        ? prev.cuisines.filter(c => c !== cuisine)
        : [...prev.cuisines, cuisine]
    }));
  };

  const toggleDietary = (dietary) => {
    setPreferences(prev => ({
      ...prev,
      dietary: prev.dietary.includes(dietary)
        ? prev.dietary.filter(d => d !== dietary)
        : [...prev.dietary, dietary]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
        <button
          onClick={onBack}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold mb-3 flex items-center gap-1 hover:gap-2 transition-all"
        >
          <ChevronLeft size={14} />
          Back to Itinerary
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Food Preferences
          </h2>
          <p className="text-gray-600 text-sm">Tell us about your dining preferences so we can find perfect restaurants for you</p>
        </div>

        <div className="space-y-5">
          {/* Cuisines and Dietary side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Favorite Cuisines - Circular Layout */}
            <div>
              <label className="block text-base font-bold text-gray-800 mb-4 flex items-center gap-2 justify-center">
                <Utensils size={18} className="text-orange-500" />
                Favorite Cuisines
              </label>
              <div className="relative w-full aspect-square max-w-md mx-auto" style={{ transformStyle: 'preserve-3d' }}>
                {cuisineTypes.map((cuisine, index) => {
                  const angle = (index / cuisineTypes.length) * 2 * Math.PI - Math.PI / 2;
                  const radius = 42;
                  const x = 50 + radius * Math.cos(angle);
                  const y = 50 + radius * Math.sin(angle);
                  
                  const cuisineColors = {
                    'Italian': 'from-red-500 to-green-500',
                    'Chinese': 'from-red-600 to-yellow-500',
                    'Japanese': 'from-pink-400 to-red-500',
                    'Mexican': 'from-green-600 to-red-600',
                    'Indian': 'from-orange-500 to-red-600',
                    'Thai': 'from-green-500 to-yellow-500',
                    'French': 'from-blue-500 to-red-400',
                    'Mediterranean': 'from-blue-400 to-yellow-400',
                    'American': 'from-red-500 to-blue-600',
                    'Korean': 'from-red-500 to-orange-500',
                    'Vietnamese': 'from-yellow-500 to-green-500',
                    'Greek': 'from-blue-500 to-white',
                    'African': 'from-orange-600 to-yellow-500'
                  };
                  
                  return (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      style={{
                        left: `calc(${x}% - 2.5rem)`,
                        top: `calc(${y}% - 2.5rem)`
                      }}
                      className={`absolute w-20 h-20 rounded-full font-medium text-xs transition-all hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer text-white ${
                        preferences.cuisines.includes(cuisine)
                          ? `bg-gradient-to-br ${cuisineColors[cuisine]} shadow-lg z-10`
                          : `bg-gradient-to-br ${cuisineColors[cuisine]} opacity-40 shadow-md hover:opacity-70`
                      }`}
                    >
                      {cuisine}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Restrictions - Circular Layout */}
            <div>
              <label className="block text-base font-bold text-gray-800 mb-4 flex items-center gap-2 justify-center">
                <Coffee size={18} className="text-green-500" />
                Dietary Restrictions
              </label>
              <div className="relative w-full aspect-square max-w-md mx-auto" style={{ transformStyle: 'preserve-3d' }}>
                {dietaryRestrictions.map((dietary, index) => {
                  let x, y;
                  if (index === 0) {
                    x = 50;
                    y = 50;
                  } else {
                    const angle = ((index - 1) / (dietaryRestrictions.length - 1)) * 2 * Math.PI - Math.PI / 2;
                    const radius = 42;
                    x = 50 + radius * Math.cos(angle);
                    y = 50 + radius * Math.sin(angle);
                  }
                  
                  const dietaryColors = {
                    'Vegetarian': 'from-green-500 to-lime-500',
                    'Vegan': 'from-green-600 to-emerald-600',
                    'Halal': 'from-teal-500 to-cyan-500',
                    'Kosher': 'from-blue-500 to-indigo-500',
                    'Gluten-Free': 'from-yellow-500 to-amber-500',
                    'Dairy-Free': 'from-sky-400 to-blue-400',
                    'Nut-Free': 'from-orange-400 to-red-400'
                  };
                  
                  return (
                    <button
                      key={dietary}
                      onClick={() => toggleDietary(dietary)}
                      style={{
                        left: `calc(${x}% - ${index === 0 ? '3rem' : '2.5rem'})`,
                        top: `calc(${y}% - ${index === 0 ? '3rem' : '2.5rem'})`
                      }}
                      className={`absolute w-20 h-20 rounded-full font-medium text-xs transition-all hover:scale-110 hover:shadow-xl active:scale-95 cursor-pointer text-white ${
                        preferences.dietary.includes(dietary)
                          ? `bg-gradient-to-br ${dietaryColors[dietary]} shadow-lg z-10`
                          : `bg-gradient-to-br ${dietaryColors[dietary]} opacity-40 shadow-md hover:opacity-70`
                      } ${index === 0 ? 'w-24 h-24' : ''}`}
                    >
                      {dietary}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-gray-800 mb-3">Allergies</label>
            <input
              type="text"
              value={preferences.allergies}
              onChange={(e) => setPreferences({ ...preferences, allergies: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm"
              placeholder="e.g., peanuts, shellfish, soy"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border border-orange-100">
              <label className="block text-sm font-bold text-gray-800 mb-3">Price Range</label>
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4].map(level => (
                  <button
                    key={level}
                    onClick={() => setPreferences({ ...preferences, priceRange: [1, level] })}
                    className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 hover:shadow-xl ${
                      level <= preferences.priceRange[1]
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                        : 'bg-white text-gray-400 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    {'$'.repeat(level)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">
                {preferences.priceRange[1] === 1 && 'Budget-friendly dining'}
                {preferences.priceRange[1] === 2 && 'Moderate pricing'}
                {preferences.priceRange[1] === 3 && 'Fine dining experience'}
                {preferences.priceRange[1] === 4 && 'Luxury restaurants'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-5 rounded-xl border border-yellow-100">
              <label className="block text-sm font-bold text-gray-800 mb-3">Minimum Rating</label>
              <div className="flex gap-2 mb-3">
                {[3, 3.5, 4, 4.5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setPreferences({ ...preferences, minRating: rating })}
                    className={`flex-1 py-3 rounded-lg font-bold transition-all flex flex-col items-center text-sm hover:scale-105 hover:shadow-xl ${
                      preferences.minRating === rating
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    <Star size={16} className="mb-1" fill="currentColor" />
                    {rating}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">
                Only show restaurants rated {preferences.minRating}+ stars
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Max Distance from Activities
              </label>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-5 rounded-xl">
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={preferences.maxDistance}
                  onChange={(e) => setPreferences({ ...preferences, maxDistance: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-gray-600">5 min</span>
                  <span className="text-xl font-bold text-gray-800">{preferences.maxDistance} min</span>
                  <span className="text-xs text-gray-600">30 min</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-3">
                Meals Per Day
              </label>
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-5 rounded-xl">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(num => (
                    <button
                      key={num}
                      onClick={() => setPreferences({ ...preferences, mealsPerDay: num })}
                      className={`flex-1 py-3 rounded-lg font-bold text-lg transition-all hover:scale-105 hover:shadow-xl ${
                        preferences.mealsPerDay === num
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-600 text-center mt-2 font-medium">
                  We'll suggest {preferences.mealsPerDay} meal{preferences.mealsPerDay > 1 ? 's' : ''} per day
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2"
          >
            Continue to Accommodation
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AccommodationScreen = ({ onBack, onNext, preferences, setPreferences }) => {
  const accommodationTypes = [
    { id: 'hotel', name: 'Hotel', icon: Hotel },
    { id: 'hostel', name: 'Hostel', icon: Hotel },
    { id: 'airbnb', name: 'Airbnb', icon: Hotel },
    { id: 'resort', name: 'Resort', icon: Hotel },
    { id: 'vacation', name: 'Vacation Rental', icon: Hotel },
  ];

  const amenities = [
    'WiFi', 'Parking', 'Pool', 'Gym', 'Breakfast', 'Pet-Friendly', 
    'Air Conditioning', 'Kitchen', 'Laundry', 'Beach Access'
  ];

  const toggleType = (type) => {
    setPreferences(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const toggleAmenity = (amenity) => {
    setPreferences(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
        <button
          onClick={onBack}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold mb-3 flex items-center gap-1 hover:gap-2 transition-all"
        >
          <ChevronLeft size={14} />
          Back to Food Preferences
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Accommodation Preferences
          </h2>
          <p className="text-gray-600 text-sm">Tell us about your ideal place to stay during your trip</p>
        </div>

        <div className="space-y-5">
          {/* Accommodation Types */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Hotel size={18} className="text-purple-500" />
              Accommodation Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {accommodationTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => toggleType(type.id)}
                    className={`p-4 rounded-xl font-medium text-sm transition-all hover:scale-105 hover:shadow-xl flex flex-col items-center gap-2 ${
                      preferences.types.includes(type.id)
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-md'
                    }`}
                  >
                    <Icon size={24} />
                    {type.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Star Rating Range */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-5 rounded-xl border border-amber-100">
            <label className="block text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Star size={18} className="text-amber-500" fill="currentColor" />
              Star Rating Range
            </label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-2 block">Minimum</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setPreferences({ ...preferences, minStars: rating })}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all hover:scale-105 hover:shadow-xl flex items-center justify-center ${
                        preferences.minStars === rating
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                      }`}
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-2 block">Maximum</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setPreferences({ ...preferences, maxStars: rating })}
                      className={`flex-1 py-3 rounded-lg font-bold transition-all hover:scale-105 hover:shadow-xl flex items-center justify-center ${
                        preferences.maxStars === rating
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                      }`}
                    >
                      {rating}★
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100">
            <label className="block text-base font-bold text-gray-800 mb-4">
              Price Per Night (USD)
            </label>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Min: ${preferences.minPrice}</span>
                  <span className="text-sm text-gray-600">Max: ${preferences.maxPrice}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="range"
                      min="20"
                      max="1000"
                      step="10"
                      value={preferences.minPrice}
                      onChange={(e) => setPreferences({ ...preferences, minPrice: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="20"
                      max="1000"
                      step="10"
                      value={preferences.maxPrice}
                      onChange={(e) => setPreferences({ ...preferences, maxPrice: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities - Grid Layout */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-blue-500" />
              Required Amenities
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {amenities.map(amenity => (
                <button
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-all hover:scale-105 hover:shadow-xl ${
                    preferences.amenities.includes(amenity)
                      ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Max Distance from Activities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
              <label className="block text-base font-bold text-gray-800 mb-4">
                Max Travel Time to Activities
              </label>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={preferences.maxTravelTime}
                onChange={(e) => setPreferences({ ...preferences, maxTravelTime: parseInt(e.target.value) })}
                className="w-full h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-600">5 min</span>
                <span className="text-xl font-bold text-gray-800">{preferences.maxTravelTime} min</span>
                <span className="text-xs text-gray-600">60 min</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-5 rounded-xl border border-rose-100">
              <label className="block text-base font-bold text-gray-800 mb-4">
                Number of Rooms/Units
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => setPreferences({ ...preferences, rooms: num })}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 hover:shadow-xl ${
                      preferences.rooms === num
                        ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-600 text-center mt-2">
                {preferences.rooms === 1 ? '1 room' : `${preferences.rooms} rooms`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2"
          >
            Continue to Transportation
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TransportationScreen = ({ onBack, onNext, preferences, setPreferences }) => {
  const transportModes = [
    { id: 'rideshare', name: 'Rideshare', icon: Car, desc: 'Uber, Lyft' },
    { id: 'taxi', name: 'Taxi', icon: Car, desc: 'Traditional cabs' },
    { id: 'public', name: 'Public Transit', icon: Car, desc: 'Bus, Metro, Train' },
    { id: 'rental', name: 'Rental Car', icon: Car, desc: 'Self-drive' },
    { id: 'bike', name: 'Bike/Scooter', icon: Car, desc: 'Pedal or electric' },
    { id: 'walk', name: 'Walking', icon: Car, desc: 'On foot' },
  ];

  const toggleMode = (mode) => {
    setPreferences(prev => ({
      ...prev,
      modes: prev.modes.includes(mode)
        ? prev.modes.filter(m => m !== mode)
        : [...prev.modes, mode]
    }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20">
        <button
          onClick={onBack}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold mb-3 flex items-center gap-1 hover:gap-2 transition-all"
        >
          <ChevronLeft size={14} />
          Back to Accommodation
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Transportation Preferences
          </h2>
          <p className="text-gray-600 text-sm">Choose how you'd like to get around during your trip</p>
        </div>

        <div className="space-y-6">
          {/* Transport Modes - Card Grid */}
          <div>
            <label className="block text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Car size={18} className="text-green-500" />
              Preferred Transportation Modes
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {transportModes.map(mode => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => toggleMode(mode.id)}
                    className={`p-5 rounded-2xl font-medium text-sm transition-all hover:scale-105 hover:shadow-2xl active:scale-95 relative overflow-hidden group ${
                      preferences.modes.includes(mode.id)
                        ? 'bg-gradient-to-br from-green-500 via-teal-500 to-cyan-500 text-white shadow-xl'
                        : 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 shadow-md border-2 border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3 relative z-10">
                      <div className={`p-3 rounded-full ${preferences.modes.includes(mode.id) ? 'bg-white/20' : 'bg-gray-200'}`}>
                        <Icon size={28} />
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{mode.name}</div>
                        <div className={`text-xs mt-1 ${preferences.modes.includes(mode.id) ? 'text-white/80' : 'text-gray-500'}`}>
                          {mode.desc}
                        </div>
                      </div>
                    </div>
                    {preferences.modes.includes(mode.id) && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Selection */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
            <label className="block text-base font-bold text-gray-800 mb-4">What's Most Important?</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {['Speed', 'Cost', 'Comfort'].map(priority => (
                <button
                  key={priority}
                  onClick={() => setPreferences({ ...preferences, priority: priority.toLowerCase() })}
                  className={`py-4 px-6 rounded-xl font-bold text-lg transition-all hover:scale-105 hover:shadow-xl ${
                    preferences.priority === priority.toLowerCase()
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Slider */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl border border-emerald-100">
              <label className="block text-base font-bold text-gray-800 mb-4">
                Daily Transport Budget (USD)
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={preferences.budget}
                onChange={(e) => setPreferences({ ...preferences, budget: parseInt(e.target.value) })}
                className="w-full h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-3">
                <span className="text-sm text-gray-600">$10</span>
                <span className="text-2xl font-black text-gray-800">${preferences.budget}</span>
                <span className="text-sm text-gray-600">$200</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
              <label className="block text-base font-bold text-gray-800 mb-4">
                Accessibility Needs
              </label>
              <div className="flex flex-col gap-2">
                {['Wheelchair Access', 'Elevator Required', 'None'].map(need => (
                  <button
                    key={need}
                    onClick={() => setPreferences({ ...preferences, accessibility: need.toLowerCase() })}
                    className={`py-3 px-4 rounded-lg font-medium text-sm transition-all hover:scale-105 hover:shadow-lg text-left ${
                      preferences.accessibility === need.toLowerCase()
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    {need}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:shadow-xl transition-all font-semibold flex items-center justify-center gap-2"
          >
            Continue to Review
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewScreen = ({ onBack, activities, foodPrefs, accommPrefs, transportPrefs }) => {
  const totalDays = Object.keys(activities).length;
  const totalActivities = Object.values(activities).reduce((sum, day) => sum + day.length, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-white">
        <button
          onClick={onBack}
          className="text-xs text-white/90 hover:text-white font-semibold mb-4 flex items-center gap-1 hover:gap-2 transition-all bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm"
        >
          <ChevronLeft size={14} />
          Back to Transportation
        </button>

        <div className="mb-8 text-center">
          <h2 className="text-4xl font-black mb-3 drop-shadow-lg">
            Your Trip Summary
          </h2>
          <p className="text-white/90 text-lg">Review your amazing itinerary before finalizing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Stats Cards */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 hover:scale-105 transition-all">
            <div className="text-5xl font-black mb-2">{totalDays}</div>
            <div className="text-sm uppercase tracking-wider font-bold">Days Planned</div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 hover:scale-105 transition-all">
            <div className="text-5xl font-black mb-2">{totalActivities}</div>
            <div className="text-sm uppercase tracking-wider font-bold">Activities</div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 hover:scale-105 transition-all">
            <div className="text-5xl font-black mb-2">{foodPrefs.cuisines.length}</div>
            <div className="text-sm uppercase tracking-wider font-bold">Cuisines</div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30 hover:scale-105 transition-all">
            <div className="text-5xl font-black mb-2">{transportPrefs.modes.length}</div>
            <div className="text-sm uppercase tracking-wider font-bold">Transport Modes</div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Food Summary */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Utensils size={20} />
              Food Preferences
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-white/70 mb-1">Cuisines</div>
                <div className="flex flex-wrap gap-1">
                  {foodPrefs.cuisines.slice(0, 5).map(c => (
                    <span key={c} className="bg-white/20 px-2 py-1 rounded-full text-xs">{c}</span>
                  ))}
                  {foodPrefs.cuisines.length > 5 && (
                    <span className="bg-white/20 px-2 py-1 rounded-full text-xs">+{foodPrefs.cuisines.length - 5} more</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-semibold text-white/70 mb-1">Price Range</div>
                <div className="text-2xl">{'$'.repeat(foodPrefs.priceRange[1])}</div>
              </div>
              <div>
                <div className="font-semibold text-white/70 mb-1">Meals Per Day</div>
                <div className="text-2xl font-bold">{foodPrefs.mealsPerDay}</div>
              </div>
            </div>
          </div>

          {/* Accommodation Summary */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Hotel size={20} />
              Accommodation
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-white/70 mb-1">Types</div>
                <div className="flex flex-wrap gap-1">
                  {accommPrefs.types.map(t => (
                    <span key={t} className="bg-white/20 px-2 py-1 rounded-full text-xs capitalize">{t}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold text-white/70 mb-1">Star Rating</div>
                <div className="text-xl">{accommPrefs.minStars}★ - {accommPrefs.maxStars}★</div>
              </div>
              <div>
                <div className="font-semibold text-white/70 mb-1">Budget Per Night</div>
                <div className="text-xl font-bold">${accommPrefs.minPrice} - ${accommPrefs.maxPrice}</div>
              </div>
            </div>
          </div>

          {/* Transportation Summary */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Car size={20} />
              Transportation
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-semibold text-white/70 mb-1">Modes</div>
                <div className="flex flex-wrap gap-1">
                  {transportPrefs.modes.map(m => (
                    <span key={m} className="bg-white/20 px-2 py-1 rounded-full text-xs capitalize">{m}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-semibold text-white/70 mb-1">Priority</div>
                <div className="text-xl capitalize font-bold">{transportPrefs.priority}</div>
              </div>
              <div>
                <div className="font-semibold text-white/70 mb-1">Daily Budget</div>
                <div className="text-xl font-bold">${transportPrefs.budget}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-8 py-4 bg-white/20 backdrop-blur-md border-2 border-white/30 text-white rounded-xl hover:bg-white/30 transition-all font-bold"
          >
            Back
          </button>
          <button
            className="flex-1 px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-black text-lg flex items-center justify-center gap-2"
          >
            Generate My Itinerary ✨
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Tratlus() {
  const [activities, setActivities] = useState({});
  const [editingActivity, setEditingActivity] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([1]);
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foodPreferences, setFoodPreferences] = useState({
    cuisines: [],
    dietary: [],
    allergies: '',
    priceRange: [1, 3],
    minRating: 3.5,
    maxDistance: 15,
    mealsPerDay: 3
  });
  const [accommodationPreferences, setAccommodationPreferences] = useState({
    types: [],
    minStars: 3,
    maxStars: 5,
    minPrice: 50,
    maxPrice: 300,
    amenities: [],
    maxTravelTime: 20,
    rooms: 1
  });
  const [transportationPreferences, setTransportationPreferences] = useState({
    modes: [],
    priority: 'cost',
    budget: 50,
    accessibility: 'none'
  });

  const handleDragStart = (e, category) => {
    e.dataTransfer.setData('category', category);
    currentDragData = { category, blockIndex: null };
  };

  const handleDrop = (newActivity, date) => {
    const dateKey = date.toDateString();
    
    setActivities(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newActivity]
    }));
    
    setEditingActivity({ 
      date: dateKey, 
      index: (activities[dateKey] || []).length, 
      block: newActivity 
    });
  };

  const handleDeleteBlock = (date, index) => {
    const dateKey = date.toDateString();
    setActivities(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].filter((_, i) => i !== index)
    }));
  };

  const handleEditBlock = (date, index) => {
    const dateKey = date.toDateString();
    setEditingActivity({ date: dateKey, index, block: activities[dateKey][index] });
  };

  const handleUpdateBlock = (date, index, updatedBlock) => {
    const dateKey = date.toDateString();
    setActivities(prev => ({
      ...prev,
      [dateKey]: prev[dateKey].map((block, i) => i === index ? updatedBlock : block)
    }));
  };

  const handleSaveActivity = (formData) => {
    if (editingActivity) {
      setActivities(prev => ({
        ...prev,
        [editingActivity.date]: prev[editingActivity.date].map((block, i) =>
          i === editingActivity.index ? formData : block
        )
      }));
    }
    setEditingActivity(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setViewMode('day');
  };

  const handleBackToCalendar = () => {
    setViewMode('calendar');
  };

  const goToStep = (step) => {
    // Can navigate to any previously visited step or step 1
    const maxAllowedStep = Math.max(...completedSteps, 1);
    if (step <= maxAllowedStep + 1 || step === 1) {
      setCurrentStep(step);
      // Mark this step as completed/visited when entering it
      if (!completedSteps.includes(step)) {
        setCompletedSteps([...completedSteps, step]);
      }
    }
  };

  const advanceStep = (nextStep) => {
    // Mark next step as visited when advancing
    if (!completedSteps.includes(nextStep)) {
      setCompletedSteps([...completedSteps, nextStep]);
    }
    setCurrentStep(nextStep);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #ffffffff, #7d9effff)' }}>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <MapPin className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tratlus
              </h1>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-sm">
              {['Itinerary', 'Food', 'Stay', 'Travel', 'Review'].map((step, i) => {
                const stepNum = i + 1;
                const isCompleted = completedSteps.includes(stepNum);
                const isCurrent = currentStep === stepNum;
                // UPDATED: Logic to disable clicking future/grey steps
                const isClickable = completedSteps.includes(stepNum);
                
                return (
                  <div key={step} className="flex items-center">
                    <button
                      // UPDATED: Added disabled attribute and check
                      disabled={!isClickable && !isCurrent}
                      onClick={() => isClickable && goToStep(stepNum)}
                      className={`px-3 py-1 rounded-full transition-all ${
                        isCurrent 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105 shadow-md' 
                          : isCompleted
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:shadow-lg hover:scale-110 cursor-pointer'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {step}
                    </button>
                    {i < 4 && (
                      <ChevronRight 
                        size={16} 
                        className={`mx-1 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-4">
        {currentStep === 1 && (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Build Your Itinerary</h2>
              <p className="text-gray-600">
                {viewMode === 'calendar' 
                  ? 'Select dates to start planning your activities' 
                  : 'Drag activity blocks to plan your day'}
              </p>
            </div>

            <div className={`grid grid-cols-1 ${viewMode === 'day' ? 'lg:grid-cols-4' : ''} gap-6`}>
              {viewMode === 'day' && (
                <div className="lg:col-span-1">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 sticky top-24 border border-gray-200">
                    <h3 className="font-bold text-lg mb-4 text-gray-800">Activity Blocks</h3>
                    <div className="space-y-3">
                      {ACTIVITY_CATEGORIES.map(cat => (
                        <ActivityBlock key={cat.id} category={cat.id} onDragStart={handleDragStart} />
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-gray-600 mb-2">
                        <strong>Quick Tip:</strong>
                      </p>
                      <p className="text-xs text-gray-600">
                        Drag blocks onto the timeline and resize them by dragging top/bottom edges
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className={viewMode === 'day' ? 'lg:col-span-3' : ''}>
                {viewMode === 'calendar' ? (
                  <CalendarView
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    activities={activities}
                  />
                ) : (
                  <DayView
                    date={selectedDate}
                    blocks={activities[selectedDate.toDateString()] || []}
                    onDrop={handleDrop}
                    onDeleteBlock={handleDeleteBlock}
                    onEditBlock={handleEditBlock}
                    onBackToCalendar={handleBackToCalendar}
                    onUpdateBlock={handleUpdateBlock}
                  />
                )}
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => advanceStep(2)}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2 font-semibold"
              >
                Continue to Food Preferences
                <ChevronRight size={20} />
              </button>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <FoodPreferencesScreen
            onBack={() => goToStep(1)}
            onNext={() => advanceStep(3)}
            preferences={foodPreferences}
            setPreferences={setFoodPreferences}
          />
        )}

        {currentStep === 3 && (
          <AccommodationScreen
            onBack={() => goToStep(2)}
            onNext={() => advanceStep(4)}
            preferences={accommodationPreferences}
            setPreferences={setAccommodationPreferences}
          />
        )}

        {currentStep === 4 && (
          <TransportationScreen
            onBack={() => goToStep(3)}
            onNext={() => advanceStep(5)}
            preferences={transportationPreferences}
            setPreferences={setTransportationPreferences}
          />
        )}

        {currentStep === 5 && (
          <ReviewScreen
            onBack={() => goToStep(4)}
            activities={activities}
            foodPrefs={foodPreferences}
            accommPrefs={accommodationPreferences}
            transportPrefs={transportationPreferences}
          />
        )}
      </div>

      {editingActivity && (
        <ActivityModal
          block={editingActivity.block}
          onSave={handleSaveActivity}
          onClose={() => setEditingActivity(null)}
        />
      )}
    </div>
  );
}