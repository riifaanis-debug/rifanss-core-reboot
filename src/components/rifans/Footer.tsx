import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  ChevronDown, 
  ChevronLeft,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import rifansLogo from '../../assets/rifans-logo-footer.png';
import { navigateTo } from '../../utils/scrollManager';

export const Footer: React.FC = () => {
  const { user } = useAuth();
  // Mobile single open accordion state (null when all closed)
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll position for the floating back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowScrollTop(window.scrollY > 280);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSection = (sectionKey: string) => {
    setOpenSection(prev => (prev === sectionKey ? null : sectionKey));
  };

  const handleNavigate = (path: string, e?: React.MouseEvent) => {
    navigateTo(path, e);
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  };

  // Action: تقديم طلب
  const handleApplyRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      sessionStorage.setItem(
        'pending_service_request',
        JSON.stringify({
          serviceId: 'waiver-request',
          fieldId: 'financial',
          prefill: {
            serviceName: 'طلب خدمة عام',
            notes: 'طلب خدمة مقدم عبر التذييل'
          }
        })
      );
      window.dispatchEvent(new CustomEvent('open-auth', { detail: { mode: 'login' } }));
    } else {
      window.dispatchEvent(
        new CustomEvent('open-waive-form', {
          detail: {
            serviceName: 'طلب خدمة عام',
            notes: 'طلب خدمة مقدم عبر التذييل'
          }
        })
      );
    }
  };

  // Action: متابعة الطلب
  const handleTrackRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      sessionStorage.setItem('redirect_after_auth', '#/dashboard');
      window.dispatchEvent(new CustomEvent('open-auth', { detail: { mode: 'login' } }));
    } else {
      navigateTo('#/dashboard');
    }
  };

  // Action: تسجيل الدخول
  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-auth', { detail: { mode: 'login' } }));
  };

  // Action: إنشاء حساب جديد
  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-auth', { detail: { mode: 'register' } }));
  };

  return (
    <footer 
      id="global-footer" 
      dir="rtl" 
      className="w-full mt-auto relative font-['Cairo',sans-serif] text-right bg-gradient-to-b from-[#180224] via-[#14011f] to-[#0c0013] text-white border-t border-gold/25 overflow-hidden"
    >
      {/* Decorative top luxury gold line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      
      {/* Ambient luxury lighting */}
      <div className="absolute -top-24 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-10 w-80 h-80 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Unified Content Wrapper with exact 24px padding-inline */}
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 pt-2 sm:pt-8 pb-8 relative z-10">
        
        {/* ========================================================================= */}
        {/* 1. SECTIONS: Compact Accordion on Mobile (<768px) & 4 Columns on Desktop   */}
        {/* ========================================================================= */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-5 lg:gap-6">
            
            {/* 1. روابط ريفانس المالية */}
            <div className="border-b border-white/10 md:border-b-0">
              {/* Desktop Header */}
              <h3 className="hidden md:flex items-center gap-2 text-[13px] font-bold text-gold mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                روابط ريفانس المالية
              </h3>

              {/* Mobile Accordion Header: compact min-h-[44px], py-[10px] */}
              <button
                type="button"
                onClick={() => toggleSection('rifans-links')}
                aria-expanded={openSection === 'rifans-links'}
                className="w-full md:hidden min-h-[44px] py-[10px] flex items-center justify-start text-[13px] font-bold leading-[1.4] text-gold active:opacity-80 transition-colors cursor-pointer select-none"
              >
                <div className="inline-flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  <span>روابط ريفانس المالية</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gold shrink-0 transition-transform duration-200 ease-out ${
                      openSection === 'rifans-links' ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </div>
              </button>

              {/* Links Container */}
              <div 
                className={`grid transition-[grid-template-rows] duration-200 ease-out md:!grid-rows-[1fr] ${
                  openSection === 'rifans-links' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <ul className="space-y-[12px] pt-1 pb-4 md:pt-0 md:pb-0 m-0 p-0 list-none">
                    <li>
                      <FooterNavLink href="#/about" onClick={(e) => handleNavigate('#/about', e)}>
                        من نحن
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/vision" onClick={(e) => handleNavigate('#/vision', e)}>
                        رؤيتنا
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/message" onClick={(e) => handleNavigate('#/message', e)}>
                        رسالتنا
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/goal" onClick={(e) => handleNavigate('#/goal', e)}>
                        أهدافنا
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#business-fields" onClick={(e) => handleNavigate('#business-fields', e)}>
                        مجالات أعمالنا
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/contact" onClick={(e) => handleNavigate('#/contact', e)}>
                        تواصل معنا
                      </FooterNavLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. الخدمات */}
            <div className="border-b border-white/10 md:border-b-0">
              {/* Desktop Header */}
              <h3 className="hidden md:flex items-center gap-2 text-[13px] font-bold text-gold mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                الخدمات
              </h3>

              {/* Mobile Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection('services')}
                aria-expanded={openSection === 'services'}
                className="w-full md:hidden min-h-[44px] py-[10px] flex items-center justify-start text-[13px] font-bold leading-[1.4] text-gold active:opacity-80 transition-colors cursor-pointer select-none"
              >
                <div className="inline-flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  <span>الخدمات</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gold shrink-0 transition-transform duration-200 ease-out ${
                      openSection === 'services' ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </div>
              </button>

              {/* Links Container */}
              <div 
                className={`grid transition-[grid-template-rows] duration-200 ease-out md:!grid-rows-[1fr] ${
                  openSection === 'services' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <ul className="space-y-[12px] pt-1 pb-4 md:pt-0 md:pb-0 m-0 p-0 list-none">
                    <li>
                      <FooterNavLink href="#/services" onClick={(e) => handleNavigate('#/services', e)}>
                        جميع الخدمات
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/electronic-services" onClick={(e) => handleNavigate('#/electronic-services', e)}>
                        الخدمات الإلكترونية
                      </FooterNavLink>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={handleApplyRequest}
                        className="group flex items-center gap-2 py-0.5 text-[15px] sm:text-[16px] leading-[1.5] text-gray-200 hover:text-gold transition-all duration-200 hover:-translate-x-1 text-right w-full font-medium cursor-pointer"
                      >
                        <ChevronLeft size={13} className="text-gold/70 group-hover:text-gold transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0" />
                        <span>تقديم طلب</span>
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={handleTrackRequest}
                        className="group flex items-center gap-2 py-0.5 text-[15px] sm:text-[16px] leading-[1.5] text-gray-200 hover:text-gold transition-all duration-200 hover:-translate-x-1 text-right w-full font-medium cursor-pointer"
                      >
                        <ChevronLeft size={13} className="text-gold/70 group-hover:text-gold transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0" />
                        <span>متابعة الطلب</span>
                      </button>
                    </li>
                    {!user ? (
                      <>
                        <li>
                          <button
                            type="button"
                            onClick={handleLogin}
                            className="group flex items-center gap-2 py-0.5 text-[15px] sm:text-[16px] leading-[1.5] text-gray-200 hover:text-gold transition-all duration-200 hover:-translate-x-1 text-right w-full font-medium cursor-pointer"
                          >
                            <ChevronLeft size={13} className="text-gold/70 group-hover:text-gold transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0" />
                            <span>تسجيل الدخول</span>
                          </button>
                        </li>
                        <li>
                          <button
                            type="button"
                            onClick={handleRegister}
                            className="group flex items-center gap-2 py-0.5 text-[15px] sm:text-[16px] leading-[1.5] text-gold hover:text-gold-light transition-all duration-200 hover:-translate-x-1 text-right w-full font-semibold cursor-pointer"
                          >
                            <ChevronLeft size={13} className="text-gold group-hover:text-gold-light transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0" />
                            <span>إنشاء حساب جديد</span>
                          </button>
                        </li>
                      </>
                    ) : (
                      <li>
                        <FooterNavLink href="#/dashboard" onClick={(e) => handleNavigate('#/dashboard', e)}>
                          لوحة التحكم الخاصة بي
                        </FooterNavLink>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. الدعم والمساعدة */}
            <div className="border-b border-white/10 md:border-b-0">
              {/* Desktop Header */}
              <h3 className="hidden md:flex items-center gap-2 text-[13px] font-bold text-gold mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                الدعم والمساعدة
              </h3>

              {/* Mobile Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection('support')}
                aria-expanded={openSection === 'support'}
                className="w-full md:hidden min-h-[44px] py-[10px] flex items-center justify-start text-[13px] font-bold leading-[1.4] text-gold active:opacity-80 transition-colors cursor-pointer select-none"
              >
                <div className="inline-flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  <span>الدعم والمساعدة</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gold shrink-0 transition-transform duration-200 ease-out ${
                      openSection === 'support' ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </div>
              </button>

              {/* Links Container */}
              <div 
                className={`grid transition-[grid-template-rows] duration-200 ease-out md:!grid-rows-[1fr] ${
                  openSection === 'support' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <ul className="space-y-[12px] pt-1 pb-4 md:pt-0 md:pb-0 m-0 p-0 list-none">
                    <li>
                      <FooterNavLink href="#/contact" onClick={(e) => handleNavigate('#/contact', e)}>
                        مركز المساعدة والدعم
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/complaints" onClick={(e) => handleNavigate('#/complaints', e)}>
                        الشكاوى والاقتراحات
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/contact" onClick={(e) => handleNavigate('#/contact', e)}>
                        تواصل مع فريق الدعم
                      </FooterNavLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. السياسات والحقوق */}
            <div className="border-b border-white/10 md:border-b-0">
              {/* Desktop Header */}
              <h3 className="hidden md:flex items-center gap-2 text-[13px] font-bold text-gold mb-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
                السياسات والحقوق
              </h3>

              {/* Mobile Accordion Header */}
              <button
                type="button"
                onClick={() => toggleSection('policies')}
                aria-expanded={openSection === 'policies'}
                className="w-full md:hidden min-h-[44px] py-[10px] flex items-center justify-start text-[13px] font-bold leading-[1.4] text-gold active:opacity-80 transition-colors cursor-pointer select-none"
              >
                <div className="inline-flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                  <span>السياسات والحقوق</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gold shrink-0 transition-transform duration-200 ease-out ${
                      openSection === 'policies' ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                </div>
              </button>

              {/* Links Container */}
              <div 
                className={`grid transition-[grid-template-rows] duration-200 ease-out md:!grid-rows-[1fr] ${
                  openSection === 'policies' ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <ul className="space-y-[12px] pt-1 pb-4 md:pt-0 md:pb-0 m-0 p-0 list-none">
                    <li>
                      <FooterNavLink href="#/terms" onClick={(e) => handleNavigate('#/terms', e)}>
                        الشروط والأحكام
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/privacy" onClick={(e) => handleNavigate('#/privacy', e)}>
                        سياسة الخصوصية
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/acceptable-use" onClick={(e) => handleNavigate('#/acceptable-use', e)}>
                        سياسة استخدام الموقع
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/cookies" onClick={(e) => handleNavigate('#/cookies', e)}>
                        سياسة ملفات تعريف الارتباط
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/disclaimer" onClick={(e) => handleNavigate('#/disclaimer', e)}>
                        إخلاء المسؤولية
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/data-protection" onClick={(e) => handleNavigate('#/data-protection', e)}>
                        سياسة حماية البيانات الشخصية
                      </FooterNavLink>
                    </li>
                    <li>
                      <FooterNavLink href="#/user-rights" onClick={(e) => handleNavigate('#/user-rights', e)}>
                        حقوق ومسؤوليات المستفيد
                      </FooterNavLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BRANDING, SOCIAL ICONS & LEGAL LINKS (Exact 24px after Accordion)      */}
        {/* ========================================================================= */}
        <div className="mt-6 flex flex-col items-center text-center">
          
          {/* 5. شعار ريفانس المالية: 190px, max-w: 55vw */}
          <div className="flex justify-center">
            <a 
              href="#/" 
              onClick={(e) => handleNavigate('#/', e)}
              className="inline-flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none"
              title="ريفانس المالية - الصفحة الرئيسية"
            >
              <img 
                src={rifansLogo} 
                alt="شعار شركة ريفانس المالية" 
                className="w-[190px] max-w-[55vw] h-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </a>
          </div>

          {/* 6. الوصف المختصر (بعد الشعار: 16px) */}
          <p className="mt-4 text-[14px] leading-[1.7] text-gray-200 font-medium max-w-sm mx-auto text-center">
            منصة متخصصة في تقديم ومتابعة الخدمات المهنية للأفراد.
          </p>

          {/* 7. أيقونات التواصل الاجتماعي (بعد الوصف: 18px، 40x40px، gap: 12px) */}
          <div className="mt-[18px] flex items-center justify-center gap-[12px]">
            {/* WhatsApp */}
            <SocialIconButton 
              href="https://wa.me/rifanes" 
              ariaLabel="واتساب ريفانس المالية"
              title="واتساب"
            >
              <WhatsAppIcon />
            </SocialIconButton>

            {/* X */}
            <SocialIconButton 
              href="https://x.com/rifaniis" 
              ariaLabel="منصة إكس - ريفانس المالية"
              title="إكس"
            >
              <XIcon />
            </SocialIconButton>

            {/* Snapchat */}
            <SocialIconButton 
              href="https://www.snapchat.com/add/rifaniis" 
              ariaLabel="سناب شات ريفانس المالية"
              title="سناب شات"
            >
              <SnapchatIcon />
            </SocialIconButton>

            {/* Instagram */}
            <SocialIconButton 
              href="https://www.instagram.com/riifanis" 
              ariaLabel="انستغرام ريفانس المالية"
              title="انستغرام"
            >
              <InstagramIcon />
            </SocialIconButton>

            {/* Email */}
            <SocialIconButton 
              href="mailto:info@rifans.net" 
              ariaLabel="البريد الإلكتروني لريفانس المالية"
              title="البريد الإلكتروني"
            >
              <Mail size={16} className="text-gold group-hover:text-[#180224] transition-colors" />
            </SocialIconButton>
          </div>

          {/* 8. الروابط القانونية السريعة */}
          <nav aria-label="روابط سريعة" className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] sm:text-[13.5px] text-gray-200 font-medium">
            <a 
              href="#/" 
              onClick={(e) => handleNavigate('#/', e)}
              className="hover:text-gold transition-colors py-0.5 focus:outline-none"
            >
              الرئيسية
            </a>
            <span className="text-gold/40 select-none text-[11px]">|</span>
            <a 
              href="#/terms" 
              onClick={(e) => handleNavigate('#/terms', e)}
              className="hover:text-gold transition-colors py-0.5 focus:outline-none"
            >
              الشروط والأحكام
            </a>
            <span className="text-gold/40 select-none text-[11px]">|</span>
            <a 
              href="#/privacy" 
              onClick={(e) => handleNavigate('#/privacy', e)}
              className="hover:text-gold transition-colors py-0.5 focus:outline-none"
            >
              سياسة الخصوصية
            </a>
          </nav>

          {/* 9. ملفات تعريف الارتباط */}
          <div className="mt-3">
            <a 
              href="#/cookies" 
              onClick={(e) => handleNavigate('#/cookies', e)}
              className="text-[12.5px] sm:text-[13px] text-gray-300 hover:text-gold transition-colors py-0.5 inline-block focus:outline-none"
            >
              ملفات تعريف الارتباط
            </a>
          </div>

          {/* Subtle bottom micro-divider */}
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent mt-4 mb-2.5" />

          {/* Copyright Notice */}
          <p className="text-[11.5px] sm:text-[12px] text-gray-400 font-normal tracking-wide">
            © 2026 ريفانس المالية. جميع الحقوق محفوظة.
          </p>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 13. زر العودة للأعلى: 44px, right-3, bottom-4 مع safe-area لتفادي أي تداخل */}
      {/* ========================================================================= */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="العودة لأعلى الصفحة"
        title="العودة لأعلى الصفحة"
        className={`fixed z-20 right-3 bottom-[calc(14px+env(safe-area-inset-bottom))] w-[44px] h-[44px] rounded-full bg-[#180224]/85 backdrop-blur-xs text-gold border border-gold/40 hover:border-gold hover:bg-gold hover:text-[#180224] shadow-md flex items-center justify-center transition-all duration-200 transform group active:scale-95 ${
          showScrollTop 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
      >
        <ChevronUp size={18} className="transition-transform duration-150 group-hover:-translate-y-0.5" />
      </button>

    </footer>
  );
};

// Reusable Navigation Link for Footer
const FooterNavLink: React.FC<{ 
  href: string; 
  children: React.ReactNode; 
  onClick?: (e: React.MouseEvent) => void;
}> = ({ href, children, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className="group flex items-center gap-2 py-0.5 text-[15px] sm:text-[16px] leading-[1.5] text-gray-200 hover:text-gold transition-all duration-200 hover:-translate-x-1 font-normal text-right w-full"
  >
    <ChevronLeft size={13} className="text-gold/70 group-hover:text-gold transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0" />
    <span className="break-words">{children}</span>
  </a>
);

// Reusable Social Icon Button - 40x40px circular design
const SocialIconButton: React.FC<{
  href: string;
  ariaLabel: string;
  title: string;
  children: React.ReactNode;
}> = ({ href, ariaLabel, title, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={ariaLabel}
    title={title}
    className="w-[40px] h-[40px] rounded-full bg-[#180224] border border-gold/40 hover:border-gold hover:bg-gradient-to-tr hover:from-gold hover:to-[#dfc285] hover:shadow-[0_0_10px_rgba(199,169,105,0.3)] flex items-center justify-center shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group shrink-0"
  >
    {children}
  </a>
);

// Clean Vector Icons for Social Channels
const WhatsAppIcon: React.FC = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="17" 
    height="17" 
    fill="currentColor" 
    className="text-gold group-hover:text-[#180224] transition-colors"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const XIcon: React.FC = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="15" 
    height="15" 
    fill="currentColor" 
    className="text-gold group-hover:text-[#180224] transition-colors"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SnapchatIcon: React.FC = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="16" 
    height="16" 
    fill="currentColor" 
    className="text-gold group-hover:text-[#180224] transition-colors"
  >
    <path d="M12.003 2c-3.79 0-5.887 2.684-5.91 4.792-.012.98.318 1.933.568 2.673.09.266.175.52.213.73-.298.077-.852.23-1.285.49-.444.267-.78.68-.78 1.258 0 .54.34.982.77 1.257.447.284 1.05.44 1.488.514.072.247.168.498.29.743-.075.053-.186.13-.322.222-.497.337-1.34.912-1.34 2.148 0 1.01.764 1.868 1.996 2.012.443.052.937.037 1.432.018.528-.02 1.077-.042 1.637.23.473.23 1.066.613 1.807.613.732 0 1.32-.378 1.79-.607.568-.276 1.127-.253 1.666-.232.484.018.966.033 1.402-.02 1.23-.147 1.992-1.004 1.992-2.014 0-1.236-.843-1.81-1.34-2.148-.137-.093-.247-.17-.323-.223.123-.245.22-.496.29-.743.438-.075 1.04-.23 1.488-.514.43-.275.77-.718.77-1.257 0-.578-.336-.99-.78-1.258-.433-.26-.987-.413-1.285-.49.038-.21.122-.464.213-.73.25-.74.58-1.693.568-2.673C17.89 4.684 15.793 2 12.003 2z" />
  </svg>
);

const InstagramIcon: React.FC = () => (
  <svg 
    viewBox="0 0 24 24" 
    width="16" 
    height="16" 
    fill="currentColor" 
    className="text-gold group-hover:text-[#180224] transition-colors"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default Footer;
