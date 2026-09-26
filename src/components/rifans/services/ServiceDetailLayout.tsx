import React from 'react';
import { Check, ArrowLeft, AlertCircle } from 'lucide-react';

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
}) => {
  // Check if shortDescription is duplicate of aboutText to prevent unnecessary visual repetition
  const shouldShowShortDesc = React.useMemo(() => {
    if (!shortDescription) return false;
    if (!aboutText) return true;
    const cleanShort = typeof shortDescription === 'string' ? shortDescription.trim() : '';
    const cleanAbout = typeof aboutText === 'string' ? aboutText.trim() : '';
    if (!cleanShort) return false;
    if (cleanShort === cleanAbout) return false;
    return true;
  }, [shortDescription, aboutText]);

  return (
    <article
      className={`font-cairo text-right max-w-[800px] mx-auto space-y-6 sm:space-y-7 ${className}`}
      dir="rtl"
    >
      {/* ===================================================================== */}
      {/* 1. SERVICE HEADER (No icon before title)                               */}
      {/* العنوان الأول: 16px على الجوال (md: 22px)، line-height: 1.375            */}
      {/* ===================================================================== */}
      <header className="pb-5 border-b border-gray-200/80 dark:border-white/10">
        <div className="w-full">
          <div className="flex items-start gap-2 flex-wrap">
            <h1 className="text-[16px] md:text-[22px] font-bold text-[#2A0E32] dark:text-white leading-[1.375] m-0 break-words">
              {title}
            </h1>

            {badge && (
              <span className="text-[12px] font-semibold text-gold shrink-0 mt-0.5">
                • {badge}
              </span>
            )}
          </div>

          {/* حجم النص: 13px على الجوال، line-height: 1.625 */}
          {shouldShowShortDesc && (
            <p className="text-[13px] leading-[1.625] text-gray-700 dark:text-gray-300 font-normal mt-1.5 m-0">
              {shortDescription}
            </p>
          )}
        </div>

        {/* Notice box if available */}
        {notice && (
          <div className="mt-3.5 p-3.5 rounded-xl bg-amber-500/10 border-r-4 border-amber-500 text-amber-900 dark:text-amber-200 text-[13px] leading-[1.625] flex items-start gap-2.5">
            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">{notice}</div>
          </div>
        )}
      </header>

      {/* ===================================================================== */}
      {/* 2. نبذة عن الخدمة (About Section)                                      */}
      {/* العنوان الثاني: 14px، line-height: 1.375                                */}
      {/* حجم النص: 13px، line-height: 1.625                                    */}
      {/* ===================================================================== */}
      {aboutText && (
        <section className="space-y-2">
          <h2 className="text-[14px] md:text-[18px] font-bold text-[#2A0E32] dark:text-white leading-[1.375] m-0">
            {aboutTitle}
          </h2>

          <div className="text-[13px] text-gray-700 dark:text-gray-300 leading-[1.625] font-normal">
            {typeof aboutText === 'string' ? (
              <p className="m-0 whitespace-pre-line">{aboutText}</p>
            ) : (
              aboutText
            )}
          </div>
        </section>
      )}

      {/* Optional Custom Slot (e.g. Transaction options / paths) */}
      {optionsSlot && (
        <section className="pt-1">
          {optionsSlot}
        </section>
      )}

      {/* ===================================================================== */}
      {/* 3. أبرز مزايا الخدمة للأفراد (Key Benefits)                            */}
      {/* العنوان الثاني: 14px، line-height: 1.375                                */}
      {/* حجم النص: 13px، line-height: 1.625                                    */}
      {/* ===================================================================== */}
      {benefits && benefits.length > 0 && (
        <section className="pt-5 border-t border-gray-200/80 dark:border-white/10 space-y-2.5">
          <h2 className="text-[14px] md:text-[18px] font-bold text-[#2A0E32] dark:text-white leading-[1.375] m-0">
            {benefitsTitle}
          </h2>

          <ul className="space-y-2.5 m-0 p-0 list-none">
            {benefits.map((benefit, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-[13px] text-gray-700 dark:text-gray-300 leading-[1.625] font-normal"
              >
                <div className="w-[18px] h-[18px] rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span className="flex-1">{benefit}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 4. المستندات والمتطلبات (Documents & Requirements)                    */}
      {/* العنوان الثاني: 14px، line-height: 1.375                                */}
      {/* حجم النص: 13px، line-height: 1.625                                    */}
      {/* ===================================================================== */}
      {requirements && requirements.length > 0 && (
        <section className="pt-5 border-t border-gray-200/80 dark:border-white/10 space-y-2.5">
          <h2 className="text-[14px] md:text-[18px] font-bold text-[#2A0E32] dark:text-white leading-[1.375] m-0">
            {requirementsTitle}
          </h2>

          <ul className="space-y-2.5 m-0 p-0 list-none">
            {requirements.map((req, index) => (
              <li
                key={index}
                className="flex items-start gap-2.5 text-[13px] text-gray-700 dark:text-gray-300 leading-[1.625] font-normal"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1.5" />
                <span className="flex-1">{req}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 5. مراحل وإجراءات تنفيذ الطلب (Process Timeline)                      */}
      {/* العنوان الثاني: 14px، line-height: 1.375                                */}
      {/* حجم النص: 13px، line-height: 1.625                                    */}
      {/* ===================================================================== */}
      {timelineSteps && timelineSteps.length > 0 && (
        <section className="pt-5 border-t border-gray-200/80 dark:border-white/10 space-y-3">
          <h2 className="text-[14px] md:text-[18px] font-bold text-[#2A0E32] dark:text-white leading-[1.375] m-0">
            {timelineTitle}
          </h2>

          <div className="relative pr-4 mr-0.5 space-y-4 before:content-[''] before:absolute before:top-2 before:bottom-2 before:right-[3px] before:w-[1px] before:bg-gold/40">
            {timelineSteps.map((step, index) => {
              const stepTitle = typeof step === 'string' ? step : step.title;
              const stepDesc = typeof step === 'string' ? null : step.description;

              return (
                <div key={index} className="relative">
                  <span className="absolute -right-[16px] top-1.5 w-2 h-2 rounded-full bg-gold ring-4 ring-[#FCFBF8] dark:ring-[#08010C]" />

                  <div>
                    <span className="text-[12px] font-bold text-gold block mb-0.5 leading-[1.375]">
                      المرحلة {index + 1}
                    </span>
                    <h3 className="text-[13px] md:text-[15px] font-bold text-[#2A0E32] dark:text-white leading-[1.375] m-0">
                      {stepTitle}
                    </h3>
                    {stepDesc && (
                      <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1 leading-[1.625] m-0 font-normal">
                        {stepDesc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* 6. تنفيذ الطلب (CTA)                                                   */}
      {/* العنوان الثاني: 14px، line-height: 1.375                                */}
      {/* زر الإجراء: 54px ارتفاع، نص 14px عريض                                  */}
      {/* ===================================================================== */}
      <footer className="pt-5 border-t border-gray-200/80 dark:border-white/10">
        {ctaSlot ? (
          ctaSlot
        ) : (
          <div>
            <h2 className="text-[14px] md:text-[18px] font-bold text-[#2A0E32] dark:text-white leading-[1.375] m-0">
              {ctaTitle}
            </h2>

            {ctaNote && (
              <p className="text-[13px] text-gray-600 dark:text-gray-400 font-medium mt-1 mb-0 leading-[1.625]">
                {ctaNote}
              </p>
            )}

            <div className="mt-2.5">
              {isUnavailable ? (
                <div className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-center font-bold text-[13px]">
                  الخدمة غير متاحة حالياً
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onCtaClick}
                  className="w-full sm:w-auto min-w-[240px] h-[54px] px-8 rounded-[12px] bg-gold hover:bg-[#D8B979] text-[#180020] font-bold text-[14px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group leading-[1.375]"
                >
                  <span>{ctaButtonText}</span>
                  <ArrowLeft
                    size={16}
                    className="transition-transform group-hover:-translate-x-1"
                  />
                </button>
              )}
            </div>
          </div>
        )}
      </footer>
    </article>
  );
};

export default ServiceDetailLayout;
