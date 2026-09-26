import React, { useState, useEffect, useCallback } from 'react';
import { Section, SectionHeader, Button } from './Shared';
import { Building2, Scale, Home, BarChart3, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import bankingImg from '../../assets/srv-banking.png.asset.json';
import legalImg from '../../assets/srv-legal.png.asset.json';
import realestateImg from '../../assets/srv-realestate.png.asset.json';
import creditImg from '../../assets/srv-credit.png.asset.json';

const Services: React.FC = () => {
  const { t, direction } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const services = [
    {
      id: 'consulting',
      name: 'الاستشارات المالية',
      desc: 'استشارات مالية وائتمانية متخصصة، تحسين السجل الائتماني، دراسة الملاءة المالية، وإعادة هيكلة الالتزامات لتحقيق الاستقرار المالي.',
      icon: <BarChart3 className="text-gold" size={24} />,
      link: '#/category/consulting',
      image: creditImg.url,
    },
    {
      id: 'banking',
      name: 'الخدمات المصرفية',
      desc: 'حلول مصرفية متكاملة تشمل جدولة التمويل، تسوية المديونيات، طلبات الإعفاء، وتنشيط الحسابات وإدارتها بكفاءة عالية.',
      icon: <Building2 className="text-gold" size={24} />,
      link: '#/category/banking',
      image: bankingImg.url,
    },
    {
      id: 'realestate',
      name: 'الحلول العقارية',
      desc: 'خدمات عقارية شاملة تشمل الوساطة، إدارة الأملاك، التقييم العقاري المعتمد، توثيق العقود وحل النزاعات الإيجارية.',
      icon: <Home className="text-gold" size={24} />,
      link: '#/category/realestate',
      image: realestateImg.url,
    },
    {
      id: 'legal',
      name: 'الخدمات القانونية',
      desc: 'تمثيل قانوني ودعم متخصص في القضايا المصرفية، رفع إيقاف الخدمات، معالجة الحجوزات البنكية، وصياغة الشكاوى واللوائح الاعتراضية.',
      icon: <Scale className="text-gold" size={24} />,
      link: '#/category/legal',
      image: legalImg.url,
    },
  ];

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % services.length);
  }, [services.length]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + services.length) % services.length);
  }, [services.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  return (
    <Section id="services" className="relative !px-0 !max-w-none mb-12">
      <div className="px-4 md:px-8">
        <SectionHeader 
          title={t('why_title')} 
          subtitle={t('why_subtitle')}
        />
      </div>
      
      <div className="max-w-[520px] mx-auto overflow-hidden">
        <div 
          className="relative w-full aspect-[4/3] overflow-hidden shadow-2xl group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slides Container */}
          <div 
            className="flex h-full w-full transition-transform duration-1000 cubic-bezier(0.4, 0, 0.2, 1)"
            style={{ transform: `translateX(${direction === 'rtl' ? activeIndex * 100 : -activeIndex * 100}%)` }}
          >
            {services.map((service, i) => (
              <a
                key={service.id}
                href={service.link}
                className="min-w-full h-full relative block cursor-pointer"
                aria-label={service.name}
              >
                {/* Background Image */}
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[5000ms] ease-linear"
                  style={{ transform: activeIndex === i ? 'scale(1.1)' : 'scale(1)' }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand via-brand/70 to-transparent opacity-90 transition-opacity duration-500"></div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <div className={`transform transition-all duration-700 ${activeIndex === i ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="mb-3">
                      <h3 className="text-base md:text-lg font-bold text-white drop-shadow-sm tracking-tight m-0">
                        {service.name}
                      </h3>
                    </div>
                    <p className="text-sm md:text-base leading-7 md:leading-8 text-gray-200 opacity-90 max-w-[500px] mb-6">
                      {service.desc}
                    </p>
                    <div className="mt-4 pt-2">
                      <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-black/30 hover:bg-black/50 border border-white/50 hover:border-gold backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.35)] transition-all duration-300 group-hover:scale-105">
                        <span>انقر للاطلاع على الخدمات</span>
                        {direction === 'rtl' ? <ArrowLeft size={16} className="text-gold group-hover:-translate-x-1 transition-transform" /> : <ArrowRight size={16} className="text-gold group-hover:translate-x-1 transition-transform" />}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-gold hover:text-brand z-20"
        >
          {direction === 'rtl' ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
        <button 
          onClick={nextSlide}
          className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-gold hover:text-brand z-20"
        >
          {direction === 'rtl' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
        </button>

        {/* Progress Bar Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {services.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className="group relative h-1.5 transition-all duration-500 rounded-full overflow-hidden bg-white/20"
              style={{ width: activeIndex === i ? '40px' : '12px' }}
            >
              <div 
                className={`h-full bg-gold transition-all duration-[5000ms] ease-linear ${activeIndex === i && !isPaused ? 'w-full' : 'w-0'}`}
              />
            </button>
          ))}
        </div>
        </div>
      </div>
    </Section>
  );
};

export default Services;

