import React, { useState, useContext } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useSound } from '@/contexts/SoundContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Map, Compass, ChevronRight, Volume2, VolumeX, Volume1 } from 'lucide-react';
import logo from '/logo.svg';

const SoundControls = () => {
    const { isMuted, setIsMuted, volume, setVolume } = useSound();
    return (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 group">
            <button 
            onClick={() => setIsMuted(!isMuted)}
            className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all relative z-10"
            >
            {isMuted ? (
                <VolumeX className="text-red-400 w-6 h-6" />
            ) : volume === 0 ? (
                <VolumeX className="text-slate-400 w-6 h-6" />
            ) : volume < 0.5 ? (
                <Volume1 className="text-blue-400 w-6 h-6" />
            ) : (
                <Volume2 className="text-blue-400 w-6 h-6" />
            )}
            </button>

            {/* Volume Slider - Reveals on Group Hover */}
            <div className="w-0 overflow-hidden group-hover:w-32 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2 rounded-full shadow-xl flex items-center">
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume}
                    style={{
                        background: `linear-gradient(to right, ${isMuted ? '#f87171' : '#60a5fa'} 0%, ${isMuted ? '#f87171' : '#60a5fa'} ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%, rgba(255, 255, 255, 0.2) 100%)`
                    }}
                    onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setVolume(val);
                        if(isMuted && val > 0) setIsMuted(false);
                    }}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <style>{`
                    input[type=range]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        height: 12px;
                        width: 12px;
                        border-radius: 50%;
                        background: #ffffff;
                        cursor: pointer;
                        margin-top: -3px;
                        box-shadow: 0 0 5px rgba(0,0,0,0.2);
                    }
                    input[type=range]::-webkit-slider-runnable-track {
                        width: 100%;
                        height: 6px;
                        cursor: pointer;
                        background: transparent;
                        border-radius: 10px;
                        border: none;
                    }
                `}</style>
            </div>
            </div>
        </div>
    )
}

export const LandingPage = ({ onStart }: { onStart: () => void }) => {
  const { isDarkMode } = useTheme();
  const { playSound } = useSound();
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
        
        <SoundControls />

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
            {/* Floating Icons */}
            <div className={`absolute top-1/4 left-[15%] backdrop-blur-lg p-4 rounded-2xl border shadow-2xl animate-[bounce_6s_infinite] ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                <Map className={`${isDarkMode ? 'text-fuchsia-500' : 'text-fuchsia-600'} w-8 h-8`} />
            </div>
            <div className={`absolute bottom-1/3 right-[15%] backdrop-blur-lg p-4 rounded-2xl border shadow-2xl animate-[bounce_8s_infinite] delay-1000 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
                <Compass className={`${isDarkMode ? 'text-blue-500' : 'text-blue-600'} w-8 h-8`} />
            </div>

            {/* LOGO PLACEMENT */}
            <div className="mb-8 relative animate-in fade-in zoom-in duration-700">
                <div className={`absolute inset-0 blur-xl rounded-full ${isDarkMode ? 'bg-fuchsia-500 opacity-30' : 'bg-purple-600 opacity-40'}`} />
                <img 
                  src={logo} 
                  alt="Tratlus Logo" 
                  className="relative w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-2xl" 
                />
            </div>

            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md mb-8 transition-colors cursor-default animate-in fade-in slide-in-from-bottom-4 duration-700 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/20 border-white/30 hover:bg-white/30 shadow-sm'}`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className={`text-xs font-bold tracking-widest uppercase ${isDarkMode ? 'text-slate-300' : 'text-blue-50'}`}>The Travel Atlas</span>
            </div>

            {/* Main Title */}
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
                    Start Swiping <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </span>
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
