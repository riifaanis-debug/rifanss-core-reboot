import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSubServiceById } from '../../data/businessFieldsData';
import { navigateTo } from '../../utils/scrollManager';

import card1 from '../../assets/most-requested/card-1.jpeg';
import card2 from '../../assets/most-requested/card-2.jpeg';
import card3 from '../../assets/most-requested/card-3.jpeg';
import card4 from '../../assets/most-requested/card-4.jpeg';
import card5 from '../../assets/most-requested/card-5.jpeg';
import card6 from '../../assets/most-requested/card-6.jpeg';
import card7 from '../../assets/most-requested/card-7.jpeg';

export interface MostRequestedCard {
  id: string;
  image: string;
  title: string;
  serviceId: string;
  route: string;
}

const MOST_REQUESTED_CARDS: MostRequestedCard[] = [
  {
    id: 'card-1',
    image: card1,
    title: 'تقديم طلب إتاحة النسبة النظامية من المبالغ المستثناة من الحجز',
    serviceId: 'statutory-ratio-request',
    route: '#/service-apply/statutory-ratio-request',
  },
  {
    id: 'card-2',
    image: card2,
    title: 'تحويل المديونية وسداد الالتزامات المالية',
    serviceId: 'debt-clearance',
    route: '#/service-apply/debt-clearance',
  },
  {
    id: 'card-3',
    image: card3,
    title: 'تقديم دعوى لدى لجان الفصل في المنازعات والمخالفات المصرفية والتمويلية',
    serviceId: 'banking-disputes',
    route: '#/service-apply/banking-disputes',
  },
  {
    id: 'card-4',
    image: card4,
    title: 'تقديم طلب الإعفاء من المنتجات التمويلية',
    serviceId: 'waiver-request',
    route: '#/service-apply/waiver-request',
  },
  {
    id: 'card-5',
    image: card5,
    title: 'تقديم شكوى على المؤسسات المالية عبر بوابة ساما تهتم',
    serviceId: 'banking-disputes',
    route: '#/service-apply/banking-disputes',
  },
  {
    id: 'card-6',
    image: card6,
    title: 'التقييم العقاري المعتمد',
    serviceId: 'certified-valuation',
    route: '#/service-apply/certified-valuation',
  },
  {
    id: 'card-7',
    image: card7,
    title: 'تقديم طلب إعادة جدولة المنتجات التمويلية',
    serviceId: 'rescheduling-request',
    route: '#/service-apply/rescheduling-request',
  },
];

export const MostRequestedServices: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Drag & interaction refs
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const isInteractingRef = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth snap to specific card index
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

  // Update active card on scroll based on center position
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

  // Pause interaction and schedule resume
  const markInteraction = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }
    resumeTimerRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 4500);
  }, []);

  // Gentle, calm auto-sliding
  useEffect(() => {
    const interval = setInterval(() => {
      if (isInteractingRef.current || isMouseDownRef.current) return;
      setActiveIndex((prev) => {
        const next = (prev + 1) % MOST_REQUESTED_CARDS.length;
        scrollToCard(next, true);
        return next;
      });
    }, 4500);

    return () => {
      clearInterval(interval);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [scrollToCard]);

  // Handle mouse drag
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
    const walk = (x - startXRef.current) * 1.3;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (isMouseDownRef.current) {
      isMouseDownRef.current = false;
      // Snap to nearest card after drag release
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

  const handleCardClick = (card: MostRequestedCard) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    if (card.serviceId === 'waiver-request') {
      window.dispatchEvent(
        new CustomEvent('open-waive-form', {
          detail: { notes: `طلب خدمة: ${card.title}` },
        })
      );
      return;
    }

    const found = getSubServiceById(card.serviceId);
    if (found) {
      window.dispatchEvent(
        new CustomEvent('open-service-form', {
          detail: {
            serviceId: found.subService.id,
            fieldId: found.field.id,
            prefill: {
              notes: `طلب خدمة: ${found.subService.name}`,
            },
          },
        })
      );
    } else {
      navigateTo(card.route);
    }
  };

  return (
    <section 
      id="most-requested-services" 
      dir="rtl" 
      className="relative pt-6 sm:pt-9 pb-[24px] sm:pb-[28px] h-auto text-gray-900 dark:text-white scroll-mt-[80px] overflow-hidden"
    >
      {/* Section Header - Enhanced Visual Identity without cards or backgrounds */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mb-1.5 sm:mb-2 relative z-10 text-right">
        {/* Eyebrow Label - Delicate & discreet without dots or decorations */}
        <div className="text-[10px] sm:text-[11px] font-semibold text-[#c5a059] dark:text-[#d8b570] tracking-wider mb-0.5 select-none pr-0.5">
          خدمات مختارة
        </div>

        {/* Title with sleek, thin, elegant vertical gold accent bar with clear spacing */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          <span 
            className="w-[2px] sm:w-[2.5px] h-4 sm:h-5 bg-gradient-to-b from-[#dfbe78] via-[#c5a059] to-[#a07c35] rounded-full shrink-0" 
            aria-hidden="true" 
          />
          <h2 className="text-[17px] sm:text-2xl md:text-3xl font-black text-[#2D083A] dark:text-[#c084fc] leading-snug tracking-tight">
            الخدمات الأكثر طلباً
          </h2>
        </div>
      </div>

      {/* 
        Horizontal Slider:
        The images themselves are 1536x512 (aspect ratio 3/1).
        Using exact aspect ratio eliminates any vertical letterboxing/empty transparent gap inside the image element.
      */}
      <div 
        className="relative w-full z-10"
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
          className="flex items-center gap-2 sm:gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar select-none cursor-grab active:cursor-grabbing px-[2.5vw] sm:px-[10vw] md:px-[14vw] lg:px-[16vw] py-0"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {MOST_REQUESTED_CARDS.map((card, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={card.id}
                ref={(el) => (cardRefs.current[idx] = el)}
                onClick={() => handleCardClick(card)}
                role="button"
                tabIndex={0}
                aria-label={card.title}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(card);
                  }
                }}
                className={`slide snap-center shrink-0 w-[95vw] sm:w-[640px] md:w-[780px] lg:w-[920px] max-w-[1080px] aspect-[1536/512] relative select-none pointer-events-auto cursor-pointer transition-transform duration-500 ease-out focus:outline-none ${
                  isActive
                    ? 'scale-100 opacity-100 z-10'
                    : 'scale-[0.98] opacity-85 hover:opacity-100 z-0'
                }`}
              >
                <div className="image-wrapper w-full h-full">
                  <img
                    src={card.image}
                    alt={card.title}
                    width={1536}
                    height={512}
                    loading={idx < 3 ? 'eager' : 'lazy'}
                    draggable={false}
                    className="select-none pointer-events-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 
        Pagination Indicator:
        Distance from bottom of images to dots is 18-20px.
        Active dot extended horizontally in gold, other dots small and neutral.
      */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-[19px] relative z-10">
        {MOST_REQUESTED_CARDS.map((card, idx) => {
          const isActive = idx === activeIndex;

          return (
            <button
              key={`dot-${card.id}`}
              type="button"
              onClick={() => {
                markInteraction();
                scrollToCard(idx, true);
              }}
              aria-label={`الانتقال إلى ${card.title}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ease-out cursor-pointer focus:outline-none ${
                isActive
                  ? 'w-6 sm:w-8 bg-gradient-to-r from-[#c5a059] to-[#d8b570] shadow-[0_0_8px_rgba(197,160,89,0.5)]'
                  : 'w-1.5 sm:w-2 bg-gray-300 dark:bg-neutral-700 hover:bg-gold/50 dark:hover:bg-gold/50'
              }`}
            />
          );
        })}
      </div>
    </section>
  );
};

export default MostRequestedServices;
