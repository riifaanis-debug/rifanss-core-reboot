import React from 'react';
import rifansLogo from '../../assets/rifans-logo.png';
import rifansLogoWhite from '../../assets/rifans-logo-white.png';

export interface LogoProps {
  className?: string;
  variant?: 'default' | 'white' | 'gold' | 'header';
  isScrolled?: boolean;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "h-14", 
  variant = 'default',
  isScrolled = false 
}) => {
  // Pure white transparent version
  if (variant === 'white') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img 
          src={rifansLogoWhite} 
          alt="شعار شركة ريفانس المالية" 
          className="w-auto h-full max-h-full max-w-full object-contain pointer-events-auto select-none opacity-90 transition-opacity duration-300"
          loading="eager"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Header dynamic variant: smooth cross-fade between white transparent (top) and official colored (scrolled)
  if (variant === 'header') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        {/* الحالة الثانية: بعد التمرير وتثبيت الهيدر → الشعار بألوانه الأساسية الأصلية */}
        <img 
          src={rifansLogo} 
          alt="شعار شركة ريفانس المالية" 
          className={`w-auto h-full max-h-full max-w-full object-contain pointer-events-auto select-none transition-opacity duration-300 ease-in-out ${
            isScrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          loading="eager"
          referrerPolicy="no-referrer"
        />

        {/* الحالة الأولى: أعلى الصفحة قبل التمرير → الشعار أبيض شفاف مع الحفاظ على تفاصيل الشعار */}
        <img 
          src={rifansLogoWhite} 
          alt="شعار شركة ريفانس المالية" 
          className={`absolute inset-0 m-auto w-auto h-full max-h-full max-w-full object-contain pointer-events-auto select-none transition-opacity duration-300 ease-in-out ${
            isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-90'
          }`}
          loading="eager"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Default: Official Primary Color Logo across all pages, footers, contracts, modals, reports, PDFs
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img 
        src={rifansLogo} 
        alt="شعار شركة ريفانس المالية" 
        className="w-auto h-full max-h-full max-w-full object-contain pointer-events-auto select-none"
        loading="eager"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

export default Logo;

