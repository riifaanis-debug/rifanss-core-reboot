import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Search, 
  X, 
  Scale, 
  Clock, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle, 
  Sparkles,
  ArrowLeft,
  FileCheck,
  CheckCircle2
} from 'lucide-react';
import { Section, SectionHeader, Card } from './Shared';
import { FAQItem } from '../../types';
import { navigateTo } from '../../utils/scrollManager';

interface ExtendedFAQItem extends FAQItem {
  id: string;
  categoryKey: 'regulations' | 'procedures' | 'solutions' | 'security';
  categoryLabel: string;
  badge: string;
}

const CATEGORIES = [
  { key: 'all', label: 'جميع المعلومات', icon: Sparkles },
  { key: 'regulations', label: 'الأنظمة والموثوقية', icon: Scale },
  { key: 'procedures', label: 'إجراءات ومدة الطلب', icon: Clock },
  { key: 'solutions', label: 'الحلول والرفض السابق', icon: RefreshCw },
  { key: 'security', label: 'الأمان والخصوصية', icon: ShieldCheck },
] as const;

const faqData: ExtendedFAQItem[] = [
  {
    id: 'faq-1',
    categoryKey: 'regulations',
    categoryLabel: 'الأنظمة والموثوقية',
    badge: 'أنظمة ساما (SAMA)',
    question: 'ما هي المرجعية النظامية التي تستند إليها حلول ريفانس المالية؟',
    answer: 'تعتمد كافة حلولنا واستشاراتنا على اللوائح التنفيذية للبنك المركزي السعودي (SAMA)، وضوابط حماية العملاء، والأنظمة الائتمانية والتمويلية المعتمدة في المملكة العربية السعودية. يضمن ذلك أن كل مسار تفاوضي أو تسوية نقترحها أو ننفذها لصالح العميل هو إجراء نظامي وقانوني 100% ويحفظ كامل حقوقه أمام الجهات التمويلية.'
  },
  {
    id: 'faq-2',
    categoryKey: 'solutions',
    categoryLabel: 'الحلول والرفض السابق',
    badge: 'معالجة التمويل',
    question: 'كيف يتم التعامل مع الحالات التي تم رفضها سابقاً من الجهات التمويلية؟',
    answer: 'الرفض المبدئي من البنوك أو شركات التمويل غالباً ما يكون نتيجة لنقص في المستندات الداعمة، أو عدم وضوح المبررات الائتمانية، أو خلل في صياغة الطلب. دورنا يكمن في التشخيص الدقيق لسبب الرفض، وإعادة هندسة الملف الائتماني، وتدعيمه بالأسانيد النظامية والتقارير المالية اللازمة، ثم إعادة رفعه بمستوى مهني واحترافي يفرض على الجهة المعنية إعادة دراسته بجدية.'
  },
  {
    id: 'faq-3',
    categoryKey: 'procedures',
    categoryLabel: 'إجراءات ومدة الطلب',
    badge: 'سرعة الإنجاز',
    question: 'كم تستغرق مدة دراسة الطلب والبدء في الإجراءات؟',
    answer: 'تبدأ المراجعة والتقييم الأولي لبياناتك خلال 24 ساعة من استلام المستندات المطلوبة، حيث يتواصل معك المستشار المالي لتوضيح خطة العمل ومسار التنفيذ المتوقع. تختلف المدة الإجمالية لإنهاء المعاملة بحسب نوع الخدمة (إعفاء، إعادة جدولة، حلول تمويلية) والإجراءات لدى الجهة التمويلية، مع التزامنا بإرسال تحديثات دورية وتوفير تتبع مباشر عبر لوحة تحكمك.'
  },
  {
    id: 'faq-4',
    categoryKey: 'security',
    categoryLabel: 'الأمان والخصوصية',
    badge: 'سرية تامة',
    question: 'كيف تضمنون أمن البيانات وسرية المعلومات المالية والائتمانية؟',
    answer: 'نطبق أعلى بروتوكولات الأمان السيبراني والتشفير الإلكتروني (SSL 256-bit). بياناتك الشخصية، ومستنداتك، وتقاريرك الائتمانية تُعامل بسرية مصرفية صارمة ولا يتم الاطلاع عليها إلا من قِبل الفريق الاستشاري المباشر لحالتك. كما نلتزم باتفاقيات سرية موثقة تمنع مشاركة أو تداول أي معلومة مع أي أطراف غير مصرح لها.'
  },
  {
    id: 'faq-5',
    categoryKey: 'regulations',
    categoryLabel: 'الأنظمة والموثوقية',
    badge: 'قيمة مضافة',
    question: 'ما القيمة المضافة لخدمات ريفانس مقارنة بالتوجه المباشر للبنك؟',
    answer: 'يمتلك مستشارونا خبرة معمقة بالسياسات الائتمانية واللوائح المصرفية، مما يمكننا من صياغة طلبك بلغة يفهمها صناع القرار في إدارات المخاطر والتحصيل. نتفادى الثغرات التي تؤدي للرفض، ونبرز أحقيتك واستحقاقك النظامي للإعفاء أو الجدولة، ونوفر عليك أسابيع من التردد والمراجعات الفردية دون نتيجة.'
  },
  {
    id: 'faq-6',
    categoryKey: 'procedures',
    categoryLabel: 'إجراءات ومدة الطلب',
    badge: 'لوحة التحكم',
    question: 'كيف يمكنني متابعة سير طلبي والتواصل مع المستشار المسؤول؟',
    answer: 'توفر منصة ريفانس المالية لوحة تحكم رقمية خاصة بكل عميل تتيح متابعة حالة الطلب لحظة بلحظة (قيد المراجعة، جاري العمل، بانتظار الرد، مكتمل). كما يمكنك التواصل المباشر مع المستشار عبر نافذة المحادثة الفورية بالمنصة، أو عبر الواتساب الرسمي وقنوات الاتصال المعتمدة.'
  },
  {
    id: 'faq-7',
    categoryKey: 'procedures',
    categoryLabel: 'إجراءات ومدة الطلب',
    badge: 'المستندات المطلوبة',
    question: 'ما هي المتطلبات والمستندات الأساسية للبدء في معالجة الطلب؟',
    answer: 'المستندات الأساسية تختلف حسب الخدمة، وعادة ما تشمل: صورة الهوية الوطنية، كشف حساب بنكي لآخر 3 أشهر، تعريف حديث بالراتب أو الدخل، وتقرير سمة الائتماني إذا كان متوفراً. عند تقديم الطلب عبر المنصة، يوضح لك النظام الحقول والمرفقات المطلوبة خطوة بخطوة بكل سلاسة.'
  },
  {
    id: 'faq-8',
    categoryKey: 'solutions',
    categoryLabel: 'الحلول والرفض السابق',
    badge: 'شفافية العقود',
    question: 'هل يتم توثيق الاتفاق وتوضيح التكاليف والرسوم مسبقاً؟',
    answer: 'نعم بالتأكيد؛ الشفافية ركيزة أساسية في تعاملاتنا. يتم اطلاع العميل على تفاصيل ونطاق الخدمة وجميع التكاليف المقررة بشكل واضح ومكتوب قبل البدء الفعلي بأي إجراء، ولا نتقاضى أي رسوم مبهمة أو غير متفق عليها مسبقاً.'
  }
];

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openItemId, setOpenItemId] = useState<string | null>('faq-1');

  // Filter questions based on active category and live search query
  const filteredFaqs = useMemo(() => {
    return faqData.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.categoryKey === activeCategory;
      const normalizedQuery = searchQuery.trim().toLowerCase();
      const matchesSearch = !normalizedQuery || 
        item.question.toLowerCase().includes(normalizedQuery) ||
        item.answer.toLowerCase().includes(normalizedQuery) ||
        item.badge.toLowerCase().includes(normalizedQuery) ||
        item.categoryLabel.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenItemId(prev => prev === id ? null : id);
  };

  return (
    <Section id="faq" className="pb-8 sm:pb-12">
      <Card className="relative overflow-hidden border-gold/40">
        
        {/* Subtle Decorative Ambient Lighting */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <SectionHeader 
          title="معلومات تهمك حول خدماتنا" 
          subtitle="إجابات وافية وموثوقة على أكثر التساؤلات شيوعاً حول الخدمات والحلول المالية، الأنظمة المصرفية، وطرق المتابعة."
          subtitleClassName="!text-[12px] sm:!text-[14px] md:!text-[15px] font-medium !text-gray-600 dark:!text-gray-300 !leading-relaxed mt-1"
        />

        {/* Top Controls: Search Bar & Categories */}
        <div className="mt-4 mb-6 space-y-4 relative z-10">
          
          {/* Live Search Input */}
          <div className="relative w-full max-w-xl">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gold">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في الأسئلة والمعلومات (مثال: ساما، مدة الطلب، الرفض، الأمان)..."
              className="w-full pr-10 pl-10 py-2.5 sm:py-3 bg-white dark:bg-[#190326] border border-gold/30 dark:border-gold/25 rounded-xl text-xs sm:text-sm text-brand dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gold transition-colors"
                title="مسح البحث"
                aria-label="مسح البحث"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.key;
              const count = cat.key === 'all' 
                ? faqData.length 
                : faqData.filter(i => i.categoryKey === cat.key).length;

              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C7A969] to-[#dfc285] text-[#180224] border-[#C7A969] shadow-[0_2px_10px_rgba(199,169,105,0.25)]'
                      : 'bg-white/80 dark:bg-[#190326]/80 text-gray-600 dark:text-gray-300 border-gold/20 hover:border-gold/50 hover:text-brand dark:hover:text-white'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#180224]' : 'text-gold'} />
                  <span>{cat.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-[#180224]/15 text-[#180224]' : 'bg-gold/10 text-gold'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Counter if search is active */}
        {searchQuery && (
          <div className="mb-4 text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>
              نتائج البحث عن: <span className="font-bold text-gold">"{searchQuery}"</span>
            </span>
            <span>{filteredFaqs.length} نتيجة</span>
          </div>
        )}

        {/* Accordion Questions List */}
        {filteredFaqs.length > 0 ? (
          <div className="flex flex-col gap-3 relative z-10">
            {filteredFaqs.map((item, idx) => {
              const isOpen = openItemId === item.id;
              const formattedIndex = String(idx + 1).padStart(2, '0');

              return (
                <div 
                  key={item.id} 
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? 'border-gold/70 bg-gradient-to-br from-white via-white to-gold/5 dark:from-[#1c0329] dark:via-[#1c0329] dark:to-gold/10 shadow-[0_4px_20px_rgba(199,169,105,0.12)]' 
                      : 'border-gold/25 bg-white/90 dark:bg-[#190326]/90 hover:border-gold/50 hover:shadow-sm'
                  }`}
                >
                  {/* Header / Question Button */}
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-expanded={isOpen}
                    className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4 text-right select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      {/* Number Badge */}
                      <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                        isOpen 
                          ? 'bg-gradient-to-tr from-[#C7A969] to-[#dfc285] text-[#180224] shadow-sm' 
                          : 'bg-gold/10 text-gold dark:bg-gold/15'
                      }`}>
                        {formattedIndex}
                      </span>

                      {/* Question Title */}
                      <div className="text-right">
                        <h3 className={`text-sm sm:text-base md:text-lg font-bold transition-colors leading-snug ${
                          isOpen ? 'text-brand dark:text-gold' : 'text-brand dark:text-gray-100'
                        }`}>
                          {item.question}
                        </h3>
                      </div>
                    </div>

                    {/* Toggle Icon */}
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
                      isOpen 
                        ? 'bg-[#C7A969] text-[#180224] rotate-180 shadow-sm' 
                        : 'bg-gold/10 text-gold hover:bg-gold hover:text-white'
                    }`}>
                      {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                    </div>
                  </button>

                  {/* Smooth Collapsible Answer Body */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 pt-1 sm:px-6 sm:pb-6 text-[13px] sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gold/15 dark:border-gold/20 font-medium">
                          <p className="whitespace-pre-line pt-2">
                            {item.answer}
                          </p>

                          {/* Reassuring note */}
                          <div className="mt-3.5 pt-3 border-t border-dashed border-gold/20 flex items-center gap-2 text-[11px] sm:text-xs text-gold font-semibold">
                            <CheckCircle2 size={14} className="shrink-0" />
                            <span>فريق ريفانس المالية مرخص ومختص بتقديم الاستشارات وحلول الإعفاء والجدولة نظامياً.</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-gold/30 bg-white/50 dark:bg-[#190326]/50">
            <HelpCircle size={36} className="mx-auto text-gold/60 mb-3" />
            <h4 className="text-sm sm:text-base font-bold text-brand dark:text-gray-200 mb-1">
              لم نعثر على نتائج مطابقة لبحثك
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
              يمكنك تجربة كلمات بحث أخرى أو مسح البحث لعرض كافة الأسئلة الشائعة.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-[#180224] text-xs font-bold hover:bg-gold-light transition-colors"
            >
              عرض جميع الأسئلة والمعلومات
            </button>
          </div>
        )}

      </Card>
    </Section>
  );
};

export default FAQ;