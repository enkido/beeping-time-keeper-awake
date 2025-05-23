import { useState, useRef, useEffect, useCallback } from 'react';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useToast } from "@/hooks/use-toast";
import EventEmitter from '@/lib/EventEmitter'; // Import EventEmitter

/**
 * Custom hook for stopwatch functionality with interval beeps.
 * @param eventEmitter - An instance of EventEmitter.
 * @param initialInterval - The initial interval in milliseconds for beeps. Defaults to 30000ms (30 seconds).
 */
export function useStopwatch(eventEmitter: EventEmitter, initialInterval = 30000) {
  // State for the elapsed time in milliseconds. Updated every 10ms by `timerRef` interval.
  const [milliseconds, setMilliseconds] = useState(0);
  // State to track if the stopwatch is currently running.
  const [isRunning, setIsRunning] = useState(false);
  // State for the user-defined interval (in milliseconds) for beeps.
  const [interval, setInterval] = useState(initialInterval);
  // State to indicate if a beep is currently active, primarily for visual feedback in the UI.
  const [isBeeping, setIsBeeping] = useState(false);

  // Temporary useEffect for debugging milliseconds state changes
  useEffect(() => {
    console.log('[useStopwatch] milliseconds state changed:', milliseconds);
  }, [milliseconds]);

  const wakeLock = useWakeLock();
  // Ref to store the ID of the `setInterval` timer used for the stopwatch ticks.
  // This allows clearing the interval when the stopwatch is stopped or the component unmounts.
  const timerRef = useRef<number | null>(null);
  // Ref to store the timestamp (in milliseconds relative to stopwatch start) of the last beep's *scheduled* time.
  const lastBeepRef = useRef(0);
  // Ref to store the target timestamp (in milliseconds relative to stopwatch start) for the *next* beep.
  const nextBeepAtRef = useRef(0);
  const { toast } = useToast();

  /**
   * Triggers a sequence of three beeps with slight variations in frequency and timing.
   * This approach is used to increase the likelihood of the beep being audible,
   * especially on mobile devices which can have quirks with single, short audio plays.
   */
  const triggerIntervalBeepSequence = useCallback(() => {
    // Emit an event instead of playing a sound directly.
    eventEmitter.emit("timeReached", { currentTime: milliseconds });
    console.log(`[useStopwatch] Event "timeReached" emitted with currentTime: ${milliseconds}ms`);
  }, [eventEmitter, milliseconds]); // Dependencies updated

  // Effect to calculate and set the `nextBeepAtRef.current` timestamp.
  // This effect is crucial for determining when the next interval beep should occur.
  // It runs primarily when:
  //  1. The stopwatch starts or resumes (`isRunning` becomes true).
  //  2. The `interval` value changes.
  useEffect(() => {
    if (isRunning) {
      // If the interval is not set or is zero/negative, no beeps should be scheduled.
      if (interval <= 0) {
        nextBeepAtRef.current = 0; // Using 0 to signify no beep is scheduled.
        console.log(`[useStopwatch Effect - CalculateNextBeep] Interval is ${interval}ms. No beep will be scheduled.`);
        return;
      }

      // When this effect runs (triggered by a change in `isRunning` or `interval`),
      // `milliseconds` (from useState) will hold the current up-to-date elapsed time.
      // This value is accessed directly from the state, ensuring it's the latest for the calculation.
      // This effect runs when `isRunning` becomes true or `interval` changes.
      // It uses the `milliseconds` state value at the time of execution for its calculation.
      const currentMilliseconds = milliseconds; // Capture current milliseconds for calculation
      let calculatedNextBeepAt = 0;

      if (currentMilliseconds === 0) {
        // Scenario: Stopwatch is starting from 0 (e.g., after reset and then start).
        calculatedNextBeepAt = interval;
      } else {
        // Scenario: Stopwatch is resuming, or the interval has been changed while running.
        // Calculate the next beep time relative to the current `currentMilliseconds` and `interval`.
        const remainder = currentMilliseconds % interval;
        if (remainder === 0) {
          // If current time is an exact multiple of the interval.
          calculatedNextBeepAt = currentMilliseconds + interval;
        } else {
          // Schedule for the next multiple of `interval` from the beginning.
          calculatedNextBeepAt = currentMilliseconds - remainder + interval;
        }
      }
      nextBeepAtRef.current = calculatedNextBeepAt;
      console.log(`[useStopwatch Effect - CalculateNextBeep] Next beep at: ${nextBeepAtRef.current}ms. Current: ${currentMilliseconds}ms, Interval: ${interval}ms`);
    }
    // This effect should only run when `isRunning` or `interval` changes.
    // It uses the `milliseconds` state value at the time of execution to make its calculation,
    // but it should NOT re-run *solely* because `milliseconds` changes.
  }, [isRunning, interval]); // REMOVED milliseconds from dependencies

  // Cleanup effect: Clears the stopwatch timer interval and releases the wake lock when the component unmounts.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current); // Stop the timer
        timerRef.current = null; // Clear the ref
      }
      wakeLock.release(); // Ensure wake lock is released on component unmount.
    };
  }, [wakeLock]); // Only depends on `wakeLock` as its `release` method is stable.

  // Core beeping logic: This effect runs frequently as `milliseconds` updates.
  useEffect(() => {
    // Conditions for attempting a beep:
    // 1. `isRunning`: The stopwatch must be active.
    // 2. `milliseconds > 0`: Time must have actually progressed beyond the start.
    // 3. `interval > 0`: A valid, positive interval must be set.
    // 4. `nextBeepAtRef.current > 0`: A beep must actually be scheduled (i.e., not 0 from the calculation effect).
    if (isRunning && milliseconds > 0 && interval > 0 && nextBeepAtRef.current > 0) {
      // Check if the current elapsed time (`milliseconds`) has reached or passed the scheduled `nextBeepAtRef.current`.
      // Using `>=` handles cases where the exact millisecond might be skipped by `setInterval` timing.
      if (milliseconds >= nextBeepAtRef.current) {
        console.log(`🔊 TIME TO BEEP! Current time: ${milliseconds}ms, Next beep was scheduled for: ${nextBeepAtRef.current}ms, Interval: ${interval}ms`);
        
        triggerIntervalBeepSequence(); // Play the beep sound sequence.
        
        // Record the timestamp for which this beep was scheduled.
        // This is important for correctly scheduling the *next* beep from this point.
        lastBeepRef.current = nextBeepAtRef.current; 
        
        // Schedule the next beep: current scheduled beep time + interval.
        // This ensures beeps are based on the planned interval grid, not the exact (potentially slightly delayed)
        // moment `milliseconds` passed the threshold. This helps maintain accuracy over longer periods.
        nextBeepAtRef.current = nextBeepAtRef.current + interval;
        console.log(`Next beep scheduled at: ${nextBeepAtRef.current}ms`);
        
        // Activate visual feedback (e.g., a pulse animation on the timer display).
        setIsBeeping(true);
        // Deactivate visual feedback after 500ms.
        setTimeout(() => setIsBeeping(false), 500); 
      }
    }
    // This effect must run whenever `milliseconds`, `interval`, or `isRunning` changes,
    // as these are all critical to determining if and when a beep should occur.
  }, [milliseconds, isRunning, interval, triggerIntervalBeepSequence]);

  // REMOVED redundant useEffect for interval changes while running

  const handleStart = useCallback(async () => {
    console.log('[useStopwatch] Start button clicked.');
    
    setIsRunning(true);
    eventEmitter.emit("stopwatchStarted", { startTime: milliseconds });
    console.log(`[useStopwatch] Event "stopwatchStarted" emitted with startTime: ${milliseconds}ms`);
    
    // Setting isRunning to true will trigger the `useEffect([isRunning, interval])`
    // (which correctly accesses the current `milliseconds` state within its closure)
    // to calculate/re-calculate `nextBeepAtRef.current`.
    // If `milliseconds` is 0 (fresh start), `nextBeepAtRef.current` will be set to `interval` by that effect.
    // If resuming, `nextBeepAtRef.current` will be recalculated based on current `milliseconds` and `interval` by that effect.
    
    console.log(`Timer starting. Current time: ${milliseconds}ms, Interval: ${interval}ms. Next beep time will be calculated by the dedicated useEffect.`);
    
    // Request wake lock to keep the screen on during timing.
    if (wakeLock.isSupported && !wakeLock.isActive) {
      try {
        await wakeLock.request();
        toast({
          title: "Bildschirmsperre aktiviert",
          description: "Das Display bleibt während des Timers aktiv.",
        });
      } catch (error) {
        console.error("Failed to acquire wake lock on start:", error);
        toast({
          title: "Wake Lock Fehler",
          description: "Bildschirmsperre konnte nicht aktiviert werden.",
          variant: "destructive",
        });
      }
    }
    
    // Clear any existing timer interval to prevent multiple timers running simultaneously if start is clicked multiple times.
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
    }
    
    // Start the stopwatch's main timer.
    // It increments the `milliseconds` state every 10ms, triggering re-renders and effect evaluations.
    timerRef.current = window.setInterval(() => {
      setMilliseconds(prev => prev + 10); 
    }, 10);
    // State setters (setIsRunning, setMilliseconds) from useState are guaranteed by React to be stable
    // and do not need to be listed in useCallback dependency arrays.
    // `triggerIntervalBeepSequence` is memoized with useCallback, ensure `eventEmitter` and `milliseconds` are dependencies if used.
  }, [wakeLock, toast, eventEmitter, milliseconds, triggerIntervalBeepSequence]); // Added eventEmitter and milliseconds
  
  const handleStop = useCallback(async () => {
    setIsRunning(false); // Stops the timer and prevents further beeps via the `isRunning` checks in useEffects.
    eventEmitter.emit("stopwatchStopped", { stopTime: milliseconds });
    console.log(`[useStopwatch] Event "stopwatchStopped" emitted with stopTime: ${milliseconds}ms`);
    
    // Clear the interval timer.
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null; // Clear the ref to indicate no active timer.
    }
    
    // Release the screen wake lock if it's active.
    if (wakeLock.isActive) {
      try {
        await wakeLock.release();
        toast({
          title: "Bildschirmsperre deaktiviert",
          description: "Das Display kann jetzt in den Ruhezustand wechseln.",
        });
      } catch (error) {
        console.error("Failed to release wake lock on stop:", error);
        // Optionally, notify the user if release failed, though it's less critical than acquisition failure.
      }
    }
  }, [wakeLock, toast, eventEmitter, milliseconds]); // Added eventEmitter and milliseconds
  
  const handleReset = useCallback(() => {
    setIsRunning(false); // Ensure the timer is stopped.
    setMilliseconds(0);   // Reset elapsed time to zero.
    eventEmitter.emit("stopwatchReset");
    console.log('[useStopwatch] Event "stopwatchReset" emitted.');
    lastBeepRef.current = 0; // Reset the last beep time.
    
    // When resetting, if the timer is started again (`isRunning` becomes true & `milliseconds` is 0),
    // the `useEffect([isRunning, interval])` will correctly set `nextBeepAtRef.current` to `interval`.
    // Explicitly setting `nextBeepAtRef.current` here ensures its state is correct even if the timer isn't
    // immediately restarted, or if `interval` is changed while stopped.
    if (interval > 0) {
      nextBeepAtRef.current = interval; // Pre-set for a potential next start from 0.
    } else {
      nextBeepAtRef.current = 0; // No beep if interval is invalid.
    }
    console.log(`Timer reset. If started, next beep target: ${nextBeepAtRef.current}ms (based on current interval: ${interval}ms)`);
    
    // No need to interact with wakeLock here; `handleStop` (called by setIsRunning(false) if timer was running)
    // or the unmount cleanup would handle its release. If it wasn't running, wakeLock wouldn't be active.
    // State setters (`setIsRunning`, `setMilliseconds`) are stable and not required in deps.
    // `interval` is a dependency because it's used to calculate `nextBeepAtRef.current`.
  }, [interval, eventEmitter]); // Added eventEmitter

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
