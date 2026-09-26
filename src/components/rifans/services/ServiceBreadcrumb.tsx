import React from 'react';
import { ArrowLeft } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

interface ServiceBreadcrumbProps {
  items: BreadcrumbItem[];
  backLabel?: string;
  onBack?: () => void;
  backHref?: string;
}

export const ServiceBreadcrumb: React.FC<ServiceBreadcrumbProps> = ({
  items,
  backLabel = 'العودة',
  onBack,
  backHref,
}) => {
  const handleBackClick = (e: React.MouseEvent) => {
    if (onBack) {
      e.preventDefault();
      onBack();
    } else if (backHref) {
      e.preventDefault();
      window.location.hash = backHref;
    }
  };

  return (
    <nav
      aria-label="مسار التنقل"
      className="border-b border-gray-200/80 dark:border-white/10 bg-white/90 dark:bg-[#08010C]/90 backdrop-blur-md sticky top-[52px] sm:top-[60px] md:top-[70px] z-20 font-cairo"
      dir="rtl"
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 h-[44px] sm:h-[48px] flex items-center justify-between gap-3">
        {/* Right side: Breadcrumb path with nowrap single-line and truncation */}
        <ol className="flex items-center gap-1.5 sm:gap-2 text-[13px] sm:text-[14px] text-gray-500 dark:text-gray-400 overflow-hidden whitespace-nowrap m-0 p-0 list-none flex-1 min-w-0">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isMiddle = index > 0 && !isLast;

            return (
              <li
                key={index}
                className={`flex items-center gap-1.5 sm:gap-2 shrink-0 ${
                  isMiddle ? 'max-w-[100px] sm:max-w-[160px] md:max-w-none' : isLast ? 'flex-1 min-w-0 max-w-[160px] sm:max-w-[280px] md:max-w-none' : ''
                }`}
              >
                {index > 0 && (
                  <span className="text-gray-300 dark:text-gray-700 select-none text-[12px] shrink-0">/</span>
                )}
                {isLast || item.isCurrent ? (
                  <span
                    aria-current="page"
                    className="font-bold text-[#2A0E32] dark:text-gold truncate block"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                ) : item.onClick ? (
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="hover:text-gold transition-colors font-medium cursor-pointer truncate block"
                    title={item.label}
                  >
                    {item.label}
                  </button>
                ) : item.href ? (
                  <a
                    href={item.href}
                    className="hover:text-gold transition-colors font-medium truncate block"
                    title={item.label}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="truncate block">{item.label}</span>
                )}
              </li>
            );
          })}
        </ol>

        {/* Left side: Back Button */}
        {(onBack || backHref) && (
          <button
            type="button"
            onClick={handleBackClick}
            className="inline-flex items-center gap-1 text-[13px] sm:text-[14px] font-bold text-gray-700 dark:text-gray-300 hover:text-gold dark:hover:text-gold transition-colors cursor-pointer shrink-0 whitespace-nowrap group py-1"
          >
            <span>{backLabel}</span>
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          </button>
        )}
      </div>
    </nav>
  );
};

export default ServiceBreadcrumb;
