import React, { useEffect, useState } from 'react';
import { PageLayout } from './StaticPages';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { getSection } from '../../data/sectionsCatalog';
import {
  ServiceHero,
  ServiceItemCard,
} from './services';

interface SectionPageProps {
  sectionId: string;
}

export const SectionPage: React.FC<SectionPageProps> = ({ sectionId }) => {
  const section = getSection(sectionId);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!section || !section.heroImages?.length) return;
    const t = setInterval(
      () => setActiveSlide((p) => (p + 1) % section.heroImages.length),
      4500
    );
    return () => clearInterval(t);
  }, [section]);

  if (!section) {
    return (
      <PageLayout title="القسم غير موجود">
        <div className="p-8 text-center max-w-[600px] mx-auto font-cairo" dir="rtl">
          <p className="text-[16px] text-gray-600 dark:text-gray-400">عذراً، لم نعثر على هذا القسم.</p>
          <a
            href="#/"
            className="inline-flex items-center gap-2 mt-4 px-6 h-11 rounded-xl bg-gold text-[#180020] font-bold text-[14px]"
          >
            العودة للرئيسية
          </a>
        </div>
      </PageLayout>
    );
  }

  const next = () => setActiveSlide((p) => (p + 1) % section.heroImages.length);
  const prev = () =>
    setActiveSlide(
      (p) => (p - 1 + section.heroImages.length) % section.heroImages.length
    );

  return (
    <div className="min-h-screen bg-[#FCFBF8] dark:bg-[#08010C] text-gray-900 dark:text-gray-100 font-cairo" dir="rtl">
      {/* Main Container: 16-20px padding-inline on mobile, 24-32px padding-block */}
      <main className="max-w-[1000px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 text-right">
        {/* Small back button at top left */}
        <div className="flex justify-end mb-2.5">
          <a
            href="#/#business-fields"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 hover:bg-gold/10 hover:text-gold dark:hover:text-gold border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
          >
            <span>رجوع</span>
            <ChevronLeft size={13} className="text-gold" />
          </a>
        </div>

        {/* 2. Intro & Section Hero */}
        <ServiceHero
          kicker="مجالات أعمالنا"
          title={section.name}
          description={section.intro}
        />

        {/* Compact Hero Banner (16:9 on desktop, max-h 240px to preserve mobile viewport) */}
        {section.heroImages && section.heroImages.length > 0 && (
          <div className="relative max-w-[800px] aspect-[21/9] sm:aspect-[16/9] max-h-[220px] sm:max-h-[300px] group mt-5 sm:mt-6">
            <div className="image-wrapper w-full h-full">
              {section.heroImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={section.name}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    i === activeSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 right-4 left-4 flex items-end justify-between z-10">
                <span className="text-white text-[14px] sm:text-[16px] font-bold drop-shadow">
                  {section.name}
                </span>
                <div className="flex gap-1">
                  {section.heroImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSlide(i)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        i === activeSlide ? 'w-5 bg-gold' : 'w-2 bg-white/50'
                      }`}
                      aria-label={`شريحة ${i + 1}`}
                    />
                  ))}
                </div>
              </div>

              {section.heroImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute top-1/2 right-2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer z-10"
                    aria-label="السابق"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={next}
                    className="absolute top-1/2 left-2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer z-10"
                    aria-label="التالي"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 3. Section Products / Services */}
        {/* End of intro -> Next section: 28px to 36px (mt-7 sm:mt-9) */}
        <div className="mt-7 sm:mt-9">
          {/* Section header: "الخدمات المتاحة في هذا القسم" 16px */}
          <div className="border-b border-gray-200/80 dark:border-white/10 pb-3 mb-1">
            <h2 className="text-[16px] sm:text-xl md:text-2xl font-bold leading-[1.375] text-[#2A0E32] dark:text-white m-0">
              الخدمات المتاحة في هذا القسم
            </h2>
          </div>

          {/* Unified Compact Service Items List: 24px vertical padding per item, hairline divider */}
          <div>
            {section.products.map((p) => (
              <ServiceItemCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.shortDesc}
                ctaText="الانتقال للخدمة وتفاصيلها"
                onSelect={() => {
                  window.location.hash = `#/product/${p.id}`;
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SectionPage;
