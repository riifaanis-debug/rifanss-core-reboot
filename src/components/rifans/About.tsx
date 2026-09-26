import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Eye, 
  ShieldCheck, 
  Compass
} from 'lucide-react';

interface CorporateCardData {
  id: string;
  title: string;
  text: string;
  icon: React.ElementType;
  visualTheme: 'target' | 'vision' | 'message' | 'mission';
}

const CARDS_DATA: CorporateCardData[] = [
  {
    id: 'goal',
    title: 'هدفنا',
    text: 'إحداث فرق ملموس في حياة عملائنا من خلال تقديم حلول مالية واقعية ومبتكرة تعزّز قدرتهم على الوفاء بالتزاماتهم وتحقيق تطلعاتهم، وتحويل التحديات المالية إلى فرص للنمو وبناء مستقبل مالي مستدام.',
    icon: Target,
    visualTheme: 'target',
  },
  {
    id: 'vision',
    title: 'رؤيتنا',
    text: 'أن نصبح العلامة التجارية الأبرز في مجال الحلول التمويلية والاستشارات المالية في المملكة العربية السعودية، وأن نكون الخيار الأول للحلول المالية المتكاملة التي تعكس الاحترافية والابتكار والموثوقية.',
    icon: Eye,
    visualTheme: 'vision',
  },
  {
    id: 'message',
    title: 'رسالتنا',
    text: 'تمكين الأفراد من مواجهة تحدياتهم المالية بثقة، من خلال خدمات متخصصة قائمة على الخبرة والمعرفة بالأنظمة واللوائح المصرفية، وتمثيل صوت العميل أمام الجهات التمويلية والرقابية.',
    icon: ShieldCheck,
    visualTheme: 'message',
  },
  {
    id: 'mission',
    title: 'مهمتنا',
    text: 'توفير حلول تمويلية مبتكرة لكل عميل، وتقديم خدمات قانونية ومالية احترافية في مجالات الإعفاء، وإعادة الجدولة، ومعالجة الديون المتعثرة، مع أعلى معايير الشفافية والمتابعة والتواصل.',
    icon: Compass,
    visualTheme: 'mission',
  },
];

export const About: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentCard = CARDS_DATA[activeIndex];

  const pauseTemporarily = useCallback(() => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 5000);
  }, []);

  const selectTab = useCallback((idx: number) => {
    setActiveIndex(idx);
    pauseTemporarily();
  }, [pauseTemporarily]);

  // Calm auto-rotation every 6s unless paused
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % CARDS_DATA.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const IconComponent = currentCard.icon;

  return (
    <section 
      id="about" 
      className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 pt-2 sm:pt-4 pb-8 sm:pb-12 relative overflow-hidden bg-transparent scroll-mt-[90px]" 
      dir="rtl"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#c5a059]/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div 
        className="w-full relative z-10 max-w-4xl mx-auto"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/*
          Primary Royal Purple Card:
          - Starts content ~28-32px from the top on mobile (pt-7 sm:pt-8 md:pt-9)
          - Height is auto with balanced, content-fitted min-height to prevent vertical layout shift
          - No arrows, no progress bar, no decorative vertical dividers next to text
        */}
        <div className="relative w-full rounded-[22px] sm:rounded-[26px] md:rounded-[28px] overflow-hidden bg-gradient-to-br from-[#1c0024] via-[#24002f] to-[#120019] border border-[#DEBF83]/25 shadow-[0_12px_36px_rgba(0,0,0,0.22)]">
          
          {/* Subtle Authentic Background Vector Motifs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            <AnimatePresence mode="wait">
              <motion.div
                key={`bg-${currentCard.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-0 w-full h-full"
              >
                {currentCard.visualTheme === 'target' && (
                  <>
                    <div className="absolute -left-12 -bottom-12 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full border border-[#DEBF83]/[0.08]" />
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 sm:w-[380px] sm:h-[380px] md:w-[460px] md:h-[460px] rounded-full border border-[#DEBF83]/[0.04]" />
                    <div className="absolute -left-4 -bottom-4 w-40 h-40 sm:w-56 sm:h-56 rounded-full border border-[#DEBF83]/[0.10]" />
                  </>
                )}

                {currentCard.visualTheme === 'vision' && (
                  <>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(222,191,131,0.08),transparent_65%)]" />
                    <div className="absolute -left-10 top-0 w-72 h-72 rounded-full bg-[#DEBF83]/[0.04] blur-[80px]" />
                    <div className="absolute -top-20 left-1/4 w-32 h-[500px] bg-gradient-to-b from-[#DEBF83]/[0.06] via-transparent to-transparent rotate-45" />
                  </>
                )}

                {currentCard.visualTheme === 'message' && (
                  <>
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-60 h-60 sm:w-80 sm:h-80 border-2 border-dashed border-[#DEBF83]/[0.08] rounded-3xl rotate-12" />
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 border border-[#DEBF83]/[0.10] rounded-3xl -rotate-6" />
                  </>
                )}

                {currentCard.visualTheme === 'mission' && (
                  <>
                    <div className="absolute -left-10 -top-10 w-72 h-72 sm:w-96 sm:h-96 rounded-full border border-[#DEBF83]/[0.08]" />
                    <div className="absolute left-1/4 -bottom-16 w-64 h-64 bg-[#DEBF83]/[0.04] blur-[90px] rounded-full" />
                    <div className="absolute left-6 bottom-6 flex gap-2 opacity-15">
                      <div className="w-1.5 h-8 bg-[#DEBF83] rounded-full" />
                      <div className="w-1.5 h-14 bg-[#DEBF83] rounded-full" />
                      <div className="w-1.5 h-6 bg-[#DEBF83] rounded-full" />
                    </div>
                  </>
                )}

                {/* Faint Watermark Icon on the bottom-left corner for visual depth */}
                <div className="absolute -left-3 -bottom-3 opacity-[0.05] text-[#DEBF83] select-none">
                  <IconComponent size={210} strokeWidth={1} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/*
            Card Content Area:
            - pt-[26px] sm:pt-[28px] md:pt-[30px]: starts naturally from top (26-30px) without empty space
            - pb-[20px] sm:pb-[22px] md:pb-[24px]: compact, balanced bottom margin without dead space
            - min-height tailored to longest text to prevent any jump/shift across tabs
            - Smooth pure fade transition without horizontal shifting or page jumping
          */}
          <div className="relative z-10 w-full px-5 sm:px-8 md:px-10 pt-[26px] sm:pt-[28px] md:pt-[30px] pb-[20px] sm:pb-[22px] md:pb-[24px] min-h-[170px] sm:min-h-[155px] md:min-h-[148px] flex flex-col justify-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCard.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="w-full text-right"
              >
                {/* Golden Title in top-right of card */}
                <h3 className="text-[17px] sm:text-xl md:text-2xl font-black text-[#DEBF83] tracking-tight leading-snug">
                  {currentCard.title}
                </h3>

                {/* Exact Text in White with 14-16px gap beneath title, comfortable line-height and max-width */}
                <p className="mt-[14px] sm:mt-[15px] text-[13px] sm:text-base md:text-[17px] leading-[1.8] sm:leading-[1.85] text-white/95 font-medium max-w-3xl whitespace-pre-line text-right">
                  {currentCard.text}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/*
          Navigation Tabs:
          - Sole and primary navigation mechanism for the section
          - Connected smoothly to card with reduced gap (mt-2 sm:mt-2.5)
          - Equal width, single line on mobile (grid-cols-4)
          - Active: calm golden background with dark purple text
          - Inactive: subtle light/transparent background with distinct purple/gold text
        */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 mt-2 sm:mt-2.5 w-full">
          {CARDS_DATA.map((card, idx) => {
            const isActive = activeIndex === idx;

            return (
              <button
                key={`tab-${card.id}`}
                type="button"
                onClick={() => selectTab(idx)}
                aria-selected={isActive}
                role="tab"
                aria-label={card.title}
                className={`py-1 sm:py-1.5 px-1 sm:px-3 min-h-[30px] sm:min-h-[34px] rounded-lg sm:rounded-xl text-[11.5px] sm:text-[13px] font-bold leading-none transition-all duration-200 cursor-pointer select-none text-center focus:outline-none flex items-center justify-center ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e0c282] via-[#DEBF83] to-[#cba358] text-[#1a0024] shadow-[0_2px_8px_rgba(222,191,131,0.3)] scale-[1.01]'
                    : 'bg-white/80 dark:bg-white/[0.06] text-[#24002F] dark:text-[#DEBF83]/80 hover:bg-[#DEBF83]/15 hover:text-[#1a0024] dark:hover:text-white border border-[#DEBF83]/20'
                }`}
              >
                <span>{card.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;
