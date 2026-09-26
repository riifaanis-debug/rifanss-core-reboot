import React from 'react';
import { PageLayout } from './StaticPages';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import bankingImg from '../../assets/srv-banking.png.asset.json';
import legalImg from '../../assets/srv-legal.png.asset.json';
import realestateImg from '../../assets/srv-realestate.png.asset.json';
import creditImg from '../../assets/srv-credit.png.asset.json';
import {
  ServiceHero,
  ServiceItemCard,
} from './services';

interface ServiceItem {
  name: string;
  desc: string;
}

interface CategoryDef {
  id: string;
  name: string;
  image: string;
  intro: string;
  services: ServiceItem[];
}

export const SERVICE_CATEGORIES: CategoryDef[] = [
  {
    id: 'consulting',
    name: 'الاستشارات المالية',
    image: creditImg.url,
    intro:
      'في ريفانس المالية نقدم منظومة استشارات وحلول مالية وائتمانية متخصصة تهدف إلى تحسين السجل الائتماني للعملاء، دراسة الملاءة المالية، وإعادة هيكلة الالتزامات بما يحقق الاستقرار المالي المستدام.',
    services: [
      { name: 'تقديم الاستشارات المالية المتخصصة', desc: 'تقديم المشورة المهنية في المجالات المالية والتمويلية المختلفة وإعادة تنظيم وإدارة الالتزامات.' },
      { name: 'تحسين السجل الائتماني وتحديث سمة', desc: 'تقديم وإعداد الخطط والإجراءات الهادفة إلى تصحيح وتحسين الوضع الائتماني وتحديث البيانات لدى سمة بعد التسوية.' },
      { name: 'دراسة الملاءة المالية والتخطيط المالي', desc: 'تقييم القدرة المالية الحالية والمستقبلية ودراسة الالتزامات القائمة واقتراح الحلول المناسبة لتنظيمها.' },
      { name: 'إعداد الدراسات والتوصيات الائتمانية', desc: 'تحليل البيانات والقوائم المالية وإعداد التوصيات المهنية الداعمة لقرارات التمويل وإدارة السيولة.' },
      { name: 'استخراج خطابات إخلاء الطرف وعدم المديونية', desc: 'متابعة واستخراج خطابات إخلاء الطرف الرسمية وعدم المديونية من البنوك والشركات التمويلية.' },
      { name: 'تحليل الالتزامات المالية وإعادة الهيكلة', desc: 'دراسة وتحليل عبء الديون الشهري وتقديم خطط إعادة الهيكلة لتخفيض الأقساط وتحسين التدفقات النقدية.' },
    ],
  },
  {
    id: 'banking',
    name: 'الخدمات المصرفية',
    image: bankingImg.url,
    intro:
      'نقدم في ريفانس المالية حلولاً ومصرفية متكاملة تهدف إلى تسهيل التعاملات البنكية ومعالجة الالتزامات المالية والتعثرات وتحقيق التوازن المالي وفق ضوابط البنك المركزي السعودي.',
    services: [
      { name: 'تقديم طلب إعادة جدولة المنتجات التمويلية', desc: 'دراسة ومتابعة وتقديم طلبات إعادة جدولة المنتجات التمويلية لدى الجهات المصرفية بما يتناسب مع قدرات العميل المالية.' },
      { name: 'تقديم طلب الإعفاء بسبب الوفاة أو العجز الطبي', desc: 'دراسة ومتابعة وتقديم طلبات الإعفاء من المنتجات التمويلية لدى الجهات المصرفية وفق السياسات والتعليمات النظامية المعتمدة.' },
      { name: 'تقديم طلب إتاحة النسبة النظامية', desc: 'تقديم ومتابعة طلبات إتاحة النسبة النظامية من المبالغ المحجوزة وفق الأنظمة والتعليمات ذات العلاقة.' },
      { name: 'تقديم طلب إتاحة المبالغ المستثناة من الحجز', desc: 'تقديم ومتابعة الطلبات الخاصة بالمبالغ المستثناة نظاماً من إجراءات الحجز والتنفيذ.' },
      { name: 'تقديم طلب شراء ونقل المديونية', desc: 'تقديم ومتابعة إجراءات نقل وشراء المديونية، وإصدار خطاب عدم ممانعة بين الجهات التمويلية.' },
      { name: 'تقديم طلب تنشيط الحسابات البنكية', desc: 'تقديم ومتابعة طلب تنشيط الحساب (مجمد، راكد، غير مطالب به) في حال وجود قرار 46 ومنع تعامل، وإعادة تفعيل الحسابات وفق الضوابط.' },
      { name: 'تقديم طلب تسوية المديونيات والمنتجات التمويلية المتعثرة', desc: 'تقديم ومتابعة طلبات التسوية والتفاوض مع الجهات المصرفية وإيجاد الحلول المناسبة لمعالجة التعثرات المالية.' },
      { name: 'سداد المديونيات وتعزيز التوازن المالي', desc: 'تقديم ومتابعة وإعداد الحلول المالية المناسبة لخفض الالتزامات وتحسين إدارة التدفقات النقدية.' },
    ],
  },
  {
    id: 'realestate',
    name: 'الحلول العقارية',
    image: realestateImg.url,
    intro:
      'نقدم في ريفانس المالية حلولاً عقارية شاملة تغطي خدمات الوساطة والتسويق، إدارة الأملاك، التقييم العقاري المعتمد، توثيق العقود وحل النزاعات الإيجارية بما يحقق أعلى قيمة للأصول.',
    services: [
      { name: 'تقديم خدمات الوساطة والتسويق العقاري', desc: 'تسويق العقارات وإدارة عمليات البيع والشراء والتأجير باحترافية تامة.' },
      { name: 'تقديم خدمات إدارة الأملاك والمرافق', desc: 'الإشراف المباشر على العقارات وإدارة العقود والصيانة والتشغيل بكفاءة عالية.' },
      { name: 'توثيق عقود الإيجار عبر منصة إيجار', desc: 'إعداد وتوثيق العقود الإيجارية السكنية والتجارية إلكترونياً وفق المتطلبات النظامية.' },
      { name: 'إنهاء عقود الإيجار النظامية في حالات النزاع', desc: 'إدارة الإجراءات النظامية والقانونية لإنهاء وفسخ عقود الإيجار المتنازع عليها.' },
      { name: 'تقديم خدمات التقييم العقاري المعتمد', desc: 'إعداد تقارير التقييم العقاري وفق المعايير المهنية المعتمدة من الهيئة السعودية للمقيمين المعتمدين.' },
      { name: 'معالجة الاعتراضات على التقييم العقاري', desc: 'مراجعة التقييمات العقارية وإعداد الاعتراضات المدعومة بالدراسات والمبررات الفنية.' },
      { name: 'تحديث وتوثيق بيانات السجل العقاري', desc: 'متابعة تحديث الصكوك والبيانات العقارية ونقل الملكيات وتوثيق التغييرات لدى السجل العقاري.' },
      { name: 'تقديم طلبات الإفراج عن العقارات المحجوزة', desc: 'متابعة ومعالجة إجراءات رفع الحجز والإفراج عن العقارات الخاضعة للتنفيذ لدى الجهات المختصة.' },
    ],
  },
  {
    id: 'legal',
    name: 'الخدمات القانونية',
    image: legalImg.url,
    intro:
      'في ريفانس المالية نوفر دعماً وتمثيلاً قانونياً متخصصاً في القضايا المالية والمصرفية والتنفيذية، بما يضمن حماية الحقوق، رفع إيقاف الخدمات، وفك الحجوزات وفق الأنظمة القضائية المعتمدة.',
    services: [
      { name: 'تقديم شكوى على المؤسسات المالية (ساما تهتم)', desc: 'إعداد ومتابعة الشكاوى لدى إدارة حماية العملاء بالبنك المركزي والمتعلقة بالخدمات والمنتجات المالية والتمويلية.' },
      { name: 'رفع الدعاوى أمام لجان المنازعات المصرفية والتمويلية', desc: 'صياغة اللوائح والتمثيل والمتابعة أمام لجان الفصل في المنازعات والمخالفات المصرفية والتمويلية.' },
      { name: 'تقديم طلب رفع إيقاف الخدمات', desc: 'دراسة الحالة النظامية ومتابعة الإجراءات اللازمة لرفع إيقاف الخدمات الحكومية بشكل نهائي.' },
      { name: 'تقديم طلب رفع الحجز عن الحسابات البنكية', desc: 'إعداد ومتابعة الطلبات النظامية المتعلقة برفع إجراءات الحجز أو تقييد الحسابات البنكية.' },
      { name: 'تقديم طلب تحويل المبالغ المحجوزة', desc: 'تقديم ومتابعة إجراءات تحويل المبالغ المحجوزة وفق الأحكام والقرارات التنفيذية الصادرة.' },
      { name: 'تقديم لوائح الاعتراض على قرارات الجهات التمويلية', desc: 'صياغة المذكرات واللوائح القانونية للاعتراض على القرارات الصادرة وحماية الحقوق النظامية.' },
      { name: 'المعالجة النظامية لتجاوزات شركات التحصيل', desc: 'اتخاذ الإجراءات القانونية ضد الممارسات المخالفة لتعليمات البنك المركزي في تحصيل المديونيات.' },
    ],
  },
];

export const getCategory = (id: string) => {
  // Support aliases
  const mappedId = id === 'credit' || id === 'tax' || id === 'consult' ? 'consulting'
    : id === 'judicial' ? 'legal'
    : id;
  return SERVICE_CATEGORIES.find((c) => c.id === mappedId) || SERVICE_CATEGORIES.find((c) => c.id === id);
};

interface Props {
  categoryId: string;
}

export const ServiceCategoryPage: React.FC<Props> = ({ categoryId }) => {
  const cat = getCategory(categoryId);

  if (!cat) {
    return (
      <PageLayout title="الخدمة غير موجودة">
        <div className="p-8 text-center max-w-[600px] mx-auto font-cairo">
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

  return (
    <div className="min-h-screen bg-[#FCFBF8] dark:bg-[#08010C] text-gray-900 dark:text-gray-100 font-cairo" dir="rtl">
      <main className="max-w-[1200px] mx-auto px-5 sm:px-6 md:px-8 py-5 sm:py-7 md:py-10 pb-24 sm:pb-28 text-right space-y-8 sm:space-y-12">
        {/* Small back button at top left */}
        <div className="flex justify-end mb-2">
          <a
            href="#/services"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 hover:bg-gold/10 hover:text-gold dark:hover:text-gold border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
          >
            <span>رجوع</span>
            <ChevronLeft size={13} className="text-gold" />
          </a>
        </div>

        {/* Hero Section */}
        <div className="space-y-6">
          <ServiceHero
            kicker="دليل الخدمات"
            title={cat.name}
            description={cat.intro}
          />

          {/* Clean 16:9 Banner Image */}
          <div className="relative max-w-[700px] aspect-[16/9]">
            <div className="image-wrapper w-full h-full">
              <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-4 right-4 text-white text-[18px] sm:text-[20px] font-bold drop-shadow z-10">
                {cat.name}
              </span>
            </div>
          </div>
        </div>

        {/* Services List Section */}
        <div>
          <div className="border-b border-gray-200/80 dark:border-white/10 pb-3 mb-4">
            <h2 className="text-[23px] sm:text-[24px] md:text-[28px] font-bold text-[#180020] dark:text-white m-0">
              الخدمات المتاحة في هذا القسم
            </h2>
          </div>

          <div className="divide-y divide-gray-200/80 dark:divide-white/10">
            {cat.services.map((s, i) => (
              <ServiceItemCard
                key={i}
                id={`cat-service-${i}`}
                name={s.name}
                description={s.desc}
                ctaText="تقديم طلب لهذه الخدمة"
                onSelect={() => {
                  window.location.hash = '#/request';
                }}
                className="py-5 sm:py-6 px-3 sm:px-4 !bg-transparent !border-0 !rounded-none hover:!bg-black/[0.02] dark:hover:!bg-white/[0.02]"
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA Button */}
        <div className="pt-6 border-t border-gray-200/80 dark:border-white/10 flex justify-start">
          <a
            href="#/request"
            className="w-full sm:w-auto h-[54px] px-8 rounded-xl bg-gold hover:bg-[#D8B979] text-[#180020] font-black text-[15px] sm:text-[16px] inline-flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <span>تقديم طلب إلكتروني عام</span>
            <ArrowLeft size={16} />
          </a>
        </div>
      </main>
    </div>
  );
};

export default ServiceCategoryPage;
