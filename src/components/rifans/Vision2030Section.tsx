import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';
import pillar1Img from '../../assets/vision2030/pillar-1-strategic-alignment.jpeg';
import pillar2Img from '../../assets/vision2030/pillar-2-national-goals.jpeg';
import pillar3Img from '../../assets/vision2030/pillar-3-fintech-digitization.jpeg';
import pillar4Img from '../../assets/vision2030/pillar-4-competitiveness-innovation.jpeg';
import pillar5Img from '../../assets/vision2030/pillar-5-economic-impact.jpeg';

export interface VisionPillar {
  id: string;
  num: string;
  title: string;
  image: string;
  shortSummary: string;
  fullContent: string[];
  keyPoints: string[];
}

const PILLARS_DATA: VisionPillar[] = [
  {
    id: 'strategic-alignment',
    num: '01',
    title: 'التوافق الاستراتيجي',
    image: pillar1Img,
    shortSummary: 'مواكبة خدمات وتوجهات ريفانس المالية مع مستهدفات رؤية 2030 وبرنامج تطوير القطاع المالي.',
    fullContent: [
      'تركز ريفانس المالية على مواءمة خدماتها وتوجهاتها مع مستهدفات رؤية المملكة 2030 وبرنامج تطوير القطاع المالي، من خلال دعم التمكين المالي، وتحسين الوصول إلى الخدمات المالية، وتطوير الحلول الرقمية، ورفع كفاءة تجربة المستفيد.'
    ],
    keyPoints: [
      'دعم وتمكين الأفراد ماليًا',
      'تحسين الوصول إلى الخدمات المالية المتخصصة',
      'تطوير الحلول الرقمية ورفع كفاءة تجربة المستفيد'
    ]
  },
  {
    id: 'national-goals',
    num: '02',
    title: 'دعم الأهداف الوطنية',
    image: pillar2Img,
    shortSummary: 'تعزيز الفائدة الشاملة وتقديم حلول مصرفية تخصصية للأفراد لمواجهة التحديات المالية.',
    fullContent: [
      'تركز ريفانس المالية على مفهوم «الفائدة الشاملة» من خلال تقديم خدمات مالية ومصرفية متخصصة للأفراد، وبالأخص للفئات التي تواجه تحديات مالية أو مصرفية، بما يساعد على تحسين قدرتهم على التعامل مع التزاماتهم المالية والوصول إلى الحلول المناسبة.',
      'وتشمل خدماتها تقديم ومتابعة طلبات إعادة جدولة الالتزامات المالية، ومتابعة طلبات الإعفاء للحالات التي تعاني من عجز صحي مثبت بموجب تقارير رسمية وفق الضوابط ذات العلاقة، إضافة إلى الاستشارات المالية والحلول التي تساعد الأفراد على تحسين إدارة التزاماتهم وملاءتهم المالية.'
    ],
    keyPoints: [
      'ترسيخ مفهوم «الفائدة الشاملة» المجتمعية',
      'متابعة طلبات إعادة جدولة الالتزامات التمويلية',
      'معالجة طلبات الإعفاء بسبب العجز الصحي بضوابط رسمية'
    ]
  },
  {
    id: 'fintech-digitization',
    num: '03',
    title: 'الرقمنة والتقنية المالية',
    image: pillar3Img,
    shortSummary: 'اعتماد التقنية والمنصات الرقمية المبتكرة لأتمتة المعاملات وتسريع معالجة الطلبات.',
    fullContent: [
      'تعتمد ريفانس المالية على التقنية كعنصر جوهري في نموذج عملها، من خلال تطوير منصات رقمية تتيح تقديم الخدمات بصورة أكثر سهولة وتنظيمًا، وأتمتة النماذج والطلبات والإجراءات، وتطوير حلول رقمية تقلل الإجراءات اليدوية وتسرّع معالجة الطلبات.',
      'كما تستهدف توظيف البيانات والتحليلات والتكاملات التقنية ذات العلاقة لتطوير الخدمات وتحسين تجربة المستفيد ورفع مستوى الكفاءة والشفافية.'
    ],
    keyPoints: [
      'أتمتة النماذج والطلبات وتقليص التدخل اليدوي',
      'توظيف البيانات والتحليلات الذكية لرفع الشفافية',
      'تسريع معالجة الإجراءات وتكامل المنصات الرقمية'
    ]
  },
  {
    id: 'competitiveness-innovation',
    num: '04',
    title: 'التنافسية والابتكار',
    image: pillar4Img,
    shortSummary: 'ابتكار خدمات مالية نوعية تستجيب لاحتياجات الأفراد مع أعلى معايير الجودة وإدارة المخاطر.',
    fullContent: [
      'تسعى ريفانس المالية إلى تعزيز تنافسيتها من خلال تطوير خدمات مالية متخصصة وحلول مبتكرة تستجيب لاحتياجات الأفراد، مع التركيز على جودة التشغيل وإدارة المخاطر والالتزام بالمعايير والضوابط ذات العلاقة.',
      'ويشمل ذلك تصميم نماذج أعمال وحلول جديدة، وتطوير تجربة مستخدم احترافية، وتوظيف البيانات والتحليلات لدعم اتخاذ القرار، والاستفادة من التقنيات الحديثة والتحليلات المتقدمة حيثما كان ذلك مناسبًا ومتوافقًا مع المتطلبات التنظيمية.'
    ],
    keyPoints: [
      'تصميم نماذج أعمال متطورة وحلول ائتمانية جديدة',
      'الالتزام الصارم بمعايير الجودة وإدارة المخاطر',
      'توظيف التحليلات المتقدمة لدعم اتخاذ القرارات المالية'
    ]
  },
  {
    id: 'economic-impact',
    num: '05',
    title: 'الأثر في التنمية الاقتصادية',
    image: pillar5Img,
    shortSummary: 'تعزيز الاستقرار المالي والشمول المستدام وتوسيع نطاق الوصول للخدمات التمويلية.',
    fullContent: [
      'تستهدف ريفانس المالية الإسهام في تعزيز الاستقرار المالي للأفراد، ودعم الشمول المالي، وتحسين قدرة المستفيدين على إدارة التزاماتهم، وتوسيع نطاق الوصول إلى الخدمات المالية.',
      'كما تسعى إلى دعم التحول الرقمي وتحسين تجربة المستفيد، بما يسهم في تطوير نموذج أكثر سهولة ووضوحًا وكفاءة في تقديم الخدمات المالية للأفراد.'
    ],
    keyPoints: [
      'دعم الشمول المالي والاستقرار الاقتصادي للأفراد',
      'تحسين الملاءة المالية وإدارة الالتزامات الائتمانية',
      'بناء نموذج مصرفي مستدام أكثر وضوحًا وكفاءة'
    ]
  },
];

export const Vision2030Section: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPillarIndex, setSelectedPillarIndex] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const modalScrollRef = useRef<HTMLDivElement>(null);

  // Drag state for desktop mouse scrolling & interaction tracking
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const isInteractingRef = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedPillar = selectedPillarIndex !== null ? PILLARS_DATA[selectedPillarIndex] : null;

  const markInteraction = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 4500);
  }, []);

  // Smooth snap to specific card index purely horizontally without moving page/window
  const scrollToCard = useCallback((index: number, smooth: boolean = true) => {
    const cardEl = cardRefs.current[index];
    const container = carouselRef.current;
    if (!cardEl || !container) return;

    const containerWidth = container.clientWidth;
    const cardLeft = cardEl.offsetLeft;
    const cardWidth = cardEl.offsetWidth;
    const targetScroll = cardLeft - (containerWidth - cardWidth) / 2;

    container.scrollTo({
      left: targetScroll,
      behavior: smooth ? 'smooth' : 'auto',
    });
    setActiveIndex(index);
  }, []);

  // Update active indicator purely based on internal horizontal scroll
  const handleScroll = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(containerCenter - cardCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  // Manual scroll to specific card index
  const scrollToIndex = (index: number) => {
    markInteraction();
    scrollToCard(index, true);
  };

  // Calm Automatic Horizontal Slider Progression purely within container
  useEffect(() => {
    if (selectedPillar !== null) return; // Pause auto-play when details modal is open

    const interval = setInterval(() => {
      if (isInteractingRef.current || isMouseDownRef.current) return; // Pause on interaction or drag
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % PILLARS_DATA.length;
        scrollToCard(nextIndex, true);
        return nextIndex;
      });
    }, 5500);

    return () => clearInterval(interval);
  }, [selectedPillar, scrollToCard]);

  // Lock background scroll and handle Escape key for Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPillarIndex(null);
      }
    };
    if (selectedPillar !== null) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedPillar]);

  // Clean up interaction timer
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // Scroll modal content to top whenever selected pillar changes
  const changePillar = (newIndex: number) => {
    setSelectedPillarIndex(newIndex);
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTop = 0;
    }
  };

  // Mouse Drag to Scroll (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = carouselRef.current;
    if (!container) return;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
    markInteraction();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const container = carouselRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      if (hasDraggedRef.current) {
        const container = carouselRef.current;
        if (container) {
          const containerCenter = container.scrollLeft + container.clientWidth / 2;
          let closestIndex = 0;
          let minDistance = Infinity;
          cardRefs.current.forEach((el, idx) => {
            if (!el) return;
            const cardCenter = el.offsetLeft + el.offsetWidth / 2;
            const distance = Math.abs(containerCenter - cardCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = idx;
            }
          });
          scrollToCard(closestIndex, true);
        }
      }
    }
  };

  const handleCardClick = (idx: number) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    changePillar(idx);
  };

  return (
    <section 
      id="vision-2030" 
      dir="rtl" 
      className="pt-6 sm:pt-8 md:pt-10 pb-6 sm:pb-8 relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F6F3EB] to-[#FAF8F5] dark:from-[#0B0B0E] dark:via-[#111114] dark:to-[#0B0B0E] text-gray-900 dark:text-white border-y border-[#c5a059]/20 scroll-mt-[80px] transition-colors duration-300 font-['Cairo']"
    >
      {/* Decorative luxury architectural background elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#c5a059]/5 dark:bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      {/* Top subtle golden edge accent */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#c5a059]/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Header grouping with sleek short vertical gold accent */}
        <div className="max-w-4xl mx-auto text-right mb-4 sm:mb-5">
          <div className="flex items-start gap-3 sm:gap-3.5 mb-2.5 sm:mb-3">
            <span 
              className="w-[2.5px] sm:w-[3px] h-10 sm:h-13 md:h-15 bg-gradient-to-b from-[#e0c282] via-[#c5a059] to-[#9c7832] rounded-full shrink-0 mt-1" 
              aria-hidden="true" 
            />
            <div className="space-y-0.5 sm:space-y-1">
              <h2 className="text-[16px] sm:text-2xl md:text-3xl font-black text-[#2A0E32] dark:text-[#c084fc] leading-[1.375] tracking-tight m-0">
                ريفانس المالية ودورها في دعم
              </h2>
              <div className="text-[14px] sm:text-xl md:text-2xl font-bold text-[#B99A55] dark:text-[#d8b570] leading-[1.375] tracking-tight">
                رؤية المملكة 2030 وبرنامج تطوير القطاع المالي
              </div>
            </div>
          </div>

          {/* Institutional Preface */}
          <p className="text-[13px] sm:text-sm md:text-[15px] text-gray-700 dark:text-gray-300 leading-[1.625] font-medium text-right pr-4 sm:pr-4.5 max-w-3xl m-0">
            انطلاقاً من التوجّهات الوطنية الطموحة لرؤية المملكة 2030 ومستهدفات برنامج تطوير القطاع المالي، تلتزم ريفانس المالية بالمساهمة الفاعلة في بناء قطاع مالي مزدهر ومستدام، يدعم الشمول المالي، ويعزز الابتكار والرقمنة، ويسهم في تحسين جودة حياة الأفراد واستقرارهم المالي والائتماني عبر خمسة محاور استراتيجية متكاملة.
          </p>
        </div>

        {/* Horizontal Slider */}
        <div 
          className="relative w-full"
          onMouseEnter={() => { isInteractingRef.current = true; }}
          onMouseLeave={() => { 
            if (!isMouseDownRef.current) markInteraction(); 
          }}
        >
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onTouchStart={() => markInteraction()}
            onTouchEnd={() => markInteraction()}
            className="flex items-center gap-2.5 sm:gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar select-none cursor-grab active:cursor-grabbing px-[3vw] sm:px-[8vw] md:px-[12vw] lg:px-[14vw] py-0"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
              overflowAnchor: 'none',
            }}
          >
            {PILLARS_DATA.map((pillar, idx) => {
              const isActive = idx === activeIndex;

              return (
                <div
                  key={pillar.id}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  onClick={() => handleCardClick(idx)}
                  role="button"
                  tabIndex={0}
                  aria-label={pillar.title}
                  className={`slide snap-center shrink-0 w-[93vw] sm:w-[640px] md:w-[800px] lg:w-[940px] max-w-[1080px] aspect-[1280/742] relative select-none cursor-pointer transition-transform duration-500 ease-out focus:outline-none ${
                    isActive 
                      ? 'scale-100 opacity-100 z-10' 
                      : 'scale-[0.98] opacity-85 hover:opacity-100 z-0'
                  }`}
                >
                  <div className="image-wrapper w-full h-full">
                    <img 
                      src={pillar.image} 
                      alt={pillar.title} 
                      width={1280}
                      height={742}
                      className="select-none pointer-events-none"
                      loading={idx < 2 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </div>

                  {/* Action CTA: زر «المزيد» داخل الصورة */}
                  <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(idx);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl bg-black/45 hover:bg-black/65 text-[#DEBF83] hover:text-white border border-[#DEBF83]/50 hover:border-[#DEBF83] backdrop-blur-md text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                      aria-label={`المزيد عن ${pillar.title}`}
                    >
                      <span>المزيد</span>
                      <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Indicators */}
        <div className="flex items-center justify-center gap-2 mt-[16px] sm:mt-[18px]">
          {PILLARS_DATA.map((p, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => scrollToIndex(idx)}
                aria-label={`الانتقال إلى ${p.title}`}
                className={`transition-all duration-300 rounded-full focus:outline-none cursor-pointer ${
                  isActive 
                    ? 'w-7 sm:w-8 h-2 bg-gradient-to-r from-[#e0c282] via-[#B99A55] to-[#9c7832] shadow-xs' 
                    : 'w-2 h-2 bg-gray-300 dark:bg-white/20 hover:bg-[#B99A55]/40'
                }`}
              />
            );
          })}
        </div>

      </div>

      {/* 
        Redesigned Pillar Details Modal / Bottom Sheet:
        - Mobile: Bottom Sheet (max-h-[90dvh], rounded-t-3xl, w-full, overflow-y-auto)
        - Desktop: Centered Modal (max-w-xl / max-w-2xl, rounded-2xl)
        - Sticky circular close button in top-left (dark purple semi-transparent with white X)
        - Seamless visual flow: 16:9 Image -> Eyebrow -> Title -> Summary -> Targets list -> Details -> Prev/Next Navigation
        - No bulky cards or white nested boxes
      */}
      <AnimatePresence>
        {selectedPillar !== null && selectedPillarIndex !== null && (
          <div 
            className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedPillarIndex(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-xl md:max-w-2xl bg-[#FBFAF8] dark:bg-[#121015] border-t sm:border border-[#B99A55]/30 rounded-t-[26px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[85vh] text-right text-gray-900 dark:text-white relative"
            >
              {/* Sticky Close Button in Top-Left (outside image area interference, stays visible) */}
              <button
                type="button"
                onClick={() => setSelectedPillarIndex(null)}
                aria-label="إغلاق النافذة"
                className="absolute top-3 left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2A0E32]/75 hover:bg-[#2A0E32] text-white backdrop-blur-md flex items-center justify-center transition-transform active:scale-90 z-30 shadow-md border border-white/20 cursor-pointer"
              >
                <X size={15} strokeWidth={2.4} />
              </button>

              {/* Scrollable Container */}
              <div 
                ref={modalScrollRef} 
                className="overflow-y-auto w-full overscroll-contain no-scrollbar divide-y divide-gray-100 dark:divide-white/5"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* 16:9 Pillar Image at Top */}
                <div className="relative w-full aspect-[1280/742] shrink-0 select-none p-4 pb-0 bg-transparent">
                  <div className="image-wrapper w-full h-full">
                    <img 
                      src={selectedPillar.image} 
                      alt={selectedPillar.title} 
                      width={1280}
                      height={742}
                      className="select-none pointer-events-none" 
                    />
                  </div>
                </div>

                {/* Content Body: Hierarchical, lightweight, free from bulky cards */}
                <div className="px-5 sm:px-7 py-4 sm:py-5 space-y-4">
                  
                  {/* Header: Small Eyebrow + Deep Royal Purple Title */}
                  <div>
                    <span className="block text-[11px] sm:text-xs font-semibold text-[#B99A55] tracking-wide mb-1">
                      رؤية المملكة 2030 وبرنامج تطوير القطاع المالي
                    </span>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-[#2A0E32] dark:text-[#e9d5ff] leading-snug">
                      {selectedPillar.title}
                    </h3>
                  </div>

                  {/* Concise Pillar Summary */}
                  <p className="text-[13px] sm:text-[14px] text-gray-700 dark:text-gray-200 leading-[1.75] font-normal">
                    {selectedPillar.shortSummary}
                  </p>

                  {/* Strategic Targets Subsection */}
                  <div className="pt-1">
                    <h4 className="text-xs sm:text-[13px] font-bold text-[#B99A55] mb-2.5 flex items-center gap-1.5">
                      <span>أبرز مستهدفات هذا المحور</span>
                    </h4>
                    
                    {/* Compact targets list without giant boxes */}
                    <div className="space-y-1.5 bg-white/70 dark:bg-white/[0.02] border border-[#B99A55]/15 rounded-xl p-3 sm:p-3.5">
                      {selectedPillar.keyPoints.map((point, ptIdx) => (
                        <div 
                          key={ptIdx}
                          className={`flex items-start gap-2 text-xs sm:text-[13px] text-gray-800 dark:text-gray-200 leading-relaxed ${
                            ptIdx > 0 ? 'pt-1.5 border-t border-gray-100 dark:border-white/5' : ''
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full bg-[#B99A55]/15 text-[#B99A55] flex items-center justify-center shrink-0 mt-0.5">
                            <Check size={11} strokeWidth={2.8} />
                          </span>
                          <span className="font-medium">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detailed Official Pillar Description (Clean text without heavy nested cards) */}
                  {selectedPillar.fullContent && selectedPillar.fullContent.length > 0 && (
                    <div className="pt-2 space-y-2 border-t border-gray-100 dark:border-white/5">
                      <h4 className="text-xs sm:text-[13px] font-bold text-[#B99A55]">
                        تفاصيل ودور ريفانس في المحور
                      </h4>
                      {selectedPillar.fullContent.map((paragraph, pIdx) => (
                        <p 
                          key={pIdx} 
                          className="text-gray-600 dark:text-gray-300 text-[12.5px] sm:text-[13.5px] leading-[1.8] font-normal"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Simple Prev / Next Footer Navigation across the 5 Pillars */}
                  <div className="pt-4 mt-2 border-t border-gray-200 dark:border-white/10 flex items-center justify-between text-xs font-bold select-none">
                    <button
                      type="button"
                      onClick={() => {
                        const prevIdx = (selectedPillarIndex - 1 + PILLARS_DATA.length) % PILLARS_DATA.length;
                        changePillar(prevIdx);
                      }}
                      className="inline-flex items-center gap-1 text-[#2A0E32] dark:text-[#DEBF83] hover:text-[#B99A55] transition-colors py-1.5 px-2 rounded-md hover:bg-[#B99A55]/10 cursor-pointer"
                    >
                      <ArrowRight size={14} />
                      <span>المحور السابق</span>
                    </button>

                    <span className="text-[11px] text-gray-400 font-normal">
                      {selectedPillarIndex + 1} من {PILLARS_DATA.length}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const nextIdx = (selectedPillarIndex + 1) % PILLARS_DATA.length;
                        changePillar(nextIdx);
                      }}
                      className="inline-flex items-center gap-1 text-[#2A0E32] dark:text-[#DEBF83] hover:text-[#B99A55] transition-colors py-1.5 px-2 rounded-md hover:bg-[#B99A55]/10 cursor-pointer"
                    >
                      <span>المحور التالي</span>
                      <ArrowLeft size={14} />
                    </button>
                  </div>

                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Vision2030Section;
