
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimerDisplay from '@/components/TimerDisplay';
import IntervalInput from '@/components/IntervalInput';
import ControlButtons from '@/components/ControlButtons';
import WakeLockIndicator from '@/components/WakeLockIndicator';
import { useWakeLock } from '@/hooks/useWakeLock';
import { playBeep, initAudio } from '@/utils/soundUtils';
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

  // Initialize audio context on first app load
  useEffect(() => {
    initAudio();
  }, []);

  // Reset nextBeepAt whenever interval changes
  useEffect(() => {
    if (isRunning) {
      // Calculate next beep time from current milliseconds
      const remainder = milliseconds % interval;
      nextBeepAtRef.current = remainder === 0 ? 
        milliseconds + interval : 
        milliseconds + (interval - remainder);
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
    if (isRunning && milliseconds > 0) {
      // Beep when we reach or pass the next beep time
      if (milliseconds >= nextBeepAtRef.current) {
        playBeep();
        lastBeepRef.current = milliseconds;
        
        // Calculate next beep time
        nextBeepAtRef.current = milliseconds + interval;
        
        // Visual feedback when beeping
        setIsBeeping(true);
        setTimeout(() => setIsBeeping(false), 500);
      }
    }
  }, [milliseconds, interval, isRunning]);

  const handleStart = useCallback(async () => {
    // Initialize audio context on first interaction
    initAudio();
    
    // Calculate next beep time from current milliseconds
    const remainder = milliseconds % interval;
    nextBeepAtRef.current = remainder === 0 ? 
      milliseconds + interval : 
      milliseconds + (interval - remainder);
    
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
