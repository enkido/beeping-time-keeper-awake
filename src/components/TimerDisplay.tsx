
import React from 'react';
import { formatTime } from '@/utils/timeUtils';

interface TimerDisplayProps {
  seconds: number;
  isBeeping: boolean;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, isBeeping }) => {
  return (
    <div className="relative flex items-center justify-center">
      {isBeeping && (
        <span className="absolute inset-0 rounded-full animate-pulse-ring bg-timer-accent opacity-75"></span>
      )}
      <div 
        className={`
          text-6xl md:text-8xl font-mono font-bold p-8 rounded-full 
          bg-gradient-to-br from-timer-light to-timer-dark text-white shadow-lg
          transition-all duration-300 
          ${isBeeping ? 'scale-105 shadow-timer-accent/50' : ''}
        `}
      >
        {formatTime(seconds)}
      </div>
    </div>
  );
};

export default TimerDisplay;
