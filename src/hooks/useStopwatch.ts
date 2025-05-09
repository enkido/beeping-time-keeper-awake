import { useState, useRef, useEffect, useCallback } from 'react';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useToast } from "@/hooks/use-toast";
import { playBeep, initAudio } from '@/utils/soundUtils';

export function useStopwatch(initialInterval = 30000) {
  const [milliseconds, setMilliseconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [interval, setInterval] = useState(initialInterval);
  const [isBeeping, setIsBeeping] = useState(false);
  const wakeLock = useWakeLock();
  const timerRef = useRef<number | null>(null);
  const lastBeepRef = useRef(0);
  const nextBeepAtRef = useRef(0);
  const { toast } = useToast();

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
  }, [wakeLock]);

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

  return {
    milliseconds,
    isRunning,
    interval,
    isBeeping,
    setInterval,
    handleStart,
    handleStop,
    handleReset
  };
}
