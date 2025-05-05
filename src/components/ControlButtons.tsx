
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, RefreshCcw } from 'lucide-react';

interface ControlButtonsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  isRunning,
  onStart,
  onStop,
  onReset,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {isRunning ? (
        <Button 
          onClick={onStop} 
          variant="destructive" 
          className="flex-1 text-lg py-6"
          size="lg"
        >
          <Square className="mr-2" size={24} />
          Stop
        </Button>
      ) : (
        <Button 
          onClick={onStart} 
          className="flex-1 text-lg py-6 bg-timer-light hover:bg-timer-dark"
          size="lg"
        >
          <Play className="mr-2" size={24} />
          Start
        </Button>
      )}
      <Button 
        onClick={onReset} 
        variant="outline" 
        className="flex-1 text-lg py-6 border-timer"
        size="lg"
        disabled={isRunning}
      >
        <RefreshCcw className="mr-2" size={24} />
        Reset
      </Button>
    </div>
  );
};

export default ControlButtons;
