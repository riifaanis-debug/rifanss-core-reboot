import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface ServiceItemCardProps {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
  badge?: string;
  isUnavailable?: boolean;
  ctaText?: string;
  onSelect: () => void;
  className?: string;
}

export const ServiceItemCard: React.FC<ServiceItemCardProps> = ({
  name,
  description,
  badge,
  isUnavailable = false,
  ctaText = 'طلب الخدمة / التفاصيل',
  onSelect,
  className = '',
}) => {
  return (
    <article
      className={`font-cairo text-right py-5 px-0 border-b border-gray-200/80 dark:border-white/10 last:border-b-0 transition-colors ${className}`}
      dir="rtl"
    >
      <div className="w-full min-w-0">
        {/* العنوان الأول: 16px على الجوال، line-height: 1.375 */}
        <div className="flex items-start gap-2 flex-wrap">
          <h3
            onClick={onSelect}
            className="text-[16px] md:text-[20px] font-bold text-[#2A0E32] dark:text-white hover:text-gold transition-colors leading-[1.375] cursor-pointer m-0 break-words"
          >
            {name}
          </h3>

          {badge && (
            <span className="text-[12px] font-semibold text-gold shrink-0 mt-0.5">
              • {badge}
            </span>
          )}

          {isUnavailable && (
            <span className="text-[12px] font-semibold text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
              (غير متاحة حالياً)
            </span>
          )}
        </div>

        {/* حجم النص: 13px على الجوال، line-height: 1.625 */}
        <p className="text-[13px] md:text-[14.5px] leading-[1.625] text-gray-700 dark:text-gray-300 font-normal mt-1.5 max-w-3xl m-0">
          {description}
        </p>

        {/* العنوان الثاني / زر الإجراء: 14px، line-height: 1.375 */}
        <div className="mt-2.5 flex items-center">
          {isUnavailable ? (
            <span className="text-[12px] text-gray-400 dark:text-gray-500 font-medium">
              سيتم توفيرها قريباً
            </span>
          ) : (
            <button
              type="button"
              onClick={onSelect}
              className="inline-flex items-center gap-1.5 text-[14px] font-bold text-gold hover:text-[#d3b46e] dark:hover:text-white transition-colors cursor-pointer group/btn py-0.5 leading-[1.375]"
            >
              <span>{ctaText}</span>
              <ArrowLeft
                size={14}
                className="transition-transform group-hover/btn:-translate-x-1"
              />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ServiceItemCard;
