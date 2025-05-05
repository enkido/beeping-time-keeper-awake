
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface IntervalInputProps {
  interval: number;
  onChange: (value: number) => void;
}

const IntervalInput: React.FC<IntervalInputProps> = ({ interval, onChange }) => {
  // Use logarithmic scale for better precision on lower values
  const [sliderValue, setSliderValue] = useState(mapToSlider(interval));
  
  // Convert between actual interval values and slider positions
  function mapToSlider(seconds: number): number {
    // Log scale: 0-100 maps to 0.1-300
    return Math.max(0, Math.min(100, Math.log(seconds / 0.1) / Math.log(3000) * 100));
  }
  
  function mapFromSlider(value: number): number {
    // Inverse of log scale
    return parseFloat((0.1 * Math.pow(3000, value / 100)).toFixed(1));
  }
  
  // Update slider value when interval changes externally
  useEffect(() => {
    setSliderValue(mapToSlider(interval));
  }, [interval]);
  
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setSliderValue(newValue);
    onChange(mapFromSlider(newValue));
  };

  // Direct input for precise value entry
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0.1 && value <= 300) {
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
      
      <div className="pt-2">
        <Slider
          id="interval-slider"
          value={[sliderValue]}
          min={0}
          max={100}
          step={0.1}
          onValueChange={handleSliderChange}
          className="cursor-pointer accent-timer-accent"
        />
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground py-1">
        <span>0.1s</span>
        <span>1s</span>
        <span>10s</span>
        <span>60s</span>
        <span>300s</span>
      </div>
      
      <div className="pt-2">
        <Input
          id="interval"
          type="number"
          min="0.1"
          max="300"
          step="0.1"
          value={interval}
          onChange={handleInputChange}
          className="w-full text-center"
        />
      </div>
    </div>
  );
};

export default IntervalInput;
