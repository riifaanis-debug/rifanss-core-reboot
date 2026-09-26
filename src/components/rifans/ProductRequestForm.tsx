import React, { useEffect, useRef, useState } from 'react';
import { PageLayout } from './StaticPages';
import { Button } from './Shared';
import {
  Send, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight,
  Hash, User as UserIcon, Phone, Mail, MapPin, Building2, FileText, CreditCard, PenLine,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitRequest, uploadDocument, getProfile } from '../../lib/api';
import { supabase } from '@/integrations/supabase/client';
import { getProduct, INITIAL_FEE_SAR } from '../../data/sectionsCatalog';
import { formatAmount } from '../../lib/formatNumber';

interface Props {
  productId: string;
}

const REGION_CITIES: Record<string, string[]> = {
  'الرياض': ['الرياض', 'الدرعية', 'الخرج', 'المجمعة', 'الزلفي'],
  'مكة المكرمة': ['مكة المكرمة', 'جدة', 'الطائف', 'رابغ', 'الليث'],
  'المدينة': ['المدينة المنورة', 'ينبع', 'العلا', 'بدر'],
  'القصيم': ['بريدة', 'عنيزة', 'الرس', 'البكيرية'],
  'الشرقية': ['الدمام', 'الخبر', 'الظهران', 'القطيف', 'الأحساء', 'الجبيل'],
  'عسير': ['أبها', 'خميس مشيط', 'بيشة'],
  'تبوك': ['تبوك', 'الوجه', 'ضباء', 'تيماء'],
  'حائل': ['حائل', 'بقعاء'],
  'الحدود الشمالية': ['عرعر', 'رفحاء', 'طريف'],
  'جازان': ['جيزان', 'صبيا', 'أبو عريش'],
  'نجران': ['نجران', 'شرورة'],
  'الباحة': ['الباحة', 'بلجرشي', 'المندق'],
  'الجوف': ['سكاكا', 'القريات', 'دومة الجندل'],
};

type Step = 'form' | 'terms' | 'payment' | 'signature' | 'success';

export const ProductRequestForm: React.FC<Props> = ({ productId }) => {
  const { user, token } = useAuth();
  const found = getProduct(productId);

  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [resultId, setResultId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    mobile: '',
    email: '',
    region: '',
    city: '',
    notes: '',
  });
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [paid, setPaid] = useState(false); // marks user pressed "I paid"
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'transfer'>('paypal');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [drawing, setDrawing] = useState(false);

  // Prefill from profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const p: any = await getProfile();
        if (p) {
          setFormData((prev) => ({
            ...prev,
            fullName:
              p.full_name ||
              [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(' '),
            nationalId: p.national_id || user.national_id || '',
            mobile: p.phone || user.phone || '',
            email: p.email || '',
            region: p.region || '',
            city: p.city || '',
          }));
        } else {
          setFormData((prev) => ({
            ...prev,
            nationalId: user.national_id || '',
            mobile: user.phone || '',
          }));
        }
      } catch {/* noop */}
    })();
  }, [user]);

  // Setup signature canvas when entering signature step
  useEffect(() => {
    if (step !== 'signature') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setup = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = 140;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#003399';
        }
      }
    };
    setup();
    window.addEventListener('resize', setup);
    return () => window.removeEventListener('resize', setup);
  }, [step]);

  // Prompt login automatically if not authenticated
  useEffect(() => {
    if (!user || !token) {
      window.dispatchEvent(new CustomEvent('open-auth'));
    }
  }, [user, token]);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    setDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(cx - rect.left, cy - rect.top);
  };
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const cy = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(cx - rect.left, cy - rect.top);
    ctx.stroke();
  };
  const stopDraw = () => setDrawing(false);
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  };

  if (!found) {
    return (
      <PageLayout title="الخدمة غير موجودة">
        <div className="p-6 text-center">
          <p className="text-sm text-muted">عذراً، لم نعثر على هذه الخدمة.</p>
          <a href="#/" className="inline-block mt-4">
            <Button>العودة للرئيسية</Button>
          </a>
        </div>
      </PageLayout>
    );
  }

  const { product, section } = found;

  if (!user || !token) {
    return (
      <PageLayout title={`طلب: ${product.name}`}>
        <div className="p-6 text-center" dir="rtl">
          <div className="w-14 h-14 rounded-full bg-gold/15 mx-auto mb-3 flex items-center justify-center">
            <LogIn className="text-gold" size={22} />
          </div>
          <p className="text-sm text-muted mb-4">
            يجب تسجيل الدخول للتقدم بطلب الخدمة.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
            className="px-5 py-2 rounded-full bg-gold-gradient text-brand text-sm font-bold shadow"
          >
            تسجيل الدخول
          </button>
        </div>
      </PageLayout>
    );
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) return 'يرجى إدخال الاسم الكامل';
    if (!/^[0-9]{10}$/.test(formData.nationalId))
      return 'رقم هوية غير صحيح (10 أرقام)';
    if (!/^05[0-9]{8}$/.test(formData.mobile))
      return 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return 'بريد إلكتروني غير صحيح';
    if (!formData.region) return 'يرجى اختيار المنطقة';
    if (!formData.city) return 'يرجى اختيار المدينة';
    return '';
  };

  const goToTerms = () => {
    const err = validateForm();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');
    setStep('terms');
  };

  const submitFinal = async () => {
    if (!hasSignature) {
      setErrorMsg('يرجى التوقيع قبل الإرسال');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const signatureData = canvasRef.current?.toDataURL() || '';
      const payload = {
        type: 'product_request',
        details: `طلب خدمة: ${product.name} — ${section.name}`,
        data: {
          productId: product.id,
          productName: product.name,
          sectionId: section.id,
          sectionName: section.name,
          fee: INITIAL_FEE_SAR,
          paymentMethod,
          paymentConfirmedByClient: paid,
          ...formData,
          signature: signatureData,
        },
        files: [],
      };
      const result: any = await submitRequest(payload);
      const id = result?.id || '';
      setResultId(id);

      // Notify admin
      try {
        await supabase.functions.invoke('notify-admin', {
          body: {
            requestData: {
              id,
              type: payload.type,
              details: payload.details,
              status: 'pending',
              data: payload.data,
              files: [],
            },
            userData: {
              fullName: formData.fullName,
              email: formData.email,
              phone: formData.mobile,
              national_id: formData.nationalId,
            },
          },
        });
      } catch {/* ignore email errors */}

      setStep('success');
    } catch (e: any) {
      setErrorMsg(e?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    'w-full h-[52px] rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/[0.04] px-4 text-[15px] text-right text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition shadow-xs';

  return (
    <PageLayout
      title={`طلب: ${product.name}`}
      backLink={`#/product/${product.id}`}
      backText="العودة لصفحة الخدمة"
    >
      <div className="max-w-[800px] mx-auto px-4 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 pb-20 font-cairo" dir="rtl">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {(['form', 'terms', 'payment', 'signature'] as Step[]).map((s, i) => {
            const order = ['form', 'terms', 'payment', 'signature'];
            const currIdx = order.indexOf(step);
            const isDone = order.indexOf(s) < currIdx || step === 'success';
            const isCurrent = s === step;
            return (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border ${
                    isCurrent
                      ? 'bg-gold text-[#180020] border-gold shadow'
                      : isDone
                      ? 'bg-gold/20 text-[#180020] dark:text-gold border-gold/40'
                      : 'bg-white dark:bg-white/[0.05] text-gray-400 border-gray-200 dark:border-white/10'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={15} /> : i + 1}
                </div>
                {i < 3 && (
                  <div
                    className={`h-[2px] w-8 sm:w-12 ${
                      isDone || (currIdx > i) ? 'bg-gold' : 'bg-gray-200 dark:bg-white/10'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-[14px] text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* STEP 1 - FORM */}
        {step === 'form' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-right">
              <span className="text-[12px] font-bold text-gold block mb-1">
                {section.name}
              </span>
              <h2 className="text-[18px] md:text-[20px] font-bold text-[#180020] dark:text-white m-0">
                {product.name}
              </h2>
            </div>

            <FieldLabel icon={<UserIcon size={12} />} label="الاسم الكامل" />
            <input
              className={inputCls}
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              placeholder="الاسم الرباعي"
            />

            <FieldLabel icon={<Hash size={12} />} label="رقم الهوية الوطنية" />
            <input
              className={inputCls}
              inputMode="numeric"
              maxLength={10}
              value={formData.nationalId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nationalId: e.target.value.replace(/\D/g, ''),
                })
              }
              placeholder="10 أرقام"
            />

            <FieldLabel icon={<Phone size={12} />} label="رقم الجوال" />
            <input
              className={inputCls}
              inputMode="tel"
              maxLength={10}
              value={formData.mobile}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  mobile: e.target.value.replace(/\D/g, ''),
                })
              }
              placeholder="05xxxxxxxx"
            />

            <FieldLabel
              icon={<Mail size={12} />}
              label="البريد الإلكتروني (اختياري)"
            />
            <input
              className={inputCls}
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="example@email.com"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel icon={<MapPin size={12} />} label="المنطقة" />
                <select
                  className={inputCls}
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value, city: '' })
                  }
                >
                  <option value="">اختر</option>
                  {Object.keys(REGION_CITIES).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel icon={<Building2 size={12} />} label="المدينة" />
                <select
                  className={inputCls}
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  disabled={!formData.region}
                >
                  <option value="">اختر</option>
                  {(REGION_CITIES[formData.region] || []).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <FieldLabel
              icon={<FileText size={12} />}
              label="ملاحظات إضافية (اختياري)"
            />
            <textarea
              className={`${inputCls} min-h-[80px] resize-none`}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="أي تفاصيل تساعدنا في خدمتك..."
            />

            <button
              onClick={goToTerms}
              className="w-full mt-2 h-[52px] sm:h-[54px] rounded-xl bg-gold hover:bg-[#D8B979] text-[#180020] text-[15px] font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>التالي: الشروط والأحكام</span>
              <ArrowLeft size={16} />
            </button>
          </div>
        )}

        {/* STEP 2 - TERMS */}
        {step === 'terms' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 text-right text-[13px] leading-[26px] text-gray-700 dark:text-gray-300 max-h-[50vh] overflow-y-auto">
              <h3 className="text-[15px] font-bold text-[#180020] dark:text-gold mb-3">
                الشروط والأحكام لطلب الخدمة
              </h3>
              <p className="mb-2">
                <b>1.</b> أُقرّ بأن جميع البيانات المُدخلة صحيحة وكاملة، وأتحمّل
                المسؤولية النظامية عن أي بيانات غير صحيحة.
              </p>
              <p className="mb-2">
                <b>2.</b> أُفوّض شركة <b>ريفانس المالية</b> بمتابعة طلبي ضمن نطاق
                الخدمة المحددة (<b>{product.name}</b>) وفق الأنظمة والتعليمات
                المعمول بها في المملكة العربية السعودية.
              </p>
              <p className="mb-2">
                <b>3.</b> أوافق على دفع <b>رسوم فتح الملف</b> وقدرها{' '}
                <b className="text-[#180020] dark:text-gold font-mono">
                  {formatAmount(INITIAL_FEE_SAR)} ريال سعودي
                </b>
                ، وأُقرّ بأن هذه الرسوم غير مسترجعة بمجرد البدء بالعمل على الطلب.
              </p>
              <p className="mb-2">
                <b>4.</b> أتفهم أن أي رسوم أو أتعاب إضافية مرتبطة بإتمام الخدمة
                يتم الاتفاق عليها لاحقاً ويتم إصدار فاتورة مستقلة لها.
              </p>
              <p className="mb-2">
                <b>5.</b> أوافق على تواصل ريفانس المالية معي عبر الجوال أو
                الواتساب أو البريد الإلكتروني فيما يخص هذا الطلب.
              </p>
              <p>
                <b>6.</b> أعلم أن مدد إنجاز الخدمات قد تختلف بحسب الجهات الخارجية
                (البنوك، المحاكم، الهيئات) ولا تتحمل ريفانس المالية مسؤولية أي
                تأخير ناتج عن جهات خارجية.
              </p>
            </div>

            <label className="flex items-start gap-2.5 px-1 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 accent-gold"
              />
              <span className="text-[13px] sm:text-[14px] text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                أوافق على جميع الشروط والأحكام أعلاه وأُقرّ بصحة بياناتي.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full sm:w-auto px-6 h-[52px] sm:h-[54px] rounded-xl border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-300 text-[14px] font-bold flex items-center justify-center gap-1.5 cursor-pointer order-2 sm:order-1"
              >
                <ArrowRight size={15} /> رجوع
              </button>
              <button
                type="button"
                disabled={!agreedTerms}
                onClick={() => setStep('payment')}
                className="flex-1 h-[52px] sm:h-[54px] rounded-xl bg-gold hover:bg-[#D8B979] text-[#180020] text-[15px] font-black shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
              >
                <span>التالي: الدفع</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 - PAYMENT */}
        {step === 'payment' && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-[#B99A55]/10 border border-[#B99A55]/30 p-5 flex items-center justify-between">
              <div className="text-right">
                <span className="text-[12px] text-gray-600 dark:text-gray-400 block mb-0.5">
                  المبلغ المستحق
                </span>
                <span className="text-[14px] font-bold text-[#180020] dark:text-gold">
                  رسوم فتح الملف — {product.name}
                </span>
              </div>
              <div className="text-left font-mono">
                <span className="text-[26px] font-bold text-[#180020] dark:text-gold">
                  {formatAmount(INITIAL_FEE_SAR)}
                </span>
                <span className="text-[12px] text-gray-500 mr-1.5 font-cairo">
                  ريال سعودي
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4">
              <div className="text-[14px] font-bold text-[#180020] dark:text-white mb-3 text-right">
                اختر طريقة الدفع
              </div>
              <div className="space-y-2.5">
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-gold bg-gold/10' : 'border-gray-200 dark:border-white/10'}`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="accent-gold w-4 h-4"
                    />
                    <span className="text-[14px] font-bold text-gray-800 dark:text-gray-200">
                      الدفع الإلكتروني عبر PayPal
                    </span>
                  </div>
                  <CreditCard size={18} className="text-gold" />
                </label>
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${paymentMethod === 'transfer' ? 'border-gold bg-gold/10' : 'border-gray-200 dark:border-white/10'}`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="pm"
                      checked={paymentMethod === 'transfer'}
                      onChange={() => setPaymentMethod('transfer')}
                      className="accent-gold w-4 h-4"
                    />
                    <span className="text-[14px] font-bold text-gray-800 dark:text-gray-200">
                      التحويل البنكي لحساب الشركة
                    </span>
                  </div>
                  <Building2 size={18} className="text-gold" />
                </label>
              </div>
            </div>

            {paymentMethod === 'paypal' ? (
              <form
                action="https://www.paypal.com/cgi-bin/webscr"
                method="post"
                target="_blank"
                className="rounded-xl border border-gold/30 bg-white dark:bg-[#12031a] p-4 text-right"
              >
                <input type="hidden" name="cmd" value="_xclick" />
                <input type="hidden" name="hosted_button_id" value="7JC8Q2G4NFSP4" />
                <input type="hidden" name="item_name" value={`رسوم خدمة: ${product.name}`} />
                <input type="hidden" name="amount" value={(INITIAL_FEE_SAR / 3.75).toFixed(2)} />
                <input type="hidden" name="currency_code" value="USD" />
                <p className="text-[13px] text-gray-600 dark:text-gray-400 mb-3">
                  اضغط للدفع الآمن عبر PayPal — سيتم فتح نافذة دفع جديدة.
                </p>
                <button
                  type="submit"
                  className="w-full h-[52px] rounded-xl bg-[#003087] text-white text-[14px] font-bold active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard size={16} /> سداد الرسوم — <span className="font-mono">{formatAmount(INITIAL_FEE_SAR)}</span> ر.س
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 text-right text-[13px] text-gray-700 dark:text-gray-300 leading-[26px]">
                <div className="font-bold text-[#180020] dark:text-gold mb-1">
                  بيانات التحويل البنكي
                </div>
                <div>اسم المستفيد: <b>ريفانس المالية</b></div>
                <div>الآيبان: <b dir="ltr" className="font-mono">SA00 0000 0000 0000 0000 0000</b></div>
                <div className="text-[12px] mt-2 text-gray-500">
                  بعد التحويل، يرجى إرسال صورة الإيصال على واتساب{' '}
                  <a className="text-gold underline font-mono font-bold" href="https://wa.me/9668002440432" target="_blank" rel="noopener noreferrer">
                    8002440432
                  </a>
                </div>
              </div>
            )}

            <label className="flex items-start gap-2.5 px-1 cursor-pointer">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
                className="mt-1 w-4 h-4 accent-gold"
              />
              <span className="text-[13px] text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                أُقرّ بأنني قمت بسداد رسوم فتح الملف (<span className="font-mono">{formatAmount(INITIAL_FEE_SAR)}</span> ر.س).
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('terms')}
                className="w-full sm:w-auto px-6 h-[52px] sm:h-[54px] rounded-xl border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-300 text-[14px] font-bold flex items-center justify-center gap-1.5 cursor-pointer order-2 sm:order-1"
              >
                <ArrowRight size={15} /> رجوع
              </button>
              <button
                type="button"
                disabled={!paid}
                onClick={() => setStep('signature')}
                className="flex-1 h-[52px] sm:h-[54px] rounded-xl bg-gold hover:bg-[#D8B979] text-[#180020] text-[15px] font-black shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
              >
                <span>المتابعة للتوقيع الإلكتروني</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 - SIGNATURE */}
        {step === 'signature' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-4 text-right">
              <div className="flex items-center gap-2 text-[14px] font-bold text-[#180020] dark:text-white mb-2">
                <PenLine size={16} className="text-gold" />
                <span>التوقيع الإلكتروني لمقدم الطلب</span>
              </div>
              <p className="text-[13px] text-gray-500 mb-3">
                يرجى التوقيع داخل الإطار أدناه بإصبعك أو بالفأرة:
              </p>

              <div className="border border-gray-300 dark:border-gold/30 rounded-xl overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDraw}
                  onMouseMove={draw}
                  onMouseUp={stopDraw}
                  onMouseLeave={stopDraw}
                  onTouchStart={startDraw}
                  onTouchMove={draw}
                  onTouchEnd={stopDraw}
                  className="block w-full h-[140px] touch-none cursor-crosshair"
                />
              </div>
              <button
                type="button"
                onClick={clearSignature}
                className="mt-2 text-[12px] font-bold text-gold hover:underline cursor-pointer"
              >
                مسح التوقيع وإعادة المحاولة
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('payment')}
                className="w-full sm:w-auto px-6 h-[52px] sm:h-[54px] rounded-xl border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-300 text-[14px] font-bold flex items-center justify-center gap-1.5 cursor-pointer order-2 sm:order-1"
              >
                <ArrowRight size={15} /> رجوع
              </button>
              <button
                type="button"
                disabled={!hasSignature || submitting}
                onClick={submitFinal}
                className="flex-1 h-[52px] sm:h-[54px] rounded-xl bg-gold hover:bg-[#D8B979] text-[#180020] text-[15px] font-black shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
              >
                {submitting ? (
                  <span>جاري الإرسال...</span>
                ) : (
                  <>
                    <Send size={16} /> <span>إرسال وتوثيق الطلب</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-[12px] text-center text-gray-500 flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-gold" /> اتصال آمن — بياناتك محمية ومشفرة
            </div>
          </div>
        )}

        {/* STEP 5 - SUCCESS */}
        {step === 'success' && (
          <div className="text-center py-12 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/15 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-[20px] font-black text-[#180020] dark:text-white m-0">
              تم إرسال طلبك بنجاح!
            </h3>
            <p className="text-[14px] text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
              سنقوم بالتواصل معك خلال 24 ساعة عمل.
            </p>
            {resultId && (
              <div className="p-3 max-w-xs mx-auto rounded-xl bg-gold/10 border border-gold/30 text-[13px] text-gray-700 dark:text-gray-300">
                رقم مرجع الطلب: <b className="text-gold font-mono text-[15px]">{resultId}</b>
              </div>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <a
                href="#/dashboard"
                className="w-full sm:w-auto px-8 h-[52px] rounded-xl bg-gold hover:bg-[#D8B979] text-[#180020] text-[14px] font-black flex items-center justify-center shadow-sm"
              >
                الانتقال للوحة التحكم
              </a>
              <a
                href="#/"
                className="w-full sm:w-auto px-6 h-[52px] rounded-xl border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-300 text-[14px] font-bold flex items-center justify-center"
              >
                العودة للرئيسية
              </a>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

const FieldLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <div className="flex items-center gap-1 text-[11px] font-bold text-brand dark:text-gray-300 mb-1 mt-1 text-right">
    <span className="text-gold">{icon}</span>
    {label}
  </div>
);

export default ProductRequestForm;
