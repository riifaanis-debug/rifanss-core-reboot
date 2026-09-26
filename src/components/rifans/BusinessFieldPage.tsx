import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  CreditCard,
  Handshake,
  Receipt,
  Smartphone,
  FileCheck,
  CalendarClock,
  Unlock,
  Home,
  Building,
  Key,
  Gavel,
  Wrench,
  Award,
  FileSpreadsheet,
  Briefcase,
  Scale,
  Landmark,
  Users,
  FileText,
  ChevronLeft,
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { BUSINESS_FIELDS_DATA, SubServiceItem } from '../../data/businessFieldsData';
import { useAuth } from '../../contexts/AuthContext';
import ElectronicServicesPage from './ElectronicServicesPage';
import {
  ServiceHero,
  ServiceItemCard,
  ServiceDetailLayout,
} from './services';

interface BusinessFieldPageProps {
  fieldId?: string;
  onBack?: () => void;
}

// Icon mapping helper with unified sizing
const getSubServiceIcon = (iconName: string) => {
  const iconProps = { size: 24, strokeWidth: 2, className: "text-gold" };
  switch (iconName) {
    case 'TrendingUp': return <TrendingUp {...iconProps} />;
    case 'CreditCard': return <CreditCard {...iconProps} />;
    case 'Handshake': return <Handshake {...iconProps} />;
    case 'Receipt': return <Receipt {...iconProps} />;
    case 'Smartphone': return <Smartphone {...iconProps} />;
    case 'FileCheck': return <FileCheck {...iconProps} />;
    case 'CalendarClock': return <CalendarClock {...iconProps} />;
    case 'Unlock': return <Unlock {...iconProps} />;
    case 'Home': return <Home {...iconProps} />;
    case 'Building': return <Building {...iconProps} />;
    case 'Key': return <Key {...iconProps} />;
    case 'Gavel': return <Gavel {...iconProps} />;
    case 'Wrench': return <Wrench {...iconProps} />;
    case 'Award': return <Award {...iconProps} />;
    case 'FileSpreadsheet': return <FileSpreadsheet {...iconProps} />;
    case 'Briefcase': return <Briefcase {...iconProps} />;
    case 'Scale': return <Scale {...iconProps} />;
    case 'Landmark': return <Landmark {...iconProps} />;
    case 'Users': return <Users {...iconProps} />;
    default: return <FileText {...iconProps} />;
  }
};

export const BusinessFieldPage: React.FC<BusinessFieldPageProps> = ({ fieldId, onBack }) => {
  const { user } = useAuth();
  // Match current field or default to 'financial'
  const currentField = BUSINESS_FIELDS_DATA.find(f => f.id === fieldId) || BUSINESS_FIELDS_DATA[0];
  const [selectedSubService, setSelectedSubService] = useState<SubServiceItem | null>(null);

  if (currentField.id === 'electronic') {
    return <ElectronicServicesPage onBack={onBack} initialServiceId={selectedSubService?.id} />;
  }

  // Reset selected sub-service when switching fields
  useEffect(() => {
    setSelectedSubService(null);
  }, [fieldId]);

  const handleSubServiceClick = (sub: SubServiceItem) => {
    setSelectedSubService(sub);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyNow = (subService: SubServiceItem) => {
    // If user is not authenticated: preserve chosen service and prompt auth
    if (!user) {
      sessionStorage.setItem('pending_service_request', JSON.stringify({
        serviceId: subService.id,
        fieldId: currentField.id,
        serviceName: subService.name,
        fieldTitle: currentField.title,
      }));
      window.dispatchEvent(new CustomEvent('open-auth'));
      return;
    }

    // If user is authenticated: directly open the appropriate form
    if (subService.id === 'waiver-request') {
      window.dispatchEvent(new CustomEvent('open-waive-form', { 
        detail: { 
          serviceName: subService.name,
          fieldTitle: currentField.title,
          notes: `طلب خدمة: ${subService.name} ضمن ${currentField.title}` 
        } 
      }));
    } else {
      window.dispatchEvent(new CustomEvent('open-service-form', {
        detail: {
          serviceId: subService.id,
          fieldId: currentField.id,
          prefill: {
            notes: `طلب خدمة: ${subService.name} ضمن ${currentField.title}`
          }
        }
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] dark:bg-[#08010C] text-gray-900 dark:text-gray-100 font-cairo" dir="rtl">
      <Header />

      {selectedSubService ? (
        /* ========================================================================= */
        /* UNIFIED SERVICE DETAIL VIEW (Strictly following the 6-component template)  */
        /* ========================================================================= */
        <main className="max-w-[1000px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex justify-end mb-2.5">
            <button
              type="button"
              onClick={() => {
                setSelectedSubService(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 hover:bg-gold/10 hover:text-gold dark:hover:text-gold border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
            >
              <span>رجوع</span>
              <ChevronLeft size={13} className="text-gold" />
            </button>
          </div>
          <ServiceDetailLayout
            title={selectedSubService.name}
            aboutTitle="نبذة عن الخدمة"
            aboutText={selectedSubService.description}
            benefitsTitle="أبرز مزايا الخدمة للأفراد"
            benefits={selectedSubService.highlights}
            requirementsTitle="المستندات والمتطلبات المقترحة"
            requirements={selectedSubService.requirements}
            timelineTitle="مراحل وإجراءات تنفيذ الطلب"
            timelineSteps={selectedSubService.steps}
            ctaTitle="تنفيذ الطلب"
            ctaButtonText="تقديم طلب إلكتروني للخدمة"
            onCtaClick={() => handleApplyNow(selectedSubService)}
          />
        </main>
      ) : (
        /* ========================================================================= */
        /* DIRECTORY VIEW: Section Hero + Clean Services List                        */
        /* ========================================================================= */
        <main className="max-w-[1000px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 text-right">
          {/* Small back button at top left */}
          <div className="flex justify-end mb-2.5">
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

          {/* Section Hero: 26px mobile, 34px desktop, 16px body */}
          <ServiceHero
            kicker="مجالات أعمالنا"
            title={currentField.title}
            description={currentField.intro}
          />

          {/* Section Services Header: 16px title without count */}
          <div className="border-b border-gray-200/80 dark:border-white/10 pb-3 mb-1 mt-7 sm:mt-9">
            <h2 className="text-[16px] sm:text-xl md:text-2xl font-bold leading-[1.375] text-[#2A0E32] dark:text-white m-0">
              الخدمات المتاحة في هذا القسم
            </h2>
          </div>

          {/* Unified Service Items List: 24px vertical padding, hairline divider */}
          <div>
            {currentField.subServices.map((service) => (
              <ServiceItemCard
                key={service.id}
                id={service.id}
                name={service.name}
                description={service.description}
                ctaText="طلب الخدمة / التفاصيل"
                onSelect={() => handleSubServiceClick(service)}
              />
            ))}
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
};

export default BusinessFieldPage;
