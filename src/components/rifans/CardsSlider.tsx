import React from 'react';
import { motion } from 'motion/react';
import { Target, Eye, MessageSquare, Briefcase } from 'lucide-react';

interface CardItem {
  id: string;
  title: string;
  badge: string;
  text: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const CARDS_DATA: CardItem[] = [
  {
    id: 'goal',
    title: 'هدفنا',
    badge: 'الغاية والأثر',
    text: 'هدفنا إحداث فرق ملموس في حياة عملائنا من خلال تقديم حلول مالية واقعية ومبتكرة تعزز قدرتهم على الوفاء بالتزاماتهم وتحقيق تطلعاتهم، مع تحويل التحديات المالية إلى فرص للنمو وبناء مستقبل مالي مستدام.',
    icon: Target,
  },
  {
    id: 'vision',
    title: 'رؤيتنا',
    badge: 'الريادة والمستقبل',
    text: 'أن نصبح العلامة التجارية الأبرز في مجال الحلول التمويلية والاستشارات المالية في المملكة العربية السعودية، وأن نكون الخيار الأول لكل من يبحث عن حلول مالية متكاملة تعكس الاحترافية والابتكار والموثوقية. ونساهم في بناء مجتمع مالي أكثر وعيًا وكفاءة.',
    icon: Eye,
  },
  {
    id: 'message',
    title: 'رسالتنا',
    badge: 'الثقة والتمكين',
    text: 'رسالتنا تمكين الأفراد من مواجهة تحدياتهم المالية بثقة، من خلال خدمات متخصصة قائمة على الخبرة والمعرفة العميقة بالأنظمة واللوائح المصرفية، مع تمثيل صوت العميل أمام الجهات التمويلية والرقابية بما يضمن حقوقه ويزيد فرص حصوله على الحلول المناسبة.',
    icon: MessageSquare,
  },
  {
    id: 'mission',
    title: 'مهمتنا',
    badge: 'الحلول والاحترافية',
    text: 'تكمن مهمتنا في توفير حلول تمويلية مبتكرة لكل عميل بشكل فردي، وتقديم خدمات قانونية ومالية احترافية في مجالات الإعفاء، وإعادة الجدولة، ومعالجة الديون المتعثرة، مع ضمان أعلى معايير الشفافية وبناء جسور ثقة عبر المتابعة المستمرة والتواصل الفعّال.',
    icon: Briefcase,
  },
];

const CardsSlider: React.FC = () => {
  // Duplicate for continuous seamless infinite loop
  const duplicatedCards = [...CARDS_DATA, ...CARDS_DATA];

  return (
    <section className="w-full max-w-[520px] mx-auto px-2 py-3 sm:py-4 overflow-hidden" aria-label="سلايدر البطاقات">
      {/* Shared SVG Gradients Defs */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <linearGradient id="card-gold-frame" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C99B39" />
            <stop offset="15%" stopColor="#F9EAA2" />
            <stop offset="35%" stopColor="#B38125" />
            <stop offset="55%" stopColor="#FDEEB3" />
            <stop offset="75%" stopColor="#D2A645" />
            <stop offset="100%" stopColor="#8C5C12" />
          </linearGradient>

          <linearGradient id="card-gold-dash" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C59A3D" />
            <stop offset="50%" stopColor="#FCEBB0" />
            <stop offset="100%" stopColor="#AC7A20" />
          </linearGradient>

          <linearGradient id="card-surface-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="28%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="45%" stopColor="#F9F7F2" stopOpacity="0.1" />
            <stop offset="62%" stopColor="#FFFFFF" stopOpacity="0.65" />
            <stop offset="80%" stopColor="#FAF8F3" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#F2EDE4" stopOpacity="0.35" />
          </linearGradient>
        </defs>
      </svg>

      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_3%,black_97%,transparent)]">
        <div dir="ltr" className="overflow-hidden w-full">
          <motion.div
            className="flex gap-3.5 py-2"
            style={{ width: 'max-content' }}
            animate={{ x: ['-50%', '0%'] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 28,
                ease: 'linear',
              },
            }}
          >
            {duplicatedCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={`${card.id}-${idx}`}
                  dir="rtl"
                  className="w-[295px] sm:w-[325px] md:w-[340px] h-[200px] sm:h-[210px] shrink-0 rounded-[22px] p-4 sm:p-4.5 flex flex-col justify-start select-none relative overflow-hidden shadow-[0_8px_25px_rgba(197,160,89,0.14),0_2px_10px_rgba(0,0,0,0.04)]"
                >
                  {/* Background Layer: Exact Replica of Image Design */}
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 360 220"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Pearlescent White Base */}
                    <rect x="2" y="2" width="356" height="216" rx="20" fill="#FCFBF9" />

                    {/* Diagonal Light Reflection Sheen */}
                    <rect x="2" y="2" width="356" height="216" rx="20" fill="url(#card-surface-sheen)" />

                    {/* Stylized Monogram "R" Watermark on the Right */}
                    <g opacity="0.065" fill="#240738">
                      <path d="M238 22 H324 C346 22 355 34 350 56 C346 76 330 88 306 91 L354 196 H315 L274 97 H259 V196 H238 V22 Z M259 40 V79 H302 C318 79 328 72 330 60 C332 48 324 40 307 40 H259 Z" />
                    </g>

                    {/* Metallic Gold Outer Frame */}
                    <rect
                      x="2.5"
                      y="2.5"
                      width="355"
                      height="215"
                      rx="19.5"
                      stroke="url(#card-gold-frame)"
                      strokeWidth="3.2"
                      fill="none"
                    />

                    {/* 3 Gold Accent Dash Capsules */}
                    {/* Top-Right Dash */}
                    <rect x="306" y="23" width="28" height="3.5" rx="1.75" fill="url(#card-gold-dash)" />
                    {/* Bottom-Left Dash */}
                    <rect x="23" y="193" width="26" height="3.5" rx="1.75" fill="url(#card-gold-dash)" />
                    {/* Bottom-Right Dash */}
                    <rect x="312" y="193" width="22" height="3.5" rx="1.75" fill="url(#card-gold-dash)" />
                  </svg>

                  {/* Card Content (Relative with z-index to sit on top of background) */}
                  <div className="relative z-10 flex flex-col h-full justify-start">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#c5a059]/20 to-[#c5a059]/10 border border-[#c5a059]/50 flex items-center justify-center text-[#956d20] shrink-0 shadow-sm">
                          <Icon size={16} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-[#240738] tracking-tight leading-none">
                            {card.title}
                          </h3>
                          <span className="text-xs text-[#715d40] font-bold mt-0.5 block">
                            {card.badge}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-[#956d20] bg-[#f8f0d8] px-2.5 py-0.5 rounded-full border border-[#d9b86d] shrink-0 shadow-xs">
                        ريفانس
                      </span>
                    </div>

                    {/* Text */}
                    <p className="text-xs leading-[1.7] font-semibold text-[#2D2438] text-right mt-1">
                      {card.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CardsSlider;
