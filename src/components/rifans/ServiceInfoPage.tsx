import React from 'react';
import { 
  ArrowLeft, 
  Check, 
  FileText, 
  Users, 
  ClipboardList, 
  ShieldCheck, 
  AlertTriangle, 
  Star, 
  Info, 
  BookOpen, 
  Target, 
  Briefcase,
  ChevronLeft,
} from 'lucide-react';

interface ServiceInfoPageProps {
  title: string;
  subtitle: string;
  image: string;
  sections: { icon: React.ReactNode; title: string; content: React.ReactNode }[];
  ctaLabel: string;
  requestType: string;
}

const ServiceInfoPage: React.FC<ServiceInfoPageProps> = ({
  title, subtitle, image, sections, ctaLabel, requestType
}) => {
  const handleRequestClick = () => {
    window.dispatchEvent(new CustomEvent('open-waive-form', {
      detail: { requestType }
    }));
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] dark:bg-[#08010C] text-gray-900 dark:text-gray-100 font-cairo" dir="rtl">
      <main className="max-w-[1000px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex justify-end mb-2.5">
          <a
            href="#/#business-fields"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] sm:text-[12px] font-medium text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 hover:bg-gold/10 hover:text-gold dark:hover:text-gold border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
          >
            <span>رجوع</span>
            <ChevronLeft size={13} className="text-gold" />
          </a>
        </div>
        <div className="max-w-[800px] mx-auto space-y-6 sm:space-y-7 text-right">
          
          {/* Service Header: 22px mobile, 26px desktop, 700 weight, line-height 1.5 */}
          <header className="space-y-1.5">
            <span className="text-[13px] sm:text-[14px] font-semibold text-gold uppercase block">
              {subtitle}
            </span>
            <h1 className="text-[22px] md:text-[26px] font-bold leading-[1.5] text-[#2A0E32] dark:text-white m-0">
              {title}
            </h1>
            <div className="w-10 sm:w-12 h-0.5 bg-[#B99A55] rounded-full mt-2.5" />
          </header>

          {/* Compact 16:9 Banner Image */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[16/9] max-h-[220px] sm:max-h-[300px]">
            <div className="image-wrapper w-full h-full">
              <img src={image} alt={title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 right-4 left-4 z-10">
                <span className="text-white text-[14px] sm:text-[16px] font-bold drop-shadow">
                  {title}
                </span>
              </div>
            </div>
          </div>

          {/* Sequential Sections: 20px titles, 16px body, hairline dividers */}
          <div className="divide-y divide-gray-200/80 dark:divide-white/10">
            {sections.map((section, i) => (
              <section key={i} className={i > 0 ? "pt-6 sm:pt-7 space-y-3" : "pb-6 sm:pb-7 space-y-3"}>
                <div>
                  <h2 className="text-[16px] md:text-[20px] font-bold text-[#2A0E32] dark:text-white leading-[1.375] m-0">
                    {section.title}
                  </h2>
                </div>

                <div className="text-[16px] text-gray-700 dark:text-gray-300 leading-[1.8] font-normal pr-1">
                  {section.content}
                </div>
              </section>
            ))}
          </div>

          {/* CTA Section: 20px title, 54px button, 12px gap */}
          <div className="pt-6 sm:pt-7 border-t border-gray-200/80 dark:border-white/10 space-y-3">
            <h3 className="text-[20px] font-bold text-[#2A0E32] dark:text-white leading-[1.5] m-0">
              تنفيذ الطلب
            </h3>
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleRequestClick}
                className="w-full sm:w-auto min-w-[240px] h-[54px] px-8 rounded-[12px] bg-gold hover:bg-[#D8B979] text-[#180020] font-bold text-[16px] shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <ShieldCheck size={18} />
                <span>{ctaLabel}</span>
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              </button>

              <button
                type="button"
                onClick={() => { window.location.hash = '#/'; }}
                className="w-full sm:w-auto h-[54px] px-6 rounded-[12px] border border-gray-300 dark:border-white/15 hover:border-gold text-gray-700 dark:text-gray-200 font-bold text-[14px] sm:text-[15px] transition-colors cursor-pointer"
              >
                رجوع للصفحة الرئيسية
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <ul className="space-y-3 sm:space-y-3.5 m-0 p-0 list-none">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-3 text-[15.5px] sm:text-[16px] text-gray-700 dark:text-gray-300 leading-[1.75] font-normal">
        <div className="w-[20px] h-[20px] rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0 mt-0.5">
          <Check size={12} strokeWidth={3} />
        </div>
        <span className="flex-1">{item}</span>
      </li>
    ))}
  </ul>
);

const NumberedList: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="relative pr-5 mr-1 space-y-5 sm:space-y-6 before:content-[''] before:absolute before:top-2 before:bottom-2 before:right-[3px] before:w-[1px] before:bg-gold/40">
    {items.map((item, i) => (
      <div key={i} className="relative">
        <span className="absolute -right-[20px] top-1.5 w-2 h-2 rounded-full bg-gold ring-4 ring-[#FCFBF8] dark:ring-[#08010C]" />
        <div>
          <span className="text-[13px] font-bold text-gold block mb-0.5">
            المرحلة {i + 1}
          </span>
          <h4 className="text-[15.5px] sm:text-[16px] font-bold text-[#2A0E32] dark:text-white leading-[1.5] m-0">
            {item}
          </h4>
        </div>
      </div>
    ))}
  </div>
);

const WarningBox: React.FC<{ items: string[] }> = ({ items }) => (
  <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border-r-4 border-amber-500 text-amber-900 dark:text-amber-200 text-[14px] leading-[1.7] space-y-2">
    {items.map((item, i) => (
      <div key={i} className="flex items-start gap-2.5">
        <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <span>{item}</span>
      </div>
    ))}
  </div>
);

// === WAIVE INFO PAGE ===
export const WaiveInfoPage: React.FC = () => (
  <ServiceInfoPage
    title="طلب الإعفاء من الالتزامات التمويلية"
    subtitle="خدمات الإعفاء بسبب عجز كلي"
    image="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800"
    requestType="waive_request"
    ctaLabel="تقديم طلب الإعفاء"
    sections={[
      {
        icon: <FileText size={20} className="text-gold" />,
        title: "نبذة عن الخدمة",
        content: <p>نقدّم خدمة متخصصة لمساعدة العملاء غير القادرين على سداد التزاماتهم التمويلية نتيجة عجز كلي مثبت، وذلك من خلال إعداد ملف طلب الإعفاء بشكل احترافي وفق المتطلبات المعتمدة لدى الجهات التمويلية، مع متابعة دقيقة لكافة مراحل الطلب حتى صدور القرار.</p>
      },
      {
        icon: <BookOpen size={20} className="text-gold" />,
        title: "تعريف العجز الكلي",
        content: <p>هو العارض الصحي الذي يمنع العميل من ممارسة حياته الطبيعية بشكل كامل، ويترتب عليه عدم لياقته طبياً للعمل، وذلك بموجب تقارير طبية صادرة أو معتمدة من الجهة المختصة نظامًا.</p>
      },
      {
        icon: <Info size={20} className="text-gold" />,
        title: "ما هو طلب الإعفاء؟",
        content: <p>هو إجراء رسمي يُمكن العميل من الحصول على إعفاء كامل من الالتزامات التمويلية المستحقة عليه، عند ثبوت العجز الكلي وفقًا للتقارير الطبية المعتمدة والضوابط المعمول بها لدى الجهة التمويلية.</p>
      },
      {
        icon: <Users size={20} className="text-gold" />,
        title: "الفئة المستفيدة من الخدمة",
        content: <p>تُقدّم هذه الخدمة لكل من ثبت لديه عجز كلي بموجب تقارير طبية رسمية معتمدة، ثبت عدم قدرته على العمل وممارسة حياته الطبيعية بشكل كامل، مما أدى إلى تعثره في سداد التزاماته التمويلية.</p>
      },
      {
        icon: <Target size={20} className="text-gold" />,
        title: "نطاق الخدمة (ماذا يشمل؟)",
        content: (
          <div>
            <p className="mb-3">نقدّم لك خدمة متكاملة لإدارة طلبك من البداية حتى النهاية:</p>
            <BulletList items={[
              "دراسة الحالة والتأكد من انطباق شروط العجز الكلي",
              "مراجعة وتحليل التقارير الطبية والتأكد من استيفائها للمتطلبات",
              "توجيهك لاستكمال أي نواقص في المستندات",
              "إعداد ملف طلب الإعفاء بشكل احترافي ومتوافق مع معايير الجهة التمويلية",
              "رفع الطلب ومتابعته لدى الجهة المختصة",
              "إشعارك بجميع التحديثات والمراحل أولاً بأول"
            ]} />
          </div>
        )
      },
      {
        icon: <ClipboardList size={20} className="text-gold" />,
        title: "خطوات التقديم",
        content: (
          <NumberedList items={[
            "تقديم الطلب الأولي عبر الموقع الإلكتروني",
            "مراجعة الحالة والتأكد من توافر التقارير الطبية المعتمدة",
            "تجهيز ملف الطلب وصياغته بشكل نظامي",
            "رفع الطلب لدى الجهة التمويلية المعنية",
            "متابعة الطلب حتى صدور القرار النهائي"
          ]} />
        )
      },
      {
        icon: <Briefcase size={20} className="text-gold" />,
        title: "المستندات المطلوبة",
        content: (
          <div>
            <p className="mb-3">المستندات الأساسية للبدء في دراسة الطلب:</p>
            <BulletList items={[
              "الهوية الوطنية سارية المفعول",
              "التقارير الطبية الصادرة أو المعتمدة من الجهة المختصة",
              "كشف حساب بنكي يوضح الالتزامات القائمة",
              "أي مستندات إضافية تدعم ثبوت العجز الكلي"
            ]} />
          </div>
        )
      },
      {
        icon: <ShieldCheck size={20} className="text-gold" />,
        title: "معايير قبول الطلب",
        content: (
          <BulletList items={[
            "ثبوت العجز الكلي بشكل واضح وقاطع",
            "اعتماد التقارير الطبية من جهة رسمية مختصة",
            "اكتمال كافة المستندات والبيانات المطلوبة",
            "انطباق شروط وسياسات الجهة التمويلية"
          ]} />
        )
      },
      {
        icon: <Star size={20} className="text-gold" />,
        title: "مميزات الخدمة",
        content: (
          <BulletList items={[
            "فريق متخصص يمتلك دراية كاملة بإجراءات ومتطلبات الجهات التمويلية",
            "إعداد ملف احترافي يزيد من فرص قبول الطلب ويسرّع دراسته",
            "متابعة دقيقة ومستمرة لكافة مراحل الطلب",
            "توفير الوقت والجهد وتجنب الأخطاء الشائعة في التقديم",
            "خصوصية وسرية تامة لجميع البيانات والتقارير الطبية"
          ]} />
        )
      },
      {
        icon: <AlertTriangle size={20} className="text-amber-500" />,
        title: "ملاحظات مهمة",
        content: (
          <WarningBox items={[
            "الإعفاء يقتصر على الحالات التي يثبت فيها العجز الكلي فقط",
            "لا يُنظر في الطلب في حال عدم اكتمال أو اعتماد التقارير الطبية",
            "قرار الإعفاء يخضع بالكامل للجهة التمويلية المختصة",
            "لا يمكن ضمان الموافقة، لكن يتم العمل على تقديم الملف بأفضل صورة ممكنة"
          ]} />
        )
      },
      {
        icon: <Info size={20} className="text-amber-600" />,
        title: "تنويه مهم",
        content: (
          <div className="p-4 rounded-xl bg-amber-500/10 border-r-4 border-amber-500 text-amber-900 dark:text-amber-200 text-[14px] sm:text-[15px] leading-[1.8] space-y-3">
            <p>نود التأكيد بأن دورنا يقتصر على تقديم الخدمات الاستشارية والإجرائية المتعلقة بطلبات الإعفاء من الالتزامات التمويلية، حيث نقوم بدراسة الحالة، ومراجعة المستندات، وتقديم المشورة المهنية، إضافة إلى إعداد ملف الطلب ورفعه ومتابعته وفق المتطلبات المعتمدة لدى الجهات التمويلية.</p>
            <p>كما نؤكد أننا لسنا جهة تمويلية أو جهة مخولة بإصدار قرارات الإعفاء، ولا نمتلك أي صلاحية في اعتماد أو رفض الطلبات.</p>
            <p className="font-bold">ويُقر العميل بأن:</p>
            <BulletList items={[
              "تقديم الخدمة لا يعني ضمان الموافقة على طلب الإعفاء",
              "قرار الإعفاء يعتمد على تقييم الجهة المختصة للحالة والتقارير الطبية المقدمة",
              "أي نقص أو عدم دقة في المستندات أو المعلومات قد يؤثر على نتيجة الطلب",
              "دورنا يقتصر على تقديم الطلب بأفضل صورة ممكنة وفق المعايير المعتمدة"
            ]} />
          </div>
        )
      }
    ]}
  />
);

// === SCHEDULING INFO PAGE ===
export const SchedulingInfoPage: React.FC = () => (
  <ServiceInfoPage
    title="طلب جدولة الالتزامات التمويلية"
    subtitle="خدمات الجدولة المالية"
    image="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
    requestType="rescheduling_request"
    ctaLabel="تقديم طلب الجدولة"
    sections={[
      {
        icon: <FileText size={20} className="text-gold" />,
        title: "نبذة عن الخدمة",
        content: <p>نقدّم خدمة متخصصة لمساعدة العملاء غير القادرين على سداد التزاماتهم التمويلية بالوضع الحالي، وذلك من خلال إعداد ملف طلب الجدولة بشكل احترافي وفق المتطلبات المعتمدة لدى الجهات التمويلية، مع متابعة دقيقة لكافة مراحل الطلب حتى صدور القرار.</p>
      },
      {
        icon: <BookOpen size={20} className="text-gold" />,
        title: "تعريف جدولة الالتزامات التمويلية",
        content: <p>هي إجراء يهدف إلى إعادة تنظيم الالتزامات التمويلية للعميل بما يتناسب مع وضعه المالي الحالي، من خلال تعديل شروط السداد، مثل تمديد مدة التمويل أو إعادة توزيع الأقساط، بما يساهم في تخفيف العبء المالي وتحقيق استقرار مالي أفضل.</p>
      },
      {
        icon: <Info size={20} className="text-gold" />,
        title: "ما هو طلب الجدولة؟",
        content: <p>هو إجراء رسمي يُمكن العميل من إعادة تنظيم الالتزامات التمويلية المستحقة عليه، بما يتناسب مع قدرته المالية الحالية، وفقًا للضوابط والسياسات المعمول بها لدى الجهة التمويلية.</p>
      },
      {
        icon: <Users size={20} className="text-gold" />,
        title: "الفئة المستفيدة من الخدمة",
        content: <p>تُقدّم هذه الخدمة للعملاء الذين يواجهون صعوبة في سداد التزاماتهم التمويلية القائمة بسبب تغير في الدخل أو زيادة في الالتزامات المالية، ويرغبون في إعادة هيكلة الأقساط لتتناسب مع قدرتهم المالية الحالية.</p>
      },
      {
        icon: <Target size={20} className="text-gold" />,
        title: "نطاق الخدمة (ماذا يشمل؟)",
        content: (
          <div>
            <p className="mb-3">نقدّم لك خدمة متكاملة لإدارة طلبك من البداية حتى النهاية:</p>
            <BulletList items={[
              "دراسة الوضع المالي الحالي وتحليل الدخل والالتزامات",
              "تحديد الحلول التمويلية المناسبة لإعادة الجدولة",
              "إعداد ملف الطلب مدعومًا بالمبررات المالية المناسبة",
              "التواصل مع الجهة التمويلية ومتابعة دراسة الطلب",
              "إشعارك بكافة المستجدات حتى اعتماد الجدولة"
            ]} />
          </div>
        )
      },
      {
        icon: <ClipboardList size={20} className="text-gold" />,
        title: "خطوات التقديم",
        content: (
          <NumberedList items={[
            "تقديم الطلب الأولي وتعبئة البيانات المالية",
            "مراجعة الوضع الائتماني والالتزامات الحالية",
            "إعداد خطة الجدولة والمقترح المالي المناسب",
            "رفع الطلب رسميًا لدى الجهة التمويلية",
            "متابعة الطلب وتحديث العميل بالقرار"
          ]} />
        )
      },
      {
        icon: <Briefcase size={20} className="text-gold" />,
        title: "المستندات المطلوبة",
        content: (
          <div>
            <p className="mb-3">المستندات المعتادة لطلبات إعادة الجدولة:</p>
            <BulletList items={[
              "الهوية الوطنية سارية الصلاحية",
              "تعريف بالراتب حديث أو إثبات الدخل",
              "كشف حساب بنكي لآخر 3 أشهر",
              "ما يثبت تغير الوضع المالي (إن وجد)"
            ]} />
          </div>
        )
      },
      {
        icon: <ShieldCheck size={20} className="text-gold" />,
        title: "معايير قبول الطلب",
        content: (
          <BulletList items={[
            "وجود التزام تمويلي قائم لدى جهة مصرفية أو تمويلية",
            "إثبات الحاجة المالية لإعادة الجدولة",
            "اكتمال المستندات والمعلومات المطلوبة",
            "موافقة الجهة التمويلية وفق ضوابط البنك المركزي"
          ]} />
        )
      },
      {
        icon: <Star size={20} className="text-gold" />,
        title: "مميزات الخدمة",
        content: (
          <BulletList items={[
            "تخفيف العبء المالي الشهري على العميل",
            "تجنب التعثر وحماية السجل الائتماني في سمة",
            "إعداد مقترح مالي احترافي متوافق مع لوائح التمويل المسؤول",
            "متابعة حثيثة لتسريع دراسة الطلب والبت فيه"
          ]} />
        )
      },
      {
        icon: <AlertTriangle size={20} className="text-amber-500" />,
        title: "ملاحظات مهمة",
        content: (
          <WarningBox items={[
            "إعادة الجدولة قد يترتب عليها تعديل في إجمالي تكلفة الأجل أو مدة التمويل",
            "الموافقة النهائية من اختصاص الجهة التمويلية الدائنة حصراً",
            "يجب الالتزام بسداد الأقساط المقررة لحين صدور الموافقة واعتماد الجدول الجديد"
          ]} />
        )
      },
      {
        icon: <Info size={20} className="text-amber-600" />,
        title: "تنويه مهم",
        content: (
          <div className="p-4 rounded-xl bg-amber-500/10 border-r-4 border-amber-500 text-amber-900 dark:text-amber-200 text-[14px] sm:text-[15px] leading-[1.8] space-y-3">
            <p>ريفانس المالية تقدم خدمات استشارية ودراسات ملاءة مالية ومساعدة إجرائية في تجهيز ورفع طلبات الجدولة، وليست جهة تمويلية أو مانحة للائتمان. كافة القرارات الائتمانية والتمويلية تصدر من الجهات المرخصة نظاماً من البنك المركزي السعودي.</p>
          </div>
        )
      }
    ]}
  />
);

// === SEIZED AMOUNTS INFO PAGE ===
export const SeizedAmountsInfoPage: React.FC = () => (
  <ServiceInfoPage
    title="طلب إتاحة النسبة النظامية من المبالغ المحجوزة"
    subtitle="خدمات إتاحة المبالغ المستثناة"
    image="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=800"
    requestType="seized_amounts_request"
    ctaLabel="تقديم طلب إتاحة النسبة النظامية"
    sections={[
      {
        icon: <FileText size={20} className="text-gold" />,
        title: "نبذة عن الخدمة",
        content: <p>نقدّم خدمة متخصصة لمساعدة العملاء الذين لديهم حجز على حساباتهم البنكية بقرار قضائي، وذلك عبر إعداد وتقديم طلب إتاحة النسبة النظامية من المبالغ المستثناة من الحجز، وفق الأنظمة المعمول بها، مع متابعة الطلب حتى صدور القرار.</p>
      },
      {
        icon: <BookOpen size={20} className="text-gold" />,
        title: "ما هي النسبة النظامية المستثناة من الحجز؟",
        content: <p>هي النسبة التي يحق للعميل الاستفادة منها من دخله أو حسابه البنكي رغم وجود حجز، وذلك وفقًا للأنظمة واللوائح المعتمدة، بما يضمن تلبية الاحتياجات المعيشية الأساسية.</p>
      },
      {
        icon: <Info size={20} className="text-gold" />,
        title: "ما هو طلب إتاحة النسبة النظامية؟",
        content: <p>هو إجراء رسمي يهدف إلى تمكين العميل من الاستفادة من الجزء المستثنى نظامًا من المبالغ المحجوزة في حسابه البنكي، وذلك من خلال التقديم للجهات المختصة وفق الضوابط المحددة.</p>
      },
      {
        icon: <Users size={20} className="text-gold" />,
        title: "الفئة المستفيدة من الخدمة",
        content: <p>تُقدّم هذه الخدمة لكل من لديه حجز قائم على حسابه البنكي، ويرغب في الحصول على النسبة النظامية المستثناة من الحجز، بما يضمن قدرته على تلبية احتياجاته الأساسية.</p>
      },
      {
        icon: <Target size={20} className="text-gold" />,
        title: "نطاق الخدمة (ماذا يشمل؟)",
        content: (
          <div>
            <p className="mb-3">نقدّم لك خدمة متكاملة لإدارة طلبك من البداية حتى النهاية:</p>
            <BulletList items={[
              "دراسة حالة الحجز والتأكد من إمكانية طلب الإتاحة",
              "مراجعة المستندات المتعلقة بالحجز والدخل",
              "توجيهك لاستكمال أي نواقص",
              "إعداد طلب إتاحة النسبة النظامية بشكل احترافي",
              "رفع الطلب للجهة المختصة",
              "متابعة مستمرة حتى صدور القرار",
              "إشعارك بجميع التحديثات أولًا بأول"
            ]} />
          </div>
        )
      },
      {
        icon: <ClipboardList size={20} className="text-gold" />,
        title: "خطوات التقديم",
        content: (
          <NumberedList items={[
            "تقديم الطلب الأولي عبر الموقع",
            "مراجعة الحالة والتأكد من انطباق الشروط",
            "تجهيز المستندات المطلوبة",
            "إعداد وتقديم الطلب رسميًا",
            "متابعة الطلب حتى صدور القرار"
          ]} />
        )
      },
      {
        icon: <Briefcase size={20} className="text-gold" />,
        title: "المستندات المطلوبة",
        content: (
          <div>
            <p className="mb-3">قد تشمل (حسب الحالة):</p>
            <BulletList items={[
              "الهوية الوطنية",
              "ما يثبت وجود الحجز على الحساب",
              "كشف حساب بنكي",
              "تعريف بالراتب أو إثبات الدخل",
              "أي مستندات إضافية تدعم الطلب"
            ]} />
          </div>
        )
      },
      {
        icon: <ShieldCheck size={20} className="text-gold" />,
        title: "معايير قبول الطلب",
        content: (
          <BulletList items={[
            "وجود حجز فعلي على الحساب البنكي",
            "وضوح مصدر الدخل",
            "انطباق الأنظمة المتعلقة بالنسب المستثناة",
            "اكتمال المستندات المطلوبة",
            "سياسات الجهة المختصة"
          ]} />
        )
      },
      {
        icon: <Star size={20} className="text-gold" />,
        title: "مميزات الخدمة",
        content: (
          <BulletList items={[
            "خبرة في إجراءات رفع طلبات الإتاحة",
            "معرفة دقيقة بالأنظمة المتعلقة بالحجز",
            "إعداد ملف احترافي يقلل من احتمالية الرفض",
            "توفير الوقت والجهد",
            "متابعة مستمرة حتى إغلاق الطلب"
          ]} />
        )
      },
      {
        icon: <AlertTriangle size={20} className="text-amber-500" />,
        title: "ملاحظات مهمة",
        content: (
          <WarningBox items={[
            "الإتاحة تكون وفق النسبة النظامية المعتمدة فقط",
            "لا يعني تقديم الطلب رفع الحجز بالكامل",
            "تخضع الموافقة للجهة المختصة والأنظمة المعمول بها",
            "قد تختلف الإجراءات حسب جهة التنفيذ أو البنك"
          ]} />
        )
      },
      {
        icon: <Info size={20} className="text-amber-600" />,
        title: "تنويه مهم",
        content: (
          <div className="p-4 rounded-xl bg-amber-500/10 border-r-4 border-amber-500 text-amber-900 dark:text-amber-200 text-[14px] sm:text-[15px] leading-[1.8] space-y-3">
            <p>نود التأكيد بأن دورنا يقتصر على تقديم الخدمات الاستشارية والإجرائية المتعلقة بطلبات إتاحة النسبة النظامية من المبالغ المحجوزة، حيث نقوم بدراسة الحالة، ومراجعة المستندات، وتقديم المشورة المهنية، إضافة إلى إعداد الطلب ورفعه ومتابعته وفق المتطلبات المعتمدة.</p>
            <p>كما نؤكد أننا لسنا جهة قضائية أو مصرفية ولا نمتلك أي صلاحية في إصدار قرارات إتاحة المبالغ أو رفضها، حيث إن القرار النهائي يعود للجهة المختصة وفق الأنظمة واللوائح المعمول بها.</p>
          </div>
        )
      }
    ]}
  />
);

export default ServiceInfoPage;
