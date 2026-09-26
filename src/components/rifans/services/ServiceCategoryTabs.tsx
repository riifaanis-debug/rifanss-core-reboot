import React from 'react';

export interface TabItem<T = string> {
  key: T;
  label: string;
}

interface ServiceCategoryTabsProps<T = string> {
  tabs: TabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  className?: string;
}

export function ServiceCategoryTabs<T = string>({
  tabs,
  activeKey,
  onChange,
  className = '',
}: ServiceCategoryTabsProps<T>) {
  return (
    <div className={`font-cairo ${className}`} dir="rtl">
      <nav
        aria-label="تبويبات الخدمات"
        className="flex items-center gap-6 sm:gap-8 overflow-x-auto whitespace-nowrap scrollbar-none border-b border-gray-200/80 dark:border-white/10"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <button
              key={String(tab.key)}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`h-[46px] sm:h-[48px] px-1 inline-flex items-center relative text-[15px] sm:text-[16px] font-bold transition-colors cursor-pointer shrink-0 ${
                isActive
                  ? 'text-[#180020] dark:text-gold'
                  : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 right-0 left-0 h-[2.5px] bg-[#B99A55] rounded-t-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default ServiceCategoryTabs;
