import React, { useEffect, useState } from 'react';
import { X, User, LogIn, LogOut, LayoutDashboard, Shield, Mail } from 'lucide-react';
import Logo from './Logo';
import { navigateTo } from '../../utils/scrollManager';
import { useAuth } from '../../contexts/AuthContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  href: string;
  highlight?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'الصفحة الرئيسية', href: '#/' },
  { label: 'مجالات أعمالنا', href: '#business-fields' },
  { label: 'من نحن', href: '#/about' },
  { label: 'اتصل بنا', href: '#/contact' },
  { label: 'الخدمات المالية', href: '#/business-field/financial' },
  { label: 'الخدمات المصرفية', href: '#/business-field/banking' },
  { label: 'الخدمات العقارية', href: '#/business-field/real-estate' },
  { label: 'الخدمات القضائية والقانونية', href: '#/business-field/legal' },
  { label: 'الخدمات الإلكترونية', href: '#/electronic-services' },
];

// Clean Vector Icons identical to Footer
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

const socialLinks = [
  { href: "https://wa.me/rifanes", icon: <WhatsAppIcon />, label: "واتساب", title: "واتساب" },
  { href: "https://x.com/rifaniis", icon: <XIcon />, label: "منصة إكس", title: "إكس" },
  { href: "https://www.snapchat.com/add/rifaniis", icon: <SnapchatIcon />, label: "سناب شات", title: "سناب شات" },
  { href: "https://www.instagram.com/riifanis", icon: <InstagramIcon />, label: "انستغرام", title: "انستغرام" },
  { href: "mailto:info@rifans.net", icon: <Mail size={16} className="text-gold group-hover:text-[#180224] transition-colors" />, label: "البريد الإلكتروني", title: "البريد الإلكتروني" },
];

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    onClose();
    navigateTo(href, e);
  };

  const handleOpenAuth = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('open-auth'));
  };

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-[310px] h-full bg-white dark:bg-brand shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header - Compact Spacing */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gold/10">
           <button onClick={onClose} aria-label="إغلاق القائمة" className="w-9 h-9 flex items-center justify-center text-muted hover:text-brand hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg transition-colors">
             <X size={22} />
           </button>
           <Logo className="h-10 w-auto max-w-[150px]" />
        </div>

        {/* User Account Bar - Compact Spacing */}
        <div className="px-5 py-2.5 bg-gold/5 dark:bg-black/20 border-b border-gold/10">
          {user ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                    <User size={15} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-brand dark:text-gold truncate max-w-[140px]">
                      {user.fullName || user.name || 'عميل ريفان'}
                    </p>
                    <p className="text-[10px] text-muted truncate">{user.phone || user.national_id || ''}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); onClose(); }}
                  title="تسجيل الخروج"
                  className="p-1 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut size={15} />
                </button>
              </div>

              <div className="flex items-center gap-2 pt-0.5">
                <a
                  href="#/dashboard"
                  onClick={(e) => handleLinkClick('#/dashboard', e)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gold text-brand dark:text-black font-bold text-xs hover:bg-gold/90 transition-all shadow-sm"
                >
                  <LayoutDashboard size={13} />
                  <span>لوحة التحكم</span>
                </a>
                {user.role === 'admin' && (
                  <a
                    href="#/admin"
                    onClick={(e) => handleLinkClick('#/admin', e)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-brand border border-gold/30 text-gold text-xs font-bold hover:bg-brand/90 transition-all"
                  >
                    <Shield size={13} />
                    <span>الإدارة</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={handleOpenAuth}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-gold to-[#D8B979] text-brand font-black text-xs shadow-sm hover:brightness-105 active:scale-98 transition-all"
            >
              <LogIn size={15} />
              <span>تسجيل الدخول / حساب جديد</span>
            </button>
          )}
        </div>

        {/* Menu Navigation Links - Reduced Vertical Gaps */}
        <div className="flex-1 overflow-y-auto py-1 scrollbar-hide">
            {menuItems.map((item, idx) => (
                <a 
                  key={idx} 
                  href={item.href} 
                  onClick={(e) => handleLinkClick(item.href, e)}
                  className={`block px-5 py-2 text-[13.5px] font-bold transition-all text-right border-r-4
                    ${item.highlight 
                      ? 'text-gold bg-gold/5 border-gold font-black' 
                      : 'text-brand dark:text-white hover:bg-gold/5 border-transparent hover:border-gold/30'
                    }`}
                >
                    {item.label}
                </a>
            ))}
        </div>

        {/* Social Links Footer - Identical to Footer Design and Colors */}
        <div className="px-5 py-3.5 bg-[#180224] dark:bg-black/60 border-t border-gold/20 flex flex-col items-center">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/70 mb-2">RIFANS FINANCIAL</div>
            <div className="flex items-center justify-center gap-2.5 w-full">
                {socialLinks.map((link, i) => (
                    <a 
                      key={i} 
                      href={link.href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      aria-label={link.label}
                      title={link.title}
                      className="w-[38px] h-[38px] rounded-full bg-[#180224] border border-gold/40 hover:border-gold hover:bg-gradient-to-tr hover:from-gold hover:to-[#dfc285] hover:shadow-[0_0_10px_rgba(199,169,105,0.3)] flex items-center justify-center shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group shrink-0"
                    >
                        {link.icon}
                    </a>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
