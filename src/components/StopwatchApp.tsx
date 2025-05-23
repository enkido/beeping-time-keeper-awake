
// src/components/StopwatchApp.tsx
/**
 * @file StopwatchApp.tsx
 * This is the main application component that orchestrates the UI and logic
 * for the stopwatch. It integrates various custom hooks and UI components
 * to provide the complete stopwatch functionality.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react'; // Added useRef, useMemo
import TimerDisplay from '@/components/TimerDisplay'; // Component to display the formatted time and visual beep indicator.
import IntervalInput from '@/components/IntervalInput'; // Component for users to set the beep interval.
import ControlButtons from '@/components/ControlButtons'; // Component providing start, stop, and reset buttons.
import WakeLockIndicator from '@/components/WakeLockIndicator'; // Component to show the status of the screen wake lock.
import AudioInitializer from '@/components/AudioInitializer'; // Component to handle user gesture for audio initialization.
import { useStopwatch } from '@/hooks/useStopwatch'; // Custom hook for all stopwatch logic (time, state, interval beeps).
import { useWakeLock } from '@/hooks/useWakeLock'; // Custom hook to manage screen wake lock.
import { useAppVersion } from '@/hooks/useAppVersion'; // Custom hook to get app version information
import EventEmitter from '@/lib/EventEmitter'; // Added EventEmitter import
import AudioService from '@/services/AudioService'; // Added AudioService import

/**
 * StopwatchApp is the main component that orchestrates the stopwatch application.
 * It integrates:
 * - `useStopwatch`: Manages the core timing logic, interval beeping, and stopwatch state.
 * - `useWakeLock`: Handles screen wake lock to prevent the device from sleeping during timing.
 * It renders child components:
 * - `TimerDisplay`: Shows the elapsed time and visual beep feedback.
 * - `IntervalInput`: Allows users to configure the beep interval.
 * - `ControlButtons`: Provides start, stop, and reset controls.
 * - `WakeLockIndicator`: Displays the status of the screen wake lock.
 * - `AudioInitializer`: Prompts the user to initialize audio if needed.
 */
const StopwatchApp: React.FC = () => {
  // State to track if the audio context has been successfully initialized by user interaction.
  // This is passed to and managed by the AudioInitializer component.
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Instantiate EventEmitter. Persists across re-renders.
  const eventEmitterRef = useRef<EventEmitter | null>(null);
  if (!eventEmitterRef.current) {
    eventEmitterRef.current = new EventEmitter();
    console.log('[StopwatchApp] EventEmitter instance created.');
  }
  const eventEmitter = eventEmitterRef.current;

  // Instantiate AudioService. Persists across re-renders and hooks into the EventEmitter.
  // useMemo is used here to ensure AudioService is instantiated only once with the eventEmitter.
  const audioService = useMemo(() => {
    if (eventEmitter) {
      console.log('[StopwatchApp] Creating AudioService instance...');
      return new AudioService(eventEmitter);
    }
    return null; // Should ideally not happen if eventEmitter is always created
  }, [eventEmitter]);

  // useEffect to manage AudioService lifecycle, e.g., cleanup if needed.
  useEffect(() => {
    if (audioService) {
      console.log('[StopwatchApp] AudioService instance is ready.');
      // If AudioService had a cleanup method, it would be returned here:
      // return () => {
      //   console.log('[StopwatchApp] Cleaning up AudioService instance...');
      //   audioService.cleanup();
      // };
    }
  }, [audioService]);
  
  // Hook to manage screen wake lock functionality.
  // `wakeLock.isSupported` indicates if the API is available in the current browser.
  // `wakeLock.isActive` indicates if the wake lock is currently active.
  const wakeLock = useWakeLock();
  
  // Custom hook that encapsulates all core stopwatch logic:
  // - `stopwatch.milliseconds`: The current elapsed time in milliseconds.
  // - `stopwatch.isRunning`: Boolean indicating if the stopwatch is active.
  // - `stopwatch.interval`: The current interval for beeps, in milliseconds.
  // - `stopwatch.isBeeping`: Boolean to trigger visual feedback in TimerDisplay during a beep.
  // - `stopwatch.setInterval`: Function to update the beep interval (expects milliseconds).
  // - `stopwatch.handleStart`: Function to start or resume the stopwatch.
  // - `stopwatch.handleStop`: Function to pause the stopwatch.
  // - `stopwatch.handleReset`: Function to reset the stopwatch to zero.
  // Pass the eventEmitter instance to useStopwatch.
  // Assuming a default initial interval if not specified, e.g., 30000ms.
  // The actual initialInterval might be managed differently or passed from props/config.
  const initialInterval = 30000; // Default or example initial interval
  const stopwatch = useStopwatch(eventEmitter, initialInterval);

  // Get the version information
  const { version } = useAppVersion();
  
  return (
    <div className="flex flex-col space-y-8 w-full max-w-md mx-auto">
      {/* TimerDisplay: Renders the formatted stopwatch time and visual pulse effect during beeps. */}
      <TimerDisplay seconds={stopwatch.milliseconds} isBeeping={stopwatch.isBeeping} />
      
      {/* IntervalInput: Allows the user to set the beep interval in seconds.
          The component handles conversion to/from seconds for the UI,
          while the useStopwatch hook operates with milliseconds. */}
      <IntervalInput 
        interval={stopwatch.interval / 1000} // Convert interval from ms to seconds for the input component.
        onChange={(value) => stopwatch.setInterval(value * 1000)} // Convert input value (seconds) back to ms for the hook.
      />
      
      {/* ControlButtons: Provides UI buttons to start, stop, and reset the stopwatch.
          Passes the current running state and control handlers from useStopwatch. */}
      <ControlButtons
        isRunning={stopwatch.isRunning}
        onStart={stopwatch.handleStart}
        onStop={stopwatch.handleStop}
        onReset={stopwatch.handleReset}
      />
      
      <div className="flex flex-col items-center gap-4 pt-2">
        {/* WakeLockIndicator: Displays the status of the screen wake lock (supported/active). */}
        <WakeLockIndicator 
          isSupported={wakeLock.isSupported} 
          isActive={wakeLock.isActive} 
        />
        
        {/* AudioInitializer: Renders a button to initialize audio context.
            This is crucial for browsers that restrict auto-playing audio without user interaction.
            Updates the `audioInitialized` state upon successful initialization. */}
        <AudioInitializer 
          audioInitialized={audioInitialized} 
          setAudioInitialized={setAudioInitialized} 
        />
      </div>
      
      {/* Version indicator in bottom right corner */}
      <div className="fixed bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
        v{version}
      </div>
    </div>
  );
};

export default StopwatchApp;

