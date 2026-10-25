import React from 'react';
import ShareButton from './ShareButton';
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
  HeartHandshake,
  ShieldCheck
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import Logo from './Logo';
import landingHero from '@/assets/waiver-landing-hero.jpg.asset.json';
import { navigateTo } from '../../utils/scrollManager';

export const HealthDisabilityWaiverPage: React.FC<{ landing?: boolean; onApply?: () => void }> = ({ landing, onApply }) => {
  const handleApplyClick = () => {
    if (onApply) { onApply(); return; }
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
      {landing ? (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-brand/95 backdrop-blur border-b border-gold/15 h-16 flex items-center justify-center pt-[env(safe-area-inset-top)]">
          <Logo className="h-11 w-auto" />
        </header>
      ) : <Header />}

      <main className={`max-w-5xl mx-auto px-4 sm:px-6 md:px-8 ${landing ? "pt-0" : "pt-5 sm:pt-8"} pb-5 sm:pb-8`}>
        {/* Back Button */}
        {!landing && <div className="flex justify-end mb-4">
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
        </div>}

        <div className="-mx-4 sm:-mx-6 md:-mx-8 mb-8 sm:mb-10">
          <img src={landingHero.url} alt="تقديم طلب إعفاء من المنتجات التمويلية - ريفانس المالية" className="block w-full h-auto" />
        </div>

        <div className="max-w-4xl mx-auto space-y-10 sm:space-y-12">
          <section className="pr-4 border-r-4 border-gold space-y-8">
            <h1 className="text-lg sm:text-2xl font-black leading-snug text-[#240738] dark:text-white">تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي</h1>
            <ShareButton title="تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي" />
            <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-white to-[#F6F2EA] dark:from-[#14031c] dark:to-[#14031c] border border-gold/30 shadow-sm space-y-4">
              <h2 className="text-lg sm:text-2xl font-black text-[#240738] dark:text-white">هل لديك عارض صحي أو عجز طبي ؟</h2>
              <p className="text-sm sm:text-lg leading-loose text-gray-600 dark:text-gray-300">تسبب في عدم لياقتك الطبية للعمل، مَما أدى إلى إنهاء خدمتك، ولا زال لديك تمويل عقاري أو تمويل شخصي أو تأجيري قائم، وتعذر عليك السداد !</p>
              <div className="border-t border-gold/25" />
              <h3 className="text-base sm:text-xl font-black text-gold">نحن في ريفانس المالية</h3>
              <p className="text-sm sm:text-lg leading-loose font-bold text-[#240738] dark:text-white">نؤمن أن الحلول المالية ليست مجرد أرقام أو معاملات، بل هي وسيلة لخلق أثر إنساني يعيد التوازن والاستقرار لحياة عملائنا.</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-base sm:text-xl font-black text-[#240738] dark:text-white">مبادرة ريفانس لرفع طلب الإعفاء</h3>
              <p className="text-sm sm:text-lg leading-loose text-gray-600 dark:text-gray-300">جاءت مبادرة رفع طلب الإعفاء من جميع الالتزامات التمويلية لدى البنوك والمصارف والشركات التمويلية كأحد أهم مساراتنا لدعم العملاء الذين لديهم عجز طبي مثبت بموجب تقارير رسمية صادرة أو معتمدة من الجهات الطبية المختصة.</p>
              <p className="text-sm sm:text-lg leading-loose font-bold text-[#240738] dark:text-white">بحكم خبرتنا وكفاءة فريقنا في ريفانس المكوَّن من نخبة متخصصة في المنازعات المصرفية والتمويلية، نؤكد لك قوة موقفنا ومتابعتنا الدقيقة حتى استلام خطاب المخالصة المالية</p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-gold/30 pb-3">
              <div className="w-2.5 h-7 rounded-full bg-gold" />
              <h2 className="text-lg sm:text-2xl font-black text-[#240738] dark:text-gold">شرح الخدمة</h2>
            </div>
            <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#14031c] border border-gold/25 space-y-5 text-sm sm:text-lg leading-loose text-gray-600 dark:text-gray-300">
              <p><strong className="text-[#240738] dark:text-white">خدمة تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي:</strong> هي خدمة متخصصة وموجّهة للعملاء الذين لديهم التزامات أو منتجات تمويلية قائمة (تمويل عقاري، تمويل شخصي، أو تمويل تأجيري) لدى أي بنك أو جهة تمويلية في المملكة، وتعذر عليهم السداد نتيجة عارض صحي أو عجز طبي مثبت بموجب تقارير رسمية صادرة من الجهات الطبية المختصة أدى إلى عدم لياقتهم الطبية للعمل وإنهاء خدمتهم.</p>
              <p>تتولى ريفانس المالية من خلال فريقها المتخصص مراجعة الحالة والتقارير الطبية، وإعداد وصياغة ملف طلب الإعفاء بصورة نظامية متوافقة مع لوائح البنك المركزي السعودي وسياسات الجهات التمويلية، ورفع الطلب ومتابعته رسميًا حتى صدور قرار الإعفاء واستلام خطاب المخالصة النهائية.</p>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 border-b border-gold/30 pb-3">
              <div className="w-2.5 h-7 rounded-full bg-gold" />
              <h2 className="text-lg sm:text-2xl font-black text-[#240738] dark:text-gold">شروط ومتطلبات تقديم الطلب</h2>
            </div>
            <ul className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#14031c] border border-gold/25 space-y-4 text-sm sm:text-lg text-gray-800 dark:text-gray-200 leading-loose">
              {[
                'تقرير طبي يوضح العارض الصحي وعدم القدرة على ممارسة الحياة اليومية بصورة طبيعية ويحتاج إلى مساعدة الآخرين',
                'قرار إنهاء الخدمة أو التقاعد الطبي',
                'تفويض ريفانس المالية لمتابعة الإجراءات لدى الجهة التمويلية وفق الأنظمة والتعليمات المعمول بها.',
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-gold shrink-0 mt-1" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#2A0835] to-[#160320] text-white border-2 border-gold/70 shadow-lg space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <ShieldCheck className="w-7 h-7 text-gold shrink-0" />
              <h3 className="text-lg sm:text-2xl font-black">المصداقية والشفافية</h3>
            </div>
            <div className="space-y-4 text-sm sm:text-base leading-loose text-gray-200">
              <p>حرصًا من ريفانس المالية على الشفافية والمصداقية، فإن خدمة تقديم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي <span className="text-gold font-bold">لا تتطلب أي رسوم أو مبالغ مقدمًا</span>.</p>
              <p>وفي حال عدم قبول طلب الإعفاء، لن يتحمل العميل أي رسوم مقابل تقديم الطلب، وتكون أي مستحقات مالية مرتبطة بالخدمة – إن وجدت – بعد قبول طلب الإعفاء رسميًا وإصدار خطاب المخالصة النهائية من الجهة التمويلية المختصة.</p>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-4 text-xs sm:text-sm">
              <span className="font-bold text-gold">«ريفانس المالية»</span>
              <span className="text-gray-300">«وضوح في الإجراءات، وشفافية في التعامل»</span>
            </div>
          </div>

          <div className="pt-8 pb-10 text-center space-y-4 border-t border-gold/30">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/15 text-gold mb-1">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-2xl font-black text-[#240738] dark:text-white">جاهز لبدء إجراءات تقديم طلب الإعفاء؟</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">فريقنا المختص جاهز لمراجعة حالتك والبدء في إعداد ملفك ومتابعته لدى الجهة التمويلية المختصة.</p>
            <div className="pt-4">
              <button
                onClick={handleApplyClick}
                className="inline-flex items-center justify-center gap-3 rounded-full px-12 sm:px-16 py-4 bg-[#2A0E32] border-2 border-gold text-white text-base sm:text-lg font-black shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <span>طلب الخدمة الآن</span>
                <ArrowLeft className="w-5 h-5 text-gold" />
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
