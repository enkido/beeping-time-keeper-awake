
import React, { useState } from 'react';
import TimerDisplay from '@/components/TimerDisplay';
import IntervalInput from '@/components/IntervalInput';
import ControlButtons from '@/components/ControlButtons';
import WakeLockIndicator from '@/components/WakeLockIndicator';
import AudioInitializer from '@/components/AudioInitializer';
import { useStopwatch } from '@/hooks/useStopwatch';
import { useWakeLock } from '@/hooks/useWakeLock';

const StopwatchApp: React.FC = () => {
  const [audioInitialized, setAudioInitialized] = useState(false);
  const wakeLock = useWakeLock();
  const stopwatch = useStopwatch();
  
  return (
    <div className="flex flex-col space-y-8 w-full max-w-md mx-auto">
      <TimerDisplay seconds={stopwatch.milliseconds} isBeeping={stopwatch.isBeeping} />
      
      <IntervalInput 
        interval={stopwatch.interval / 1000} 
        onChange={(value) => stopwatch.setInterval(value * 1000)} 
      />
      
      <ControlButtons
        isRunning={stopwatch.isRunning}
        onStart={stopwatch.handleStart}
        onStop={stopwatch.handleStop}
        onReset={stopwatch.handleReset}
      />
      
      <div className="flex flex-col items-center gap-4 pt-2">
        <WakeLockIndicator 
          isSupported={wakeLock.isSupported} 
          isActive={wakeLock.isActive} 
        />
        
        <AudioInitializer 
          audioInitialized={audioInitialized} 
          setAudioInitialized={setAudioInitialized} 
        />
      </div>
    </div>
  );
};

export default StopwatchApp;
