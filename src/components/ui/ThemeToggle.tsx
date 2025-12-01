import { useTheme } from '@/contexts/ThemeContext';
import { useSound } from '@/contexts/SoundContext';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { playSound } = useSound();

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
