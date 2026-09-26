import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { navigateTo } from '../../utils/scrollManager';

interface BusinessFieldSlide {
  id: string;
  title: string;
  route: string;
  image: string;
}

// Exactly the 5 business fields mapped to their authentic uploaded images
const BUSINESS_FIELD_SLIDES: BusinessFieldSlide[] = [
  {
    id: 'financial',
    title: 'الخدمات المالية',
    route: '#/business-field/financial',
    image: '/business-fields/financial.jpeg?v=2',
  },
  {
    id: 'banking',
    title: 'الخدمات المصرفية',
    route: '#/business-field/banking',
    image: '/business-fields/banking.jpeg?v=2',
  },
  {
    id: 'real-estate',
    title: 'الخدمات العقارية',
    route: '#/business-field/real-estate',
    image: '/business-fields/real-estate.jpeg?v=2',
  },
  {
    id: 'legal',
    title: 'الخدمات القانونية',
    route: '#/business-field/legal',
    image: '/business-fields/legal.jpeg?v=2',
  },
  {
    id: 'electronic',
    title: 'الخدمات الإلكترونية',
    route: '#/electronic-services',
    image: '/business-fields/electronic.jpeg?v=4',
  },
];

export const BusinessFields: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Drag and interaction states (purely horizontal, zero impact on window.scrollY)
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const isInteractingRef = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Preload all 5 images for instant flicker-free rendering
  useEffect(() => {
    BUSINESS_FIELD_SLIDES.forEach((slide) => {
      const img = new window.Image();
      img.src = slide.image;
    });
  }, []);

  // Smooth snap to specific card index purely horizontally
  const scrollToCard = useCallback((index: number, smooth: boolean = true) => {
    const cardEl = cardRefs.current[index];
    const container = containerRef.current;
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

  // Interaction timer handling
  const markInteraction = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 4500);
  }, []);

  // Update active card indicator purely on horizontal scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
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

  // Autoplay progression: purely horizontal within container, zero window scroll
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInteractingRef.current || isMouseDownRef.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % BUSINESS_FIELD_SLIDES.length;
        scrollToCard(next, true);
        return next;
      });
    }, 5000);

    return () => {
      clearInterval(interval);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [scrollToCard]);

  // Clean up interaction timer
  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  // Mouse Drag to Scroll (Desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    markInteraction();
    const container = containerRef.current;
    if (!container) return;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.4;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      if (hasDraggedRef.current) {
        const container = containerRef.current;
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

  // Card click navigation
  const handleCardClick = (route: string) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    navigateTo(route);
  };

  // Chevron pagination
  const handlePrev = () => {
    markInteraction();
    const prevIdx = (activeIndex - 1 + BUSINESS_FIELD_SLIDES.length) % BUSINESS_FIELD_SLIDES.length;
    scrollToCard(prevIdx, true);
  };

  const handleNext = () => {
    markInteraction();
    const nextIdx = (activeIndex + 1) % BUSINESS_FIELD_SLIDES.length;
    scrollToCard(nextIdx, true);
  };

  return (
    <section 
      id="business-fields" 
      dir="rtl" 
      className="relative pt-4 sm:pt-6 pb-6 sm:pb-8 h-auto text-gray-900 dark:text-white scroll-mt-[80px] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-right mb-3 sm:mb-4">
          {/* Header grouping with sleek short vertical gold accent */}
          <div className="flex items-center gap-2.5 sm:gap-3 mb-1.5 sm:mb-2">
            <span 
              className="w-[2.5px] sm:w-[3px] h-6 sm:h-7 bg-gradient-to-b from-[#e0c282] via-[#c5a059] to-[#9c7832] rounded-full shrink-0" 
              aria-hidden="true" 
            />
            <h2 className="text-[17px] sm:text-2xl md:text-3xl font-black text-[#240738] dark:text-[#c084fc] leading-snug tracking-tight">
              مجالات أعمالنا
            </h2>
          </div>

          {/* Institutional Preface */}
          <p className="text-[12.5px] sm:text-sm md:text-[15px] text-gray-700 dark:text-gray-300 leading-[1.75] sm:leading-[1.8] font-medium text-right pr-3.5 sm:pr-4 max-w-3xl">
            تقدم ريفانس المالية منظومة متكاملة من الخدمات الموجهة للأفراد، تجمع بين الحلول المالية والمصرفية والعقارية والقضائية والقانونية، بما يتيح دراسة احتياجات العميل ومعالجة طلباته من خلال خدمات مترابطة وواضحة، وفق طبيعة كل حالة ومتطلباتها.
          </p>
        </div>

        {/* 
          Horizontal Slider:
          - 92-94vw on mobile with 16:9 ratio
          - Original untouched 16:9 uploaded images
          - No extra cards, no double padding, no heavy shadows
        */}
        <div 
          className="relative w-full"
          onMouseEnter={() => { isInteractingRef.current = true; }}
          onMouseLeave={() => { 
            if (!isMouseDownRef.current) markInteraction(); 
          }}
        >
          <div
            ref={containerRef}
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
            {BUSINESS_FIELD_SLIDES.map((slide, idx) => {
              const isActive = idx === activeIndex;

              return (
                <div
                  key={slide.id}
                  ref={(el) => (cardRefs.current[idx] = el)}
                  onClick={() => handleCardClick(slide.route)}
                  role="button"
                  tabIndex={0}
                  aria-label={`انتقال إلى ${slide.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(slide.route);
                    }
                  }}
                  className={`slide snap-center shrink-0 w-[93vw] sm:w-[640px] md:w-[800px] lg:w-[940px] max-w-[1080px] aspect-[1280/720] relative select-none cursor-pointer transition-all duration-300 ease-out focus:outline-none active:scale-[0.995] ${
                    isActive 
                      ? 'scale-100 opacity-100 z-10' 
                      : 'scale-[0.98] opacity-85 hover:opacity-100 z-0'
                  }`}
                >
                  <div className="image-wrapper w-full h-full">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      width={1280}
                      height={720}
                      className="select-none pointer-events-none"
                      loading={idx < 2 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 
          Single Unified Navigation Bar:
          - Prev Arrow — Slider Indicators — Next Arrow
          - Centered horizontally under the cards
          - Compact, refined circular arrows with thin gold border
        */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-[14px] sm:mt-[16px] select-none">
          {/* Previous Arrow (RTL: points to right) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="المجال السابق"
            title="المجال السابق"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#c5a059]/40 hover:border-[#c5a059] bg-[#FBFAF8] dark:bg-[#1a0024] text-[#240738] dark:text-[#DEBF83] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs cursor-pointer focus:outline-none"
          >
            <ChevronRight size={15} strokeWidth={2.2} />
          </button>

          {/* Dots Indicator: 5 exact indicators */}
          <div className="flex items-center gap-1.5" dir="rtl">
            {BUSINESS_FIELD_SLIDES.map((slide, idx) => {
              const isCurrent = idx === activeIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => {
                    markInteraction();
                    scrollToCard(idx, true);
                  }}
                  aria-label={`انتقال إلى ${slide.title}`}
                  className={`transition-all duration-300 rounded-full focus:outline-none cursor-pointer ${
                    isCurrent 
                      ? 'w-6 sm:w-7 h-1.5 sm:h-2 bg-gradient-to-r from-[#e0c282] via-[#c5a059] to-[#9c7832] shadow-xs' 
                      : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gray-300 dark:bg-white/20 hover:bg-[#c5a059]/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Next Arrow (RTL: points to left) */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="المجال التالي"
            title="المجال التالي"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#c5a059]/40 hover:border-[#c5a059] bg-[#FBFAF8] dark:bg-[#1a0024] text-[#240738] dark:text-[#DEBF83] flex items-center justify-center transition-all duration-200 active:scale-95 shadow-xs cursor-pointer focus:outline-none"
          >
            <ChevronLeft size={15} strokeWidth={2.2} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default BusinessFields;
