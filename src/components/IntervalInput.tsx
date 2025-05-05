
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
  const [inputExpression, setInputExpression] = useState(interval.toString());
  
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
    
    // Only update the expression if it doesn't match the current value
    // This prevents overwriting user's expression when slider is moved
    if (parseFloat(inputExpression) !== interval) {
      setInputExpression(interval.toFixed(1));
    }
  }, [interval]);
  
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setSliderValue(newValue);
    const calculatedValue = mapFromSlider(newValue);
    onChange(calculatedValue);
    setInputExpression(calculatedValue.toFixed(1));
  };

  // Evaluate mathematical expressions
  const evaluateExpression = (expression: string): number | null => {
    try {
      // Replace all commas with dots for decimal handling
      const sanitizedExpression = expression.replace(/,/g, '.');
      
      // Use Function constructor to evaluate the expression
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + sanitizedExpression + ')')();
      
      if (typeof result === 'number' && isFinite(result)) {
        return result;
      }
      return null;
    } catch (e) {
      // If evaluation fails, return null
      return null;
    }
  };

  // Direct input for precise value entry
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;
    setInputExpression(rawInput);
    
    // Try to evaluate the expression
    const result = evaluateExpression(rawInput);
    
    if (result !== null && result >= 0.1 && result <= 300) {
      onChange(result);
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
          type="text"
          min="0.1"
          max="300"
          value={inputExpression}
          onChange={handleInputChange}
          className="w-full text-center"
        />
      </div>
    </div>
  );
};

export default IntervalInput;
