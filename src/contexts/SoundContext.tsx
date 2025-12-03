import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';

interface SoundContextType {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  playSound: (type: string) => void;
  volume: number;
  setVolume: (volume: number) => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export const useSound = () => {
    const context = useContext(SoundContext);
    if (!context) {
      throw new Error('useSound must be used within a SoundProvider');
    }
    return context;
};

export const SoundProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5); // Default 50% volume
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context on first interaction
  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = useCallback((type: string) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    const masterGainNode = ctx.createGain();
    masterGainNode.gain.value = volume;
    masterGainNode.connect(ctx.destination);

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(masterGainNode);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;
        
      case 'cancel':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.15);
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'hover':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        gainNode.gain.setValueAtTime(0.02, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;

      case 'pop':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'plop':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.1);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'switch':
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      
      case 'success':
        const notes = [440, 554.37, 659.25]; // A Major
        notes.forEach((freq, i) => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          
          osc2.connect(gain2);
          gain2.connect(masterGainNode);
          
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
  }, [isMuted, volume, audioCtxRef.current]);

  useEffect(() => {
    // Initialize audio context immediately on mount
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      audioCtxRef.current = new AudioContext();
      // Try to resume immediately (may require user interaction on some browsers)
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {
          // If resume fails, fall back to interaction-based initialization
          const handleFirstInteraction = () => {
            initAudio();
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
          };
          window.addEventListener('click', handleFirstInteraction);
          window.addEventListener('keydown', handleFirstInteraction);
          window.addEventListener('touchstart', handleFirstInteraction);
        });
      }
    }
  }, []);

  return (
    <SoundContext.Provider value={{ isMuted, setIsMuted, playSound, volume, setVolume }}>
      {children}
    </SoundContext.Provider>
  );
};
