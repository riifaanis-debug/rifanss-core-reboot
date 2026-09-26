import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/rifans/Header';
import IntroVideo from './components/rifans/IntroVideo';
import Hero from './components/rifans/Hero';
import About from './components/rifans/About';
import Footer from './components/rifans/Footer';
import BackToTop from './components/rifans/BackToTop';
import { useLanguage, LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import FloatingWhatsApp from './components/rifans/FloatingWhatsApp';
import CompanyIntro from './components/rifans/CompanyIntro';
import ClientReviews from './components/rifans/ClientReviews';
import HealthDisabilityWaiver from './components/rifans/HealthDisabilityWaiver';
import HealthDisabilityWaiverPage from './components/rifans/HealthDisabilityWaiverPage';
import { Terms, Privacy, Complaints, Contact, AboutPage, GoalPage, VisionPage, MessagePage, MissionPage, ServicesPage, AcceptableUse, CookiePolicy, IntellectualProperty, DisclaimerPage, DataProtectionPolicy, BeneficiaryRightsPage } from './components/rifans/StaticPages';
import { ServiceDetailPage } from './components/rifans/ServiceDetailPage';
import { SectionPage } from './components/rifans/SectionPage';
import { ServiceCategoryPage } from './components/rifans/ServiceCategoryPage';
import { ProductPage } from './components/rifans/ProductPage';
import { ProductRequestForm } from './components/rifans/ProductRequestForm';
import WaiveRequestForm from './components/rifans/WaiveRequestForm';
import AuthPage from './components/rifans/AuthPage';
import AdminDashboard from './components/rifans/AdminDashboard';
import CustomerDashboard from './components/rifans/CustomerDashboard';
import ContractPage from './components/rifans/ContractPage';
import InvoicePage from './components/rifans/InvoicePage';
import PromissoryNotePage from './components/rifans/PromissoryNotePage';
import ClientCard from './components/rifans/ClientCard';
import ProfileCompletionModal from './components/rifans/ProfileCompletionModal';
import { WaiveInfoPage, SchedulingInfoPage, SeizedAmountsInfoPage } from './components/rifans/ServiceInfoPage';
import DomainVerificationCheck from './components/rifans/DomainVerificationCheck';
import PaymentReturnPage from './components/rifans/PaymentReturnPage';
import BusinessFields from './components/rifans/BusinessFields';
import MostRequestedServices from './components/rifans/MostRequestedServices';
import Vision2030Section from './components/rifans/Vision2030Section';
import BusinessFieldPage from './components/rifans/BusinessFieldPage';
import ElectronicServicesPage from './components/rifans/ElectronicServicesPage';
import DynamicServiceForm from './components/rifans/DynamicServiceForm';
import { getSubServiceById, SubServiceItem, BusinessFieldItem } from './data/businessFieldsData';
import { 
  initGlobalScrollRestoration, 
  forceScrollToTop, 
  scheduleScrollToTop, 
  scrollToSection, 
  extractSectionId, 
  getPendingSection, 
  setPendingSection,
  navigateTo 
} from './utils/scrollManager';

const LandingPage: React.FC = () => {
  return (
    <>
      <Header />
      <IntroVideo />
      <CompanyIntro />
      <div className="relative z-10">
        <About />
        <Vision2030Section />
        <MostRequestedServices />
        <BusinessFields />
        <ClientReviews />
        <HealthDisabilityWaiver />
        <Footer />
      </div>
      <BackToTop />
    </>
  );
};

const AppContent: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash);
  const [showAuth, setShowAuth] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [waivePrefill, setWaivePrefill] = useState<any>(null);
  const [showWaiveForm, setShowWaiveForm] = useState(false);
  const [activeServiceForm, setActiveServiceForm] = useState<{
    subService: SubServiceItem;
    field: BusinessFieldItem;
    prefill?: any;
  } | null>(null);
  const [showLoginWarning, setShowLoginWarning] = useState(false);
  const { user, logout } = useAuth();

  // Show warning modal on first login
  useEffect(() => {
    if (user) {
      const warningShown = sessionStorage.getItem('login_warning_shown');
      if (!warningShown) {
        setShowLoginWarning(true);
        sessionStorage.setItem('login_warning_shown', 'true');
      }
    }
  }, [user]);

  // Initialize global scroll manager and click interception once on mount
  useEffect(() => {
    const cleanup = initGlobalScrollRestoration();
    return cleanup;
  }, []);

  // Sync route on hashchange / popstate
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash || '#/';
      setRoute(currentHash);
      const sectionId = extractSectionId(currentHash);
      if (!sectionId) {
        forceScrollToTop();
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Scroll Restoration when route changes
  useEffect(() => {
    const sectionId = extractSectionId(route) || getPendingSection();
    if (sectionId) {
      setPendingSection(null);
      let attempts = 0;
      const tryScroll = () => {
        const scrolled = scrollToSection(sectionId, true);
        if (!scrolled && attempts < 10) {
          attempts++;
          setTimeout(tryScroll, 50);
        }
      };
      // Try immediate and on paint
      requestAnimationFrame(tryScroll);
    } else {
      // Full page route: forcefully schedule instant scroll to top
      scheduleScrollToTop();
    }
  }, [route]);

  useEffect(() => {
    const handleOpenAuth = (e?: any) => {
      const mode = e?.detail?.mode === 'register' ? 'register' : 'login';
      setAuthInitialMode(mode);
      setShowAuth(true);
    };
    
    const handleOpenWaiveForm = (e: any) => {
      setWaivePrefill(e.detail);
      if (!user) {
        setAuthInitialMode('login');
        setShowAuth(true);
        return;
      }
      setShowWaiveForm(true);
    };

    const handleOpenServiceForm = (e: any) => {
      const { serviceId, prefill } = e.detail || {};
      const found = getSubServiceById(serviceId);
      if (!found) return;

      if (!user) {
        sessionStorage.setItem('pending_service_request', JSON.stringify({
          serviceId: found.subService.id,
          fieldId: found.field.id,
          prefill
        }));
        setShowAuth(true);
        return;
      }

      if (found.subService.id === 'waiver-request') {
        setWaivePrefill(prefill);
        setShowWaiveForm(true);
      } else {
        setActiveServiceForm({
          subService: found.subService,
          field: found.field,
          prefill
        });
      }
    };

    window.addEventListener('open-auth', handleOpenAuth);
    window.addEventListener('open-waive-form', handleOpenWaiveForm);
    window.addEventListener('open-service-form', handleOpenServiceForm);
    return () => {
      window.removeEventListener('open-auth', handleOpenAuth);
      window.removeEventListener('open-waive-form', handleOpenWaiveForm);
      window.removeEventListener('open-service-form', handleOpenServiceForm);
    };
  }, [user]);

  // Open waive form or dynamic service form if user just logged in after clicking a service request button
  useEffect(() => {
    if (user && !showAuth) {
      const pendingRaw = sessionStorage.getItem('pending_service_request');
      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw);
          sessionStorage.removeItem('pending_service_request');
          const found = getSubServiceById(pending.serviceId);
          if (found) {
            if (found.subService.id === 'waiver-request') {
              setWaivePrefill(pending.prefill || {});
              setShowWaiveForm(true);
            } else {
              setActiveServiceForm({
                subService: found.subService,
                field: found.field,
                prefill: pending.prefill
              });
            }
          }
        } catch (err) {
          console.error('Pending service request parse error:', err);
        }
      } else if (waivePrefill && !showWaiveForm) {
        setShowWaiveForm(true);
      }
    }
  }, [user, waivePrefill, showWaiveForm, showAuth]);

  const getComponent = () => {
    // PayPal return / cancel routes (must run before role-based routing)
    if (route.startsWith('#/pay/return')) return <PaymentReturnPage />;
    if (route.startsWith('#/pay/cancel')) return <PaymentReturnPage cancelled />;

    // Admins always see only the admin dashboard
    if (user?.role === 'admin') {
      if (route.startsWith('#/promissory/')) {
        const noteId = route.replace('#/promissory/', '');
        return <PromissoryNotePage noteId={noteId} onClose={() => window.location.hash = '#/admin'} />;
      }
      return <AdminDashboard onClose={() => { window.location.hash = '#/admin';}} />;
    }
    if (route.startsWith('#/service-apply/')) {
      const serviceId = route.replace('#/service-apply/', '');
      const found = getSubServiceById(serviceId);
      if (found) {
        if (found.subService.id === 'waiver-request') {
          return (
            <WaiveRequestForm
              prefill={{ notes: `طلب خدمة: ${found.subService.name}` }}
              onClose={() => { window.location.hash = '#/'; }}
            />
          );
        }
        return (
          <DynamicServiceForm
            subService={found.subService}
            field={found.field}
            onClose={() => { window.location.hash = `#/business-field/${found.field.id}`; }}
          />
        );
      }
    }
    if (route.startsWith('#/electronic-service/')) {
      const serviceId = route.replace('#/electronic-service/', '');
      return <ElectronicServicesPage initialServiceId={serviceId} onBack={() => navigateTo('#/electronic-services')} />;
    }
    if (route.startsWith('#/electronic-services')) {
      return <ElectronicServicesPage onBack={() => navigateTo('#business-fields')} />;
    }
    if (route.startsWith('#/business-field/')) {
      const fieldId = route.replace('#/business-field/', '');
      return <BusinessFieldPage fieldId={fieldId} onBack={() => navigateTo('#business-fields')} />;
    }
    if (route === '#/business-fields') {
      return <BusinessFieldPage fieldId="financial" onBack={() => navigateTo('#business-fields')} />;
    }
    if (route.startsWith('#/section/')) {
      const sectionId = route.replace('#/section/', '');
      return <SectionPage sectionId={sectionId} />;
    }
    if (route.startsWith('#/category/')) {
      const categoryId = route.replace('#/category/', '');
      return <ServiceCategoryPage categoryId={categoryId} />;
    }
    if (route.startsWith('#/product/') && route.endsWith('/apply')) {
      const productId = route.replace('#/product/', '').replace('/apply', '');
      return <ProductRequestForm productId={productId} />;
    }
    if (route.startsWith('#/product/')) {
      const productId = route.replace('#/product/', '');
      return <ProductPage productId={productId} />;
    }
    if (route.startsWith('#/service/')) {
      const fullType = route.replace('#/service/', '');
      const [type, subType] = fullType.split('/');
      return <ServiceDetailPage type={type} subType={subType} />;
    }
    if (route.startsWith('#/contract/')) {
      const submissionId = route.replace('#/contract/', '');
      return user ? <ContractPage submissionId={submissionId} onClose={() => window.location.hash = '#/dashboard?tab=contracts'} /> : <LandingPage />;
    }
    if (route.startsWith('#/invoice/')) {
      const submissionId = route.replace('#/invoice/', '');
      return user ? <InvoicePage submissionId={submissionId} onClose={() => window.location.hash = '#/dashboard?tab=contracts'} /> : <LandingPage />;
    }
    if (route.startsWith('#/promissory/')) {
      const noteId = route.replace('#/promissory/', '');
      return user ? <PromissoryNotePage noteId={noteId} onClose={() => window.location.hash = '#/dashboard'} /> : <LandingPage />;
    }
    switch(route) {
      case '#/services': return <ServicesPage />;
      case '#/business-fields': return <LandingPage />;
      case '#/terms': return <Terms />;
      case '#/privacy': return <Privacy />;
      case '#/complaints': return <Complaints />;
      case '#/contact': return <Contact />;
      case '#/about': return <AboutPage />;
      case '#/goal': return <GoalPage />;
      case '#/vision': return <VisionPage />;
      case '#/message': return <MessagePage />;
      case '#/mission': return <MissionPage />;
      case '#/acceptable-use': return <AcceptableUse />;
      case '#/cookies': return <CookiePolicy />;
      case '#/disclaimer': return <DisclaimerPage />;
      case '#/data-protection': return <DataProtectionPolicy />;
      case '#/user-rights': return <BeneficiaryRightsPage />;
      case '#/intellectual-property': return <IntellectualProperty />;
      case '#/waive-landing': return <LandingPage />;
      case '#/health-waiver':
      case '#/waiver-health': return <HealthDisabilityWaiverPage />;
      case '#/waive-info': return <WaiveInfoPage />;
      case '#/scheduling-info': return <SchedulingInfoPage />;
      case '#/seized-amounts-info': return <SeizedAmountsInfoPage />;
      case '#/client-card': return <ClientCard />;
      case '#/domain-check': return <DomainVerificationCheck />;
      case '#/admin': return <LandingPage />;
      case '#/dashboard': return user ? <CustomerDashboard user={{ id: user.id, fullName: '', email: '', nationalId: user.national_id || '', mobile: user.phone || '', joinDate: new Date().toISOString() }} onClose={() => { window.location.hash = '#/';}} onLogout={logout} /> : <LandingPage />;
      default: return <LandingPage />;
    }
  };

  return (
    <main key={route} className="w-full max-w-full overflow-x-clip mx-auto min-h-screen bg-page dark:bg-[#06010a] transition-colors duration-300">
      {getComponent()}
      {showAuth && !user && <AuthPage initialMode={authInitialMode} onClose={() => setShowAuth(false)} />}
      {showWaiveForm && <WaiveRequestForm prefill={waivePrefill} onClose={() => { setShowWaiveForm(false); setWaivePrefill(null); }} />}
      {activeServiceForm && (
        <DynamicServiceForm
          subService={activeServiceForm.subService}
          field={activeServiceForm.field}
          prefill={activeServiceForm.prefill}
          onClose={() => setActiveServiceForm(null)}
        />
      )}
      <ProfileCompletionModal />

      {/* Login Warning Modal */}
      {showLoginWarning && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLoginWarning(false)} />
          <div className="relative w-full max-w-[340px] overflow-hidden rounded-xl shadow-2xl" dir="rtl">
            {/* Red header */}
            <div className="bg-red-600 px-4 py-2">
              <h3 className="text-[13px] font-black text-white text-right">إخلاء مسؤولية</h3>
            </div>
            {/* Content */}
            <div className="bg-white dark:bg-[#12031a] px-4 py-3 text-right space-y-2 text-[10px] leading-[18px] text-gray-700 dark:text-gray-300 max-h-[40vh] overflow-y-auto">
              <p>
                يُعدّ القيام بتقديم بيانات غير صحيحة أو مستندات غير نظامية أو مضلّلة ، مخالفة صريحة للأنظمة والتعليمات المعمول بها، ويعرّضك للمساءلة أمام الجهات المعنية والجهات القضائية المختصة ، كما قد يترتب على ذلك اتخاذ كافة الإجراءات القانونية اللازمة بحقك دون إشعار مسبق .
              </p>
              <p>
                نؤكد على ضرورة الالتزام بإدخال معلومات دقيقة وصحيحة ، والتأكد من سلامة وصحة جميع المستندات المرفقة ، حيث إنك تتحمّل كامل المسؤولية النظامية عن أي بيانات يتم تقديمها من خلال المنصة .
              </p>
              <p>
                إن استخدامك للخدمة يُعد إقرارًا منك بصحة المعلومات المقدمة وموافقتك على الشروط والأحكام ذات العلاقة
              </p>
            </div>
            {/* Footer */}
            <div className="bg-white dark:bg-[#12031a] px-4 pb-3 flex justify-center">
              <button
                onClick={() => setShowLoginWarning(false)}
                className="px-8 py-1.5 rounded-md bg-red-600 text-white font-bold text-[11px] hover:bg-red-700 transition-all"
              >
                موافق
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </LanguageProvider>
);

export default App;
