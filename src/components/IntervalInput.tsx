
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface IntervalInputProps {
  interval: number;
  onChange: (value: number) => void;
}

const IntervalInput: React.FC<IntervalInputProps> = ({ interval, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0.1) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="interval" className="text-sm md:text-base">
          Intervall (Sekunden)
        </Label>
        <span className="bg-timer-accent/10 text-timer-accent px-2 py-1 rounded-md font-semibold">
          {interval.toFixed(1)} s
        </span>
      </div>
      <Input
        id="interval"
        type="range"
        min="0.1"
        max="300"
        step="0.1"
        value={interval}
        onChange={handleChange}
        className="cursor-pointer accent-timer-accent"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0.1s</span>
        <span>60s</span>
        <span>300s</span>
      </div>
    </div>
  );
};

export default IntervalInput;
