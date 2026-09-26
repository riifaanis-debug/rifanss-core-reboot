import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface PopularServiceItem {
  id: string;
  name: string;
  category?: string;
}

interface ServicePopularListProps {
  title?: string;
  items: PopularServiceItem[];
  onSelect: (item: PopularServiceItem) => void;
  className?: string;
}

export const ServicePopularList: React.FC<ServicePopularListProps> = ({
  title = 'الأكثر طلبًا',
  items,
  onSelect,
  className = '',
}) => {
  if (!items || items.length === 0) return null;

  return (
    <section className={`font-cairo text-right ${className}`} dir="rtl">
      {/* Section Title: 16px mobile, 20px desktop, font-bold, line-height 1.375 */}
      <h2 className="text-[16px] md:text-[20px] font-bold text-[#2A0E32] dark:text-white mb-2.5 leading-[1.375]">
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {items.map((item, index) => {
          const formattedIndex = index < 9 ? `0${index + 1}` : `${index + 1}`;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="group h-[50px] sm:h-[54px] px-3.5 sm:px-4 rounded-xl border border-gray-200/80 dark:border-white/10 hover:border-gold/50 bg-white/70 dark:bg-white/[0.03] hover:bg-[#FAF7F0] dark:hover:bg-white/[0.07] flex items-center justify-between text-right transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5 truncate">
                {/* Secondary Gold Number */}
                <span className="text-[13px] sm:text-[14px] font-mono font-bold text-gold shrink-0">
                  {formattedIndex} —
                </span>

                {/* Primary Title */}
                <span className="text-[14px] sm:text-[15px] font-bold text-[#180020] dark:text-gray-100 group-hover:text-gold transition-colors truncate">
                  {item.name}
                </span>
              </div>

              {/* Hover Indicator Arrow */}
              <ArrowLeft
                size={14}
                className="text-gold opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all shrink-0"
              />
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default ServicePopularList;
