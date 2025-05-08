import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimerDisplay from '@/components/TimerDisplay';
import IntervalInput from '@/components/IntervalInput';
import ControlButtons from '@/components/ControlButtons';
import WakeLockIndicator from '@/components/WakeLockIndicator';
import { useWakeLock } from '@/hooks/useWakeLock';
import { playBeep, initAudio } from '@/utils/soundUtils';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const StopwatchApp: React.FC = () => {
  const [milliseconds, setMilliseconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [interval, setInterval] = useState(30000); // Default 30 seconds (in milliseconds)
  const [isBeeping, setIsBeeping] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const wakeLock = useWakeLock();
  const isMobile = useIsMobile();
  const timerRef = useRef<number | null>(null);
  const lastBeepRef = useRef(0);
  const nextBeepAtRef = useRef(0);
  const { toast } = useToast();
  
  // Initialize audio context aggressively on app load
  useEffect(() => {
    console.log('Initializing audio on app load');
    // Try to initialize audio immediately
    const initialized = initAudio();
    setAudioInitialized(initialized);
    
    // For Android compatibility, initialize audio again after a small delay
    const timeoutId = setTimeout(() => {
      const initialized = initAudio();
      setAudioInitialized(initialized);
      console.log('Delayed audio initialization:', initialized);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Try to initialize audio on any user interaction
  useEffect(() => {
    console.log('Setting up user interaction listeners for audio');
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    
    const handleUserInteraction = () => {
      console.log('User interaction detected - initializing audio');
      const initialized = initAudio();
      setAudioInitialized(initialized);
      
      // Play a test beep with very low volume (almost silent)
      try {
        const testAudio = new Audio();
        testAudio.volume = 0.01; // Very low volume
        testAudio.play().catch(() => {}); // Ignore errors
      } catch (e) {
        // Ignore errors
      }
    };
    
    // Add listeners for user interaction events
    interactionEvents.forEach(event => {
      document.addEventListener(event, handleUserInteraction);
    });
    
    // Clean up listeners on unmount
    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, []);

  // Reset nextBeepAt whenever interval changes
  useEffect(() => {
    if (isRunning) {
      console.log(`Interval changed to ${interval}ms, recalculating next beep time`);
      // Calculate next beep time from current milliseconds
      const remainder = milliseconds % interval;
      nextBeepAtRef.current = remainder === 0 ? 
        milliseconds + interval : 
        milliseconds + (interval - remainder);
      console.log(`Next beep scheduled at: ${nextBeepAtRef.current}ms`);
    }
  }, [interval, isRunning, milliseconds]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
      }
      wakeLock.release();
    };
  }, []);

  // Check if it's time to beep - THIS IS THE MAIN BEEPING LOGIC
  useEffect(() => {
    if (isRunning && milliseconds > 0 && interval > 0) {
      // Beep when we reach or pass the next beep time
      if (milliseconds >= nextBeepAtRef.current) {
        console.log(`🔊 TIME TO BEEP! Current time: ${milliseconds}ms, Next beep was at: ${nextBeepAtRef.current}ms`);
        
        // Initialize audio if not already done
        initAudio();
        
        // Try multiple beeps for better chance of hearing - with higher volume for Android
        playBeep(880, 300, 1.0); // Higher frequency (880 Hz)
        
        // Schedule additional beeps with slight delays for redundancy
        setTimeout(() => playBeep(660, 300, 1.0), 50);
        setTimeout(() => playBeep(770, 300, 1.0), 100);
        
        lastBeepRef.current = milliseconds;
        
        // Calculate next beep time (exactly interval ms in the future)
        nextBeepAtRef.current = nextBeepAtRef.current + interval;
        console.log(`Next beep scheduled at: ${nextBeepAtRef.current}ms`);
        
        // Visual feedback when beeping
        setIsBeeping(true);
        setTimeout(() => setIsBeeping(false), 500);
      }
    }
  }, [milliseconds, interval, isRunning]);

  const handleStart = useCallback(async () => {
    // Initialize audio context on start - important for Android
    console.log('Start button clicked - ensuring audio is initialized');
    initAudio();
    
    // Calculate next beep time from current milliseconds
    const remainder = milliseconds % interval;
    nextBeepAtRef.current = milliseconds === 0 ? 
      interval : // first beep should be at the interval time
      milliseconds + (interval - remainder);
    
    // Test beep at start to ensure audio is working
    playBeep(440, 100, 0.1);
    
    console.log(`Timer started. Next beep scheduled at: ${nextBeepAtRef.current}ms`);
    
    // Request wake lock to keep screen on
    if (wakeLock.isSupported && !wakeLock.isActive) {
      await wakeLock.request();
      toast({
        title: "Bildschirmsperre aktiviert",
        description: "Das Display bleibt während des Timers aktiv.",
      });
    }
    
    setIsRunning(true);
    
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }
    
    timerRef.current = window.setInterval(() => {
      setMilliseconds(prev => {
        // Log every second to help with debugging
        if (prev % 1000 === 0) {
          console.log(`Timer tick: ${prev}ms`);
        }
        return prev + 10; // Update every 10 milliseconds
      });
    }, 10);
  }, [wakeLock, toast, milliseconds, interval]);
  
  const handleStop = useCallback(async () => {
    setIsRunning(false);
    
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Release wake lock when timer stops
    if (wakeLock.isActive) {
      await wakeLock.release();
      toast({
        title: "Bildschirmsperre deaktiviert",
        description: "Das Display kann jetzt in den Ruhezustand wechseln.",
      });
    }
  }, [wakeLock, toast]);
  
  const handleReset = useCallback(() => {
    setMilliseconds(0);
    lastBeepRef.current = 0;
    nextBeepAtRef.current = interval;
  }, [interval]);
  
  const handleAudioInit = () => {
    console.log('Manual audio initialization requested');
    const success = initAudio();
    setAudioInitialized(success);
    
    if (success) {
      // Play a test beep
      playBeep(440, 100, 0.1);
      toast({
        title: "Audio aktiviert",
        description: "Audio wurde initialisiert. Beeps sollten jetzt funktionieren.",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-8 w-full max-w-md mx-auto">
      <TimerDisplay seconds={milliseconds} isBeeping={isBeeping} />
      
      <IntervalInput interval={interval / 1000} onChange={(value) => setInterval(value * 1000)} />
      
      <ControlButtons
        isRunning={isRunning}
        onStart={handleStart}
        onStop={handleStop}
        onReset={handleReset}
      />
      
      <div className="flex flex-col items-center gap-4 pt-2">
        <WakeLockIndicator isSupported={wakeLock.isSupported} isActive={wakeLock.isActive} />
        
        <button
          className="text-sm px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-md"
          onClick={handleAudioInit}
        >
          Audio aktivieren
        </button>
      </div>
      
      {/* Special button that covers the whole screen for first touch on Android */}
      {isMobile && !audioInitialized && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => {
            handleAudioInit();
            // Remove the overlay after initialization
            setAudioInitialized(true);
          }}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs text-center">
            <h3 className="text-lg font-semibold mb-2">Audio aktivieren</h3>
            <p className="mb-4">Bitte tippen Sie auf den Bildschirm, um die Audiofunktion zu aktivieren.</p>
            <button className="bg-amber-500 text-white px-4 py-2 rounded-md">
              Hier tippen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StopwatchApp;
