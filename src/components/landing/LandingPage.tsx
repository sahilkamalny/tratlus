import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSound } from '@/contexts/SoundContext';
import { Map, Compass, ChevronRight, Volume2, VolumeX, Volume1, Settings, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '/logo.svg';

export const LandingPage = ({ onStart }: { onStart: () => void }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { isMuted, setIsMuted, volume, playSound } = useSound();
  const [isFlushing, setIsFlushing] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const handleStartClick = () => {
    playSound('success');
    setIsFlushing(true);
    // Wait for animation (800ms) before changing screen
    setTimeout(() => {
        onStart();
    }, 800);
  };

  const handleThemeToggle = () => {
    playSound("click");
    toggleTheme();
    setShowSettingsMenu(false);
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    setShowSettingsMenu(false);
  };

  const accentBorderClass = isDarkMode ? "border-white/20 text-white/80 bg-white/5" : "border-white/30 text-slate-700 bg-white/10";

  return (
    <div className={`h-screen relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-white selection:bg-blue-500 selection:text-white' : 'bg-blue-600 text-white selection:bg-blue-200 selection:text-blue-900'}`}>
        
        {/* Settings Menu */}
        <div className="absolute top-6 right-6 z-50">
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowSettingsMenu((prev) => !prev)}
              className={cn(
                "rounded-2xl border text-[11px] font-semibold px-2 py-1.5 active:scale-95",
                accentBorderClass,
                isDarkMode 
                  ? "hover:-translate-y-0.5 hover:bg-white/10 active:-translate-y-0.5 active:bg-white/10 transition-all" 
                  : "hover:-translate-y-0.5 hover:bg-slate-900/10 active:-translate-y-0.5 active:bg-slate-900/10 transition-all"
              )}
              aria-label="Open settings menu"
            >
              <Settings className="size-4" />
            </Button>
            {showSettingsMenu && (
              <div 
                className={cn(
                  "absolute right-0 top-[calc(100%+0.5rem)] flex flex-col rounded-2xl z-30 overflow-hidden",
                  accentBorderClass
                )}
                style={{ width: '40px' }}
              >
                <Button
                  variant="ghost"
                  onClick={handleThemeToggle}
                  className={cn(
                    "rounded-none border-0 text-[11px] font-semibold px-2 py-1.5 active:scale-95",
                    accentBorderClass,
                    isDarkMode 
                      ? "hover:-translate-y-0 hover:bg-white/10 active:-translate-y-0 active:bg-white/10 transition-all" 
                      : "hover:-translate-y-0 hover:bg-slate-900/10 active:-translate-y-0 active:bg-slate-900/10 transition-all"
                  )}
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? (
                    <Moon className="size-4" />
                  ) : (
                    <Sun className="size-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleMuteToggle}
                  className={cn(
                    "rounded-none border-0 text-[11px] font-semibold px-2 py-1.5 active:scale-95",
                    accentBorderClass,
                    isDarkMode 
                      ? "hover:-translate-y-0 hover:bg-white/10 active:-translate-y-0 active:bg-white/10 transition-all" 
                      : "hover:-translate-y-0 hover:bg-slate-900/10 active:-translate-y-0 active:bg-slate-900/10 transition-all"
                  )}
                  aria-label="Toggle sound"
                >
                  {isMuted ? (
                    <VolumeX className="size-4" />
                  ) : volume < 0.35 ? (
                    <Volume1 className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Background Gradients */}
        <div className={`absolute inset-0 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-400 via-blue-300 to-blue-600'}`} style={{ zIndex: 0 }} />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            <div className={`absolute top-0 left-0 w-[100vw] h-[100vh] rounded-full blur-[150px] sm:blur-[200px] ${
                isDarkMode 
                ? 'bg-fuchsia-500/45 sm:bg-fuchsia-500/26' 
                : 'bg-fuchsia-600/52 sm:bg-fuchsia-600/45' 
            }`} style={{ 
              animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              transform: 'translate(-20%, -20%)',
              width: '80vw',
              height: '80vw',
              maxWidth: '800px',
              maxHeight: '800px'
            }} />
            
            <div className={`absolute top-0 right-0 w-[100vw] h-[100vh] rounded-full blur-[150px] sm:blur-[200px] ${
                isDarkMode 
                ? 'bg-blue-500/41 sm:bg-blue-500/22' 
                : 'bg-fuchsia-600/52 sm:bg-fuchsia-600/45'
            }`} style={{ 
              animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', 
              animationDelay: '0.5s',
              transform: 'translate(20%, 30%)',
              width: '70vw',
              height: '70vw',
              maxWidth: '700px',
              maxHeight: '700px'
            }} />
            
            <div className={`absolute bottom-0 left-0 w-[100vw] h-[100vh] rounded-full blur-[150px] sm:blur-[200px] ${
                isDarkMode 
                ? 'bg-purple-500/41 sm:bg-purple-500/22' 
                : 'bg-purple-600/90 sm:bg-purple-600/80'
            }`} style={{ 
              animation: 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite', 
              animationDelay: '1s',
              transform: 'translate(20%, 10%)',
              width: '60vw',
              height: '60vw',
              maxWidth: '600px',
              maxHeight: '600px'
            }} />
            
            {/* Grid Overlay */}
            <div className={`absolute inset-0 bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] ${isDarkMode ? 'bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]'}`} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-screen flex flex-col justify-center items-center text-center">
            {/* Floating Icons */}
            <div className={`absolute top-[15%] left-[5%] md:top-1/4 md:left-[15%] backdrop-blur-lg p-2 md:p-4 rounded-2xl border shadow-2xl animate-[bounce_6s_infinite] ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                <Map className={`${isDarkMode ? 'text-fuchsia-500' : 'text-fuchsia-600'} w-6 h-6 md:w-8 md:h-8`} />
            </div>
            <div className={`absolute bottom-[20%] right-[5%] md:bottom-1/3 md:right-[15%] backdrop-blur-lg p-2 md:p-4 rounded-2xl border shadow-2xl animate-[bounce_8s_infinite] delay-1000 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                <Compass className={`${isDarkMode ? 'text-blue-500' : 'text-blue-600'} w-6 h-6 md:w-8 md:h-8`} />
            </div>

            {/* LOGO PLACEMENT */}
            <div className="mb-6 md:mb-8 relative animate-in fade-in zoom-in duration-700">
                <div className={`absolute inset-0 blur-xl rounded-full ${isDarkMode ? 'bg-fuchsia-500 opacity-30' : 'bg-purple-600 opacity-40'}`} />
                <img 
                  src={logo} 
                  alt="Tratlus Logo" 
                  className="relative w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-2xl" 
                />
            </div>

            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md mb-6 md:mb-8 transition-colors cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/20 border-white/30 hover:bg-white/30 shadow-sm'}`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className={`text-xs font-bold tracking-widest uppercase ${isDarkMode ? 'text-slate-300' : 'text-blue-50'}`}>The Travel Atlas</span>
            </div>

            {/* Main Title */}
            <h1 className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4 md:mb-6 bg-clip-text text-transparent drop-shadow-sm animate-in fade-in zoom-in-95 duration-1000 px-4 pb-4 ${isDarkMode ? 'bg-gradient-to-r from-fuchsia-500 to-blue-500' : 'bg-gradient-to-r from-fuchsia-600 to-blue-600'}`}>
                TRATLUS
            </h1>

            {/* Subtitle */}
            <p className={`text-lg sm:text-xl md:text-2xl max-w-xs sm:max-w-md md:max-w-2xl mb-8 md:mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 ${isDarkMode ? 'text-slate-400' : 'text-blue-100 drop-shadow-md'}`}>
                Architect your perfect journey with our AI-powered itinerary engine. 
                Drag, drop, and discover the world with precision.
            </p>

            {/* CTA Button */}
            <button 
                onClick={handleStartClick}
                onMouseEnter={() => playSound('hover')}
                className={`group relative px-8 py-4 md:px-10 md:py-5 rounded-full font-black text-base md:text-lg tracking-wide overflow-hidden transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 ${isDarkMode ? 'bg-white text-slate-950 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]' : 'bg-slate-900 text-white hover:shadow-[0_0_40px_rgba(30,58,138,0.4)]'}`}
            >
                <span className="relative z-10 flex items-center gap-2">
                    Start Swiping <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div 
                  className={`absolute inset-0 transition-transform duration-[800ms] ease-in-out origin-left ${isFlushing ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 group-active:opacity-100'} ${isDarkMode ? 'bg-gradient-to-r from-fuchsia-500 to-blue-500' : 'bg-gradient-to-r from-fuchsia-600 to-blue-600'}`} 
                />
            </button>

            {/* Feature Pills */}
            <div className="mt-12 md:mt-16 flex flex-wrap justify-center gap-2 md:gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                {['Intuitive Itinerary', 'Dynamic Logistics', 'Vast Database', 'AI-Powered'].map((feat, i) => (
                    <div key={i} className={`px-4 py-2 md:px-6 md:py-3 rounded-xl backdrop-blur-sm text-xs sm:text-sm font-bold transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white' : 'bg-white/10 border border-white/20 text-blue-50 hover:bg-white/20 hover:text-white shadow-sm'}`}>
                        {feat}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};
