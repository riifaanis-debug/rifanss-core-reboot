import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Sparkles, 
  FileCheck, 
  Building2, 
  ShieldCheck, 
  Landmark, 
  Briefcase, 
  Leaf, 
  Award, 
  FolderArchive, 
  Send, 
  ClipboardCheck, 
  ChevronLeft,
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { BUSINESS_FIELDS_DATA, SubServiceItem, BusinessFieldItem } from '../../data/businessFieldsData';
import { useAuth } from '../../contexts/AuthContext';
import {
  ServiceHero,
  ServiceSearch,
  ServicePopularList,
  ServiceCategoryTabs,
  ServiceItemCard,
  ServiceDetailLayout,
} from './services';

// Category tab definitions
export type ServiceCategoryKey = 'all' | 'cv-employment' | 'government' | 'financing-support' | 'documents-submission';

interface CategoryTab {
  key: ServiceCategoryKey;
  label: string;
}

const CATEGORY_TABS: CategoryTab[] = [
  { key: 'all', label: 'الكل' },
  { key: 'cv-employment', label: 'السيرة الذاتية والتوظيف' },
  { key: 'government', label: 'الخدمات الحكومية' },
  { key: 'financing-support', label: 'التمويل والدعم' },
  { key: 'documents-submission', label: 'المستندات والتقديم' },
];

// Unified icon resolver for electronic services (22-24px inner symbol)
export const getElectronicServiceIcon = (iconName: string, className = "text-gold") => {
  const props = { size: 24, strokeWidth: 2, className };
  switch (iconName) {
    case 'FileText': return <FileText {...props} />;
    case 'Sparkles': return <Sparkles {...props} />;
    case 'FileCheck': return <FileCheck {...props} />;
    case 'Building2': return <Building2 {...props} />;
    case 'ShieldCheck': return <ShieldCheck {...props} />;
    case 'Landmark': return <Landmark {...props} />;
    case 'Briefcase': return <Briefcase {...props} />;
    case 'Leaf': return <Leaf {...props} />;
    case 'Award': return <Award {...props} />;
    case 'FolderArchive': return <FolderArchive {...props} />;
    case 'Send': return <Send {...props} />;
    case 'ClipboardCheck': return <ClipboardCheck {...props} />;
    default: return <FileText {...props} />;
  }
};

interface ElectronicServicesPageProps {
  initialServiceId?: string;
  onBack?: () => void;
}

export const ElectronicServicesPage: React.FC<ElectronicServicesPageProps> = ({ 
  initialServiceId,
  onBack 
}) => {
  const { user } = useAuth();

  // Find the electronic business field item from data
  const electronicField = useMemo<BusinessFieldItem>(() => {
    return BUSINESS_FIELDS_DATA.find(f => f.id === 'electronic') || {
      id: 'electronic',
      number: '05',
      title: 'الخدمات الإلكترونية',
      badge: 'حلول رقمية ومساندة متكاملة',
      intro: 'حلول رقمية متكاملة تساعدك في تجهيز المستندات، إعداد السيرة الذاتية، والتقديم على الخدمات الحكومية وبرامج التمويل والدعم بسهولة ووضوح.',
      image: '/business-fields/electronic.jpeg?v=4',
      subServices: []
    };
  }, []);

  const allServices = electronicField.subServices;

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ServiceCategoryKey>('all');
  const [selectedService, setSelectedService] = useState<SubServiceItem | null>(() => {
    if (initialServiceId) {
      return allServices.find(s => s.id === initialServiceId) || null;
    }
    return null;
  });

  // Dedicated detail selection state: selected option
  const [selectedOption, setSelectedOption] = useState<string>('');

  // Synchronize route hash with service selection
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/electronic-service/')) {
        const id = hash.replace('#/electronic-service/', '');
        const found = allServices.find(s => s.id === id);
        if (found) {
          setSelectedService(found);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      } else if (hash.includes('service=')) {
        const match = hash.match(/service=([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          const found = allServices.find(s => s.id === match[1]);
          if (found) {
            setSelectedService(found);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }
      }
      
      // If returning to main electronic services list
      if (hash === '#/electronic-services' || hash === '#/business-field/electronic') {
        if (!initialServiceId) {
          setSelectedService(null);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allServices, initialServiceId]);

  // When service changes, initialize default selected option
  useEffect(() => {
    if (selectedService) {
      if (selectedService.options && selectedService.options.length > 0) {
        setSelectedOption(selectedService.options[0]);
      } else {
        setSelectedOption('');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedService]);

  // Top Most Requested Services
  const mostRequestedList = useMemo(() => {
    const targetOrder = ['cv-design', 'citizen-account', 'social-security', 'freelance-financing', 'reef-support'];
    const ordered: SubServiceItem[] = [];
    targetOrder.forEach(id => {
      const item = allServices.find(s => s.id === id);
      if (item) ordered.push(item);
    });
    // Add any remaining marked as isMostRequested
    allServices.forEach(s => {
      if (s.isMostRequested && !ordered.some(o => o.id === s.id)) {
        ordered.push(s);
      }
    });
    return ordered;
  }, [allServices]);

  // Filtered services based on search query and category
  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allServices.filter(service => {
      // Category filter
      if (activeCategory !== 'all' && service.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (query) {
        const inName = service.name.toLowerCase().includes(query);
        const inSubtitle = (service.subtitle || '').toLowerCase().includes(query);
        const inDesc = service.description.toLowerCase().includes(query);
        const inHighlights = (service.highlights || []).some(h => h.toLowerCase().includes(query));
        const inOptions = (service.options || []).some(o => o.toLowerCase().includes(query));
        const inCategory = (service.category || '').toLowerCase().includes(query);

        return inName || inSubtitle || inDesc || inHighlights || inOptions || inCategory;
      }

      return true;
    });
  }, [allServices, activeCategory, searchQuery]);

  // Action: Open service details
  const handleOpenServiceDetails = (service: SubServiceItem) => {
    setSelectedService(service);
    window.location.hash = `#/electronic-service/${service.id}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Back to list
  const handleBackToList = () => {
    setSelectedService(null);
    window.location.hash = '#/electronic-services';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: Start service application
  const handleStartServiceRequest = (service: SubServiceItem) => {
    if (service.status === 'unavailable') {
      return;
    }

    const prefillData: any = {
      notes: `طلب خدمة إلكترونية: ${service.name} - خيار الخدمة المحدد: ${selectedOption || 'عام'}`,
      serviceOption: selectedOption || (service.options?.[0] || ''),
    };

    // If user is not logged in: save pending request and trigger login modal
    if (!user) {
      sessionStorage.setItem('pending_service_request', JSON.stringify({
        serviceId: service.id,
        fieldId: electronicField.id,
        prefill: prefillData
      }));
      window.dispatchEvent(new CustomEvent('open-auth', { detail: { mode: 'login' } }));
      return;
    }

    // If user is logged in: trigger dynamic service form directly
    window.dispatchEvent(new CustomEvent('open-service-form', {
      detail: {
        serviceId: service.id,
        fieldId: electronicField.id,
        prefill: prefillData
      }
    }));
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] dark:bg-[#08010C] text-gray-900 dark:text-gray-100 font-cairo" dir="rtl">
      <Header />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-8">
        {selectedService ? (
          /* ========================================================================= */
          /* UNIFIED SERVICE DETAIL VIEW (Strictly following the 6-component template)  */
          /* ========================================================================= */
          <>
            <div className="flex justify-end mb-2.5">
              <button
                type="button"
                onClick={handleBackToList}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 hover:bg-gold/10 hover:text-gold dark:hover:text-gold border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
              >
                <span>رجوع</span>
                <ChevronLeft size={13} className="text-gold" />
              </button>
            </div>
            <ServiceDetailLayout
            title={selectedService.name}
            badge={selectedService.isMostRequested ? 'الأكثر طلباً' : undefined}
            shortDescription={selectedService.subtitle}
            aboutTitle="ماذا نقدم في هذه الخدمة"
            aboutText={selectedService.description}
            // Interactive Options Selector Slot (56-64px rows with radio button indicator)
            optionsSlot={
              selectedService.options && selectedService.options.length > 0 ? (
                <div className="space-y-3 pt-2">
                  <h2 className="text-[18px] md:text-[20px] font-bold text-[#180020] dark:text-white m-0">
                    خيارات ومسارات الخدمة المتاحة
                  </h2>
                  <p className="text-[14px] text-gray-600 dark:text-gray-400 m-0">
                    يرجى تحديد المسار أو نوع المعاملة المراد إنجازها:
                  </p>
                  <div className="space-y-2 mt-2">
                    {selectedService.options.map((opt, idx) => {
                      const isSelected = selectedOption === opt;
                      const formattedIndex = idx < 9 ? `0${idx + 1}` : `${idx + 1}`;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedOption(opt)}
                          className={`w-full h-[54px] sm:h-[58px] px-4 rounded-xl border flex items-center justify-between text-right transition-all cursor-pointer ${
                            isSelected
                              ? 'border-gold bg-[#B99A55]/10 shadow-xs'
                              : 'border-gray-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] hover:border-gold/40'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'border-gold bg-gold'
                                : 'border-gray-400 dark:border-gray-600'
                            }`}>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#180020]" />}
                            </span>
                            <span className={`text-[14.5px] sm:text-[15.5px] font-bold truncate ${
                              isSelected ? 'text-[#180020] dark:text-gold' : 'text-gray-800 dark:text-gray-200'
                            }`}>
                              {opt}
                            </span>
                          </div>
                          <span className="text-[13px] font-mono font-bold text-gold shrink-0">
                            {formattedIndex}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : undefined
            }
            benefitsTitle="أبرز مزايا الخدمة"
            benefits={selectedService.highlights}
            requirementsTitle="المتطلبات"
            requirements={selectedService.requirements}
            timelineTitle="خطوات إنجاز الطلب"
            timelineSteps={
              selectedService.steps && selectedService.steps.length > 0
                ? selectedService.steps
                : [
                    'اختيار نوع الخدمة والمسار المناسب.',
                    'إدخال البيانات والمعلومات الأساسية بدقة.',
                    'رفع المستندات والوثائق المطلوبة.',
                    'مراجعة الطلب والتأكد من مطابقة الشروط.',
                    'إرسال الطلب ومتابعة حالته إلكترونياً.',
                  ]
            }
            ctaTitle="تنفيذ الطلب"
            ctaButtonText="ابدأ طلب الخدمة"
            ctaNote={
              selectedOption
                ? `المسار المحدد: ${selectedOption}`
                : undefined
            }
            isUnavailable={selectedService.status === 'unavailable'}
            onCtaClick={() => handleStartServiceRequest(selectedService)}
          />
          </>
        ) : (
          /* ========================================================================= */
          /* MAIN DIRECTORY VIEW: Hero + Banner + Search + Popular + Tabs + Service List */
          /* ========================================================================= */
          <div className="space-y-6 sm:space-y-7 text-right">
            {/* Small back button at top left */}
            <div className="flex justify-end mb-1">
              <button
                type="button"
                onClick={() => {
                  if (onBack) {
                    onBack();
                  } else if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.hash = '#/#business-fields';
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 hover:bg-gold/10 hover:text-gold dark:hover:text-gold border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
              >
                <span>رجوع</span>
                <ChevronLeft size={13} className="text-gold" />
              </button>
            </div>

            {/* Top Intro Section with Official Card Banner */}
            <div className="space-y-5">
              <ServiceHero
                kicker="بوابة الخدمات الذاتية والإلكترونية"
                title="الخدمات الإلكترونية"
                subtitle="أنجز خدماتك الإلكترونية بسهولة ووضوح"
                description="حلول رقمية متكاملة تساعدك في تجهيز المستندات، إعداد السيرة الذاتية، والتقديم على الخدمات الحكومية وبرامج التمويل والدعم."
              />

              {/* Official 16:9 Visual Card Banner */}
              <div className="max-w-[800px] aspect-[21/9] sm:aspect-[16/9] max-h-[220px] sm:max-h-[300px]">
                <div className="image-wrapper w-full h-full">
                  <img 
                    src="/business-fields/electronic.jpeg?v=4" 
                    alt="بطاقة الخدمات الإلكترونية - شركة ريفانس المالية" 
                    loading="eager"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Independent Search Bar (52-56px height) */}
            <ServiceSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="ابحث بالاسم، مثل: سيرة، ضمان، ريف، حساب، تمويل..."
            />

            {/* SECTION: الأكثر طلباً (Compact Numbered List) */}
            {!searchQuery && activeCategory === 'all' && (
              <ServicePopularList
                title="الأكثر طلبًا"
                items={mostRequestedList}
                onSelect={(item) => {
                  const service = allServices.find(s => s.id === item.id);
                  if (service) handleOpenServiceDetails(service);
                }}
                className="pb-6 border-b border-gray-200/80 dark:border-white/10"
              />
            )}

            {/* SECTION: تصنيفات الخدمات (Horizontal Scrollable Tabs) */}
            <ServiceCategoryTabs
              tabs={CATEGORY_TABS}
              activeKey={activeCategory}
              onChange={(key) => setActiveCategory(key as ServiceCategoryKey)}
            />

            {/* SECTION: قائمة الخدمات (Clean Service Items List) */}
            {filteredServices.length > 0 ? (
              <div>
                {filteredServices.map((service) => (
                  <ServiceItemCard
                    key={service.id}
                    id={service.id}
                    name={service.name}
                    description={service.subtitle || service.description}
                    badge={service.isMostRequested ? 'الأكثر طلباً' : undefined}
                    isUnavailable={service.status === 'unavailable'}
                    ctaText="ابدأ الخدمة"
                    onSelect={() => handleOpenServiceDetails(service)}
                  />
                ))}
              </div>
            ) : (
              /* No Search Results */
              <div className="py-16 text-center text-gray-500 dark:text-gray-400 space-y-3">
                <p className="text-[17px] font-bold text-gray-800 dark:text-gray-200 m-0">
                  لم نجد أي خدمة مطابقة لبحثك
                </p>
                <p className="text-[14px] m-0">
                  جرّب البحث بكلمات أخرى أو اختر أحد التصنيفات أعلاه.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  className="inline-block text-[14px] font-bold text-gold hover:underline cursor-pointer pt-2"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ElectronicServicesPage;
