import React from 'react';

interface SliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, min, max, step = 1, unit = '' }) => {
  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex justify-between items-end">
        <label className="text-slate-500 text-sm font-medium">{label}</label>
        <span className="text-slate-900 font-bold text-lg">
          {unit} {value.toLocaleString()}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
};
