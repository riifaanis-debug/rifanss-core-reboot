import React from 'react';

interface ServiceHeroProps {
  title: string;
  subtitle?: string;
  kicker?: string;
  description: string;
  className?: string;
}

export const ServiceHero: React.FC<ServiceHeroProps> = ({
  title,
  subtitle,
  kicker,
  description,
  className = '',
}) => {
  return (
    <div className={`font-cairo text-right ${className}`} dir="rtl">
      {kicker && (
        <span className="text-[14px] font-semibold text-gold uppercase block mb-1 leading-[1.375]">
          {kicker}
        </span>
      )}

      {/* العنوان الأول: 16px على الجوال (font-weight 700/900، line-height 1.375)، ويكبر تدريجياً على الشاشات الكبيرة */}
      <h1 className="text-[16px] sm:text-2xl md:text-3xl font-black leading-[1.375] text-[#2A0E32] dark:text-white m-0">
        {title}
      </h1>

      {/* العنوان الثاني: 14px على الجوال (font-weight 700، line-height 1.375) */}
      {subtitle && (
        <h2 className="text-[14px] sm:text-lg md:text-xl font-bold text-gold mt-1.5 leading-[1.375] m-0">
          {subtitle}
        </h2>
      )}

      {/* حجم النص: 13px على الجوال (line-height 1.625) */}
      <p className="text-[13px] sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-[1.625] font-normal max-w-[800px] mt-2.5 sm:mt-3 m-0 whitespace-pre-line">
        {description}
      </p>

      {/* شريط ذهبي زخرفي */}
      <div className="w-8 sm:w-12 h-0.5 bg-[#B99A55] rounded-full mt-2.5 sm:mt-3" />
    </div>
  );
};

export default ServiceHero;
