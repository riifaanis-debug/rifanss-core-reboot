import React from 'react';
import { 
  FileSearch, 
  Stethoscope, 
  FileSignature, 
  FolderCheck, 
  Send, 
  Clock, 
  Users, 
  ArrowLeft, 
  ChevronLeft,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import healthWaiverBanner from '@/assets/health-waiver-banner.jpg';
import { navigateTo } from '../../utils/scrollManager';

export const HealthDisabilityWaiverPage: React.FC = () => {
  const handleApplyClick = () => {
    window.dispatchEvent(
      new CustomEvent('open-waive-form', {
        detail: {
          requestType: 'إعفاء بسبب العجز الصحي',
          serviceTitle: 'تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي',
          prefill: {
            obligationType: 'عجز صحي',
            notes: 'تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي المثبت بتقرير طبي رسمي'
          }
        }
      })
    );
  };

  const servicesList = [
    {
      num: '01',
      title: 'دراسة الحالة',
      desc: 'مراجعة تفاصيل الالتزام التمويلي وحالة العجز الصحي والمستندات المتوفرة، وتحديد المتطلبات اللازمة للتقدم بطلب الإعفاء.',
      icon: FileSearch
    },
    {
      num: '02',
      title: 'مراجعة التقرير الطبي',
      desc: 'مراجعة التقرير الطبي الصادر من الجهة الرسمية المختصة، والتأكد من وضوح ما يثبت حالة العجز وعدم اللياقة الطبية للعمل.',
      icon: Stethoscope
    },
    {
      num: '03',
      title: 'تجهيز طلب الإعفاء',
      desc: 'إعداد وصياغة طلب الإعفاء بصورة احترافية ومنظمة، مع تضمين البيانات والمعلومات ذات العلاقة بالحالة.',
      icon: FileSignature
    },
    {
      num: '04',
      title: 'تجهيز المستندات',
      desc: 'تنظيم المستندات والتقارير المطلوبة وتجهيزها بالشكل المناسب للتقديم، مع مراجعة البيانات والمرفقات قبل رفع الطلب.',
      icon: FolderCheck
    },
    {
      num: '05',
      title: 'تقديم الطلب',
      desc: 'تقديم طلب الإعفاء إلى الجهة التمويلية المختصة من خلال القنوات والإجراءات المعتمدة لديها.',
      icon: Send
    },
    {
      num: '06',
      title: 'متابعة الطلب',
      desc: 'متابعة حالة الطلب والإجراءات المرتبطة به، والتعامل مع المتطلبات أو الملاحظات التي قد ترد من الجهة المختصة، وإطلاع العميل على مستجدات الطلب.',
      icon: Clock
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] dark:bg-[#08010C] text-gray-900 dark:text-gray-100 font-['Tajawal']" dir="rtl">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-5 sm:py-8">
        {/* Back Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else {
                navigateTo('#/');
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-black/5 dark:bg-white/5 hover:bg-gold/15 hover:text-gold dark:hover:text-gold border border-black/5 dark:border-white/10 transition-colors cursor-pointer"
          >
            <span>رجوع</span>
            <ChevronLeft size={14} className="text-gold" />
          </button>
        </div>

        {/* 1. صورة الخدمة الموجودة في الصفحة الرئيسية */}
        <div className="image-wrapper w-full max-w-4xl mx-auto mb-8 sm:mb-10 shadow-sm">
          <img 
            src={healthWaiverBanner} 
            alt="تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي - شركة ريفانس المالية" 
            className="w-full h-auto object-cover" 
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12">
          {/* 2. تعريف بالخدمة */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-gold/30 pb-3">
              <div className="w-2.5 h-6 rounded-full bg-gold" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#240738] dark:text-gold">
                تعريف بالخدمة
              </h2>
            </div>

            <div className="pr-4 border-r-4 border-gold space-y-3.5 text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed font-medium">
              <h3 className="font-bold text-[#240738] dark:text-white text-base sm:text-xl">
                خدمة تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي
              </h3>
              <p>
                هي خدمة متخصصة وموجّهة للعملاء الذين لديهم التزامات أو منتجات تمويلية قائمة (تمويل عقاري، تمويل شخصي، أو تمويل تأجيري) وتعذر عليهم السداد نتيجة عارض صحي أو عجز طبي مثبت بموجب تقارير رسمية صادرة من الجهات الطبية المختصة أدى إلى عدم لياقتهم الطبية للعمل وإنهاء خدمتهم.
              </p>
              <p>
                تتولى ريفانس من خلال فريقها المتخصص مراجعة الحالة والتقارير الطبية، وإعداد وصياغة ملف طلب الإعفاء بصورة نظامية متوافقة مع لوائح البنوك والجهات التمويلية، ورفع الطلب ومتابعته رسمياً حتى استلام خطاب إخلاء الطرف والمخالصة المالية النهائية.
              </p>
            </div>
          </section>

          {/* 3. من يمكنه الاستفادة من الخدمة */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-gold/30 pb-3">
              <div className="w-2.5 h-6 rounded-full bg-gold" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#240738] dark:text-gold">
                من يمكنه الاستفادة من الخدمة؟
              </h2>
            </div>

            <div className="flex items-start gap-4 p-5 sm:p-6 rounded-2xl bg-gold/10 dark:bg-white/[0.03] border border-gold/30 dark:border-white/10">
              <div className="w-12 h-12 rounded-xl bg-gold-gradient text-brand flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-1">
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
                  الخدمة مخصصة ومتاحة لكل عميل تنطبق عليه المعايير التالية:
                </p>
                <ul className="space-y-2.5 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span>لديه التزامات أو منتجات تمويلية قائمة لدى البنوك أو الشركات التمويلية بالمملكة.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span>يعاني من عجز صحي أو عارض طبي مثبت بموجب تقرير طبي رسمي صادر أو معتمد من جهة طبية مختصة.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                    <span>أدى العجز الطبي إلى عدم لياقته الطبية للعمل أو إنهاء خدمته وتعذر سداد الأقساط.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. ماذا تشمل الخدمة */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-gold/30 pb-3">
              <div className="w-2.5 h-6 rounded-full bg-gold" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#240738] dark:text-gold">
                ماذا تشمل الخدمة؟
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {servicesList.map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.title}
                    className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#14031c] border border-gold/25 dark:border-white/10 shadow-xs flex items-start gap-3.5"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center font-bold text-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gold">{item.num}</span>
                        <h4 className="text-base sm:text-lg font-bold text-brand dark:text-white">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ميثاق الشفافية والمصداقية */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1C0624] via-[#2A0835] to-[#160320] text-white border-2 border-gold/50 shadow-md space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-gold">المصداقية والشفافية</h3>
            <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-gray-200">
              <p>
                حرصًا من ريفانس المالية على الشفافية والمصداقية، فإن خدمة تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي لا تتطلب أي رسوم أو مبالغ مقدمًا.
              </p>
              <p>
                وفي حال عدم قبول طلب الإعفاء، لن يتحمل العميل أي رسوم مقابل تقديم الطلب، وتكون أي مستحقات مالية مرتبطة بالخدمة — إن وجدت — بعد قبول طلب الإعفاء رسميًا وإصدار خطاب المخالصة النهائية من الجهة التمويلية المختصة.
              </p>
            </div>
          </div>

          {/* 5. زر طلب الخدمة */}
          <div className="pt-4 pb-10 text-center space-y-4 border-t border-gold/30">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gold/15 text-gold mb-1">
              <HeartHandshake className="w-6 h-6" />
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-[#240738] dark:text-white">
              جاهز لبدء إجراءات تقديم طلب الإعفاء؟
            </h3>

            <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              فريقنا المختص جاهز لمراجعة حالتك والبدء في إعداد ملفك ومتابعته لدى الجهة التمويلية.
            </p>

            <div className="pt-2">
              <button
                onClick={handleApplyClick}
                className="inline-flex items-center justify-center gap-2.5 rounded-full px-8 sm:px-10 py-3.5 sm:py-4 bg-gold-gradient text-brand text-sm sm:text-base font-black shadow-lg hover:brightness-105 active:scale-95 transition-all cursor-pointer group"
              >
                <span>طلب الخدمة الآن</span>
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HealthDisabilityWaiverPage;
