
import React, { useEffect } from 'react';
import { 
  ArrowRight, Phone, Mail, MapPin, Send, ShieldCheck, FileText, 
  AlertCircle, ArrowLeft, Home, Banknote, Scale, Building2, 
  Receipt, BarChart3, MessageSquare, Briefcase, ChevronLeft, RefreshCw,
  CheckCircle, Code
} from 'lucide-react';
import { Button, Card, SectionHeader } from './Shared';
import Footer from './Footer';
import Calculator from './Calculator';
import Logo from './Logo';
import { safeStringify } from '../../utils/safeJson';
import { submitRequest } from '../../lib/api';
import { supabase } from '@/integrations/supabase/client';
import { navigateTo } from '../../utils/scrollManager';

// Layout Wrapper
export const PageLayout: React.FC<{ title: string; children: React.ReactNode; backLink?: string; backText?: string }> = ({ title, children, backLink = '#/', backText = 'العودة للرئيسية' }) => {
  const handleBack = (e: React.MouseEvent) => {
    navigateTo(backLink, e);
  };

  return (
    <div className="min-h-screen bg-[#F5F4FA] dark:bg-[#06010a] flex flex-col transition-colors duration-300 w-full overflow-x-clip">
      {/* Header */}
      <div className="bg-white/85 dark:bg-black/80 backdrop-blur-md border-b border-gold/20 py-2 sm:py-2.5 px-3 sm:px-4 sticky top-0 z-50 shadow-sm w-full">
        <div className="max-w-[700px] mx-auto flex justify-between items-center">
          <button 
            onClick={handleBack}
            className="flex items-center gap-1.5 text-[11px] sm:text-[12.5px] font-bold text-brand dark:text-gold hover:text-gold transition-colors cursor-pointer"
          >
            <ArrowRight size={15} />
            <span>{backText}</span>
          </button>
          <Logo className="w-[90px] sm:w-[110px] h-auto" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-8 md:py-10 overflow-x-hidden">
        <h1 className="text-[16px] sm:text-2xl md:text-3xl font-black text-brand dark:text-white mb-3 sm:mb-6 border-r-3 sm:border-r-4 border-gold pr-2.5 sm:pr-3 tracking-tight leading-snug">
          {title}
        </h1>
        <div className="w-full space-y-3.5 sm:space-y-4 text-[13px] sm:text-base md:text-lg leading-relaxed font-medium text-gray-700 dark:text-gray-200 max-w-4xl whitespace-pre-line">
          {children}
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Main Services Directory Page
export const ServicesPage: React.FC = () => {
  const allServices = [
    { id: 'consulting', name: 'الاستشارات المالية', desc: 'استشارات مالية واستثمارية، إدارة وتخطيط الميزانية، وحلول التعثر وسجل سمة.', icon: <MessageSquare className="text-gold" size={24} /> },
    { id: 'banking', name: 'الخدمات المصرفية', desc: 'إدارة المنتجات التمويلية، إعادة جدولة القروض، نقاط البيع وتنظيم الحسابات.', icon: <Building2 className="text-gold" size={24} /> },
    { id: 'realestate', name: 'الحلول العقارية', desc: 'التمويل والرهن العقاري، التقييم المعتمد، التوثيق والإفراغ وإدارة الأملاك.', icon: <Home className="text-gold" size={24} /> },
    { id: 'legal', name: 'الخدمات القانونية', desc: 'التمثيل القضائي، معالجة ملفات التنفيذ، صياغة العقود، والامتثال الزكوي والضريبي.', icon: <Scale className="text-gold" size={24} /> },
  ];

  return (
    <PageLayout title="دليل الخدمات">
      <div className="grid grid-cols-1 gap-4">
        {allServices.map((service) => (
          <a 
            key={service.id} 
            href={`#/category/${service.id}`}
            className="group block bg-white dark:bg-[#1a0b25] p-5 rounded-[24px] border border-gold/20 shadow-sm hover:border-gold hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-extrabold text-brand dark:text-white group-hover:text-gold transition-colors">{service.name}</h3>
                <p className="text-[12px] text-muted dark:text-gray-400 mt-1">{service.desc}</p>
              </div>
              <ChevronLeft size={18} className="text-gold opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 shrink-0" />
            </div>
          </a>
        ))}
      </div>
      
      <div className="mt-8 p-6 bg-brand rounded-[24px] text-center text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-gold/5 pointer-events-none" />
         <h4 className="text-[16px] font-extrabold text-gold mb-2">تواصل معنا الآن</h4>
         <p className="text-[12px] opacity-80 mb-4 px-4">فريقنا متاح للإجابة على جميع استفساراتك المالية.</p>
         <a href="#/contact">
           <Button className="w-full h-11 bg-white text-brand hover:bg-gold transition-colors">اتصل بنا</Button>
         </a>
      </div>
    </PageLayout>
  );
};

export const Terms: React.FC = () => (
  <PageLayout title="الشروط والأحكام">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm">
      <div className="space-y-8 text-sm md:text-base leading-7 md:leading-8 text-muted dark:text-gray-300 text-right">
        <div className="p-4 bg-gold/5 border-r-4 border-gold rounded-l-lg mb-6">
          <p className="font-bold text-brand dark:text-gold">تاريخ آخر تحديث: 25 مارس 2026</p>
          <p>يرجى قراءة هذه الشروط والأحكام بعناية قبل البدء في استخدام منصة ريفانس المالية.</p>
        </div>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">1. مقدمة وقبول الشروط</h3>
          <p>
            تعد هذه الشروط والأحكام ("الاتفاقية") عقداً قانونياً ملزماً بينك ("المستخدم" أو "العميل") وبين منصة ريفانس المالية ("ريفانس"، "نحن"، "لنا"). 
            من خلال الوصول إلى موقعنا الإلكتروني أو استخدام أي من خدماتنا، فإنك تقر بأنك قد قرأت وفهمت ووافقت على الالتزام بجميع بنود هذه الاتفاقية. 
            إذا كنت لا توافق على أي جزء من هذه الشروط، فيجب عليك التوقف فوراً عن استخدام المنصة.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">2. التعريفات</h3>
          <ul className="list-disc pr-5 space-y-2">
            <li><strong>المنصة:</strong> تشمل الموقع الإلكتروني لريفانس المالية وأي تطبيقات أو خدمات رقمية تابعة لها.</li>
            <li><strong>الخدمات:</strong> تشمل الاستشارات المالية، حلول المديونيات، الوساطة التمويلية، وأي خدمات أخرى نقدمها.</li>
            <li><strong>المستخدم:</strong> أي شخص طبيعي أو اعتباري يصل إلى المنصة أو يستخدم خدماتها.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">3. الأهلية والمتطلبات</h3>
          <p>
            باستخدامك للمنصة، فإنك تقر وتضمن ما يلي:
          </p>
          <ul className="list-disc pr-5 space-y-2">
            <li>أن عمرك لا يقل عن 18 عاماً ميلادياً.</li>
            <li>أنك تتمتع بالأهلية القانونية الكاملة لإبرام العقود.</li>
            <li>أن جميع المعلومات التي تقدمها لنا صحيحة ودقيقة ومحدثة.</li>
            <li>أن استخدامك للخدمات لا ينتهك أي قوانين أو لوائح معمول بها في المملكة العربية السعودية.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">4. وصف الخدمات</h3>
          <p>
            تعمل ريفانس المالية كمنصة استشارية ووسيط مالي يقدم حلولاً للمديونيات وتسهيلات تمويلية من خلال التعاون مع جهات تمويلية مرخصة. 
            نحن لا نقدم التمويل بشكل مباشر، بل نقوم بدراسة حالة العميل وتقديم أفضل الحلول المتاحة وربطه بالجهات المناسبة. 
            تخضع جميع طلبات التمويل أو الإعفاء لموافقة الجهات المختصة والأنظمة البنكية المعمول بها.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">5. التزامات المستخدم</h3>
          <p>
            يلتزم المستخدم بما يلي:
          </p>
          <ul className="list-disc pr-5 space-y-2">
            <li>الحفاظ على سرية معلومات حسابه وبيانات الدخول الخاصة به.</li>
            <li>عدم تقديم معلومات مضللة أو وثائق مزورة للوصول إلى الخدمات.</li>
            <li>تحديث بياناته فور حدوث أي تغيير قد يؤثر على تقديم الخدمة.</li>
            <li>تحمل المسؤولية الكاملة عن جميع الأنشطة التي تتم من خلال حسابه.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">6. الأنشطة المحظورة</h3>
          <p>
            يُحظر على المستخدم القيام بما يلي:
          </p>
          <ul className="list-disc pr-5 space-y-2">
            <li>استخدام المنصة لأي غرض غير قانوني أو احتيالي.</li>
            <li>محاولة الوصول غير المصرح به إلى أنظمة المنصة أو بيانات المستخدمين الآخرين.</li>
            <li>استخدام أي برمجيات آلية (مثل الروبوتات) لجمع البيانات من المنصة.</li>
            <li>نشر أي محتوى ينتهك حقوق الملكية الفكرية أو يتضمن تشهيراً أو إساءة.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">7. الرسوم والدفع</h3>
          <p>
            قد تخضع بعض خدماتنا لرسوم استشارية أو إدارية. سيتم إبلاغ العميل بوضوح عن أي رسوم قبل البدء في تقديم الخدمة. 
            تخضع الرسوم لضريبة القيمة المضافة وفقاً للأنظمة المعمول بها في المملكة العربية السعودية. 
            في حال تقديم طلبات تمويل، قد تفرض الجهات التمويلية رسوماً إضافية خاصة بها.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">8. الملكية الفكرية</h3>
          <p>
            جميع المحتويات الموجودة على المنصة، بما في ذلك النصوص، الشعارات، الصور، البرمجيات، والتصاميم، هي ملكية حصرية لريفانس المالية ومحمية بموجب قوانين الملكية الفكرية. 
            لا يجوز نسخ أو توزيع أو استخدام أي جزء من المحتوى دون إذن كتابي مسبق منا.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">9. إخلاء المسؤولية</h3>
          <p>
            يتم تقديم الخدمات "كما هي" دون أي ضمانات صريحة أو ضمنية. نحن لا نضمن الحصول على موافقة الجهات التمويلية في جميع الحالات، حيث يعتمد ذلك على معايير الأهلية الخاصة بتلك الجهات. 
            لا تتحمل ريفانس المالية المسؤولية عن أي خسائر مباشرة أو غير مباشرة ناتجة عن استخدام المنصة أو الاعتماد على المعلومات الواردة فيها.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">10. التعويض</h3>
          <p>
            توافق على تعويض ريفانس المالية وموظفيها وشركائها عن أي مطالبات أو خسائر أو أضرار (بما في ذلك أتعاب المحاماة) ناتجة عن انتهاكك لهذه الشروط أو سوء استخدامك للخدمات.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">11. إنهاء الخدمة</h3>
          <p>
            نحتفظ بالحق في تعليق أو إنهاء وصولك إلى المنصة في أي وقت ودون إشعار مسبق، إذا رأينا أنك انتهكت هذه الشروط أو قمت بأي نشاط يضر بمصالحنا أو بمستخدمينا.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">12. القانون الواجب التطبيق</h3>
          <p>
            تخضع هذه الشروط والأحكام وتفسر وفقاً للقوانين والأنظمة المعمول بها في المملكة العربية السعودية. 
            تختص المحاكم السعودية في مدينة مكة المكرمة بالنظر في أي نزاع قد ينشأ عن هذه الاتفاقية.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">13. التعديلات على الشروط</h3>
          <p>
            نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التعديلات على هذه الصفحة وتحديث تاريخ "آخر تحديث". 
            يعتبر استمرارك في استخدام المنصة بعد نشر التعديلات قبولاً منك للشروط الجديدة.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">14. حماية البيانات والخصوصية</h3>
          <p>
            تلتزم ريفانس المالية بحماية خصوصية بياناتك الشخصية وفقاً لنظام حماية البيانات الشخصية في المملكة العربية السعودية. 
            يتم توضيح كيفية جمع واستخدام وحماية بياناتك في "سياسة الخصوصية" الخاصة بنا، والتي تعد جزءاً لا يتجزأ من هذه الشروط والأحكام. 
            باستخدامك للمنصة، فإنك توافق على ممارسات جمع ومعالجة البيانات الموضحة في سياسة الخصوصية.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">15. الروابط الخارجية</h3>
          <p>
            قد تحتوي المنصة على روابط لمواقع إلكترونية تابعة لأطراف ثالثة (مثل البنوك أو شركات التمويل). 
            هذه الروابط مقدمة لراحتك فقط، ولا تعني موافقتنا على محتوى تلك المواقع. 
            نحن لا نتحكم في تلك المواقع ولا نتحمل المسؤولية عن محتواها أو سياسات الخصوصية الخاصة بها. 
            يجب عليك مراجعة شروط وأحكام أي موقع خارجي تزوره.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">16. استقلالية البنود</h3>
          <p>
            إذا تبين أن أي بند من بنود هذه الاتفاقية غير قانوني أو غير قابل للتنفيذ بموجب أي قانون أو نظام معمول به، 
            فإن ذلك لا يؤثر على صحة ونفاذ بقية البنود الأخرى. 
            سيتم تعديل البند غير القانوني أو استبداله ببند قانوني يحقق الغرض الأصلي منه قدر الإمكان.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">17. التنازل</h3>
          <p>
            عدم ممارسة ريفانس المالية لأي حق أو بند من بنود هذه الاتفاقية لا يشكل تنازلاً عن ذلك الحق أو البند في المستقبل. 
            يجب أن يكون أي تنازل عن أي بند كتابياً وموقعاً من قبلنا ليكون ملزماً.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">18. الاتفاق الكامل</h3>
          <p>
            تشكل هذه الشروط والأحكام، جنباً إلى جنب مع سياسة الخصوصية وأي اتفاقيات أخرى يتم إبرامها معك، الاتفاق الكامل والنهائي بينك وبين ريفانس المالية فيما يتعلق باستخدام المنصة، 
            وتحل محل أي تفاهمات أو اتفاقيات سابقة، سواء كانت شفهية أو كتابية.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">19. التواصل معنا</h3>
          <p>
            إذا كان لديك أي استفسار حول هذه الشروط، يمكنك التواصل معنا عبر:
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
            <p>البريد الإلكتروني: info@rifans.net</p>
            <p>الهاتف: 8002440432</p>
            <p>العنوان: مكة المكرمة، المملكة العربية السعودية</p>
          </div>
        </section>
      </div>
    </div>
  </PageLayout>
);

export const Privacy: React.FC = () => (
  <PageLayout title="سياسة الخصوصية">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm">
      <div className="space-y-8 text-sm md:text-base leading-7 md:leading-8 text-muted dark:text-gray-300 text-right">
        <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30 mb-4">
          <ShieldCheck size={24} />
          <span className="font-bold">نلتزم بأعلى معايير حماية البيانات وفق نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/19) في المملكة العربية السعودية.</span>
        </div>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">1. مقدمة</h3>
          <p>
            تولي ريفانس المالية أهمية قصوى لخصوصية بياناتك. توضح هذه السياسة كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك الشخصية عند استخدامك لمنصتنا. باستخدامك لخدماتنا، فإنك توافق على ممارسات البيانات الموضحة في هذه السياسة.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">2. المعلومات التي نجمعها</h3>
          <p>نقوم بجمع أنواع مختلفة من المعلومات لتقديم وتحسين خدماتنا لك:</p>
          <div className="space-y-4 mt-3">
            <div>
              <h4 className="font-bold text-brand dark:text-white">أ. المعلومات التي تقدمها مباشرة:</h4>
              <ul className="list-disc pr-5 space-y-1">
                <li>المعلومات الشخصية: الاسم الكامل، رقم الهوية الوطنية أو الإقامة، تاريخ الميلاد.</li>
                <li>معلومات الاتصال: رقم الجوال، البريد الإلكتروني، العنوان الوطني.</li>
                <li>المعلومات المالية: تفاصيل الدخل، كشوفات الحسابات البنكية، تفاصيل المديونيات الحالية، السجل الائتماني (سمة).</li>
                <li>معلومات العمل: اسم جهة العمل، المسمى الوظيفي، مدة الخدمة.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-brand dark:text-white">ب. المعلومات التي نجمعها تلقائياً:</h4>
              <ul className="list-disc pr-5 space-y-1">
                <li>عنوان بروتوكول الإنترنت (IP Address).</li>
                <li>نوع المتصفح ونظام التشغيل.</li>
                <li>الصفحات التي قمت بزيارتها ومدة الزيارة.</li>
                <li>بيانات الموقع الجغرافي التقريبية.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">3. الغرض من معالجة البيانات</h3>
          <p>نستخدم بياناتك للأغراض النظامية التالية:</p>
          <ul className="list-disc pr-5 space-y-2">
            <li>التحقق من هويتك وضمان أمن حسابك.</li>
            <li>دراسة وتحليل وضعك المالي لتقديم الاستشارات وحلول المديونيات المناسبة.</li>
            <li>التواصل مع البنوك والجهات التمويلية المرخصة نيابة عنك للحصول على عروض تمويلية.</li>
            <li>إدارة طلباتك ومتابعة حالتها وتحديثك بالمستجدات.</li>
            <li>الامتثال للمتطلبات القانونية والتنظيمية الصادرة عن البنك المركزي السعودي (ساما) والجهات الأخرى.</li>
            <li>تحسين أداء المنصة وتطوير خدمات جديدة تلبي احتياجات العملاء.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">4. مشاركة البيانات والإفصاح عنها</h3>
          <p>نحن نلتزم بسرية بياناتك ولا نقوم بمشاركتها إلا في الحالات التالية:</p>
          <ul className="list-disc pr-5 space-y-2">
            <li><strong>الجهات التمويلية:</strong> مشاركة البيانات الضرورية مع البنوك وشركات التمويل المرخصة لدراسة طلبك.</li>
            <li><strong>مزودي الخدمة:</strong> التعاقد مع شركات تقنية أو استشارية تساعدنا في تشغيل المنصة (بموجب اتفاقيات سرية صارمة).</li>
            <li><strong>المتطلبات القانونية:</strong> الإفصاح عن البيانات للجهات القضائية أو الرقابية عند وجود طلب رسمي أو التزام نظامي.</li>
            <li><strong>بموافقتك:</strong> أي حالات أخرى يتم فيها الحصول على موافقتك الصريحة والمسبقة.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">5. تخزين البيانات والاحتفاظ بها</h3>
          <p>
            يتم تخزين بياناتك في خوادم آمنة داخل المملكة العربية السعودية أو في بيئات سحابية تلتزم بمعايير الأمن السيبراني الوطنية. 
            نحتفظ ببياناتك الشخصية طوال المدة اللازمة لتحقيق الأغراض الموضحة في هذه السياسة، أو وفقاً لما تقتضيه الأنظمة واللوائح المعمول بها (مثل فترات الاحتفاظ بالسجلات المالية).
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">6. أمن المعلومات</h3>
          <p>
            نطبق تدابير أمنية تقنية وإدارية متقدمة لحماية بياناتك، بما في ذلك:
          </p>
          <ul className="list-disc pr-5 space-y-2">
            <li>تشفير البيانات أثناء النقل (SSL/TLS) وأثناء التخزين.</li>
            <li>جدران حماية وأنظمة كشف التسلل.</li>
            <li>ضوابط وصول صارمة تقتصر على الموظفين المخولين فقط.</li>
            <li>إجراء فحوصات أمنية دورية للبنية التحتية للمنصة.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">7. حقوق المستخدم</h3>
          <p>بموجب نظام حماية البيانات الشخصية، يحق لك:</p>
          <ul className="list-disc pr-5 space-y-2">
            <li><strong>الحق في العلم:</strong> معرفة ماهية البيانات التي نجمعها وكيفية معالجتها.</li>
            <li><strong>الحق في الوصول:</strong> الحصول على نسخة من بياناتك الشخصية الموجودة لدينا.</li>
            <li><strong>الحق في التصحيح:</strong> طلب تحديث أو تصحيح أي بيانات غير دقيقة أو ناقصة.</li>
            <li><strong>الحق في الإتلاف:</strong> طلب حذف بياناتك عند انتهاء الغرض منها (ما لم يوجد التزام نظامي بالاحتفاظ بها).</li>
            <li><strong>الحق في سحب الموافقة:</strong> يمكنك سحب موافقتك على معالجة البيانات في أي وقت (قد يؤثر ذلك على قدرتنا على تقديم الخدمة).</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">8. ملفات تعريف الارتباط (Cookies)</h3>
          <p>
            نستخدم ملفات تعريف الارتباط لتحسين تجربة تصفحك وتحليل حركة المرور. يمكنك الرجوع إلى "سياسة ملفات تعريف الارتباط" لمزيد من التفاصيل حول كيفية إدارتها.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">9. روابط الأطراف الثالثة</h3>
          <p>
            قد تحتوي منصتنا على روابط لمواقع خارجية. نحن غير مسؤولين عن ممارسات الخصوصية أو محتوى تلك المواقع، وننصحك بقراءة سياسة الخصوصية الخاصة بكل موقع تزوره.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">10. التعديلات على السياسة</h3>
          <p>
            نحتفظ بالحق في تحديث سياسة الخصوصية هذه في أي وقت لتعكس التغييرات في ممارساتنا أو المتطلبات القانونية. سيتم نشر النسخة المحدثة على هذه الصفحة مع تحديث تاريخ السريان.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">11. التواصل معنا</h3>
          <p>
            إذا كان لديك أي استفسار أو شكوى بخصوص خصوصية بياناتك، يرجى التواصل مع مسؤول حماية البيانات لدينا عبر:
          </p>
          <div className="mt-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10">
            <p>البريد الإلكتروني: info@rifans.net</p>
            <p>العنوان: مكة المكرمة، المملكة العربية السعودية</p>
          </div>
        </section>
      </div>
    </div>
  </PageLayout>
);

export const Complaints: React.FC = () => (
  <PageLayout title="الشكاوي والاقتراحات">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm">
      <div className="space-y-4">
        <p className="text-[13px] text-muted dark:text-gray-300 leading-7">
          نحرص دائماً على رضاكم. سيتم التعامل مع طلبك بكل جدية وسرية.
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-[14px] border border-gray-100 dark:border-white/10">
            <Mail className="text-gold" size={20} />
            <div className="text-[13px] font-bold text-brand dark:text-white">info@rifans.net</div>
          </div>
        </div>
      </div>
    </div>
  </PageLayout>
);

export const Contact: React.FC = () => {
  const [formData, setFormData] = React.useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitRequest({
        type: 'contact',
        details: `${formData.subject}: ${formData.message}`,
        data: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        },
      });

      // Send email notification to admin
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            requestData: { id: Date.now().toString(), type: 'contact', details: formData.message, data: formData },
            userData: { fullName: formData.name, email: formData.email },
          },
        });
      } catch (e) { console.error(e); }

      setIsSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error(error);
      alert('حدث خطأ في الاتصال.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="اتصل بنا">
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <a href="tel:8002440432" className="bg-white dark:bg-[#1a0b25] p-5 rounded-[24px] border border-gold/20 shadow-sm flex flex-col items-center gap-2 hover:border-gold transition-all">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
              <Phone size={20} />
            </div>
            <div className="text-[13px] font-bold text-brand dark:text-white">8002440432</div>
          </a>
          <a href="mailto:info@rifans.net" className="bg-white dark:bg-[#1a0b25] p-5 rounded-[24px] border border-gold/20 shadow-sm flex flex-col items-center gap-2 hover:border-gold transition-all">
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
              <Mail size={20} />
            </div>
            <div className="text-[13px] font-bold text-brand dark:text-white">info@rifans.net</div>
          </a>
        </div>

        <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm">
          <h3 className="text-[15px] font-extrabold text-brand dark:text-gold mb-4 flex items-center gap-2">
            <Send size={18} />
            أرسل لنا رسالة
          </h3>
          
          {isSuccess ? (
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-center animate-in zoom-in duration-300">
               <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
               <p className="text-[13px] font-bold text-green-800">تم إرسال رسالتك بنجاح!</p>
               <p className="text-[11px] text-green-600 mt-1">سنتواصل معك في أقرب وقت ممكن.</p>
               <button onClick={() => setIsSuccess(false)} className="mt-4 text-[11px] font-bold text-brand underline">إرسال رسالة أخرى</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1.5">الاسم الكامل</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 rounded-[12px] border border-gold/20 text-[13px] focus:border-gold outline-none bg-gray-50 dark:bg-white/5" 
                  placeholder="أدخل اسمك"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1.5">البريد الإلكتروني</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-2.5 rounded-[12px] border border-gold/20 text-[13px] focus:border-gold outline-none bg-gray-50 dark:bg-white/5" 
                  placeholder="example@mail.com"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1.5">الموضوع</label>
                <input 
                  type="text" 
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full p-2.5 rounded-[12px] border border-gold/20 text-[13px] focus:border-gold outline-none bg-gray-50 dark:bg-white/5" 
                  placeholder="عنوان الرسالة"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-muted mb-1.5">الرسالة</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full p-2.5 rounded-[12px] border border-gold/20 text-[13px] focus:border-gold outline-none bg-gray-50 dark:bg-white/5 min-h-[100px]" 
                  placeholder="كيف يمكننا مساعدتك؟"
                ></textarea>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full h-11 bg-gold-gradient text-brand font-bold shadow-lg">
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرسالة'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export const AboutPage: React.FC = () => (
  <PageLayout title="من نحن">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-4 sm:p-6 md:p-8 border border-gold/30 shadow-sm space-y-3.5 sm:space-y-4 text-brand/90 dark:text-gray-200 text-[13px] sm:text-base md:text-lg leading-relaxed text-right font-medium">
      <div className="w-8 sm:w-12 h-1 bg-gold rounded-full mb-2" />
      <h2 className="space-y-1 sm:space-y-1.5 mb-4">
        <span className="block text-[16px] sm:text-2xl md:text-3xl font-black text-[#240738] dark:text-white leading-snug">
          | ريفانس المالية
        </span>
        <span className="block text-[14px] sm:text-lg md:text-xl font-bold text-[#c5a059] dark:text-gold leading-snug">
          | شركة حلول واستشارات مالية
        </span>
      </h2>
      <p>
        ريفانس المالية شركة سعودية ذات مسؤولية محدودة، مرخصة من قِبل البنك المركزي السعودي وخاضعة لإشراف ورقابة هيئة السوق المالية، وتعمل تحت مظلة قطاع التقنية المالية (FinTech)، بما يعكس توجهها نحو توظيف التقنية والابتكار في تطوير الخدمات والحلول المالية وتعزيز تجربة العملاء.
      </p>
      <p>
        وتُعد ريفانس المالية إحدى الجهات المتخصصة في تقديم الحلول والخدمات المالية والعقارية والاستشارية المتكاملة، حيث انطلقت برؤية طموحة تهدف إلى إعادة تعريف مفهوم الخدمات المالية الحديثة، من خلال الجمع بين الاحترافية، والابتكار، والتقنية، والفهم العميق لاحتياجات العملاء ومتطلبات السوق.
      </p>
      <p>
        كما تقدم ريفانس المالية خدمات متخصصة في دراسة ومعالجة طلبات الأفراد في القطاع المصرفي، بما يتيح للعملاء الوصول إلى خدمات مالية واستشارية متخصصة ضمن تجربة واحدة أكثر تنظيمًا ووضوحًا، مع الحرص على فهم احتياجات كل عميل ودراسة وضعه المالي والائتماني بصورة متكاملة.
      </p>
      <p>
        وتؤمن ريفانس المالية بأن التطور الحقيقي في القطاع المالي لا يقتصر على تقديم المنتجات والخدمات، بل يمتد إلى إعادة بناء تجربة العميل بالكامل؛ بدءًا من فهم احتياجه، مرورًا بدراسة حالته وتحديد الخيارات المتاحة، ووصولًا إلى تقديم الخدمة بطريقة رقمية سلسة ومهنية.
      </p>
      <p>
        ومن هذا المنطلق، تواصل ريفانس المالية تطوير منظومتها لتقديم تجربة متكاملة تجمع بين الخبرة، والاستشارة، والتقنية، والابتكار، مع التركيز على تبسيط الإجراءات ورفع كفاءة الخدمات وتقديم حلول تتوافق مع احتياجات العملاء ومتطلبات السوق، بما يواكب التطور المتسارع الذي يشهده القطاع المالي والعقاري في المملكة العربية السعودية.
      </p>
    </div>
  </PageLayout>
);

export const GoalPage: React.FC = () => (
  <PageLayout title="هدفنا">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm space-y-4">
      <div className="w-10 h-1 bg-gold rounded-full" />
      <p className="text-sm md:text-base leading-7 md:leading-8 text-brand/90 dark:text-gray-200 font-medium text-right">
        هدفنا إحداث فرق ملموس في حياة عملائنا من خلال تقديم حلول مالية واقعية ومبتكرة تعزز قدرتهم على الوفاء بالتزاماتهم وتحقيق تطلعاتهم، مع تحويل التحديات المالية إلى فرص للنمو وبناء مستقبل مالي مستدام.
      </p>
    </div>
  </PageLayout>
);

export const VisionPage: React.FC = () => (
  <PageLayout title="رؤيتنا">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm space-y-4">
      <div className="w-10 h-1 bg-gold rounded-full" />
      <p className="text-sm md:text-base leading-7 md:leading-8 text-brand/90 dark:text-gray-200 font-medium text-right">
        أن نصبح العلامة التجارية الأبرز في مجال الحلول التمويلية والاستشارات المالية في المملكة العربية السعودية، وأن نكون الخيار الأول لكل من يبحث عن حلول مالية متكاملة تعكس الاحترافية والابتكار والموثوقية. ونساهم في بناء مجتمع مالي أكثر وعيًا وكفاءة.
      </p>
    </div>
  </PageLayout>
);

export const MessagePage: React.FC = () => (
  <PageLayout title="رسالتنا">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm space-y-4">
      <div className="w-10 h-1 bg-gold rounded-full" />
      <p className="text-sm md:text-base leading-7 md:leading-8 text-brand/90 dark:text-gray-200 font-medium text-right">
        رسالتنا تمكين الأفراد من مواجهة تحدياتهم المالية بثقة، من خلال خدمات متخصصة قائمة على الخبرة والمعرفة العميقة بالأنظمة واللوائح المصرفية، مع تمثيل صوت العميل أمام الجهات التمويلية والرقابية بما يضمن حقوقه ويزيد فرص حصوله على الحلول المناسبة.
      </p>
    </div>
  </PageLayout>
);

export const MissionPage: React.FC = () => (
  <PageLayout title="مهمتنا">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm space-y-4">
      <div className="w-10 h-1 bg-gold rounded-full" />
      <p className="text-sm md:text-base leading-7 md:leading-8 text-brand/90 dark:text-gray-200 font-medium text-right">
        تكمن مهمتنا في توفير حلول تمويلية مبتكرة لكل عميل بشكل فردي، وتقديم خدمات قانونية ومالية احترافية في مجالات الإعفاء، وإعادة الجدولة، ومعالجة الديون المتعثرة، مع ضمان أعلى معايير الشفافية وبناء جسور ثقة عبر المتابعة المستمرة والتواصل الفعّال.
      </p>
    </div>
  </PageLayout>
);

export const AcceptableUse: React.FC = () => (
  <PageLayout title="سياسة الاستخدام المقبول">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm">
      <div className="space-y-8 text-sm md:text-base leading-7 md:leading-8 text-muted dark:text-gray-300 text-right">
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border-r-4 border-red-500 rounded-l-lg mb-6">
          <p className="font-bold text-red-700 dark:text-red-400">تنبيه هام:</p>
          <p className="text-red-600 dark:text-red-300">يعد انتهاك هذه السياسة سبباً كافياً لتعليق حسابك أو اتخاذ إجراءات قانونية ضدك.</p>
        </div>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">1. نطاق السياسة</h3>
          <p>
            تحدد هذه السياسة المعايير التي يجب الالتزام بها عند استخدام منصة ريفانس المالية. تنطبق هذه السياسة على جميع المستخدمين والزوار الذين يصلون إلى خدماتنا عبر أي وسيلة رقمية. الغرض من هذه السياسة هو ضمان أمن وموثوقية المنصة وحماية حقوق جميع الأطراف.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">2. الاستخدامات المحظورة</h3>
          <p>يُحظر تماماً استخدام المنصة للقيام بأي من الأنشطة التالية:</p>
          <div className="space-y-4 mt-3">
            <div>
              <h4 className="font-bold text-brand dark:text-white">أ. الأنشطة غير القانونية:</h4>
              <ul className="list-disc pr-5 space-y-1">
                <li>القيام بأي عمل ينتهك القوانين واللوائح المعمول بها في المملكة العربية السعودية.</li>
                <li>استخدام المنصة لأغراض غسيل الأموال أو تمويل الإرهاب أو أي أنشطة إجرامية أخرى.</li>
                <li>تقديم مستندات مزورة أو معلومات كاذبة للحصول على خدمات مالية.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-brand dark:text-white">ب. الانتهاكات التقنية:</h4>
              <ul className="list-disc pr-5 space-y-1">
                <li>محاولة الوصول غير المصرح به إلى الخوادم أو قواعد البيانات أو الأنظمة المرتبطة بالمنصة.</li>
                <li>استخدام أي برمجيات أو أدوات تهدف إلى تعطيل أو إبطاء عمل المنصة (هجمات DoS/DDoS).</li>
                <li>إدخال فيروسات أو أحصنة طروادة أو أي برمجيات خبيثة أخرى.</li>
                <li>استخدام تقنيات "كشط البيانات" (Data Scraping) أو الجمع الآلي للمعلومات دون إذن مسبق.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-brand dark:text-white">ج. سوء السلوك:</h4>
              <ul className="list-disc pr-5 space-y-1">
                <li>انتحال شخصية ريفانس المالية أو أي من موظفيها أو مستخدميها.</li>
                <li>استخدام المنصة لإرسال رسائل عشوائية (Spam) أو مواد ترويجية غير مرغوب فيها.</li>
                <li>التدخل في استخدام المستخدمين الآخرين للمنصة أو التأثير على تجربتهم.</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">3. معايير المحتوى</h3>
          <p>
            في حال سمحت المنصة للمستخدمين برفع أو نشر محتوى، يجب أن يلتزم هذا المحتوى بالمعايير التالية:
          </p>
          <ul className="list-disc pr-5 space-y-2">
            <li>أن يكون دقيقاً وصادقاً (خاصة في البيانات المالية).</li>
            <li>ألا ينتهك حقوق الملكية الفكرية لأي طرف ثالث.</li>
            <li>ألا يحتوي على مواد مسيئة أو خادشة للحياء أو تتنافى مع القيم الإسلامية والمجتمعية.</li>
            <li>ألا يتضمن أي معلومات سرية تخص أطرافاً أخرى دون موافقتهم.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">4. أمن الحساب</h3>
          <p>
            يتحمل المستخدم المسؤولية الكاملة عن حماية بيانات الدخول الخاصة به. يجب إبلاغنا فوراً إذا كان لديك سبب للاعتقاد بأن حسابك قد تعرض للاختراق أو أن كلمة المرور الخاصة بك قد تم كشفها.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">5. المراقبة والإنفاذ</h3>
          <p>
            نحتفظ بالحق (ولكننا لسنا ملزمين) بمراقبة استخدام المنصة لضمان الالتزام بهذه السياسة. في حال رصد أي انتهاك، يحق لنا اتخاذ الإجراءات التالية:
          </p>
          <ul className="list-disc pr-5 space-y-2">
            <li>إصدار تحذير رسمي للمستخدم.</li>
            <li>التعليق المؤقت أو الدائم لحساب المستخدم.</li>
            <li>حذف أي محتوى ينتهك السياسة.</li>
            <li>اتخاذ الإجراءات القانونية والمطالبة بالتعويض عن الأضرار الناتجة.</li>
            <li>الإفصاح عن المعلومات للجهات الأمنية المختصة إذا لزم الأمر.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">6. التعديلات على السياسة</h3>
          <p>
            قد نقوم بتحديث هذه السياسة من وقت لآخر لمواكبة التطورات التقنية أو القانونية. يعتبر استمرارك في استخدام المنصة بعد نشر التعديلات قبولاً ضمنياً بها.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">7. الإبلاغ عن الانتهاكات</h3>
          <p>
            إذا لاحظت أي نشاط ينتهك هذه السياسة، يرجى إبلاغنا فوراً عبر البريد الإلكتروني: info@rifans.net
          </p>
        </section>
      </div>
    </div>
  </PageLayout>
);

export const CookiePolicy: React.FC = () => (
  <PageLayout title="سياسة ملفات تعريف الارتباط">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm">
      <div className="space-y-8 text-sm md:text-base leading-7 md:leading-8 text-muted dark:text-gray-300 text-right">
        <p>توضح هذه السياسة كيفية استخدام ريفانس المالية لملفات تعريف الارتباط (Cookies) والتقنيات المشابهة لتوفير تجربة مستخدم متميزة وآمنة.</p>
        
        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">1. ما هي ملفات تعريف الارتباط؟</h3>
          <p>
            ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على متصفحك أو جهازك عند زيارة موقعنا. تسمح هذه الملفات للموقع "بتذكر" أفعالك وتفضيلاتك (مثل تسجيل الدخول، اللغة، وحجم الخط) عبر فترة زمنية، مما يغنيك عن إعادة إدخالها في كل مرة تعود فيها للموقع.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">2. لماذا نستخدم ملفات تعريف الارتباط؟</h3>
          <p>نستخدمها للأغراض التالية:</p>
          <ul className="list-disc pr-5 mt-2 space-y-2">
            <li><strong>تحسين الأداء:</strong> لضمان تحميل صفحات الموقع بسرعة وكفاءة.</li>
            <li><strong>التخصيص:</strong> لتذكر تفضيلاتك وتوفير محتوى يتناسب مع اهتماماتك.</li>
            <li><strong>الأمان:</strong> للمساعدة في اكتشاف الأنشطة المشبوهة وحماية حسابك.</li>
            <li><strong>التحليلات:</strong> لفهم كيفية تفاعل المستخدمين مع المنصة، مما يساعدنا في تطوير وتحسين خدماتنا.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">3. أنواع ملفات تعريف الارتباط التي نستخدمها</h3>
          <div className="space-y-4 mt-3">
            <div>
              <h4 className="font-bold text-brand dark:text-white">أ. ملفات تعريف الارتباط الضرورية:</h4>
              <p>هذه الملفات أساسية لتشغيل الموقع ولا يمكن إيقافها. تشمل وظائف مثل التنقل بين الصفحات والوصول إلى المناطق الآمنة.</p>
            </div>
            <div>
              <h4 className="font-bold text-brand dark:text-white">ب. ملفات تعريف الارتباط التحليلية:</h4>
              <p>تساعدنا في جمع معلومات حول كيفية استخدام الزوار للموقع (مثل Google Analytics). يتم جمع هذه البيانات بشكل مجهول وتستخدم فقط لتحسين أداء الموقع.</p>
            </div>
            <div>
              <h4 className="font-bold text-brand dark:text-white">ج. ملفات تعريف الارتباط الوظيفية:</h4>
              <p>تسمح للموقع بتقديم ميزات متقدمة وتخصيص أفضل، مثل تذكر إعدادات اللغة أو الوضع الليلي.</p>
            </div>
            <div>
              <h4 className="font-bold text-brand dark:text-white">د. ملفات تعريف الارتباط التسويقية:</h4>
              <p>تستخدم لتتبع الزوار عبر المواقع الإلكترونية بهدف عرض إعلانات ذات صلة وجذابة للمستخدم الفردي.</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">4. ملفات تعريف الارتباط للطرف الثالث</h3>
          <p>
            قد نستخدم خدمات من أطراف ثالثة (مثل أدوات التحليل أو منصات التواصل الاجتماعي) التي قد تضع ملفات تعريف ارتباط خاصة بها على جهازك. نحن لا نتحكم في هذه الملفات، وننصحك بمراجعة سياسات تلك الأطراف.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">5. إدارة ملفات تعريف الارتباط</h3>
          <p>
            يمكنك التحكم في ملفات تعريف الارتباط أو حذفها كما تشاء. يمكنك مسح جميع الملفات الموجودة بالفعل على جهازك، كما يمكنك ضبط معظم المتصفحات لمنع وضعها.
          </p>
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 mt-3">
            <p className="font-bold mb-2">كيفية تغيير الإعدادات:</p>
            <ul className="list-disc pr-5 space-y-1">
              <li>في Chrome: الإعدادات {'>'} الخصوصية والأمان {'>'} ملفات تعريف الارتباط.</li>
              <li>في Safari: التفضيلات {'>'} الخصوصية.</li>
              <li>في Firefox: الخيارات {'>'} الخصوصية والأمان.</li>
            </ul>
          </div>
          <p className="mt-3 text-red-600 dark:text-red-400 font-bold">ملاحظة: قد يؤدي تعطيل ملفات تعريف الارتباط إلى عدم قدرتك على استخدام بعض ميزات الموقع بشكل كامل.</p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">6. تحديثات السياسة</h3>
          <p>
            قد نقوم بتحديث هذه السياسة من وقت لآخر لتعكس التغييرات في التقنيات التي نستخدمها أو المتطلبات القانونية. يرجى مراجعة هذه الصفحة بانتظام للبقاء على اطلاع.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">7. لمزيد من المعلومات</h3>
          <p>
            إذا كان لديك أي استفسار حول استخدامنا لملفات تعريف الارتباط، يمكنك التواصل معنا عبر البريد الإلكتروني: info@rifans.net
          </p>
        </section>
      </div>
    </div>
  </PageLayout>
);

export const DisclaimerPage: React.FC = () => (
  <PageLayout title="إخلاء المسؤولية">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm">
      <div className="space-y-8 text-sm md:text-base leading-7 md:leading-8 text-muted dark:text-gray-300 text-right">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/15 border-r-4 border-gold rounded-l-lg mb-6">
          <p className="font-bold text-brand dark:text-gold">تنبيه قانوني هام:</p>
          <p className="text-gray-700 dark:text-gray-300">
            «ريفانس المالية» منصة إلكترونية متخصصة في تقديم ومتابعة الخدمات المهنية للأفراد، وتخضع خدماتها للأنظمة واللوائح السارية في المملكة العربية السعودية.
          </p>
        </div>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">1. طبيعة الخدمات المقدمة</h3>
          <p>
            توضح منصة «ريفانس المالية» لجميع عملائها وزوارها أنها منصة متخصصة في الاستشارات والخدمات المهنية وإعداد ومتابعة الملفات المالية والقانونية والإدارية للأفراد. والمنصة ليست جهة تمويلية أو مصرفية مانحة للقروض، وإنما تقدم أعمال الوساطة والدراسة والاستشارات ومتابعة الطلبات بالتنسيق مع الجهات النظامية والتمويلية المختصة.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">2. عدم ضمان النتائج القطعية</h3>
          <p>
            تبذل ريفانس المالية أقصى عناية مهنية ممكنة وفق أفضل الممارسات لدراسة طلبات عملائها ومتابعتها، إلا أن قبول طلبات الإعفاء، أو منح التمويل، أو إعادة الجدولة، أو إسقاط المديونيات، أو القرارات القضائية والتنفيذية، هي قرارات سيادية وتخضع حصرًا لتقدير وصلاحيات الجهات المصرفية أو القضائية أو التمويلية المعنية. وعليه، فإن المنصة لا تقدم أي ضمان قطعي أو تعهد مسبق بقبول أي طلب أو تحقيق نتيجة محددة خارج نطاق اختصاصها المهني.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">3. مسؤولية العميل عن صحة البيانات</h3>
          <p>
            يتحمل المستخدم والعميل كامل المسؤولية النظامية والمدنية والجنائية عن صحة ودقة وسلامة كافة البيانات والمستندات والوثائق المرفوعة عبر المنصة. ويُعد تقديم أي مستند غير صحيح أو بيانات غير مطابقة للواقع مخالفة صريحة للأنظمة، ويحق للمنصة فورًا إلغاء الطلب وتحميل العميل كافة التبعات القانونية دون أي مسؤولية على ريفانس المالية.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">4. حدود المسؤولية والتعويضات</h3>
          <p>
            لا تتحمل ريفانس المالية أو إدارتها أو منسوبوها أي مسؤولية عن أي أضرار مباشرة أو غير مباشرة، أو خسائر تجارية أو مالية، أو تعطل في الأعمال قد ينشأ عن استخدام المنصة، أو انقطاع الخدمة المؤقت لأسباب تقنية أو صيانة، أو تأخر البت في الطلبات من قبل الجهات الخارجية المعنية.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">5. الروابط الخارجية والمحتوى المستقل</h3>
          <p>
            قد تتضمن المنصة روابط إلكترونية لمواقع أو بوابات تابعة لجهات خارجية لغرض التسهيل على العميل. ولا يعني وجود هذه الروابط مصادقة المنصة على محتواها أو تحملها أي مسؤولية عن سياسات أو ممارسات تلك الجهات.
          </p>
        </section>
      </div>
    </div>
  </PageLayout>
);

export const DataProtectionPolicy: React.FC = () => (
  <PageLayout title="سياسة حماية البيانات الشخصية">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm">
      <div className="space-y-8 text-sm md:text-base leading-7 md:leading-8 text-muted dark:text-gray-300 text-right">
        <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 mb-4">
          <ShieldCheck size={26} className="shrink-0 text-gold" />
          <span className="font-bold text-[13.5px]">
            تلتزم منصة «ريفانس المالية» التزاماً كاملاً بنظام حماية البيانات الشخصية الصادر بالمرسوم الملكي رقم (م/19) وتعديلاته ولائحته التنفيذية بالمملكة العربية السعودية.
          </span>
        </div>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">1. مبادئ معالجة البيانات الشخصية</h3>
          <p>
            تتبع ريفانس المالية المبادئ النظامية الأساسية لمعالجة البيانات الشخصية، وتشمل:
          </p>
          <ul className="list-disc pr-5 space-y-2">
            <li><strong>المشروعية والشفافية:</strong> معالجة البيانات بموجب مسوغ نظامي واضح وموافقة صريحة من العميل.</li>
            <li><strong>تحديد الغرض:</strong> جمع البيانات لأغراض محددة ومشروعة تتعلق بتقديم الخدمات ومتابعتها فقط.</li>
            <li><strong>الحد الأدنى:</strong> عدم جمع أي بيانات تزيد عن الحاجة الفعلية لتقديم الخدمة المطلوبة.</li>
            <li><strong>الدقة والتحديث:</strong> اتخاذ التدابير المعقولة لضمان دقة البيانات وتحديثها.</li>
            <li><strong>أمن وسرية البيانات:</strong> تطبيق تدابير تشفير فنية وبروتوكولات أمن سيبراني متقدمة لحماية البيانات من الوصول غير المصرح به.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">2. نطاق البيانات الخاضعة للحماية</h3>
          <p>
            تشمل البيانات الخاضعة للحماية: البيانات الشخصية الثبوتية (الاسم، الهوية، تاريخ الميلاد)، بيانات الاتصال (الجوال، العنوان الوطني، البريد)، والبيانات المالية والائتمانية والوظيفية المقدمة لإتمام المعاملات المهنية، وكافة المرفقات والمستندات المرفوعة عبر المنصة.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">3. حقوق صاحب البيانات الشخصية</h3>
          <p>بموجب النظام السعودي، يحق للعميل ممارسة حقوقه التالية:</p>
          <ul className="list-disc pr-5 space-y-2">
            <li><strong>حق العلم:</strong> معرفة الأساس النظامي والغرض من جمع ومعالجة بياناته.</li>
            <li><strong>حق الوصول:</strong> الاطلاع على بياناته الشخصية المحفوظة لدى المنصة وطلب نسخة منها.</li>
            <li><strong>حق التصحيح والاستكمال:</strong> طلب تعديل أو تصحيح أو استكمال أي بيانات غير دقيقة.</li>
            <li><strong>حق الإتلاف:</strong> طلب حذف أو إتلاف بياناته الشخصية عند انتهاء الغرض من جمعها ما لم ينص النظام على خلاف ذلك.</li>
            <li><strong>حق سحب الموافقة:</strong> سحب موافقته السابقة على معالجة البيانات في أي وقت وفق الضوابط النظامية.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">4. التخزين والأمن السيبراني</h3>
          <p>
            يتم حفظ ومعالجة كافة البيانات داخل خوادم رقمية آمنة تلتزم بضوابط الهيئة الوطنية للأمن السيبراني، مع تطبيق تشفير كامل للاتصالات وقواعد بيانات مشددة الصلاحيات يقتصر التعامل معها على المختصين المعنيين بدراسة المعاملة.
          </p>
        </section>
      </div>
    </div>
  </PageLayout>
);

export const BeneficiaryRightsPage: React.FC = () => (
  <PageLayout title="حقوق ومسؤوليات المستفيد">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm">
      <div className="space-y-8 text-sm md:text-base leading-7 md:leading-8 text-muted dark:text-gray-300 text-right">
        <div className="p-4 bg-gold/10 border-r-4 border-gold rounded-l-lg mb-6">
          <p className="font-bold text-brand dark:text-gold">ميثاق خدمة المستفيدين:</p>
          <p className="text-gray-700 dark:text-gray-300">
            نحرص في ريفانس المالية على ترسيخ مبادئ الشفافية والعدالة والوضوح في كافة تعاملاتنا المهنية مع عملائنا الكرام.
          </p>
        </div>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">أولاً: حقوق المستفيد</h3>
          <ul className="list-disc pr-5 space-y-2">
            <li><strong>الشفافية والوضوح:</strong> الحصول على شرح وافٍ ومفصل عن نطاق كل خدمة وإجراءاتها ومتطلباتها قبل البدء.</li>
            <li><strong>معرفة التكاليف:</strong> الاطلاع المسبق على أي رسوم إدارية أو أتعاب استشارية بشكل واضح ومحدد دون أي تكاليف خفية.</li>
            <li><strong>حفظ السرية والخصوصية:</strong> سرية كافة المعلومات والوثائق المقدمة وعدم استخدامها لغير الأغراض المتفق عليها.</li>
            <li><strong>متابعة حالة الطلب:</strong> إمكانية الاطلاع الدائم على مراحل تقدم الطلب والتحديثات والمستندات عبر لوحة التحكم الخاصة.</li>
            <li><strong>التعامل المهني المحترم:</strong> تلقي معاملة راقية وعادلة من فريق العمل ومسؤولي خدمة العملاء.</li>
            <li><strong>حق تقديم الشكاوى والمقترحات:</strong> إمكانية تقديم أي ملاحظة أو شكوى عبر القنوات الرسمية والحصول على رقم متابعة ورد خلال المدد المعتمدة.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">ثانياً: مسؤوليات والتزامات المستفيد</h3>
          <ul className="list-disc pr-5 space-y-2">
            <li><strong>صحة ودقة البيانات:</strong> تقديم معلومات صحيحة ومحدثة وتزويد المنصة بالمستندات الثبوتية السليمة نظاماً.</li>
            <li><strong>حماية بيانات الحساب:</strong> المحافظة على سرية بيانات تسجيل الدخول ورمز التحقق وعدم إفشائها لأي طرف آخر.</li>
            <li><strong>التجاوب واستيفاء النواقص:</strong> سرعة الرد على استفسارات فريق العمل وتزويدهم بأي وثائق إضافية مطلوبة لإنجاز المعاملة.</li>
            <li><strong>الالتزام بالعقود والاتفاقيات:</strong> احترام الالتزامات والشروط التعاقدية المنصوص عليها في العقود والسندات المعتمدة من قبله.</li>
            <li><strong>الاستخدام المشروع:</strong> استخدام المنصة للأغراض المشروعة وتجنب أي تصرف يخالف الأنظمة السعودية أو يعطل أنظمة المنصة.</li>
          </ul>
        </section>
      </div>
    </div>
  </PageLayout>
);

export const IntellectualProperty: React.FC = () => (
  <PageLayout title="سياسة الملكية الفكرية">
    <div className="bg-white dark:bg-[#1a0b25] rounded-[24px] p-6 border border-gold/30 shadow-sm">
      <div className="space-y-8 text-sm md:text-base leading-7 md:leading-8 text-muted dark:text-gray-300 text-right">
        <p>تعتبر حماية الملكية الفكرية ركيزة أساسية في ريفانس المالية. توضح هذه السياسة حقوقنا وحقوق الأطراف الثالثة فيما يتعلق بالمحتوى والخدمات المتاحة على منصتنا.</p>
        
        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">1. ملكية المحتوى</h3>
          <p>
            جميع المواد والمحتويات المتاحة على منصة ريفانس المالية، بما في ذلك على سبيل المثال لا الحصر: النصوص، الرسوم البيانية، الشعارات، الأيقونات، الصور، المقاطع الصوتية، التحميلات الرقمية، تجميع البيانات، والبرمجيات، هي ملكية حصرية لريفانس المالية أو مزودي المحتوى التابعين لها، وهي محمية بموجب أنظمة الملكية الفكرية وحقوق النشر في المملكة العربية السعودية والاتفاقيات الدولية.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">2. العلامات التجارية</h3>
          <p>
            اسم "ريفانس المالية" وشعارها وجميع الأسماء والشعارات المرتبطة بخدماتنا هي علامات تجارية مسجلة أو محمية لريفانس المالية. يُحظر تماماً استخدام هذه العلامات التجارية فيما يتعلق بأي منتج أو خدمة لا تتبع لنا، أو بأي طريقة قد تسبب ارتباكاً لدى العملاء أو تسيء لسمعتنا.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">3. ترخيص الاستخدام المحدود</h3>
          <p>
            تمنحك ريفانس المالية ترخيصاً محدوداً وشخصياً وغير قابل للتحويل للوصول إلى المنصة واستخدامها للأغراض الشخصية فقط. لا يمنحك هذا الترخيص الحق في:
          </p>
          <ul className="list-disc pr-5 mt-2 space-y-2">
            <li>إعادة بيع المنصة أو استخدامها لأغراض تجارية دون موافقة صريحة.</li>
            <li>جمع واستخدام أي قوائم خدمات أو أوصاف أو أسعار بشكل آلي.</li>
            <li>استخدام أي تقنيات لاستخراج البيانات أو الروبوتات أو أدوات جمع البيانات المماثلة.</li>
            <li>نسخ أو تكرار أو بيع أو استغلال أي جزء من المنصة لأي غرض تجاري دون إذن.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">4. المحتوى الذي يقدمه المستخدم</h3>
          <p>
            عند تقديمك لأي محتوى أو بيانات للمنصة (مثل التقييمات أو الاستفسارات)، فإنك تمنح ريفانس المالية حقاً غير حصري وعالمي ودائم لاستخدام هذا المحتوى وتعديله ونشره لغرض تقديم وتحسين الخدمات، مع الالتزام التام بسياسة الخصوصية فيما يتعلق بالبيانات الشخصية.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">5. حماية حقوق الآخرين</h3>
          <p>
            نحن نحترم حقوق الملكية الفكرية للآخرين. إذا كنت تعتقد أن أي محتوى متاح على منصتنا ينتهك حقوق النشر الخاصة بك، يرجى تزويدنا بإشعار يتضمن وصفاً للعمل المحمي، وتحديداً للمكان على المنصة، ومعلومات الاتصال الخاصة بك.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">6. الإجراءات ضد الانتهاكات</h3>
          <p>
            سنتخذ الإجراءات المناسبة فور التحقق من أي انتهاك للملكية الفكرية، بما في ذلك إزالة المحتوى المخالف والملاحقة القانونية لحماية حقوقنا.
          </p>
        </section>

        <section>
          <h3 className="text-base md:text-lg font-black text-brand dark:text-gold mb-3">7. التواصل بخصوص الملكية الفكرية</h3>
          <p>
            لأي استفسارات أو بلاغات تتعلق بالملكية الفكرية، يرجى التواصل معنا عبر البريد الإلكتروني: info@rifans.net
          </p>
        </section>
      </div>
    </div>
  </PageLayout>
);


