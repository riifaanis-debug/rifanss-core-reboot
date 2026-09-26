import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { PageLayout } from './StaticPages';
import { getProduct, INITIAL_FEE_SAR } from '../../data/sectionsCatalog';
import { ServiceDetailLayout } from './services';

interface ProductPageProps {
  productId: string;
}

export const ProductPage: React.FC<ProductPageProps> = ({ productId }) => {
  const found = getProduct(productId);

  if (!found) {
    return (
      <PageLayout title="الخدمة غير موجودة">
        <div className="p-8 text-center max-w-[600px] mx-auto font-cairo" dir="rtl">
          <p className="text-[16px] text-gray-600 dark:text-gray-400">عذراً، لم نعثر على هذه الخدمة.</p>
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

  const { product, section } = found;

  return (
    <div className="min-h-screen bg-[#FCFBF8] dark:bg-[#08010C] text-gray-900 dark:text-gray-100 font-cairo" dir="rtl">
      <main className="max-w-[1000px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex justify-end mb-2.5">
          <a
            href={`#/section/${section.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 hover:bg-gold/10 hover:text-gold dark:hover:text-gold border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
          >
            <span>رجوع</span>
            <ChevronLeft size={13} className="text-gold" />
          </a>
        </div>
        {/* Banner image: compact aspect ratio to avoid eating mobile screen */}
        <div className="max-w-[800px] mx-auto mb-6 aspect-[21/9] sm:aspect-[16/9] max-h-[220px] sm:max-h-[300px]">
          <div className="image-wrapper w-full h-full">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Master Service Detail Layout */}
        <ServiceDetailLayout
          title={product.name}
          shortDescription={product.shortDesc}
          aboutTitle="تفاصيل الخدمة"
          aboutText={product.description}
          optionsSlot={
            <div className="p-4 rounded-xl bg-[#B99A55]/10 border border-[#B99A55]/30 flex items-center justify-between">
              <div className="text-right">
                <span className="text-[12px] text-gray-600 dark:text-gray-300 block mb-0.5">
                  رسوم فتح الملف
                </span>
                <span className="text-[14px] font-bold text-[#2A0E32] dark:text-gold">
                  دفعة مبدئية واحدة
                </span>
              </div>
              <div className="text-left font-mono">
                <span className="text-[24px] font-bold text-[#2A0E32] dark:text-gold">
                  {INITIAL_FEE_SAR}
                </span>
                <span className="text-[12px] text-gray-500 mr-1.5 font-cairo">
                  ريال سعودي
                </span>
              </div>
            </div>
          }
          benefitsTitle="أبرز مزايا الخدمة للأفراد"
          benefits={[
            'متابعة مهنية مباشرة من فريق العمل المختص.',
            'دراسة متكاملة وتدقيق المستندات وفق المعايير المعتمدة.',
            'تحديث دوري ومستمر بحالة الطلب حتى الإنجاز.',
          ]}
          requirementsTitle="المستندات والمتطلبات المقترحة"
          requirements={[
            'الهوية الوطنية سارية الصلاحية.',
            'المستندات والبيانات ذات الصلة بالطلب.',
          ]}
          timelineTitle="مراحل وإجراءات تنفيذ الطلب"
          timelineSteps={[
            'تقديم الطلب الأولي وتعبئة البيانات.',
            'مراجعة وتدقيق المستندات.',
            'متابعة الإجراءات لدى الجهة المعنية.',
            'إشعار العميل بالنتيجة والاعتماد.',
          ]}
          ctaTitle="تنفيذ الطلب"
          ctaButtonText="تقديم طلب للخدمة"
          onCtaClick={() => {
            window.location.hash = `#/product/${product.id}/apply`;
          }}
        />
      </main>
    </div>
  );
};

export default ProductPage;
