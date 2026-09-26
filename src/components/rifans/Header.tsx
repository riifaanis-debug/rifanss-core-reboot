import React, { useState, useEffect, useRef } from 'react';
import { Menu, User, Sun, Moon, Bell, X } from 'lucide-react';
import SideMenu from './SideMenu';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';
import { getMyNotifications, markAllNotificationsRead } from '../../lib/api';
import { navigateTo } from '../../utils/scrollManager';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, token } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const [isDark, setIsDark] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    if (user && token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 120000);
      return () => clearInterval(interval);
    }
  }, [user, token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
      const unread = data.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleNotifications = async () => {
    if (!showNotifications) {
      await fetchNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = async (n: any) => {
    setShowNotifications(false);
    try {
      const { markNotificationRead } = await import('../../lib/api');
      await markNotificationRead(n.id);
    } catch (e) {
      console.error(e);
    }
    setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
    setUnreadCount(prev => Math.max(0, prev - 1));

    const type = n.type || '';
    const title = n.title || '';
    const subId = n.submission_id;

    if (type === 'contract' || title.includes('عقد')) {
      window.location.hash = subId ? `#/contract/${subId}` : `#/dashboard?tab=contracts`;
      return;
    }
    if (type === 'promissory_note' || title.includes('سند')) {
      window.location.hash = subId ? `#/promissory/${subId}` : `#/dashboard?tab=promissory`;
      return;
    }
    if (type === 'invoice' || title.includes('فاتورة')) {
      window.location.hash = subId ? `#/invoice/${subId}` : `#/dashboard?tab=invoices`;
      return;
    }
    if (type === 'open_request' || type === 'system' || title.includes('مستند') || title.includes('طلب مفتوح')) {
      window.location.hash = `#/dashboard?tab=open_requests${subId ? `&openReq=${subId}` : ''}`;
      return;
    }
    window.location.hash = `#/dashboard?tab=requests${subId ? `&reqId=${subId}` : ''}`;
  };

  const handleOpenAuth = () => {
    window.dispatchEvent(new CustomEvent('open-auth'));
  };

  const handleOpenDashboard = () => {
    window.location.hash = '#/dashboard';
  };

  const handleOpenAdmin = () => {
    window.location.hash = '#/admin';
  };

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[52px] sm:h-[60px] md:h-[70px] flex items-center
        ${isScrolled 
          ? 'bg-white/85 dark:bg-black/80 backdrop-blur-xl border-b border-gold/20 shadow-sm' 
          : 'bg-transparent border-b border-transparent shadow-none'}`}>
        
        <div className="container mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between">
          {/* Right: User Actions (RTL: Right edge) */}
          <div className="flex-1 flex items-center justify-start gap-1.5 sm:gap-3 order-1">
            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {user.role === 'admin' && (
                  <button 
                    onClick={handleOpenAdmin} 
                    className="flex items-center gap-1.5 px-2 py-1 sm:py-1.5 rounded-lg bg-gold text-[#180020] hover:bg-[#d8b570] transition-all shadow-sm font-bold"
                  >
                    <span className="hidden md:block text-[9px] font-black uppercase">لوحة الإدارة</span>
                  </button>
                )}
                <button 
                  onClick={handleOpenDashboard} 
                  className="flex items-center gap-1.5 px-2 py-1 sm:py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold hover:bg-gold/20 transition-all group relative"
                >
                  <span className="hidden md:block text-[10px] font-bold">{user.fullName || user.name || 'حسابي'}</span>
                  <User size={14} className="sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform" />
                </button>
                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={handleToggleNotifications}
                    className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all relative
                      ${isScrolled ? 'bg-gold/10 text-gray-800 dark:text-gold hover:bg-gold/20' : 'bg-black/20 text-white hover:bg-black/30 backdrop-blur-sm'}`}
                  >
                    <Bell size={15} className="sm:w-4 sm:h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute top-10 sm:top-12 right-0 w-[min(300px,calc(100vw-1.5rem))] max-h-[380px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-gold/20 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                      <div className="flex items-center justify-between p-2.5 sm:p-3 border-b border-gold/10">
                        <h3 className="text-xs sm:text-[13px] font-bold text-gray-900 dark:text-gold">التنبيهات</h3>
                        <button onClick={() => setShowNotifications(false)} className="w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                          <X size={11} />
                        </button>
                      </div>
                      <div className="overflow-y-auto max-h-[320px] custom-scrollbar">
                        {notifications.length > 0 ? (
                          notifications.slice(0, 20).map((n) => (
                            <button
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`w-full p-2.5 sm:p-3 border-b border-gray-50 dark:border-white/5 text-right transition-colors hover:bg-gold/10 active:scale-[0.99] cursor-pointer block ${!n.is_read ? 'bg-gold/5' : ''}`}
                            >
                              <div className="flex items-start gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-gold' : 'bg-gray-300 dark:bg-white/20'}`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] sm:text-[12px] font-bold text-gray-900 dark:text-white truncate">{n.title}</p>
                                  <p className="text-[10px] sm:text-[11px] text-muted leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                                  <p className="text-[8.5px] text-muted/60 mt-0.5">{getTimeAgo(n.created_at)}</p>
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-5 text-center text-muted">
                            <Bell size={20} className="mx-auto mb-1.5 opacity-20" />
                            <p className="text-[10px] sm:text-[11px]">لا توجد تنبيهات</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button 
                onClick={handleOpenAuth} 
                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 border-0 outline-none
                  ${isScrolled ? 'text-gray-800 dark:text-gold hover:bg-gold/10' : 'text-white hover:bg-white/15'} whitespace-nowrap`}
              >
                {t('login_register')}
              </button>
            )}
          </div>

          {/* Center: Logo */}
          <a href="#/" onClick={(e) => navigateTo('#/', e)} className="flex-shrink-0 flex items-center justify-center order-2 transition-transform hover:scale-105 active:scale-95 mx-2 sm:mx-4" title="شركة ريفانس المالية">
            <Logo 
              variant="header" 
              isScrolled={isScrolled} 
              className="h-[42px] sm:h-[50px] md:h-[58px] lg:h-[60px] w-auto max-w-[150px] sm:max-w-[190px] md:max-w-[240px]" 
            />
          </a>

          {/* Left: Menu & Controls (RTL: Left edge) */}
          <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-3 md:gap-4 order-3">
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={toggleLanguage} 
                className={`w-9 h-9 flex items-center justify-center font-bold text-xs rounded-xl transition-all ${
                  isScrolled ? 'text-gray-800 dark:text-gold hover:bg-gold/10' : 'text-white hover:bg-white/15'
                }`}
              >
                {language === 'ar' ? 'EN' : 'ع'}
              </button>
              <button 
                onClick={toggleTheme} 
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                  isScrolled ? 'text-gray-800 dark:text-gold hover:bg-gold/10' : 'text-white hover:bg-white/15'
                }`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <button 
              onClick={() => setIsMenuOpen(true)} 
              aria-label="القائمة الجانبية"
              className={`p-1.5 sm:p-2 rounded-xl transition-all hover:bg-gold/10 group ${isScrolled ? 'text-gray-800 dark:text-gold' : 'text-white'}`}
            >
              <Menu size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;