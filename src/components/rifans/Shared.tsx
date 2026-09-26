import React, { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`rounded-[18px] border border-gold/45 shadow-[0_12px_30px_rgba(0,0,0,0.08)] bg-card-gradient dark:bg-none dark:bg-dark-card dark:border-white/10 overflow-hidden transition-colors duration-300 ${noPadding ? '' : 'p-3.5 sm:p-6 md:p-8'} ${className}`}>
      {children}
    </div>
  );
};

interface SectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
}

export const Section: React.FC<SectionProps> = ({ id, children, className = '' }) => {
  return (
    <section id={id} className={`w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-8 md:py-10 scroll-mt-[90px] font-tajawal ${className}`}>
      {children}
    </section>
  );
};

interface SectionHeaderProps {
  eyebrow?: string;
  title?: string;
  subtitle?: ReactNode;
  align?: 'right' | 'center' | 'left';
  subtitleClassName?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, subtitle, align, subtitleClassName = '' }) => {
  const { direction } = useLanguage();
  
  // Determine alignment based on props or direction
  let textAlignClass = '';
  if (align) {
    if (align === 'center') textAlignClass = 'text-center';
    else if (align === 'right') textAlignClass = 'text-right';
    else textAlignClass = 'text-left';
  } else {
    // Default based on direction
    textAlignClass = direction === 'rtl' ? 'text-right' : 'text-left';
  }

  return (
    <div className={`space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 ${textAlignClass}`}>
      {eyebrow && (
        <div className="w-8 sm:w-12 h-1 bg-[#c5a059] rounded-full mb-2"></div>
      )}
      {title && (
        <h2 className="text-[16px] sm:text-2xl md:text-3xl font-black text-[#240738] dark:text-white leading-snug tracking-tight">
          {title}
        </h2>
      )}
      {subtitle && (
        <div className={`text-[14px] sm:text-lg md:text-xl font-bold text-[#c5a059] dark:text-gold leading-snug max-w-4xl whitespace-pre-line ${subtitleClassName}`}>
          {subtitle}
        </div>
      )}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-full px-4 py-2 text-[12px] font-bold cursor-pointer transition-transform active:scale-95 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";
  const variants = {
    primary: "bg-gold-gradient text-brand shadow-md border border-transparent",
    ghost: "bg-white dark:bg-transparent dark:text-gold border border-gold/80 text-brand shadow-sm hover:bg-gray-50 dark:hover:bg-white/5",
    outline: "bg-transparent border border-gold text-gold"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const PulseDot = () => (
  <span className="w-[9px] h-[9px] rounded-full bg-gold animate-rf-pulse block" />
);

export const StripContainer: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`flex gap-4 overflow-x-auto pb-6 pt-4 px-3.5 scrollbar-default -mx-3.5 touch-pan-x snap-x snap-proximity cursor-grab active:cursor-grabbing ${className}`}>
    {children}
  </div>
);