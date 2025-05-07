import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimerDisplay from '@/components/TimerDisplay';
import IntervalInput from '@/components/IntervalInput';
import ControlButtons from '@/components/ControlButtons';
import WakeLockIndicator from '@/components/WakeLockIndicator';
import { useWakeLock } from '@/hooks/useWakeLock';
import { playBeep, initAudio, testBeep } from '@/utils/soundUtils';
import { useToast } from "@/hooks/use-toast";

const StopwatchApp: React.FC = () => {
  const [milliseconds, setMilliseconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [interval, setInterval] = useState(30000); // Default 30 seconds (in milliseconds)
  const [isBeeping, setIsBeeping] = useState(false);
  const wakeLock = useWakeLock();
  const timerRef = useRef<number | null>(null);
  const lastBeepRef = useRef(0);
  const nextBeepAtRef = useRef(0);
  const { toast } = useToast();
  const audioInitializedRef = useRef(false);

  // Initialize audio context on app load
  useEffect(() => {
    console.log('Initializing audio on app load');
    const initialized = initAudio();
    audioInitializedRef.current = initialized;
    
    // Test beep on first render with a delay to ensure browser is ready
    const testTimeout = setTimeout(() => {
      console.log('Testing initial beep');
      testBeep();
    }, 1000);
    
    return () => clearTimeout(testTimeout);
  }, []);
  
  // Add listener for user interaction to initialize audio
  useEffect(() => {
    console.log('Setting up user interaction listeners for audio');
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    
    const handleUserInteraction = () => {
      console.log('User interaction detected - initializing audio');
      initAudio();
      audioInitializedRef.current = true;
      
      // Remove all event listeners after first interaction
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
      
      // Test beep on user interaction
      testBeep();
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

  // Check if it's time to beep
  useEffect(() => {
    if (isRunning && milliseconds > 0 && interval > 0) {
      // Beep when we reach or pass the next beep time
      if (milliseconds >= nextBeepAtRef.current) {
        console.log(`Time to beep! Current time: ${milliseconds}ms, Next beep was at: ${nextBeepAtRef.current}ms`);
        // Try the beep
        playBeep(800, 300, 1.0); // Higher volume (1.0) and longer duration (300ms)
        lastBeepRef.current = milliseconds;
        
        // Calculate next beep time
        nextBeepAtRef.current = milliseconds + interval;
        console.log(`Next beep scheduled at: ${nextBeepAtRef.current}ms`);
        
        // Visual feedback when beeping
        setIsBeeping(true);
        setTimeout(() => setIsBeeping(false), 500);
      }
    }
  }, [milliseconds, interval, isRunning]);

  const handleStart = useCallback(async () => {
    // Initialize audio context on first interaction
    console.log('Start button clicked - ensuring audio is initialized');
    initAudio();
    
    // Play a test beep when starting
    testBeep();
    
    // Calculate next beep time from current milliseconds
    const remainder = milliseconds % interval;
    nextBeepAtRef.current = remainder === 0 ? 
      milliseconds + interval : 
      milliseconds + (interval - remainder);
    
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
      setMilliseconds(prev => prev + 10); // Update every 10 milliseconds
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
      
      <div className="flex justify-center pt-2">
        <WakeLockIndicator isSupported={wakeLock.isSupported} isActive={wakeLock.isActive} />
      </div>
    </div>
  );
};

export default StopwatchApp;
