import React, { useState, useEffect, useRef, useCallback } from 'react';
import TimerDisplay from '@/components/TimerDisplay';
import IntervalInput from '@/components/IntervalInput';
import ControlButtons from '@/components/ControlButtons';
import WakeLockIndicator from '@/components/WakeLockIndicator';
import { useWakeLock } from '@/hooks/useWakeLock';
import { playBeep, initAudio } from '@/utils/soundUtils';
import { useToast } from "@/components/ui/use-toast";

const StopwatchApp: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [interval, setInterval] = useState(30); // Default 30 seconds
  const [isBeeping, setIsBeeping] = useState(false);
  const wakeLock = useWakeLock();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastBeepRef = useRef(0);
  const { toast } = useToast();

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      wakeLock.release();
    };
  }, []);

  // Check if it's time to beep
  useEffect(() => {
    if (isRunning && seconds > 0 && seconds % interval === 0 && seconds !== lastBeepRef.current) {
      playBeep();
      lastBeepRef.current = seconds;
      
      // Visual feedback when beeping
      setIsBeeping(true);
      setTimeout(() => setIsBeeping(false), 500);
    }
  }, [seconds, interval, isRunning]);

  const handleStart = useCallback(async () => {
    // Initialize audio context on first interaction
    initAudio();
    
    // Request wake lock to keep screen on
    if (wakeLock.isSupported && !wakeLock.isActive) {
      await wakeLock.request();
      toast({
        title: "Bildschirmsperre aktiviert",
        description: "Das Display bleibt während des Timers aktiv.",
      });
    }
    
    setIsRunning(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  }, [wakeLock, toast]);
  
  const handleStop = useCallback(async () => {
    setIsRunning(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
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
    setSeconds(0);
    lastBeepRef.current = 0;
  }, []);

  return (
    <div className="flex flex-col space-y-8 w-full max-w-md mx-auto">
      <TimerDisplay seconds={seconds} isBeeping={isBeeping} />
      
      <IntervalInput interval={interval} onChange={setInterval} />
      
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
