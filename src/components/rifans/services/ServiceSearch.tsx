import React from 'react';
import { Search, X } from 'lucide-react';

interface ServiceSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ServiceSearch: React.FC<ServiceSearchProps> = ({
  value,
  onChange,
  placeholder = 'ابحث بالاسم، مثل: سيرة، ضمان، ريف، حساب، تمويل...',
  className = '',
}) => {
  return (
    <div className={`font-cairo ${className}`} dir="rtl">
      <div className="relative max-w-[800px]">
        {/* Input Field: 52-56px height */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[52px] sm:h-[54px] pr-12 pl-11 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/15 rounded-xl text-[15px] sm:text-[16px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all shadow-sm text-right"
        />

        {/* Right Search Icon (44-48px outer box feeling, 22-24px inner icon) */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gold pointer-events-none flex items-center justify-center w-6 h-6">
          <Search size={20} strokeWidth={2} />
        </div>

        {/* Left Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="مسح البحث"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceSearch;
