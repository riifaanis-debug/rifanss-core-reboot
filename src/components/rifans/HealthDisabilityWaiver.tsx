import React from 'react';
import { 
  ArrowLeft
} from 'lucide-react';
import rifansLogo from '@/assets/rifans-logo.png';
import healthWaiverBanner from '@/assets/health-waiver-banner.jpg';

const HealthDisabilityWaiver: React.FC = () => {
  return (
    <section 
      id="health-disability-waiver" 
      className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-8 md:py-10 scroll-mt-[90px] font-['Tajawal']" 
      dir="rtl"
    >
      {/* Section Header & Official Banner */}
      <div className="space-y-6 mb-8 sm:mb-10">
        {/* Official Visual Banner */}
        <div className="image-wrapper w-full">
          <img 
            src={healthWaiverBanner} 
            alt="تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي - شركة ريفانس المالية" 
            className="w-full h-auto object-cover" 
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>

        {/* Lead Descriptive Text - Flowing editorial style without card box */}
        <div className="relative pr-4 sm:pr-5 border-r-4 border-gold space-y-3.5 sm:space-y-4 text-brand dark:text-gray-100 text-[13px] sm:text-base md:text-lg leading-relaxed pt-1 font-medium">
          <h2 className="font-black text-[#240738] dark:text-gold text-[16px] sm:text-2xl md:text-3xl leading-snug">
            هل لديك عارض صحي أو عجز طبي ؟
          </h2>

          <p className="text-brand dark:text-gray-100 font-medium">
            تسبب في عدم لياقتك الطبية للعمل ، مَما أدى إلى إنهاء خدمتك،&nbsp; ولا زال لديك تمويل عقاري أو تمويل شخصي قائم ، وتعذر عليك السداد !
          </p>

          <div className="pt-1 space-y-1">
            <h3 className="font-bold text-gold text-[15px] sm:text-xl md:text-2xl leading-snug">
              نحن في ريفانس
            </h3>
            <p className="text-brand dark:text-gray-100 font-medium">
              نؤمن أن الحلول المالية ليست مجرد أرقام أو معاملات<br />
              بل هي وسيلة لخلق أثر إنساني يعيد التوازن لحياة عملائنا.
            </p>
          </div>

          <div className="pt-2">
            <h3 className="font-bold text-[#240738] dark:text-gold text-[14px] sm:text-lg md:text-xl mb-2 leading-snug">
              مبادرة ريفانس لرفع طلب الإعفاء
            </h3>
            <p className="text-brand dark:text-gray-100 font-medium">
              جاءت مبادرة رفع طلب الإعفاء من جميع الالتزامات التمويلية لدى البنوك والمصارف ، كأحد أهم مبادراتنا لدعم العملاء الذين لديهم عجز طبي مثبت بموجب تقارير رسمية صادرة من الجهات الطبية المختصة.
            </p>
          </div>

          <div className="pt-2 text-brand dark:text-gray-100 font-medium">
            <p>
              بحكم خبرتنا ، وكفاءة فريقنا في ريفانس<br />
              المكوَّن من نخبة متخصصة في المنازعات المصرفية والقضائية&nbsp;<br />
              <span className="font-bold text-gold">نؤكد لك قوة موقفنا حتى استلام خطاب إخلاء الطرف والمخالصة المالية النهائية.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Highlighted Official Document: المصداقية والشفافية (مباشرة تحت فقرة بحكم خبرتنا) */}
      <div className="mb-8 sm:mb-12">
        <div className="relative rounded-[22px] overflow-hidden border-2 border-gold/60 bg-gradient-to-br from-[#1C0624] via-[#2A0835] to-[#160320] text-white p-6 sm:p-9 md:p-10 shadow-[0_16px_40px_rgba(34,4,44,0.35)]">
          {/* Subtle Golden Ambient Glow */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gold/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Header */}
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white">
                المصداقية والشفافية
              </h3>
            </div>

            {/* Verbatim Official Text */}
            <div className="space-y-3.5 text-xs sm:text-sm md:text-base leading-relaxed text-gray-200 border-t border-white/10 py-5">
              <p>
                حرصًا من ريفانس المالية على الشفافية والمصداقية، فإن خدمة تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي لا تتطلب أي رسوم أو مبالغ مقدمًا.
              </p>
              <p>
                وفي حال عدم قبول طلب الإعفاء، لن يتحمل العميل أي رسوم مقابل تقديم الطلب، وتكون أي مستحقات مالية مرتبطة بالخدمة — إن وجدت — بعد قبول طلب الإعفاء رسميًا وإصدار خطاب المخالصة النهائية من الجهة التمويلية المختصة.
              </p>
            </div>

            {/* In-Card Call to Action: Question & Button in one line */}
            <div className="py-4 border-y border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <span className="text-[12px] min-[400px]:text-[13.5px] sm:text-base md:text-lg font-bold text-white whitespace-nowrap text-center sm:text-right">
                هل لديك عجز صحي أدى إلى عدم لياقتك الطبية للعمل؟
              </span>
              <a
                href="#/health-waiver"
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full px-5 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-[#C59B27] via-[#D4AF37] to-[#A67C1E] text-white border-2 border-white text-xs sm:text-sm md:text-base font-black shadow-[0_4px_16px_rgba(197,155,39,0.35)] hover:bg-white hover:text-[#8C650A] hover:border-gold active:scale-95 transition-all cursor-pointer group whitespace-nowrap"
              >
                <span className="text-white group-hover:text-[#8C650A] transition-colors drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] group-hover:drop-shadow-none">اطلب خدمة الإعفاء</span>
                <ArrowLeft className="w-4 h-4 text-white group-hover:text-[#8C650A] transition-all group-hover:-translate-x-1" />
              </a>
            </div>

            {/* Footer Seal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="space-y-0.5">
                <p className="text-sm sm:text-base font-black text-gold">
                  «ريفانس المالية»
                </p>
                <p className="text-xs sm:text-sm text-gray-300 font-medium">
                  «وضوح في الإجراءات، وشفافية في التعامل.»
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <img 
                  src={rifansLogo} 
                  alt="ريفانس المالية" 
                  className="h-9 sm:h-11 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HealthDisabilityWaiver;
