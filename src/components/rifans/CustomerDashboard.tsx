import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserProfile, CustomerRequest, UserProduct, UserDocument } from '../../types';
import { X, User, Phone, CreditCard, LogOut, FileText, Clock, Briefcase, Edit, CheckCircle2, AlertTriangle, MapPin, Building2, Wallet, Plus, Trash2, FolderOpen, Upload, Paperclip, QrCode, Loader2, ArrowRight, Bell, PenTool, UserPlus, ChevronDown, Scale, Home, Receipt, BarChart3, MessageSquare, Shield, Copy, CheckCircle, MessageCircle, Eye, Inbox, RotateCcw, Hash } from 'lucide-react';
import CustomerOpenRequests from './CustomerOpenRequests';
import { CustomerPaymentRequests } from './PaymentRequests';
import ChatPage from './ChatPage';
import { Button } from './Shared';
import { useAuth } from '../../contexts/AuthContext';
import Logo from './Logo';
import { safeStringify, safeParse } from '../../utils/safeJson';
import { supabase } from '@/integrations/supabase/client';
import { getMyRequests, getMyNotifications, getMyContracts, getMyInvoices, getMyPromissoryNotes, getProfile, updateProfile, markAllNotificationsRead, markNotificationRead, uploadDocument, deleteRequest } from '../../lib/api';
import { getMyOpenRequests } from '../../lib/openRequestsApi';
import { formatAmount } from '../../lib/formatNumber';

interface CustomerDashboardProps {
  user: UserProfile;
  onClose: () => void;
  onLogout: () => void;
}

// Constants for dropdowns (Shared with Waive Form concept)
const REGION_CITIES: Record<string, string[]> = {
  "الرياض": ["الرياض","الدرعية","الخرج","الدوادمي","المجمعة","القويعية","وادي الدواسر","الزلفي","شقراء","حوطة بني تميم","الأفلاج","السليل","ضرما","المزاحمية"],
  "مكة المكرمة": ["مكة المكرمة","جدة","الطائف","رابغ","خليص","الليث","القنفذة","العرضيات","الكامل"],
  "المدينة": ["المدينة المنورة","ينبع","العلا","بدر","الحناكية","خيبر"],
  "القصيم": ["بريدة","عنيزة","الرس","البكيرية","البدائع","المذنب","عيون الجواء","رياض الخبراء"],
  "الشرقية": ["الدمام","الخبر","الظهران","القطيف","الأحساء","الجبيل","الخفجي","حفر الباطن","بقيق","رأس تنورة"],
  "عسير": ["أبها","خميس مشيط","بيشة","محايل عسير","النماص","رجال ألمع"],
  "تبوك": ["تبوك","الوجه","ضباء","تيماء","أملج","حقل"],
  "حائل": ["حائل","بقعاء","الغزالة","الشنان"],
  "الحدود الشمالية": ["عرعر","رفحاء","طريف","العويقلية"],
  "جازان": ["جيزان","صبيا","أبو عريش","صامطة","بيش","الدرب"],
  "نجران": ["نجران","شرورة","حبونا","بدر الجنوب"],
  "الباحة": ["الباحة","بلجرشي","المندق","المخواة"],
  "الجوف": ["سكاكا","القريات","دومة الجندل","طبرجل"]
};

const BANKS = [
  "البنك الأهلي السعودي (SNB)", "مصرف الراجحي", "بنك الرياض", 
  "البنك السعودي البريطاني (ساب)", "البنك السعودي الفرنسي", "بنك البلاد", 
  "بنك الجزيرة", "بنك الإنماء", "بنك الخليج الدولي - السعودية", "جهة تمويلية أخرى"
];

const DOCUMENT_TYPES = [
  "تقرير طبي",
  "قرار انهاء الخدمة",
  "مشهد تقييم إعاقة",
  "مشهد ضمان اجتماعي",
  "قرار الهيئة الطبية",
  "قرار طبي",
  "مستندات اخرى"
];

// Custom invoice receipt icon matching the attached reference image (zigzag edges + dollar symbol in center)
const InvoiceReceiptIcon: React.FC<{ size?: number; className?: string; strokeWidth?: number }> = ({ 
  size = 20, 
  className = '', 
  strokeWidth = 1.8 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M4 2v20l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5V2l-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2 1.5Z" />
    <path d="M12 6.5v11" />
    <path d="M14.5 9.5a2.5 2.5 0 0 0-5 0c0 1.5 1 2.3 2.5 2.5s2.5 1 2.5 2.5a2.5 2.5 0 0 1-5 0" />
  </svg>
);

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onClose, onLogout }) => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'requests' | 'contracts' | 'invoices' | 'payments' | 'open_requests' | 'promissory'>(() => {
    const hash = window.location.hash;
    if (hash.includes('tab=contracts')) return 'contracts';
    if (hash.includes('tab=requests')) return 'requests';
    if (hash.includes('tab=invoices')) return 'invoices';
    if (hash.includes('tab=promissory')) return 'promissory';
    if (hash.includes('tab=payments')) return 'payments';
    if (hash.includes('tab=open_requests')) return 'open_requests';
    return 'profile';
  });
  const [userData, setUserData] = useState<UserProfile>(user);
  const [requests, setRequests] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [promissoryNotes, setPromissoryNotes] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [openRequests, setOpenRequests] = useState<any[]>([]);
  const [targetOpenRequestId, setTargetOpenRequestId] = useState<string | null>(() => {
    const match = window.location.hash.match(/[?&]openReq=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  });
  const [targetRequestId, setTargetRequestId] = useState<string | null>(() => {
    const match = window.location.hash.match(/[?&]reqId=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(true);

  // Fetch unread chat messages count
  useEffect(() => {
    const currentUserId = authUser?.id?.toString() || '';
    if (!currentUserId) return;
    const fetchUnread = async () => {
      const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true })
        .eq('receiver_id', currentUserId).eq('is_read', false);
      setUnreadChatCount(count || 0);
    };
    fetchUnread();
    const channelName = `unread-chat-customer-${currentUserId}-${Date.now()}`;
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, () => fetchUnread())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authUser?.id]);

  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  
  const generateFileNumber = () => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `RF-${datePart}-${randomPart}`;
  };
  
  // Document Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [showRequestTypeSelector, setShowRequestTypeSelector] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showServiceBrowser, setShowServiceBrowser] = useState(false);

  // Service categories with sub-services for the dropdown browser (4 main categories)
  const serviceCategories = [
    { 
      id: 'consulting', label: 'الاستشارات المالية', icon: <MessageSquare size={16} className="text-gold" />,
      subServices: ['التخطيط والتحليل المالي', 'استشارات التعثر والتمويل', 'إعادة الهيكلة والتسويات المالية', 'الاستشارات الاستثمارية']
    },
    { 
      id: 'banking', label: 'الخدمات المصرفية', icon: <Building2 size={16} className="text-gold" />,
      subServices: ['إدارة المنتجات التمويلية', 'إعادة جدولة القروض', 'نقاط البيع والمحافظ الرقمية', 'تنظيم وتنسيق الحسابات البنكية']
    },
    { 
      id: 'realestate', label: 'الحلول العقارية', icon: <Home size={16} className="text-gold" />,
      subServices: ['التمويل العقاري والرهن', 'التقييم العقاري المعتمد', 'التوثيق والإفراغ العقاري', 'إدارة الأملاك وعقود الإيجار']
    },
    { 
      id: 'legal', label: 'الخدمات القانونية', icon: <Scale size={16} className="text-gold" />,
      subServices: ['صياغة وتوثيق العقود', 'رفع الدعاوى والاعتراضات', 'معالجة ملفات وقضايا التنفيذ', 'الاستشارات الزكوية والضريبية']
    },
  ];

  const handleServiceSubRequest = (categoryId: string, subServiceName: string) => {
    setShowRequestTypeSelector(false);
    setShowServiceBrowser(false);
    setExpandedCategory(null);
    window.dispatchEvent(new CustomEvent('open-waive-form', { 
      detail: { ...userData, requestType: 'service_request', serviceCategory: categoryId, subService: subServiceName } 
    }));
    onClose();
  };

  useEffect(() => {
    if (authUser) {
      fetchData();
      fetchNotifications();
      fetchContracts();
    }

    const handleRefresh = () => {
      fetchData();
      fetchNotifications();
      fetchContracts();
    };
    window.addEventListener('request-submitted', handleRefresh);
    window.addEventListener('signature-submitted', handleRefresh);

    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('tab=contracts')) setActiveTab('contracts');
      else if (hash.includes('tab=requests')) setActiveTab('requests');
      else if (hash.includes('tab=invoices')) setActiveTab('invoices');
      else if (hash.includes('tab=promissory')) setActiveTab('promissory');
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('request-submitted', handleRefresh);
      window.removeEventListener('signature-submitted', handleRefresh);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [authUser]);

  const fetchData = async () => {
    if (!authUser) return;
    try {
      setIsLoading(true);
      
      // Fetch user requests from Supabase
      const requestsData = await getMyRequests();
      setRequests(requestsData);

      // Fetch profile from Supabase
      let currentProfile: UserProfile | null = null;
      try {
        const profileData = await getProfile();
        if (profileData) {
          currentProfile = {
            fullName: profileData.full_name || '',
            firstName: profileData.first_name || '',
            middleName: profileData.middle_name || '',
            lastName: profileData.last_name || '',
            nationalId: profileData.national_id || '',
            mobile: profileData.phone || '',
            fileNumber: profileData.file_number || '',
            email: profileData.email || '',
            jobStatus: profileData.job_status || '',
            salary: profileData.salary ? Number(profileData.salary) : undefined,
            joinDate: profileData.created_at || '',
            age: profileData.age || '',
            region: profileData.region || '',
            city: profileData.city || '',
            bank: profileData.bank || '',
            products: (profileData.products as any[]) || [],
            documents: (profileData.documents as any[]) || [],
          };
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
      }

      // Fallback to localStorage
      if (!currentProfile) {
        const savedProfile = localStorage.getItem(`profile_${authUser.id}`);
        if (savedProfile && savedProfile !== 'undefined') {
          currentProfile = safeParse(savedProfile, { ...user });
        } else {
          currentProfile = { ...user };
        }
      }
      
      const authNationalId = authUser.nationalId || authUser.national_id || '';
      let authMobile = authUser.mobile || authUser.phone || '';
      
      // Convert +9665... to 05...
      if (authMobile.startsWith('+966')) {
        authMobile = '0' + authMobile.substring(4);
      } else if (authMobile.startsWith('966')) {
        authMobile = '0' + authMobile.substring(3);
      } else if (authMobile.startsWith('5') && authMobile.length === 9) {
        authMobile = '0' + authMobile;
      }

      if (currentProfile) {
        // Pre-fill from auth data - ALWAYS sync these two fields
        currentProfile.nationalId = authNationalId;
        currentProfile.mobile = authMobile;
        
        // Auto-extract customer fields from submitted requests if missing in profile
        if (requestsData && requestsData.length > 0) {
          let hasSyncedRequestData = false;
          for (const req of requestsData) {
            const d = req.data;
            if (d) {
              if (!currentProfile.region && d.region) { currentProfile.region = d.region; hasSyncedRequestData = true; }
              if (!currentProfile.city && d.city) { currentProfile.city = d.city; hasSyncedRequestData = true; }
              if (!currentProfile.age && d.age) { currentProfile.age = String(d.age); hasSyncedRequestData = true; }
              if (!currentProfile.jobStatus && (d.jobStatus || d.job_status)) { currentProfile.jobStatus = d.jobStatus || d.job_status; hasSyncedRequestData = true; }
              if (!currentProfile.bank && d.bank) { currentProfile.bank = d.bank; hasSyncedRequestData = true; }
              if (!currentProfile.firstName && (d.firstName || d.first_name)) { currentProfile.firstName = d.firstName || d.first_name; hasSyncedRequestData = true; }
              if (!currentProfile.middleName && (d.middleName || d.middle_name)) { currentProfile.middleName = d.middleName || d.middle_name; hasSyncedRequestData = true; }
              if (!currentProfile.lastName && (d.lastName || d.last_name)) { currentProfile.lastName = d.lastName || d.last_name; hasSyncedRequestData = true; }
              if (!currentProfile.fullName && (d.fullName || d.full_name)) { currentProfile.fullName = d.fullName || d.full_name; hasSyncedRequestData = true; }
              if ((!currentProfile.products || currentProfile.products.length === 0) && d.products && d.products.length > 0) {
                currentProfile.products = d.products;
                hasSyncedRequestData = true;
              }
            }
          }
          if (hasSyncedRequestData && authUser?.id) {
            updateProfile(currentProfile).catch(console.error);
          }
        }

        // Ensure permanent unique customer/file number exists
        if (!currentProfile.fileNumber || currentProfile.fileNumber === 'RF-####-####') {
          currentProfile.fileNumber = authUser?.fileNumber || authUser?.file_number || generateFileNumber();
          if (authUser?.id) {
            updateProfile(currentProfile).catch(console.error);
          }
        }
        
        setUserData(currentProfile);
        
        if (authUser.role !== 'admin' && (!currentProfile.fullName || currentProfile.fullName === '')) {
          setShowCompleteProfile(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!authUser) return;
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchContracts = async () => {
    if (!authUser) return;
    try {
      const [contractsData, invoicesData, notesData, paymentReqsData, openReqsData] = await Promise.all([
        getMyContracts(),
        getMyInvoices(),
        getMyPromissoryNotes(),
        supabase.from('payment_requests').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false }),
        getMyOpenRequests(),
      ]);
      setContracts(contractsData || []);
      setInvoices(invoicesData || []);
      setPromissoryNotes(notesData || []);
      setPaymentRequests(paymentReqsData?.data || []);
      setOpenRequests(openReqsData || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Close notifications dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationsOpen]);

  // Realtime synchronization for customer entities
  useEffect(() => {
    const currentUserId = authUser?.id?.toString() || '';
    if (!currentUserId) return;

    let mounted = true;
    const channelName = `customer-dashboard-realtime-${currentUserId}-${Date.now()}`;
    const channel = supabase.channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUserId}` }, () => {
        if (mounted) fetchNotifications();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts', filter: `user_id=eq.${currentUserId}` }, () => {
        if (mounted) fetchContracts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices', filter: `user_id=eq.${currentUserId}` }, () => {
        if (mounted) fetchContracts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promissory_notes', filter: `user_id=eq.${currentUserId}` }, () => {
        if (mounted) fetchContracts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'open_requests', filter: `user_id=eq.${currentUserId}` }, () => {
        if (mounted) fetchContracts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests', filter: `user_id=eq.${currentUserId}` }, () => {
        if (mounted) fetchData();
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [authUser?.id]);

  // Hash change listener for deep navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('tab=contracts')) setActiveTab('contracts');
      else if (hash.includes('tab=requests')) setActiveTab('requests');
      else if (hash.includes('tab=invoices')) setActiveTab('invoices');
      else if (hash.includes('tab=promissory')) setActiveTab('promissory');
      else if (hash.includes('tab=payments')) setActiveTab('payments');
      else if (hash.includes('tab=open_requests')) setActiveTab('open_requests');
      
      const openReqMatch = hash.match(/[?&]openReq=([^&]+)/);
      if (openReqMatch) {
        setTargetOpenRequestId(decodeURIComponent(openReqMatch[1]));
        setActiveTab('open_requests');
      }
      const reqMatch = hash.match(/[?&]reqId=([^&]+)/);
      if (reqMatch) {
        setTargetRequestId(decodeURIComponent(reqMatch[1]));
        setActiveTab('requests');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Event listener for request submissions & refresh requests
  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
      fetchContracts();
      fetchNotifications();
    };
    window.addEventListener('request-submitted', handleRefresh);
    window.addEventListener('rifans-refresh-dashboard', handleRefresh);
    return () => {
      window.removeEventListener('request-submitted', handleRefresh);
      window.removeEventListener('rifans-refresh-dashboard', handleRefresh);
    };
  }, []);

  const handleNotificationClick = async (n: any) => {
    setIsNotificationsOpen(false);
    if (!n.is_read) {
      await markAsRead(n.id);
      try {
        await markNotificationRead(n.id);
      } catch (e) {
        console.error("Mark read error:", e);
      }
    }

    const type = n.type || '';
    const title = n.title || '';
    const subId = n.submission_id;

    // Contract direct navigation
    if (type === 'contract' || title.includes('عقد')) {
      if (subId) {
        window.location.hash = `#/contract/${subId}`;
      } else if (contracts.length > 0) {
        window.location.hash = `#/contract/${contracts[0].submission_id || contracts[0].id}`;
      } else {
        setActiveTab('contracts');
      }
      return;
    }

    // Promissory Note direct navigation
    if (type === 'promissory_note' || title.includes('سند')) {
      const foundNote = promissoryNotes.find((p: any) => p.submission_id === subId || p.id === subId);
      const noteId = foundNote?.id || subId;
      if (noteId) {
        window.location.hash = `#/promissory/${noteId}`;
      } else if (promissoryNotes.length > 0) {
        window.location.hash = `#/promissory/${promissoryNotes[0].id}`;
      } else {
        setActiveTab('promissory');
      }
      return;
    }

    // Invoice direct navigation
    if (type === 'invoice' || title.includes('فاتورة')) {
      if (subId) {
        window.location.hash = `#/invoice/${subId}`;
      } else if (invoices.length > 0) {
        window.location.hash = `#/invoice/${invoices[0].submission_id || invoices[0].id}`;
      } else {
        setActiveTab('invoices');
      }
      return;
    }

    // Open Request / Document direct navigation
    if (type === 'open_request' || type === 'system' || title.includes('مستند') || title.includes('طلب مفتوح')) {
      if (subId) {
        setTargetOpenRequestId(subId);
      }
      setActiveTab('open_requests');
      return;
    }

    // Status change / request direct navigation
    if (type === 'status_change' || type === 'status_update' || subId) {
      const foundReq = requests.find((r: any) => r.id === subId);
      if (foundReq) {
        setActiveTab('requests');
        window.dispatchEvent(new CustomEvent('open-waive-form', { 
          detail: { 
            ...userData, 
            ...(foundReq.data || {}), 
            requestType: foundReq.type, 
            viewOnly: true, 
            viewRequestId: foundReq.id, 
            viewRequestStatus: foundReq.status 
          } 
        }));
      } else {
        setActiveTab('requests');
      }
      return;
    }

    setActiveTab('requests');
  };

  const markAsRead = async (id: string) => {
    try {
      const updatedNotifications = notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
      setNotifications(updatedNotifications);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!authUser) return;
    try {
      await markAllNotificationsRead();
      const updatedNotifications = notifications.map(n => ({ ...n, is_read: true }));
      setNotifications(updatedNotifications);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const onlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Delete') {
      e.preventDefault();
    }
  };

  const handleMobileChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setUserData({...userData, mobile: cleaned});
    setProfileError('');
  };

  const handleSaveProfile = async () => {
    setProfileError('');
    
    // Validate required fields
    if (!userData.firstName || !userData.lastName || !userData.mobile) {
      setProfileError('يرجى إكمال الاسم الأول والاسم الأخير ورقم الجوال');
      return;
    }

    if (!userData.mobile || !/^05[0-9]{8}$/.test(userData.mobile)) {
      setProfileError('رقم الجوال يجب أن يتكون من 10 أرقام ويبدأ بـ 05');
      return;
    }

    // Update fullName
    const fullName = [userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ').trim();

    let fileNumber = userData.fileNumber;
    if (!fileNumber || fileNumber === 'RF-####-####') {
      fileNumber = generateFileNumber();
    }
    const updatedData = { ...userData, fullName, fileNumber };
    
    // Save to localStorage
    try {
      localStorage.setItem(`profile_${authUser?.id}`, safeStringify(updatedData));
    } catch (e) {
      console.error("Error saving profile to localStorage:", e);
    }
    
    // Save to Supabase
    try {
      await updateProfile(updatedData);
    } catch (err) {
      console.error("Error saving profile:", err);
    }

    setUserData(updatedData);
    setIsEditing(false);
    setShowCompleteProfile(false);
  };

  // Product Management Handlers
  const addProduct = () => {
    setUserData({
      ...userData,
      products: [...(userData.products || []), { id: Date.now(), type: '', amount: '', accountNumber: '' }]
    });
  };

  const removeProduct = (id: number) => {
    setUserData({
      ...userData,
      products: (Array.isArray(userData.products) ? userData.products : []).filter(p => p.id !== id)
    });
  };

  const updateProduct = (id: number, field: 'type' | 'amount' | 'accountNumber', value: string) => {
    setUserData({
      ...userData,
      products: (Array.isArray(userData.products) ? userData.products : []).map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  // Document Management Handlers
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedDocType) {
      const file = e.target.files[0];
      
      try {
        setIsUploading(true);
        
        const data = await uploadDocument(file);
        const newDoc: UserDocument = {
          id: Date.now(),
          type: selectedDocType,
          fileName: data.fileName,
          filePath: data.filePath,
          date: new Date().toLocaleDateString('ar-SA')
        };
        
        const updatedUserData = {
          ...userData,
          documents: [...(userData.documents || []), newDoc]
        };
        
        setUserData(updatedUserData);
        
        // Save updated profile
        await updateProfile(updatedUserData);
      } catch (err) {
        console.error("Upload error:", err);
        alert('حدث خطأ أثناء رفع الملف.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSelectedDocType('');
      }
    }
  };

  const removeDocument = (id: number) => {
    setUserData({
      ...userData,
      documents: (Array.isArray(userData.documents) ? userData.documents : []).filter(d => d.id !== id)
    });
  };

  const handleOpenRequestForm = (type: string) => {
    setShowRequestTypeSelector(false);
    setShowServiceBrowser(false);
    setExpandedCategory(null);
    
    let subServiceName = '';
    if (type === 'waive_request') subServiceName = 'طلب إعفاء من الإلتزامات المالية';
    else if (type === 'rescheduling_request') subServiceName = 'طلب اعادة جدولة المنتجات التمويلية';
    else if (type === 'consultation_request') subServiceName = 'طلب استشارة مالية';
    else if (type === 'seized_amounts_request') subServiceName = 'طلب اتاحة النسبة النظامية والمبالغ المستثناه من الحجز';

    window.dispatchEvent(new CustomEvent('open-waive-form', { 
      detail: { 
        ...userData, 
        requestType: type,
        subService: subServiceName,
        serviceCategory: type === 'consultation_request' ? 'consulting' : 'financial_commitments'
      } 
    }));
    onClose();
  };

  const handleResumeDraft = (req: any) => {
    const draftData = req.data || {};
    window.dispatchEvent(new CustomEvent('open-waive-form', { 
      detail: { 
        ...userData,
        ...draftData,
        requestType: req.type,
        draftId: req.id,
        firstName: draftData.firstName,
        middleName: draftData.middleName,
        lastName: draftData.lastName,
        age: draftData.age,
        nationalId: draftData.nationalId,
        phone: draftData.mobile,
        jobStatus: draftData.jobStatus,
        region: draftData.region,
        city: draftData.city,
        bank: draftData.bank,
        summary: draftData.summary,
        products: draftData.products,
      } 
    }));
  };

  const hasContracts = Boolean(contracts && contracts.length > 0);
  const hasPromissory = Boolean(promissoryNotes && promissoryNotes.length > 0);
  const hasInvoices = Boolean(invoices && invoices.length > 0);
  const hasDocuments = Boolean((openRequests && openRequests.length > 0) || (userData.documents && userData.documents.length > 0));
  const hasRequests = Boolean(requests && requests.length > 0);
  const hasPayments = Boolean((paymentRequests && paymentRequests.length > 0) || (hasInvoices && invoices.some((i: any) => (i.status || '').toLowerCase() !== 'paid')));

  // Badges for unread / pending items strictly reflect real customer data
  const unreadContracts = contracts.filter((c: any) => !c.signed_at).length;
  const unreadPromissory = promissoryNotes.filter((n: any) => (n.status || '').toLowerCase() === 'pending').length;
  const unreadInvoices = invoices.filter((i: any) => {
    const s = (i.status || '').toLowerCase();
    return s === 'pending' || s === 'unpaid';
  }).length;
  const unreadRequests = notifications.filter((n: any) => !n.is_read && (n.type === 'status_change' || n.type === 'status_update')).length;

  const contractBadge = unreadContracts;
  const promissoryBadge = unreadPromissory;
  const invoiceBadge = unreadInvoices;
  const overdue = invoices.find((i: any) => (i.status || '').toLowerCase() !== 'paid');

  // Check if admin has sent a contract, promissory note, or invoice to this customer
  const hasSentContractOrNote = hasContracts || hasPromissory || hasInvoices;

  const baseActions = [
    { id: 'new_request', icon: Plus, iconStroke: 2.4, label: 'طلب جديد', onClick: () => setShowRequestTypeSelector(true), badge: 0 },
    { id: 'requests', tab: 'requests', icon: FileText, iconStroke: 1.8, label: 'طلباتي', onClick: () => setActiveTab('requests'), badge: unreadRequests > 0 ? unreadRequests : 0 },
  ];

  const adminTriggeredActions = hasSentContractOrNote ? [
    { id: 'contracts', tab: 'contracts', icon: PenTool, iconStroke: 1.8, label: 'عقودي', onClick: () => setActiveTab('contracts'), badge: contractBadge },
    { id: 'promissory', tab: 'promissory', icon: FileText, iconStroke: 1.8, label: 'سنداتي', onClick: () => setActiveTab('promissory'), badge: promissoryBadge },
    { id: 'invoices', tab: 'invoices', icon: InvoiceReceiptIcon, iconStroke: 1.8, label: 'فواتيري', onClick: () => setActiveTab('invoices'), badge: invoiceBadge },
    { id: 'payments', tab: 'payments', icon: CreditCard, iconStroke: 1.8, label: 'سداد', onClick: () => setActiveTab('payments'), badge: 0 },
  ] : [];

  const quickActions = [...baseActions, ...adminTriggeredActions];

  // If customer has no contracts/promissory/invoices sent from admin, redirect them away from hidden tabs
  useEffect(() => {
    if (!isLoading && !hasSentContractOrNote) {
      if (['contracts', 'promissory', 'invoices', 'payments'].includes(activeTab)) {
        setActiveTab('requests');
      }
    }
  }, [isLoading, hasSentContractOrNote, activeTab]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600 border-gray-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      executing: 'bg-purple-100 text-purple-700 border-purple-200',
      contract_signature: 'bg-gold/20 text-brand border-gold/30',
      completed: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    const labels: Record<string, string> = {
      draft: 'مسودة',
      pending: 'جديد',
      processing: 'تحت الإجراء',
      executing: 'قيد التنفيذ',
      contract_signature: 'بانتظار التوقيع',
      completed: 'مكتمل',
      rejected: 'مرفوض',
    };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-[90] flex justify-end transition-opacity duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-[450px] h-full bg-[#F9F8FC] dark:bg-[#06010a] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-gold/20">
        
        {/* Complete Profile Popup */}
        {showCompleteProfile && (
          <div className="absolute inset-0 z-[100] bg-brand/90 backdrop-blur-md flex items-center justify-center p-4 text-right overflow-y-auto">
            <div className="bg-white dark:bg-[#12031a] w-full max-w-[340px] rounded-[24px] p-5 shadow-2xl border border-gold/30 animate-in zoom-in-95 duration-300 my-auto">
              <div className="text-right mb-3 relative">
                <button 
                  onClick={() => setShowCompleteProfile(false)}
                  className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
                >
                  <X size={14} />
                </button>
                <div className="w-11 h-11 bg-gold/10 rounded-full flex items-center justify-center mr-auto ml-auto mb-2 border border-gold/20">
                  <UserPlus className="text-gold" size={22} />
                </div>
                <h3 className="text-base font-bold text-brand dark:text-white">إكمال ملفك الشخصي</h3>
                <p className="text-[9px] text-muted mt-0.5 leading-relaxed">يرجى تزويدنا ببعض المعلومات الإضافية لنتمكن من خدمتك بشكل أفضل</p>
              </div>

              <div className="space-y-2">
                {profileError && (
                  <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-[10px] flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <AlertTriangle size={12} />
                    {profileError}
                  </div>
                )}

                <div className={`grid ${requests && requests.length > 0 ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5`}>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-brand dark:text-gold/80 px-1">رقم الهوية الوطنية</label>
                    <div className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] font-bold text-brand dark:text-white flex items-center justify-center">
                      {userData.nationalId || '—'}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[8px] font-bold text-brand dark:text-gold/80 px-1">رقم الجوال <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      placeholder="05xxxxxxxx"
                      value={userData.mobile || ''}
                      onChange={(e) => { setUserData({...userData, mobile: e.target.value}); setProfileError(''); }}
                      onKeyDown={onlyNumbers}
                      className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] focus:border-gold outline-none dark:text-white dir-ltr text-right"
                    />
                  </div>
                  {requests && requests.length > 0 && (
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-bold text-brand dark:text-gold/80 px-1">العمر</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        placeholder="بالسنوات"
                        onKeyDown={onlyNumbers}
                        value={userData.age || ''}
                        onChange={(e) => setUserData({...userData, age: e.target.value.replace(/\D/g, '')})}
                        className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] focus:border-gold outline-none dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {requests && requests.length > 0 && (
                  <div className="grid grid-cols-3 gap-1.5 animate-in fade-in">
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-bold text-brand dark:text-gold/80 px-1">المنطقة <span className="text-red-500">*</span></label>
                      <select 
                        value={userData.region || ''} 
                        onChange={(e) => { setUserData({...userData, region: e.target.value, city: ''}); setProfileError(''); }}
                        className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] focus:border-gold outline-none dark:text-white"
                      >
                        <option value="">اختر</option>
                        {Object.keys(REGION_CITIES).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-bold text-brand dark:text-gold/80 px-1">المدينة <span className="text-red-500">*</span></label>
                      <select 
                        value={userData.city || ''} 
                        onChange={(e) => { setUserData({...userData, city: e.target.value}); setProfileError(''); }}
                        className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] focus:border-gold outline-none dark:text-white"
                        disabled={!userData.region}
                      >
                        <option value="">اختر</option>
                        {userData.region && REGION_CITIES[userData.region]?.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[8px] font-bold text-brand dark:text-gold/80 px-1">الحالة الوظيفية <span className="text-red-500">*</span></label>
                      <select 
                        value={userData.jobStatus || ''} 
                        onChange={(e) => { setUserData({...userData, jobStatus: e.target.value}); setProfileError(''); }}
                        className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] focus:border-gold outline-none dark:text-white"
                      >
                        <option value="">اختر الحالة</option>
                        <option value="موظف حكومي">موظف حكومي</option>
                        <option value="موظف قطاع خاص">موظف قطاع خاص</option>
                        <option value="متقاعد">متقاعد</option>
                        <option value="لا يوجد عمل">لا يوجد عمل</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="space-y-0.5">
                  <label className="text-[8px] font-bold text-brand dark:text-gold/80 px-1">اسم العميل (ثلاثي) <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <input 
                      type="text" 
                      placeholder="الأول"
                      value={userData.firstName || ''}
                      onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                      className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] focus:border-gold outline-none dark:text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="الأوسط"
                      value={userData.middleName || ''}
                      onChange={(e) => setUserData({...userData, middleName: e.target.value})}
                      className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] focus:border-gold outline-none dark:text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="الأخير"
                      value={userData.lastName || ''}
                      onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                      className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] focus:border-gold outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[8px] font-bold text-brand dark:text-gold/80 px-1">الجهة المالية <span className="text-red-500">*</span></label>
                  <select 
                    value={userData.bank || ''} 
                    onChange={(e) => { setUserData({...userData, bank: e.target.value}); setProfileError(''); }}
                    className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] focus:border-gold outline-none dark:text-white"
                  >
                    <option value="">اختر البنك أو الجهة التمويلية</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>

                <div className="space-y-0.5">
                  <label className="text-[8px] font-bold text-brand dark:text-gold/80 px-1">البريد الإلكتروني <span className="text-[8px] text-muted/60">(اختياري)</span></label>
                  <p className="text-[7px] text-muted/50 px-1">لاستلام التقارير ونتائج الخدمات</p>
                  <input 
                    type="email" 
                    placeholder="example@email.com"
                    value={userData.email || ''}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                    className="w-full py-0.5 px-1.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] focus:border-gold outline-none dark:text-white dir-ltr text-right"
                  />
                </div>

                <Button
                  onClick={handleSaveProfile} 
                  className="w-full py-2.5 mt-1 bg-gold text-brand hover:bg-gold/90 border-none text-sm"
                >
                  حفظ ومتابعة
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Chat */}
        <ChatPage isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        
        {/* Header */}
        <div className="bg-white dark:bg-[#12031a] px-3 py-3 sm:py-4 border-b border-gold/10 flex items-center justify-between sticky top-0 z-10" dir="rtl">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center border border-gold/20">
                 <User size={20} />
              </div>
           </div>

           <div className="flex items-center gap-2 relative">
              {/* Notifications Bell */}
              <button 
                onClick={() => {
                  fetchNotifications();
                  setIsNotificationsOpen(prev => !prev);
                }}
                className="w-9 h-9 rounded-full bg-brand/10 dark:bg-white/5 flex items-center justify-center hover:bg-brand/20 dark:hover:bg-white/10 transition-colors relative"
                title="التنبيهات"
              >
                <Bell size={18} className="text-brand dark:text-gold" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-[#E52E3D] text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Popover */}
              {isNotificationsOpen && (
                <div 
                  ref={notificationsRef}
                  className="absolute top-11 left-0 w-[min(320px,calc(100vw-3rem))] max-h-[380px] bg-white dark:bg-[#12031a] rounded-2xl shadow-2xl border border-gold/30 z-[100] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col"
                  dir="rtl"
                >
                  <div className="flex items-center justify-between p-3 border-b border-gold/15 bg-gold/5 shrink-0">
                    <div className="flex items-center gap-2">
                      <Bell size={15} className="text-gold" />
                      <h3 className="text-[13px] font-bold text-brand dark:text-gold">التنبيهات</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead} 
                          className="text-[10px] text-gold hover:underline font-bold cursor-pointer"
                        >
                          تحديد الكل كمقروء
                        </button>
                      )}
                      <button 
                        onClick={() => setIsNotificationsOpen(false)} 
                        className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-muted hover:text-brand"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-[320px] custom-scrollbar divide-y divide-gray-100 dark:divide-white/5">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 30).map((n) => (
                        <button
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full p-3 text-right transition-colors hover:bg-gold/10 active:scale-[0.99] cursor-pointer block ${!n.is_read ? 'bg-gold/10 font-medium' : 'bg-transparent'}`}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.is_read ? 'bg-gold animate-pulse' : 'bg-gray-300 dark:bg-white/20'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-bold text-brand dark:text-white truncate">{n.title}</p>
                              <p className="text-[11px] text-muted leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[9px] text-gold/90 mt-1 inline-block font-semibold">انقر للانتقال مباشرة ←</span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted">
                        <Bell size={24} className="mx-auto mb-2 opacity-20" />
                        <p className="text-[11px]">لا توجد تنبيهات جديدة</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Chat */}
              <button 
                onClick={() => setIsChatOpen(true)} 
                className="w-9 h-9 rounded-full bg-brand/10 dark:bg-white/5 flex items-center justify-center hover:bg-brand/20 dark:hover:bg-white/10 transition-colors relative"
                title="المحادثة الفورية"
               >
                <MessageCircle size={18} className="text-brand dark:text-gold" />
                {unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadChatCount > 99 ? '99+' : unreadChatCount}
                  </span>
                )}
               </button>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                <X size={18} />
              </button>
           </div>
        </div>

        {/* Header & Quick Action Row for Sub-tabs */}
        {activeTab !== 'profile' && (
          <div className="border-b border-gold/15 bg-white/40 dark:bg-white/5 pb-2" dir="rtl">
            {/* Top Bar with Back Button & Section Title */}
            <div className="px-3 py-2.5 flex items-center justify-between">
              <button 
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand text-gold border border-gold/50 hover:bg-brand/90 hover:border-gold transition-all text-[11px] font-bold shadow-sm active:scale-95 cursor-pointer"
                title="الرجوع إلى الصفحة الرئيسية / الملف الشخصي"
              >
                <ArrowRight size={14} className="text-gold" />
                <span>رجوع</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-brand dark:text-gold">
                  {activeTab === 'requests' && 'طلباتي'}
                  {activeTab === 'contracts' && 'عقودي'}
                  {activeTab === 'invoices' && 'فواتيري'}
                  {activeTab === 'promissory' && 'سندات الأمر'}
                  {activeTab === 'open_requests' && 'مستنداتي والطلبات المفتوحة'}
                  {activeTab === 'payments' && 'سداد المدفوعات'}
                </span>
              </div>
            </div>

            {/* Quick Actions Pills - same horizontal card style matching the reference */}
            <div className="overflow-x-auto scrollbar-none px-2 pt-2.5 pb-1" dir="rtl">
              <div className={`flex gap-2 ${quickActions.length <= 2 ? 'w-full' : 'w-max min-w-full'}`}>
                {quickActions.map((a, i) => {
                  const isActive = a.tab === activeTab;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={a.onClick}
                      className={`relative h-[36px] sm:h-[38px] rounded-[12px] px-2.5 sm:px-3 flex items-center justify-center gap-1.5 sm:gap-2 transition-all active:scale-95 shadow-sm cursor-pointer ${
                        quickActions.length <= 2 ? 'flex-1' : ''
                      } ${
                        isActive 
                          ? 'bg-[#3b0d47] border-2 border-gold text-gold font-black ring-2 ring-gold/40' 
                          : 'bg-[#1a0425] border border-[#4c1e48] hover:border-gold/60 text-[#cbb074]'
                      }`}
                    >
                      {a.badge > 0 && (
                        <span className="absolute -top-2.5 sm:-top-3 right-1.5 sm:right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-[#e52843] text-white text-[9px] font-black flex items-center justify-center shadow-md border-[1.5px] border-[#1a0425] z-20 pointer-events-none">
                          {a.badge > 99 ? '99+' : a.badge}
                        </span>
                      )}
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2" dir="ltr">
                        <a.icon size={14} className={isActive ? 'text-gold' : 'text-[#cbb074]'} strokeWidth={1.9} />
                        <span className={`text-[11px] sm:text-[11.5px] whitespace-nowrap ${isActive ? 'font-black text-gold' : 'font-bold text-[#cbb074]'}`}>{a.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-2 pb-8 custom-scrollbar">
           
           {activeTab === 'requests' && (
             <div className={`space-y-3`}>
               {isLoading ? (
                 <div className="flex justify-center py-10">
                   <Loader2 className="animate-spin text-gold" size={32} />
                 </div>
               ) : requests.length > 0 ? (
                 requests.map((req) => (
                    <div key={req.id} className="bg-white dark:bg-[#12031a] p-3 rounded-[16px] border border-gold/20 shadow-sm group hover:border-gold/50 transition-all text-right">
                       <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-gold block animate-pulse"></span>
                            <h3 className="text-[13px] font-bold text-brand dark:text-white">
                              {req.type === 'waive_request' ? 'طلب إعفاء من الإلتزامات المالية' : 
                               req.type === 'rescheduling_request' ? 'اعادة جدولة المنتجات التمويلية' : 
                               req.type === 'seized_amounts_request' ? 'اتاحة النسبة النظامية والمبالغ المستثناه' :
                               'طلب استشارة مالية'}
                            </h3>
                          </div>
                          {getStatusBadge(req.status)}
                       </div>
                       <div className="text-[11px] text-muted font-mono mb-2 flex items-center gap-2 justify-end">
                         <span className="flex items-center gap-1"><Clock size={10} /> {new Date(req.timestamp).toLocaleDateString('ar-SA')}</span>
                         <span className="bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 rounded text-gray-500">{req.id}</span>
                       </div>
                       <p className="text-[12px] text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-white/5 pt-2 mt-2">
                         {req.type === 'waive_request' ? `طلب إعفاء للجهة: ${req.data?.bank || ''}` : 
                          req.type === 'rescheduling_request' ? `إعادة جدولة للمنتجات التمويلية - ${req.data?.bank || ''}` :
                          req.type === 'seized_amounts_request' ? `اتاحة النسبة النظامية - ${req.data?.bank || ''}` :
                          `استشارة براتب: ${req.data?.salary || ''}`}
                       </p>

                       {/* Preview & Delete Buttons */}
                       <div className="flex gap-2 mt-3">
                         <button 
                           onClick={() => {
                             window.dispatchEvent(new CustomEvent('open-waive-form', { 
                               detail: { 
                                 ...userData,
                                 ...(req.data || {}),
                                 requestType: req.type,
                                 viewOnly: true,
                                 viewRequestId: req.id,
                                 viewRequestStatus: req.status,
                               } 
                             }));
                           }}
                           className="flex-1 py-2 bg-gray-50 dark:bg-white/5 text-brand dark:text-gold font-bold text-[11px] rounded-xl border border-gold/20 hover:bg-gold/5 transition-all flex items-center justify-center gap-2"
                         >
                           <Eye size={12} />
                           معاينة الطلب
                         </button>
                         {(req.status === 'draft' || req.status === 'pending') && (
                           <button 
                             onClick={async () => {
                               if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
                                 try {
                                   await deleteRequest(req.id);
                                   fetchData();
                                 } catch (err) {
                                   console.error(err);
                                   alert('حدث خطأ أثناء حذف الطلب');
                                 }
                               }
                             }}
                             className="py-2 px-3 bg-red-50 dark:bg-red-900/20 text-red-500 font-bold text-[11px] rounded-xl border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-1"
                           >
                             <Trash2 size={12} />
                             حذف
                           </button>
                         )}
                       </div>

                       {req.status === 'draft' && (
                          <button 
                            onClick={() => handleResumeDraft(req)}
                            className="mt-2 w-full py-2.5 bg-gold/10 text-gold font-bold text-[12px] rounded-xl border border-gold/30 hover:bg-gold/20 transition-all flex items-center justify-center gap-2"
                          >
                            <Edit size={14} />
                            استكمال الطلب وإرساله
                          </button>
                        )}

                       {req.status === 'contract_signature' && (
                         <div className="mt-3 p-2 bg-brand/5 border border-gold/20 rounded-lg flex items-center justify-between animate-pulse">
                            <span className="text-[10px] font-bold text-brand">العقد جاهز للتوقيع</span>
                            <button 
                               onClick={() => window.location.hash = `#/contract/${req.id}`}
                               className="text-[9px] font-bold text-white bg-brand px-3 py-1 rounded-full hover:bg-brand/90 transition-all shadow-sm"
                            >
                               توقيع الآن
                            </button>
                         </div>
                       )}
                    </div>
                 ))
               ) : (
                 <div className="text-right py-10 text-muted flex flex-col items-start gap-3">
                    <FileText size={40} className="opacity-20" />
                    <p className="text-[12px]">لا توجد طلبات حالياً</p>
                     <Button onClick={() => setShowRequestTypeSelector(true)} className="mt-2">تقديم طلب جديد</Button>
                  </div>
                )}

                {/* Always show "New Request" button if not empty */}
                {requests.length > 0 && (
                  <div className="mt-6">
                     <Button onClick={() => setShowRequestTypeSelector(true)} className="w-full py-3">تقديم طلب جديد</Button>
                  </div>
                )}

                <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-[12px] border border-blue-100 dark:border-blue-800 mt-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-800 dark:text-blue-200 leading-relaxed">
                      يتم تحديث حالة الطلبات بشكل يومي. في حال وجود استفسار عاجل، يمكنك التواصل مع خدمة العملاء عبر الواتساب.
                    </p>
                  </div>
               </div>
             </div>
           )}

           {activeTab === 'contracts' && (
             <div className={`space-y-3`}>
               <h3 className="text-[13px] font-bold text-brand dark:text-white mb-2 px-1">عقودي الإلكترونية</h3>
               {isLoading ? (
                 <div className="flex justify-center py-10">
                   <Loader2 className="animate-spin text-gold" size={32} />
                 </div>
               ) : contracts.length > 0 ? (
                 contracts.map((contract) => {
                   const req = requests.find(r => r.id === contract.submission_id) || { id: contract.submission_id, status: 'unknown', type: contract.type };
                   return (
                     <div key={contract.id} className="bg-white dark:bg-[#12031a] p-3 rounded-[16px] border border-gold/20 shadow-sm group hover:border-gold/50 transition-all text-right">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                             <PenTool className="text-gold" size={16} />
                             <h3 className="text-[13px] font-bold text-brand dark:text-white">
                               عقد تقديم خدمات رقم {contract.submission_id}
                             </h3>
                           </div>
                           {getStatusBadge(req.status)}
                        </div>
                         <p className="text-[11px] text-muted mb-3">
                          {contract.type === 'waive_request' ? 'طلب إعفاء من الالتزامات' : 
                           contract.type === 'rescheduling_request' ? 'إعادة جدولة المنتجات التمويلية' : 
                           contract.type === 'seized_amounts_request' ? 'إتاحة النسبة النظامية والمبالغ المستثناه' : 'طلب استشارة مالية'}
                         </p>
                        
                        {req.status === 'contract_signature' ? (
                          <div className="mt-3 p-3 bg-brand/5 border border-gold/20 rounded-xl flex items-center justify-between animate-pulse">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gold rounded-full"></div>
                                <span className="text-[11px] font-bold text-brand">العقد جاهز للتوقيع</span>
                             </div>
                             <button 
                                onClick={() => window.location.hash = `#/contract/${contract.submission_id}`}
                                className="text-[10px] font-bold text-white bg-brand px-4 py-1.5 rounded-full hover:bg-brand/90 transition-all shadow-sm"
                             >
                                توقيع العقد الآن
                             </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              window.location.hash = `#/contract/${contract.submission_id}`;
                            }}
                            className="w-full py-2.5 bg-white text-brand font-bold text-[12px] rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 border border-gold/30"
                          >
                            <FileText size={14} />
                            {contract.signed_at ? 'عرض العقد المكتمل' : 'عرض تفاصيل العقد'}
                          </button>
                        )}
                     </div>
                   );
                 })
               ) : (
                 <div className="text-right py-10 text-muted flex flex-col items-start gap-3">
                    <PenTool size={40} className="opacity-20" />
                    <p className="text-[12px]">لا توجد عقود حالياً</p>
                 </div>
               )}

              </div>
             )}

           {/* Invoices Tab */}
           {activeTab === 'invoices' && (
             <div className={`space-y-3`}>
               {isLoading ? (
                 <div className="flex justify-center py-10">
                   <Loader2 className="animate-spin text-gold" size={32} />
                 </div>
               ) : invoices.length > 0 ? (
                 invoices.map((inv) => (
                   <div key={inv.id} className="bg-white dark:bg-[#12031a] p-3 rounded-[16px] border border-gold/20 shadow-sm group hover:border-gold/50 transition-all text-right">
                     <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                         <Receipt className="text-gold" size={16} />
                         <h3 className="text-[13px] font-bold text-brand dark:text-white">
                           فاتورة رقم <span className="font-mono">{inv.id}</span>
                         </h3>
                       </div>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                         {inv.status === 'paid' ? 'مسددة' : 'في انتظار السداد'}
                       </span>
                     </div>
                     <p className="text-[11px] text-muted mb-2">
                       {inv.type === 'waive_request' ? 'طلب إعفاء من الالتزامات' : 
                        inv.type === 'rescheduling_request' ? 'إعادة جدولة المنتجات التمويلية' : 
                        inv.type === 'seized_amounts_request' ? 'إتاحة النسبة النظامية والمبالغ المستثناه' : 'طلب استشارة مالية'}
                     </p>
                     <div className="flex justify-between items-center mb-3">
                       <span className="text-[11px] text-muted">{new Date(inv.created_at).toLocaleDateString('ar-SA')}</span>
                       <span className="text-sm font-black text-gold font-mono">{formatAmount(inv.amount)} ر.س</span>
                     </div>
                     <button 
                       onClick={() => window.location.hash = `#/invoice/${inv.submission_id}`}
                       className="w-full py-2.5 bg-white text-brand font-bold text-[12px] rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 border border-gold/30"
                     >
                       <FileText size={14} />
                       عرض الفاتورة
                     </button>
                   </div>
                 ))
               ) : (
                 <div className="text-right py-10 text-muted flex flex-col items-start gap-3">
                    <Receipt size={40} className="opacity-20" />
                    <p className="text-[12px]">لا توجد فواتير حالياً</p>
                 </div>
               )}
             </div>
           )}

           {/* Promissory Notes Tab */}
           {activeTab === 'promissory' && (
             <div className={`space-y-3`}>
               {isLoading ? (
                 <div className="flex justify-center py-10">
                   <Loader2 className="animate-spin text-gold" size={32} />
                 </div>
               ) : promissoryNotes.length > 0 ? (
                 promissoryNotes.map((note) => (
                   <div key={note.id} className="bg-white dark:bg-[#12031a] p-3 rounded-[16px] border border-gold/20 shadow-sm hover:border-gold/50 transition-all text-right">
                     <div className="flex justify-between items-start mb-2">
                       <div className="flex items-center gap-2">
                         <FileText className="text-gold" size={16} />
                         <h3 className="text-[13px] font-bold text-brand dark:text-white">سند لأمر رقم <span className="font-mono">{note.id}</span></h3>
                       </div>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${note.status === 'signed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                         {note.status === 'signed' ? 'موقّع' : 'بانتظار التوقيع'}
                       </span>
                     </div>
                     <div className="flex justify-between items-center mb-3">
                       <span className="text-[11px] text-muted">{new Date(note.created_at).toLocaleDateString('ar-SA')}</span>
                       <span className="text-sm font-black text-gold font-mono">{formatAmount(note.amount)} ر.س</span>
                     </div>
                     <button
                       onClick={() => window.location.hash = `#/promissory/${note.id}`}
                       className="w-full py-2.5 bg-white text-brand font-bold text-[12px] rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 border border-gold/30"
                     >
                       <FileText size={14} />
                       {note.status === 'signed' ? 'عرض السند' : 'توقيع وعرض السند'}
                     </button>
                   </div>
                 ))
               ) : (
                 <div className="text-right py-10 text-muted flex flex-col items-start gap-3">
                   <FileText size={40} className="opacity-20" />
                   <p className="text-[12px]">لا توجد سندات أمر حالياً</p>
                 </div>
               )}
             </div>
           )}

           {/* Open Requests / Documents Tab */}
           {activeTab === 'open_requests' && (
             <CustomerOpenRequests 
               userData={{
                 full_name: userData.fullName,
                 phone: userData.mobile,
                 national_id: userData.nationalId,
               }} 
               targetRequestId={targetOpenRequestId}
               onClearTarget={() => setTargetOpenRequestId(null)}
             />
           )}

           {/* Payments Tab */}
           {activeTab === 'payments' && (
             <CustomerPaymentRequests userId={String(user.id)} />
           )}

            {activeTab === 'profile' && (
              <div className={`space-y-4 pb-10`}>

                 {/* === Mobile Dashboard Overview (matches mockup 100%) === */}
                 {(() => {
                   const hasRequests = requests && requests.length > 0;
                   const profileFields = hasRequests
                     ? [userData.firstName, userData.lastName, userData.nationalId, userData.mobile, userData.email, userData.jobStatus, userData.region, userData.city, userData.age]
                     : [userData.firstName, userData.lastName, userData.nationalId, userData.mobile, userData.email];
                   const rawCompletion = Math.round((profileFields.filter(Boolean).length / profileFields.length) * 100);
                   const completion = rawCompletion;
                   const circumference = 2 * Math.PI * 41; // ~257.6
                   const strokeOffset = circumference - (circumference * completion) / 100;
                   
                   return (
                     <>
                      {/* Hero — profile completion (100% matching attached reference image) */}
                      <div 
                        className="relative w-full overflow-hidden rounded-[28px] sm:rounded-[32px] p-6 sm:p-7 pr-6 sm:pr-8 bg-[#18001F] shadow-[0_16px_40px_rgba(0,0,0,0.3)] border border-[#2B0432]" 
                        dir="rtl"
                      >
                        {/* Subtle concentric rings in the background matching reference */}
                        <div className="absolute -left-10 -top-10 w-[320px] h-[320px] rounded-full border border-white/[0.04] pointer-events-none" />
                        <div className="absolute -left-24 -top-24 w-[460px] h-[460px] rounded-full border border-white/[0.02] pointer-events-none" />
                        
                        <div className="relative z-[1] flex items-center justify-between gap-4 sm:gap-6">
                          {/* Right side: Greeting, Customer Name, and Customer ID */}
                          <div className="flex-1 min-w-0 text-right">
                            <div className="text-[13px] sm:text-[14px] text-[#DEBF83] font-normal mb-1.5">
                              مرحباً،
                            </div>
                            <h1 className="text-[21px] sm:text-[24px] font-bold text-[#DEBF83] leading-tight mb-2.5 truncate">
                              {userData.fullName || 'ماجد عامر السفياني'}
                            </h1>
                            <div className="flex items-center gap-2 text-[13px] sm:text-[14px]">
                              <span className="text-[#DEBF83] font-normal">رقم العميل :</span>
                              <span dir="ltr" className="text-white font-bold font-mono tracking-wide text-[13px] sm:text-[14px]">
                                {userData.fileNumber || 'RF-20260331-7247'}
                              </span>
                            </div>
                          </div>

                          {/* Left side: Circular Progress Gauge, Label, and "إكمال" Pill Button */}
                          <div className="flex flex-col items-center shrink-0">
                            <div className="relative w-[86px] h-[86px] sm:w-[92px] sm:h-[92px]">
                              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                {/* Background Track Circle */}
                                <circle 
                                  cx="50" 
                                  cy="50" 
                                  r="41" 
                                  stroke="rgba(222, 191, 131, 0.18)" 
                                  strokeWidth="7.5" 
                                  fill="none"
                                />
                                {/* Progress Circle */}
                                <circle 
                                  cx="50" 
                                  cy="50" 
                                  r="41" 
                                  stroke="#DEBF83" 
                                  strokeWidth="7.5" 
                                  fill="none" 
                                  strokeLinecap="round" 
                                  strokeDasharray={circumference} 
                                  strokeDashoffset={strokeOffset} 
                                  className="transition-all duration-700 ease-out origin-center"
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center text-[#DEBF83] text-[20px] sm:text-[22px] font-bold font-sans">
                                {completion}%
                              </div>
                            </div>
                            
                            <div className="text-[12px] sm:text-[13px] text-[#DEBF83] font-normal mt-2 whitespace-nowrap">
                              اكتمال الملف
                            </div>
                            
                            <button 
                              type="button"
                              onClick={() => setShowCompleteProfile(true)} 
                              className="mt-2.5 w-[92px] sm:w-[98px] h-[32px] sm:h-[34px] rounded-[13px] bg-[#DEBF83] hover:bg-[#E8CE96] text-[#18001F] text-[13px] font-bold tracking-wide transition-all active:scale-95 shadow-sm flex items-center justify-center cursor-pointer"
                            >
                              إكمال
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick actions row directly underneath hero card (100% matching attached reference image) */}
                      <div className="w-full overflow-x-auto scrollbar-none pt-2.5 sm:pt-3 pb-1 mt-2.5 sm:mt-3" dir="rtl">
                        <div className={`grid gap-2 sm:gap-2.5 ${
                          quickActions.length <= 2 
                            ? 'grid-cols-2 w-full' 
                            : 'grid-cols-3 sm:grid-cols-6 min-w-[540px] sm:min-w-0'
                        }`}>
                          {quickActions.map((a, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={a.onClick}
                              className="relative h-[36px] sm:h-[38px] rounded-[12px] bg-[#18001F] hover:bg-[#23002B] border border-[#2D0A35] flex items-center justify-center px-2 sm:px-2.5 shadow-sm active:scale-95 transition-all cursor-pointer group"
                            >
                              {a.badge > 0 && (
                                <span className="absolute -top-2.5 sm:-top-3 right-1.5 sm:right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E52E3D] text-white text-[9px] font-black flex items-center justify-center shadow-md border-[1.5px] border-[#18001F] z-20 pointer-events-none">
                                  {a.badge}
                                </span>
                              )}
                              <div className="flex items-center justify-center gap-1.5 sm:gap-2" dir="ltr">
                                <a.icon size={13.5} className="text-[#DEBF83] shrink-0" strokeWidth={a.iconStroke || 1.8} />
                                <span className="text-[11px] sm:text-[11.5px] font-bold text-[#DEBF83] whitespace-nowrap">
                                  {a.label}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}

                          {/* Personal Info */}
                          <div className="bg-white dark:bg-[#12031a] rounded-[24px] border border-gold/20 p-3 shadow-sm relative overflow-hidden" dir="rtl">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
                            <div className="w-full flex items-center justify-between gap-2 mb-3">
                              <button
                                type="button"
                                onClick={() => setIsPersonalInfoOpen(v => !v)}
                                className="flex items-center gap-2 flex-1 text-right"
                              >
                                <div className="w-7 h-7 rounded-lg bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                                  <User size={16} />
                                </div>
                                <h3 className="text-[14px] font-black text-brand dark:text-gold">البيانات الشخصية</h3>
                              </button>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditing(v => !v);
                                    setProfileError('');
                                    if (!isPersonalInfoOpen) setIsPersonalInfoOpen(true);
                                  }}
                                  className="text-[11px] text-gold hover:underline font-bold px-2 py-1 rounded-lg hover:bg-gold/10 transition-colors flex items-center gap-1 cursor-pointer"
                                  title={isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}
                                >
                                  <Edit size={12} />
                                  <span>{isEditing ? 'إلغاء' : 'تعديل'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsPersonalInfoOpen(v => !v)}
                                  className="text-gold p-1"
                                >
                                  <ChevronDown
                                    size={18}
                                    className={`transition-transform duration-300 ease-in-out ${isPersonalInfoOpen ? 'rotate-180' : ''}`}
                                  />
                                </button>
                              </div>
                            </div>

                            <div
                              className={`overflow-hidden transition-all duration-300 ease-in-out ${isPersonalInfoOpen ? 'max-h-[1400px] opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                              {profileError && (
                                <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-[11px] font-bold flex items-center gap-1.5">
                                  <AlertTriangle size={14} className="shrink-0" />
                                  <span>{profileError}</span>
                                </div>
                              )}

                              {!isEditing ? (
                                /* VIEW MODE: Strictly show ONLY registered/existing data. NO empty fields, NO '---' placeholders! */
                                <div className="space-y-2.5 text-right">
                                  {/* Name */}
                                  <div>
                                    <label className="text-[9px] text-muted block mb-0.5">الاسم الكامل</label>
                                    <div className="text-[12px] font-bold text-brand dark:text-white py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5">
                                      {[userData.firstName, userData.middleName, userData.lastName].filter(Boolean).join(' ') || userData.fullName || '—'}
                                    </div>
                                  </div>

                                  {/* National ID & Mobile - Always present fundamental registered data */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-[9px] text-muted block mb-0.5">رقم الهوية الوطنية</label>
                                      <div className="text-[12px] font-bold text-brand dark:text-white font-mono py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5 flex items-center gap-1.5">
                                        <CreditCard size={11} className="text-gold shrink-0" />
                                        <span>{userData.nationalId || ''}</span>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-muted block mb-0.5">رقم الجوال</label>
                                      <div className="text-[12px] font-bold text-brand dark:text-white py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5 dir-ltr text-right font-mono flex items-center justify-end gap-1.5">
                                        <Phone size={11} className="text-gold shrink-0" />
                                        <span>{userData.mobile || ''}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Dynamic Email (ONLY if exists) */}
                                  {Boolean(userData.email && userData.email.trim() && userData.email !== '—' && userData.email !== '---') && (
                                    <div>
                                      <label className="text-[9px] text-muted block mb-0.5">البريد الإلكتروني</label>
                                      <div className="text-[12px] font-medium text-brand dark:text-white py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5 dir-ltr text-right">
                                        {userData.email}
                                      </div>
                                    </div>
                                  )}

                                  {/* Dynamic Region & City (ONLY if provided, no empty placeholders) */}
                                  {(() => {
                                    const hasRegion = Boolean(userData.region && userData.region.trim() && userData.region !== '---');
                                    const hasCity = Boolean(userData.city && userData.city.trim() && userData.city !== '---');
                                    if (hasRegion && hasCity) {
                                      return (
                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="text-[9px] text-muted block mb-0.5">المنطقة</label>
                                            <div className="text-[12px] font-medium text-brand dark:text-white py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5 flex items-center gap-1.5">
                                              <MapPin size={11} className="text-gold shrink-0" />
                                              <span className="truncate">{userData.region}</span>
                                            </div>
                                          </div>
                                          <div>
                                            <label className="text-[9px] text-muted block mb-0.5">المدينة</label>
                                            <div className="text-[12px] font-medium text-brand dark:text-white py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5 flex items-center gap-1.5">
                                              <MapPin size={11} className="text-gold shrink-0" />
                                              <span className="truncate">{userData.city}</span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                    if (hasRegion) {
                                      return (
                                        <div>
                                          <label className="text-[9px] text-muted block mb-0.5">المنطقة</label>
                                          <div className="text-[12px] font-medium text-brand dark:text-white py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5 flex items-center gap-1.5">
                                            <MapPin size={11} className="text-gold shrink-0" />
                                            <span className="truncate">{userData.region}</span>
                                          </div>
                                        </div>
                                      );
                                    }
                                    if (hasCity) {
                                      return (
                                        <div>
                                          <label className="text-[9px] text-muted block mb-0.5">المدينة</label>
                                          <div className="text-[12px] font-medium text-brand dark:text-white py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5 flex items-center gap-1.5">
                                            <MapPin size={11} className="text-gold shrink-0" />
                                            <span className="truncate">{userData.city}</span>
                                          </div>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })()}

                                  {/* Dynamic Age (ONLY if provided, no empty placeholders) */}
                                  {Boolean(userData.age && String(userData.age).trim() && userData.age !== '---') && (
                                    <div>
                                      <label className="text-[9px] text-muted block mb-0.5">العمر</label>
                                      <div className="text-[12px] font-medium text-brand dark:text-white py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5 font-mono">
                                        {userData.age} سنة
                                      </div>
                                    </div>
                                  )}

                                  {/* Dynamic Job Status (ONLY if provided, no empty placeholders) */}
                                  {Boolean(userData.jobStatus && userData.jobStatus.trim() && userData.jobStatus !== '---') && (
                                    <div>
                                      <label className="text-[9px] text-muted block mb-0.5">الحالة الوظيفية</label>
                                      <div className="text-[12px] font-medium text-brand dark:text-white py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5 flex items-center gap-1.5">
                                        <Briefcase size={11} className="text-gold shrink-0" />
                                        <span className="truncate">{userData.jobStatus}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Dynamic Financial Entity / Bank (ONLY if provided, no empty placeholders) */}
                                  {Boolean(userData.bank && userData.bank.trim() && userData.bank !== '---') && (
                                    <div>
                                      <label className="text-[9px] text-muted block mb-0.5">الجهة المالية (البنك / جهة التمويل)</label>
                                      <div className="text-[12px] font-medium text-brand dark:text-white py-1.5 px-2 bg-gray-50 dark:bg-white/5 rounded-[10px] border border-gray-100 dark:border-white/5 flex items-center gap-1.5">
                                        <Building2 size={11} className="text-gold shrink-0" />
                                        <span className="truncate">{userData.bank}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                /* EDIT MODE: Form with inputs for updating data */
                                <div className="grid grid-cols-1 gap-3 text-right">
                                  {/* Name row */}
                                  <div className="grid grid-cols-3 gap-1.5">
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">الاسم الأول *</label>
                                      <input 
                                        type="text" 
                                        value={userData.firstName || ''} 
                                        onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 dark:bg-white/5 text-[11px] focus:border-gold outline-none"
                                        placeholder="الاسم الأول"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">الاسم الأوسط</label>
                                      <input 
                                        type="text" 
                                        value={userData.middleName || ''} 
                                        onChange={(e) => setUserData({...userData, middleName: e.target.value})}
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 dark:bg-white/5 text-[11px] focus:border-gold outline-none"
                                        placeholder="الأب / الجد"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">الاسم الأخير *</label>
                                      <input 
                                        type="text" 
                                        value={userData.lastName || ''} 
                                        onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 dark:bg-white/5 text-[11px] focus:border-gold outline-none"
                                        placeholder="العائلة"
                                      />
                                    </div>
                                  </div>

                                  {/* National ID, Mobile, Age */}
                                  <div className="grid grid-cols-3 gap-1.5">
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">رقم الهوية</label>
                                      <input 
                                        type="text" 
                                        value={userData.nationalId || ''} 
                                        readOnly
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 text-[11px] outline-none bg-gray-50 dark:bg-white/5 cursor-not-allowed opacity-80 font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">رقم الجوال</label>
                                      <input 
                                        type="tel" 
                                        inputMode="numeric"
                                        value={userData.mobile || ''} 
                                        readOnly
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 text-[11px] font-bold outline-none dir-ltr text-left bg-gray-50 dark:bg-white/5 cursor-not-allowed opacity-80 font-mono"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">العمر</label>
                                      <input 
                                        type="text" 
                                        inputMode="numeric"
                                        value={userData.age || ''} 
                                        onChange={(e) => setUserData({...userData, age: e.target.value.replace(/\D/g, '')})}
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 dark:bg-white/5 text-[11px] focus:border-gold outline-none font-mono"
                                        placeholder="بالسنوات"
                                      />
                                    </div>
                                  </div>

                                  {/* Region, City, Job Status */}
                                  <div className="grid grid-cols-3 gap-1.5">
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">المنطقة</label>
                                      <select 
                                        value={userData.region || ''} 
                                        onChange={(e) => setUserData({...userData, region: e.target.value, city: ''})} 
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 text-[11px] focus:border-gold outline-none bg-white dark:bg-white/5 dark:text-white"
                                      >
                                        <option value="">اختر المنطقة</option>
                                        {Object.keys(REGION_CITIES).map(r => <option key={r} value={r}>{r}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">المدينة</label>
                                      <select 
                                        value={userData.city || ''} 
                                        onChange={(e) => setUserData({...userData, city: e.target.value})} 
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 text-[11px] focus:border-gold outline-none bg-white dark:bg-white/5 dark:text-white" 
                                        disabled={!userData.region}
                                      >
                                        <option value="">اختر المدينة</option>
                                        {userData.region && REGION_CITIES[userData.region]?.map(c => <option key={c} value={c}>{c}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">الحالة الوظيفية</label>
                                      <select 
                                        value={userData.jobStatus || ''} 
                                        onChange={(e) => setUserData({...userData, jobStatus: e.target.value})}
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 text-[11px] bg-white dark:bg-white/5 dark:text-white focus:border-gold outline-none"
                                      >
                                        <option value="">اختر الحالة</option>
                                        <option value="موظف حكومي">موظف حكومي</option>
                                        <option value="موظف قطاع خاص">موظف قطاع خاص</option>
                                        <option value="متقاعد">متقاعد</option>
                                        <option value="لا يوجد عمل">لا يوجد عمل</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Financial Entity & Email */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">الجهة المالية (البنك / جهة التمويل)</label>
                                      <select 
                                        value={userData.bank || ''} 
                                        onChange={(e) => setUserData({...userData, bank: e.target.value})} 
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 text-[11px] bg-white focus:border-gold outline-none dark:bg-white/5 dark:text-white"
                                      >
                                        <option value="">اختر البنك أو الجهة التمويلية</option>
                                        {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[9px] text-muted block mb-1">البريد الإلكتروني <span className="text-[8px] text-muted/60">(اختياري)</span></label>
                                      <input 
                                        type="email" 
                                        value={userData.email || ''} 
                                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                                        className="w-full py-1 px-2 rounded-[8px] border border-gray-200 dark:border-white/10 dark:bg-white/5 text-[11px] focus:border-gold outline-none dir-ltr text-left"
                                        placeholder="example@email.com"
                                      />
                                    </div>
                                  </div>

                                  {/* Actions inside edit mode */}
                                  <div className="flex gap-2 pt-2">
                                    <button
                                      type="button"
                                      onClick={handleSaveProfile}
                                      className="flex-1 py-2 bg-gold text-brand rounded-[10px] text-[12px] font-bold shadow-md hover:bg-gold/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <CheckCircle2 size={14} />
                                      حفظ التغييرات
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsEditing(false);
                                        setProfileError('');
                                      }}
                                      className="px-3 py-2 bg-gray-100 dark:bg-white/10 text-muted hover:text-brand dark:hover:text-white rounded-[10px] text-[12px] font-medium transition-colors"
                                    >
                                      إلغاء
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>



                {isEditing && (
                   <div className="mt-4">
                      <button 
                        onClick={handleSaveProfile} 
                        className="w-full py-3 bg-gold text-brand rounded-[14px] text-[13px] font-bold shadow-md hover:bg-gold/90 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        حفظ التغييرات
                      </button>
                   </div>
                )}
             </div>
           )}

        </div>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#12031a]">
           <button 
             onClick={onLogout}
             className="w-full flex items-center justify-center gap-2 text-[12px] font-bold text-red-500 bg-red-50 dark:bg-red-900/20 py-3 rounded-[14px] hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
           >
             <LogOut size={16} />
             تسجيل الخروج
           </button>
        </div>

      
      {/* Request Type Selector Modal Popup */}
      {showRequestTypeSelector && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          dir="rtl"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRequestTypeSelector(false);
              setShowServiceBrowser(false);
              setExpandedCategory(null);
            }
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-[#15041d] rounded-[24px] shadow-2xl border border-gold/30 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-brand dark:text-gold">تقديم طلب جديد</h3>
                  <p className="text-[10px] text-muted">اختر نوع الخدمة أو المعاملة المطلوبة</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowRequestTypeSelector(false);
                  setShowServiceBrowser(false);
                  setExpandedCategory(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:text-brand dark:hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto space-y-3">
              <p className="text-[11px] font-bold text-brand dark:text-gold">الخدمات الأكثر طلباً</p>
              
              <div className="space-y-2">
                <button 
                  onClick={() => handleOpenRequestForm('waive_request')}
                  className="w-full p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[12px] font-bold text-brand dark:text-white hover:border-gold/50 hover:bg-gold/5 flex items-center justify-between transition-all group text-right"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                      <FileText size={14} />
                    </div>
                    <span>طلب إعفاء من الإلتزامات المالية</span>
                  </div>
                  <ArrowRight size={14} className="rotate-180 text-muted group-hover:text-gold group-hover:-translate-x-1 transition-all" />
                </button>

                <button 
                  onClick={() => handleOpenRequestForm('rescheduling_request')}
                  className="w-full p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[12px] font-bold text-brand dark:text-white hover:border-gold/50 hover:bg-gold/5 flex items-center justify-between transition-all group text-right"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                      <Clock size={14} />
                    </div>
                    <span>طلب اعادة جدولة المنتجات التمويلية</span>
                  </div>
                  <ArrowRight size={14} className="rotate-180 text-muted group-hover:text-gold group-hover:-translate-x-1 transition-all" />
                </button>

                <button 
                  onClick={() => handleOpenRequestForm("consultation_request")}
                  className="w-full p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[12px] font-bold text-brand dark:text-white hover:border-gold/50 hover:bg-gold/5 flex items-center justify-between transition-all group text-right"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                      <Scale size={14} />
                    </div>
                    <span>طلب استشارة مالية</span>
                  </div>
                  <ArrowRight size={14} className="rotate-180 text-muted group-hover:text-gold group-hover:-translate-x-1 transition-all" />
                </button>

                <button 
                  onClick={() => handleOpenRequestForm('seized_amounts_request')}
                  className="w-full p-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl text-[12px] font-bold text-brand dark:text-white hover:border-gold/50 hover:bg-gold/5 flex items-center justify-between transition-all group text-right"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gold/10 flex items-center justify-center text-gold shrink-0">
                      <Building2 size={14} />
                    </div>
                    <span>طلب اتاحة النسبة النظامية والمبالغ المستثناه من الحجز</span>
                  </div>
                  <ArrowRight size={14} className="rotate-180 text-muted group-hover:text-gold group-hover:-translate-x-1 transition-all" />
                </button>
              </div>

              {/* Browse by service category */}
              <div className="pt-2">
                <button 
                  onClick={() => setShowServiceBrowser(!showServiceBrowser)} 
                  className="w-full p-3.5 bg-gold/10 border border-gold/30 rounded-2xl text-[12px] font-bold text-gold hover:bg-gold/20 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen size={16} />
                    <span>تصفح حسب نوع الخدمة</span>
                  </div>
                  <ChevronDown size={16} className={`transition-transform duration-200 ${showServiceBrowser ? "rotate-180" : ""}`} />
                </button>

                {showServiceBrowser && (
                  <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {serviceCategories.map(cat => (
                      <div key={cat.id} className="rounded-xl border border-gray-100 dark:border-white/10 overflow-hidden">
                        <button 
                          onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                          className="w-full p-3 bg-white dark:bg-white/5 text-[12px] font-bold text-brand dark:text-white hover:border-gold/50 flex items-center justify-between transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {cat.icon}
                            <span>{cat.label}</span>
                          </div>
                          <ChevronDown size={14} className={`transition-transform duration-200 ${expandedCategory === cat.id ? "rotate-180" : ""}`} />
                        </button>
                        {expandedCategory === cat.id && (
                          <div className="p-2 bg-gray-50/70 dark:bg-black/20 space-y-1.5 border-t border-gray-100 dark:border-white/10 animate-in slide-in-from-top-1">
                            {cat.subServices.map(sub => (
                              <button 
                                key={sub} 
                                onClick={() => handleServiceSubRequest(cat.id, sub)}
                                className="w-full p-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-[11px] font-bold text-brand dark:text-white hover:border-gold/50 hover:bg-gold/5 flex items-center justify-between transition-all text-right"
                              >
                                <span>{sub}</span>
                                <ArrowRight size={12} className="rotate-180 text-gold" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5">
              <button 
                onClick={() => {
                  setShowRequestTypeSelector(false);
                  setShowServiceBrowser(false);
                  setExpandedCategory(null);
                }}
                className="w-full py-2.5 text-center text-[12px] font-bold text-muted hover:text-red-500 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default CustomerDashboard;