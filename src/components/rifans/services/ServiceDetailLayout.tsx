import React from 'react';
import { ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';

export interface DetailTimelineStep {
  title: string;
  description?: string;
}

export interface ServiceDetailLayoutProps {
  // 1. Service Header
  icon?: React.ReactNode;
  title: string;
  badge?: string;
  shortDescription?: string;

  // Optional Disclaimer / Notice
  notice?: string | React.ReactNode;

  // 2. نبذة عن الخدمة (About)
  aboutTitle?: string;
  aboutText?: string | React.ReactNode;

  // Custom Slot (e.g. Transaction options / paths)
  optionsSlot?: React.ReactNode;

  // 3. أبرز مزايا الخدمة (Key Benefits)
  benefitsTitle?: string;
  benefits?: string[];

  // 4. المستندات والمتطلبات (Requirements)
  requirementsTitle?: string;
  requirements?: string[];

  // 5. مراحل وإجراءات تنفيذ الطلب (Timeline)
  timelineTitle?: string;
  timelineSteps?: Array<string | DetailTimelineStep>;

  // 6. تنفيذ الطلب (CTA)
  ctaTitle?: string;
  ctaButtonText?: string;
  ctaNote?: string;
  isUnavailable?: boolean;
  onCtaClick?: () => void;
  ctaSlot?: React.ReactNode;

  className?: string;
  heroImage?: string;
}

export const ServiceDetailLayout: React.FC<ServiceDetailLayoutProps> = ({
  title,
  badge,
  shortDescription,
  notice,
  aboutTitle = 'نبذة عن الخدمة',
  aboutText,
  optionsSlot,
  benefitsTitle = 'أبرز مزايا الخدمة للأفراد',
  benefits,
  requirementsTitle = 'المستندات والمتطلبات المقترحة',
  requirements,
  timelineTitle = 'مراحل وإجراءات تنفيذ الطلب',
  timelineSteps,
  ctaTitle = 'تنفيذ الطلب',
  ctaButtonText = 'تقديم طلب إلكتروني للخدمة',
  ctaNote,
  isUnavailable = false,
  onCtaClick,
  ctaSlot,
  className = '',
  heroImage,
}) => {
  // Check if shortDescription is duplicate of aboutText to prevent unnecessary visual repetition
  const shouldShowShortDesc = React.useMemo(() => {
    if (!shortDescription) return false;
    if (!aboutText) return true;
    const cleanShort = typeof shortDescription === 'string' ? shortDescription.trim() : '';
    const cleanAbout = typeof aboutText === 'string' ? aboutText.trim() : '';
    if (!cleanShort) return false;
    if (cleanShort === cleanAbout  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 border-b border-gold/30 pb-3">
      <div className="w-2.5 h-7 rounded-full bg-gold shrink-0" />
      <h2 className="text-xl sm:text-3xl font-black text-[#240738] dark:text-gold m-0">{children}</h2>
    </div>
  );
  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#14031c] border border-gold/25 text-sm sm:text-lg leading-loose text-gray-600 dark:text-gray-300">
      {children}
    </div>
  );
  const CheckList = ({ items }: { items: string[] }) => (
    <ul className="space-y-4 m-0 p-0 list-none">
      {items.map((t, i) => (
        <li key={i} className="flex items-start gap-3 text-gray-800 dark:text-gray-200">
          <CheckCircle2 className="w-6 h-6 text-gold shrink-0 mt-1" />
          <span className="flex-1">{t}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <article className={`font-cairo text-right ${className}`} dir="rtl">
      {heroImage && (
        <div className="relative w-screen max-w-[100vw] left-1/2 -translate-x-1/2 mb-8 sm:mb-10 overflow-hidden">
          <img src={heroImage} alt={title} className="block w-full h-auto max-h-[560px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12021a]/95 via-[#12021a]/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10 max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-5xl font-black leading-tight m-0 bg-gradient-to-l from-[#F3DEA0] via-[#D6B56A] to-[#B99A55] bg-clip-text text-transparent drop-shadow">
              {title}
            </h1>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12">
        <section className="pr-4 border-r-4 border-gold space-y-3">
          <div className="flex items-start gap-2 flex-wrap">
            <h2 className="text-xl sm:text-3xl font-black leading-snug text-[#240738] dark:text-white m-0">{title}</h2>
            {badge && <span className="text-xs font-bold text-gold mt-2">• {badge}</span>}
          </div>
          {shouldShowShortDesc && (
            <p className="text-sm sm:text-lg leading-loose text-gray-600 dark:text-gray-300 m-0">{shortDescription}</p>
          )}
          {notice && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border-r-4 border-amber-500 text-amber-900 dark:text-amber-200 text-sm leading-relaxed flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">{notice}</div>
            </div>
          )}
        </section>

        {aboutText && (
          <section className="space-y-4">
            <SectionTitle>شرح الخدمة</SectionTitle>
            <Card>
              {typeof aboutText === 'string' ? <p className="m-0 whitespace-pre-line">{aboutText}</p> : aboutText}
            </Card>
          </section>
        )}

        {optionsSlot && <section>{optionsSlot}</section>}

        {benefits && benefits.length > 0 && (
          <section className="space-y-4">
            <SectionTitle>{benefitsTitle}</SectionTitle>
            <Card><CheckList items={benefits} /></Card>
          </section>
        )}

        {requirements && requirements.length > 0 && (
          <section className="space-y-4">
            <SectionTitle>{requirementsTitle}</SectionTitle>
            <Card><CheckList items={requirements} /></Card>
          </section>
        )}

        {timelineSteps && timelineSteps.length > 0 && (
          <section className="space-y-4">
            <SectionTitle>{timelineTitle}</SectionTitle>
            <Card>
              <ol className="space-y-5 m-0 p-0 list-none">
                {timelineSteps.map((step, index) => {
                  const stepTitle = typeof step === 'string' ? step : step.title;
                  const stepDesc = typeof step === 'string' ? null : step.description;
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-full bg-gold/15 text-gold font-black text-sm flex items-center justify-center shrink-0">{index + 1}</span>
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-lg font-bold text-[#240738] dark:text-white m-0 leading-relaxed">{stepTitle}</h3>
                        {stepDesc && <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 m-0 mt-1 leading-relaxed">{stepDesc}</p>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </section>
        )}

        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#2A0835] to-[#160320] text-white border-2 border-gold/70 shadow-lg space-y-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <ShieldCheck className="w-7 h-7 text-gold shrink-0" />
            <h3 className="text-lg sm:text-2xl font-black m-0">المصداقية والشفافية</h3>
          </div>
          <p className="text-sm sm:text-base leading-loose text-gray-200 m-0">
            حرصًا من ريفانس المالية على الشفافية والمصداقية، نوضح لك جميع تفاصيل الخدمة وإجراءاتها ومتطلباتها قبل البدء، ونتابع طلبك خطوة بخطوة حتى إنجازه.
          </p>
          <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-4 text-xs sm:text-sm">
            <span className="font-bold text-gold">«ريفانس المالية»</span>
            <span className="text-gray-300">«وضوح في الإجراءات، وشفافية في التعامل»</span>
          </div>
        </div>

        <footer className="pt-8 pb-10 text-center space-y-4 border-t border-gold/30">
          {ctaSlot ? ctaSlot : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/15 text-gold mb-1">
                <HeartHandshake className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-[#240738] dark:text-white m-0">جاهز لبدء الطلب؟</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto m-0">
                {ctaNote || 'فريقنا المختص جاهز لمراجعة طلبك والبدء في تنفيذ الخدمة ومتابعتها حتى الإنجاز.'}
              </p>
              <div className="pt-4">
                {isUnavailable ? (
                  <div className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-center font-bold text-sm">
                    الخدمة غير متاحة حالياً
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={onCtaClick}
                    className="inline-flex items-center justify-center gap-3 rounded-full px-12 sm:px-16 py-4 bg-[#2A0E32] border-2 border-gold text-white text-base sm:text-lg font-black shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>طلب الخدمة الآن</span>
                    <ArrowLeft className="w-5 h-5 text-gold" />
                  </button>
                )}
              </div>
            </>
          )}
        </footer>
      </div>
    </article>
  );
};

export default ServiceDetailLayout;
