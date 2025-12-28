import React from 'react';
import { ChevronDown } from 'lucide-react';

interface InputSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  disabled?: boolean;
}

const InputSelect: React.FC<InputSelectProps> = ({ label, value, onChange, options, disabled }) => {
  return (
    <div className="mb-4">
      <label className="block text-gray-400 text-xs font-medium mb-2 pl-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-white py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg"
        >
          <option value="" disabled>Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-slate-900 text-gray-200">
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
          <ChevronDown size={16} />
        </div>
      </div>
    </div>
  );
};

export default InputSelect;