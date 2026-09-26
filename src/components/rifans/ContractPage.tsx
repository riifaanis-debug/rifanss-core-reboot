import React, { useState, useRef, useEffect } from 'react';
import rifansStampImg from '@/assets/rifans-stamp.png';
import rifansLogo from '@/assets/rifans-logo.png';
import { 
  X, CheckCircle, Download, Printer, ShieldCheck, PenTool, 
  ArrowRight, Loader2, AlertTriangle, Building2, UserCheck, 
  FileText, Calendar, CreditCard, Award, Check
} from 'lucide-react';
import { Button } from './Shared';
import { useAuth } from '../../contexts/AuthContext';
import { safeStringify, safeParse } from '../../utils/safeJson';
import { getSubmission, submitSignature, notifyAdminContractSigned } from '../../lib/api';
import { formatAmount } from '../../lib/formatNumber';
import { downloadContractPdf, printContractPdf } from '../../lib/generateContractPdf';

interface ContractPageProps {
  submissionId: string;
  onClose: () => void;
}

const ContractPage: React.FC<ContractPageProps> = ({ submissionId, onClose }) => {
  const { token } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contractRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAlreadySigned, setIsAlreadySigned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [submission, setSubmission] = useState<any>(null);

  const products = Array.isArray(submission?.data?.products)
    ? submission.data.products
    : (typeof submission?.data?.products === 'string' ? safeParse(submission.data.products, []) : []);
  const totalDebt = products.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0) || 0;

  const fetchSubmission = async () => {
    setIsLoading(true);
    try {
      const data = await getSubmission(submissionId);
      if (data) {
        setSubmission(data);
        if (data.signature_data) setIsAlreadySigned(true);
      }
    } catch (error) {
      console.error('Error fetching submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { if (token && submissionId) fetchSubmission(); }, [token, submissionId]);

  useEffect(() => {
    if (!isLoading && submission && !isAlreadySigned) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#0000FF'; }
      const resizeCanvas = () => {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = 140;
          if (ctx) { ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#0000FF'; }
        }
      };
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [isLoading, submission, isAlreadySigned]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true); setHasSignature(true);
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getContractPayload = () => {
    const isRescheduling = submission?.type === 'rescheduling_request' || submission?.type === 'scheduling_request';
    const isSeizedAmounts = submission?.type === 'seized_amounts_request';
    const contractTitle = isRescheduling
      ? 'عقد تفويض ومتابعة طلب جدولة منتجات تمويلية'
      : isSeizedAmounts
      ? 'عقد تفويض ومتابعة طلب إتاحة النسبة النظامية'
      : 'عقد تفويض ومتابعة طلب إعفاء تمويلي';

    return {
      submissionId,
      submission,
      products,
      totalDebt,
      contractTitle,
      isRescheduling,
      isSeizedAmounts,
      isAlreadySigned,
      signatureData: (isAlreadySigned && submission?.signature_data)
        ? submission.signature_data
        : (canvasRef.current?.toDataURL() || null),
      signedAt: submission?.signed_at || (isSuccess ? new Date().toISOString() : null),
      clientName: [submission?.data?.firstName, submission?.data?.middleName, submission?.data?.lastName].filter(Boolean).join(' ') || 'العميل الكريم',
      nationalId: submission?.data?.nationalId || submission?.data?.userNationalId || '---',
      mobile: submission?.data?.mobile || submission?.data?.phone || '---',
      bank: submission?.data?.bank || (isRescheduling ? 'الجهات التمويلية والبنوك' : 'البنك الأهلي السعودي'),
      contractDate: new Date(submission?.timestamp || Date.now()).toLocaleDateString('ar-SA'),
    };
  };

  const handlePrint = async () => {
    if (isPdfLoading) return;
    setIsPdfLoading(true);
    try {
      const data = getContractPayload();
      await printContractPdf(data);
    } catch (e) {
      console.error('Error printing contract:', e);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleDownload = async () => {
    if (isPdfLoading) return;
    setIsPdfLoading(true);
    try {
      const data = getContractPayload();
      await downloadContractPdf(data, `عقد ريفانيس المالية - ${submissionId}.pdf`);
    } catch (e) {
      console.error('Error downloading contract:', e);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleSignSubmit = async () => {
    if (!canvasRef.current || !hasSignature) return;
    setIsSubmitting(true);
    try {
      const signatureBase64 = canvasRef.current.toDataURL('image/png');
      await submitSignature(submissionId, signatureBase64);
      setIsSuccess(true);
      setIsAlreadySigned(true);
      notifyAdminContractSigned(
        submissionId,
        `${submission?.data?.firstName || ''} ${submission?.data?.lastName || ''}`.trim() || 'عميل',
        submission?.data?.phone || submission?.data?.mobile || ''
      );
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error) {
      console.error('Error submitting signature:', error);
      alert('حدث خطأ أثناء حفظ التوقيع، يرجى المحاولة مرة أخرى');
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center font-['Tajawal']" dir="rtl">
        <div className="relative mb-4">
          <Loader2 className="w-12 h-12 text-brand animate-spin" />
          <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold" size={20} />
        </div>
        <p className="text-brand font-bold text-base">جاري تجهيز وثيقة العقد...</p>
        <p className="text-muted text-xs mt-1">يتم جلب البيانات الموثقة للنظام</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center font-['Tajawal']" dir="rtl">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={32} />
        </div>
        <h3 className="text-lg font-bold text-brand mb-2">فشل تحميل العقد</h3>
        <p className="text-muted text-xs mb-6 max-w-xs">تعذر جلب تفاصيل العقد، يرجى إعادة المحاولة.</p>
        <div className="flex gap-2">
          <Button onClick={fetchSubmission} className="bg-brand text-white text-xs px-5 py-2">إعادة المحاولة</Button>
          <Button onClick={onClose} variant="outline" className="text-xs px-5 py-2">رجوع</Button>
        </div>
      </div>
    );
  }

  const isRescheduling = submission?.type === 'rescheduling_request' || submission?.type === 'scheduling_request';
  const isSeizedAmounts = submission?.type === 'seized_amounts_request';
  const contractTitle = isRescheduling
    ? 'عقد تفويض ومتابعة طلب جدولة منتجات تمويلية'
    : isSeizedAmounts
    ? 'عقد تفويض ومتابعة طلب إتاحة النسبة النظامية'
    : 'عقد تفويض ومتابعة طلب إعفاء تمويلي';

  const clientFullName = [submission?.data?.firstName, submission?.data?.middleName, submission?.data?.lastName].filter(Boolean).join(' ') || 'العميل الكريم';
  const clientNationalId = submission?.data?.nationalId || submission?.data?.userNationalId || '---';
  const clientMobile = submission?.data?.mobile || submission?.data?.phone || '---';
  const targetBank = submission?.data?.bank || (isRescheduling ? 'الجهات التمويلية والبنوك' : 'البنك الأهلي السعودي');
  const contractDateFormatted = new Date(submission?.timestamp || Date.now()).toLocaleDateString('ar-SA');

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-['Tajawal'] text-right" dir="rtl">
      
      {/* ── Sticky Mobile-Friendly Top Action Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-3 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button 
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#22042C] text-xs font-bold transition-colors active:scale-95"
            title="رجوع"
          >
            <ArrowRight size={16} className="rotate-180" />
            <span>رجوع</span>
          </button>
          <div className="hidden sm:block">
            <h2 className="text-xs font-bold text-brand leading-tight">عقد تقديم خدمات</h2>
            <p className="text-[10px] text-muted font-mono">رقم {submissionId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            disabled={isPdfLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-[#22042C] border border-gold/30 text-xs font-bold transition-all disabled:opacity-50 active:scale-95"
            title="طباعة العقد بصيغة A4"
          >
            {isPdfLoading ? <Loader2 size={15} className="animate-spin text-gold" /> : <Printer size={15} className="text-gold" />}
            <span>طباعة</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            disabled={isPdfLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22042C] hover:bg-[#22042C]/90 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 active:scale-95"
            title="تحميل العقد بصيغة PDF الرسمية"
          >
            {isPdfLoading ? <Loader2 size={15} className="animate-spin text-gold" /> : <Download size={15} className="text-gold" />}
            <span>تحميل PDF</span>
          </button>
        </div>
      </header>

      {/* ── Main Mobile View Document Viewer (Fluid, Full Width, Natural Scroll) ── */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-3 sm:px-6 py-4 pb-28">
        <div 
          ref={contractRef}
          className="bg-white rounded-2xl shadow-sm border border-gold/20 p-4 sm:p-7 space-y-6 text-[#222222]"
        >
          {/* Document Header Card */}
          <div className="border-b-2 border-gold/30 pb-4 text-center space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-right">
                <img src={rifansLogo} alt="ريفانس المالية" className="h-12 sm:h-14 w-auto object-contain" />
                <div>
                  <h1 className="text-sm sm:text-base font-black text-[#22042C] leading-tight">شركة ريفانس المالية</h1>
                  <span className="text-[10px] sm:text-xs text-gold font-bold">RIFANIS FINANCIAL COMPANY</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${isAlreadySigned ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                  {isAlreadySigned ? <><Check size={12} /> موثق وموقع</> : 'بانتظار التوقيع'}
                </span>
                <span className="text-[10px] text-muted font-mono">ملف: {submissionId}</span>
              </div>
            </div>

            {/* Official Title */}
            <div className="bg-[#FAF7FC] border border-brand/10 rounded-xl py-3 px-3 text-center">
              <h2 className="text-base sm:text-lg font-black text-[#22042C]">
                {contractTitle}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-2 text-[11px] sm:text-xs text-gray-600 font-medium">
                <span>رقم العقد: <strong className="font-mono text-[#22042C]">{submissionId}</strong></span>
                <span>تاريخ التحرير: <strong className="text-[#22042C]">{contractDateFormatted}</strong></span>
              </div>
            </div>
          </div>

          {/* الطرفان (Parties) - Responsive Cards */}
          <div className="space-y-2">
            <h3 className="text-xs sm:text-sm font-bold text-[#22042C] flex items-center gap-1.5">
              <Building2 size={16} className="text-gold" />
              طرفا العقد
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Party 1 */}
              <div className="bg-[#FAF7FC] border border-gold/25 rounded-xl p-3.5 space-y-1.5 text-xs sm:text-[13px]">
                <div className="font-bold text-[#22042C] border-b border-gold/20 pb-1 flex items-center justify-between">
                  <span>الطرف الأول (المفوض)</span>
                  <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-md">شركة معتمدة</span>
                </div>
                <div className="text-gray-700"><strong>الاسم:</strong> شركة ريفانس المالية</div>
                <div className="text-gray-700"><strong>الرقم الوطني الموحد:</strong> <span className="font-mono font-bold text-brand">7038821125</span></div>
                <div className="text-gray-700"><strong>يمثلها:</strong> AZZAH ALOBIDI (المدير العام)</div>
                <div className="text-gray-700"><strong>تفويض رقم:</strong> <span className="font-mono">DLG398908</span></div>
              </div>

              {/* Party 2 */}
              <div className="bg-[#FAF7FC] border border-gold/25 rounded-xl p-3.5 space-y-1.5 text-xs sm:text-[13px]">
                <div className="font-bold text-[#22042C] border-b border-gold/20 pb-1 flex items-center justify-between">
                  <span>الطرف الثاني (العميل)</span>
                  <span className="text-[10px] bg-gold/20 text-[#22042C] px-2 py-0.5 rounded-md">المفوض</span>
                </div>
                <div className="text-gray-700"><strong>الاسم:</strong> {clientFullName}</div>
                <div className="text-gray-700"><strong>رقم الهوية:</strong> <span className="font-mono font-bold text-brand">{clientNationalId}</span></div>
                <div className="text-gray-700"><strong>رقم الجوال:</strong> <span className="font-mono" dir="ltr">{clientMobile}</span></div>
              </div>
            </div>
          </div>

          {/* التمهيد */}
          <div className="space-y-2 bg-gray-50/70 border border-gray-200 rounded-xl p-3.5 sm:p-4">
            <h3 className="text-xs sm:text-sm font-bold text-[#22042C]">التمهيد:</h3>
            <p className="text-xs sm:text-sm leading-relaxed sm:leading-loose text-gray-800 text-right">
              {isRescheduling ? (
                <>
                  حيث إن الطرف الثاني لديه التزامات مالية قائمة لدى البنوك والجهات التمويلية، وحيث إن الطرف الأول يعد من الجهات المتخصصة ذات الخبرة والكفاءة المهنية العالية في مجال المنازعات المصرفية والتمويلية، ويضم نخبة من اللجان القانونية المؤهلة القادرة على دراسة الطلبات وتدقيق المستندات ومتابعة الإجراءات بشكل رسمي ونظامي مع البنوك والمصارف والجهات التمويلية وكافة الجهات التنظيمية ذات العلاقة.
                  وحيث إن الطرف الثاني قد أبدى رغبته الصريحة في التقدم بطلب إعادة جدولة المنتجات التمويلية القائمة لديه لدى البنوك والمصارف، وحيث إن الطرف الأول قد أثبت جدارته المهنية من خلال ما يملكه من لجان متخصصة وخبرات عملية في إدارة طلبات العملاء المقدمة إلى الجهات التمويلية.
                  وحيث إن هذا التمهيد يعد جزءاً لا يتجزأ من هذا العقد ومكملاً ومفسراً لبنوده، فقد اتفق الطرفان وهما بكامل الأهلية المعتبرة شرعاً ونظاماً على إبرام هذا العقد.
                </>
              ) : isSeizedAmounts ? (
                <>
                  حيث إن الطرف الثاني لديه مبالغ مالية محجوزة أو مستقطعة بما يتجاوز النسبة النظامية المقررة وفقاً للأنظمة السعودية، وحيث إن الطرف الأول يعد من الجهات المتخصصة ذات الخبرة والكفاءة المهنية العالية في مجال المنازعات المصرفية والتمويلية، ويضم نخبة من اللجان القانونية المؤهلة القادرة على دراسة الطلبات وتدقيق المستندات ومتابعة الإجراءات بشكل رسمي ونظامي مع البنوك والمصارف والجهات التمويلية وكافة الجهات التنظيمية ذات العلاقة.
                  وحيث إن الطرف الثاني قد أبدى رغبته الصريحة في التقدم بطلب إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز، وحيث إن هذا التمهيد يعد جزءاً لا يتجزأ من هذا العقد ومكملاً ومفسراً لبنوده، فقد اتفق الطرفان وهما بكامل الأهلية المعتبرة شرعاً ونظاماً على إبرام هذا العقد.
                </>
              ) : (
                <>
                  حيث إن الطرف الثاني قد تقدم وأفاد بأن لديه عجزاً طبياً مثبتاً بموجب تقارير رسمية صادرة من الجهات الطبية المختصة؛ وحيث إن الطرف الأول يُعد من الجهات المتخصصة ذات الخبرة والكفاءة المهنية العالية في مجال المنازعات المصرفية والتمويلية، ويضم نخبة من اللجان القانونية المؤهلة القادرة على دراسة الطلبات، وتدقيق المستندات والتقارير الطبية، ومتابعة الإجراءات بشكل رسمي ونظامي مع البنوك والمصارف والجهات التمويلية والهيئات الطبية وكافة الجهات التنظيمية ذات العلاقة؛ وحيث إن الطرف الثاني قد أبدى رغبته الصريحة في التقدم بطلب إعفاء من جميع التزاماته التمويلية القائمة لدى البنوك والمصارف؛ وحيث إن الطرف الأول قد أثبت جدارته المهنية من خلال ما يملكه من لجان متخصصة وخبرات عملية في إدارة طلبات العملاء المقدمة إلى الجهات التمويلية، وما حققه من نتائج إيجابية تسهم في حفظ حقوق العملاء وتحقيق مصالحهم؛ وحيث إن هذا التمهيد يُعد جزءاً لا يتجزأ من هذا العقد ومكملاً ومفسراً لبنوده؛ فقد اتفق الطرفان، وهما بكامل الأهلية المعتبرة شرعاً ونظاماً، على إبرام هذا العقد وفقاً لما يلي.
                </>
              )}
            </p>
          </div>

          {/* المواد القانونية (المادة 1 إلى 12) */}
          <div className="space-y-4">
            
            {/* المادة 1 */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (1): حجية التعامل الإلكتروني</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 text-right">
                يقر الطرفان بموافقتهما على إبرام هذا العقد واستخدام الوسائل الإلكترونية (البريد الإلكتروني والرسائل النصية) لتوثيقه، وتعد هذه الوسائل حجة ملزمة وقائمة بذاتها وفقاً لنظام التعاملات الإلكترونية السعودي، ولها ذات الحجية القانونية للتوقيع اليدوي أمام كافة الجهات الرسمية والقضائية.
              </p>
            </div>

            {/* المادة 2: موضوع العقد + المنتجات التمويلية */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (2): موضوع العقد والتفويض</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 text-right">
                {isRescheduling
                  ? `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب إعادة جدولة المنتجات التمويلية الخاصة به لدى ${targetBank}، وذلك فيما يتعلق بمنتجات التمويل الموضحة أدناه:`
                  : isSeizedAmounts
                  ? `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز لدى ${targetBank}، وذلك فيما يتعلق بالمبالغ والمنتجات الموضحة أدناه:`
                  : `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب الإعفاء المقدم من الطرف الثاني لدى ${targetBank}، وذلك فيما يتعلق بمنتجات التمويل الموضحة أدناه:`
                }
              </p>

              {/* المنتجات التمويلية (عرض مخصص للجوال) */}
              <div className="space-y-2 mt-2">
                <div className="text-[11px] sm:text-xs font-bold text-brand">المنتجات التمويلية المشمولة:</div>
                <div className="space-y-2">
                  {products.map((p: any, idx: number) => (
                    <div key={idx} className="bg-white border border-gray-200 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <CreditCard size={15} className="text-gold shrink-0" />
                        <div>
                          <span className="font-bold text-[#22042C]">{p.type}</span>
                          <span className="text-[11px] text-gray-500 mr-2 font-mono">({p.accountNumber || p.account_number || '---'})</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right font-bold text-red-700 font-mono text-sm">
                        {formatAmount(p.amount)} ر.س
                      </div>
                    </div>
                  ))}

                  {/* إجمالي المديونية */}
                  <div className="bg-[#FAF7FC] border border-gold/40 rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-[#22042C]">إجمالي المديونية التمويلية:</span>
                    <span className="text-base sm:text-lg font-black text-brand font-mono">{formatAmount(totalDebt)} ر.س</span>
                  </div>
                </div>
              </div>
            </div>

            {/* المادة 3 */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (3): نطاق التفويض</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700">يشمل التفويض الممنوح للطرف الأول الصلاحيات التالية:</p>
              <ol className="list-decimal pr-5 space-y-1 text-xs sm:text-sm text-gray-700">
                {isRescheduling ? (
                  <>
                    <li>الاطلاع على المستندات والبيانات المالية.</li>
                    <li>التواصل مع البنوك والجهات التمويلية.</li>
                    <li>رفع الطلبات ومتابعتها، وإعداد المذكرات النظامية والحضور النظامي عند الحاجة.</li>
                  </>
                ) : (
                  <>
                    <li>الاطلاع على التقارير الطبية والمستندات الرسمية.</li>
                    <li>التواصل مع البنوك والجهات التمويلية.</li>
                    <li>رفع الطلبات ومتابعتها، وإعداد المذكرات القانونية والحضور النظامي عند الحاجة.</li>
                  </>
                )}
              </ol>
            </div>

            {/* المادة 4 */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (4): التزامات الطرف الأول</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 text-right">
                يلتزم الطرف الأول بالمحافظة على سرية بيانات الطرف الثاني، وبذل أقصى درجات العناية المهنية، ورفع الطلبات بصيغة رسمية تعزز فرص القبول، وإبلاغ الطرف الثاني بالمستجدات دورياً.
              </p>
            </div>

            {/* المادة 5 */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (5): التزامات الطرف الثاني</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 text-right">
                يلتزم الطرف الثاني بتقديم كافة المستندات والبيانات الصحيحة، التعاون مع الطرف الأول لاستكمال النواقص، والالتزام بسداد الأتعاب المستحقة وفقاً لأحكام العقد.
              </p>
            </div>

            {/* المادة 6 */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-1.5 bg-gold/5 border-gold/30">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (6): المستحقات المالية والأتعاب</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-800 text-right">
                {isRescheduling
                  ? 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قرار الموافقة على إعادة جدولة المنتجات التمويلية وإتمام الإجراءات ذات العلاقة. وفي حال صدور القرار يستحق الطرف الأول أتعاباً مقطوعة قدرها: 2,000 ريال سعودي فقط.'
                  : isSeizedAmounts
                  ? 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قرار إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز. وفي حال صدور القرار، يستحق الطرف الأول أتعاباً مقطوعة قدرها (1%) من إجمالي المبالغ المستردة فعلياً.'
                  : 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قبول طلب الإعفاء وإصدار خطاب المخالصة المالية، وفي حال قبول طلب الإعفاء، يستحق الطرف الأول أتعاباً مقطوعة قدرها (4%) من إجمالي المبالغ المعفاة فعلياً.'
                }
              </p>
              <p className="text-xs sm:text-sm font-bold text-red-700 pt-1">
                "وفي حال عدم قبول الطلب، لا يحق للطرف الأول المطالبة بأي أتعاب"
              </p>
            </div>

            {/* المادة 7 */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (7): مدة العقد</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 text-right">
                {isRescheduling
                  ? 'يبدأ العمل بهذا العقد من تاريخ توقيعه، ويستمر سارياً حتى صدور قرار الجهة التمويلية بشأن طلب إعادة الجدولة، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.'
                  : isSeizedAmounts
                  ? 'يبدأ العمل بهذا العقد من تاريخ توقيعه، ويستمر سارياً حتى صدور قرار إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.'
                  : 'يبدأ العمل بهذا العقد من تاريخ توقيعه، ويستمر سارياً حتى قبول طلب الإعفاء، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.'
                }
              </p>
            </div>

            {/* المادة 8: سند لأمر */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (8): سند لأمر وإقرار دين واجب النفاذ</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 text-right">
                {isRescheduling
                  ? 'اتفق الطرفان على أن يعد هذا العقد بمثابة سند لأمر واجب النفاذ وفقاً لأحكام نظام الأوراق التجارية ونظام التنفيذ السعودي. ويقر الطرف الثاني إقراراً صريحاً ونهائياً بالتزامه بسداد أتعاب الطرف الأول وقدرها 2,000 ريال سعودي عند صدور قرار الموافقة على طلب إعادة الجدولة.'
                  : isSeizedAmounts
                  ? 'اتفق الطرفان على أن يُعد هذا العقد بمثابة سندٍ لأمرٍ واجب النفاذ وفقًا لأحكام نظام الأوراق التجارية ونظام التنفيذ السعودي، ويقر الطرف الثاني إقرارًا صريحًا ونهائيًا بالتزامه بسداد أتعاب الطرف الأول بنسبة (1%) من إجمالي المبالغ المستردة فعلياً، وذلك فور صدور قرار إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز.'
                  : 'اتفق الطرفان على أن يُعد هذا العقد بمثابة سندٍ لأمرٍ واجب النفاذ وفقًا لأحكام نظام الأوراق التجارية ونظام التنفيذ السعودي، ويقر الطرف الثاني إقرارًا صريحًا ونهائيًا بالتزامه بسداد أتعاب الطرف الأول بنسبة (4%) من إجمالي مبالغ المنتجات التمويلية التي يتم إعفاؤه منها، وذلك فور قبول طلب الإعفاء واستلام خطاب المخالصة المالية.'
                }
              </p>

              {/* بطاقة بيانات السند لأمر */}
              <div className="bg-[#FAF7FC] border border-gold/30 rounded-xl p-3 space-y-1.5 text-xs">
                <div className="font-bold text-brand border-b border-gold/20 pb-1">بيانات السند لأمر الملحق:</div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500">رقم السند:</span>
                  <span className="font-mono font-bold text-brand">{submissionId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500">قيمة السند:</span>
                  <span className="font-bold text-[#22042C]">{isRescheduling ? '2,000 ريال سعودي' : isSeizedAmounts ? '1% من المبالغ المستردة' : '4% من المبالغ المعفاة'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-500">تاريخ الاستحقاق:</span>
                  <span className="font-medium text-[#22042C]">{isRescheduling ? 'عند صدور الموافقة' : isSeizedAmounts ? 'عند صدور قرار الإتاحة' : 'عند قبول طلب الإعفاء'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">مكان الوفاء:</span>
                  <span className="font-medium text-[#22042C]">مدينة جدة – المملكة العربية السعودية</span>
                </div>
              </div>
            </div>

            {/* المادة 9 */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (9): أحكام عامة</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 text-right">
                يخضع العقد لأنظمة المملكة العربية السعودية. لا يُعد أي تعديل نافذاً إلا إذا كان مكتوباً وموقعاً من الطرفين.
              </p>
            </div>

            {/* المادة 10 */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (10): الإقرار والتنازل عن الدفوع</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700">يُقر الطرف الثاني إقراراً صريحاً ونهائياً بما يلي:</p>
              <ol className="list-decimal pr-5 space-y-1 text-xs sm:text-sm text-gray-700">
                <li>صحة جميع البيانات والمستندات المقدمة منه.</li>
                <li>صحة احتساب الأتعاب وفق ما ورد في هذا العقد.</li>
                <li>التنازل عن أي دفوع أو منازعات تتعلق بسند الأمر متى ما تم إصداره عبر منصة نافذ وفق أحكام هذا العقد.</li>
                <li>عدم الطعن أو الاعتراض على التنفيذ أمام محكمة التنفيذ إلا في الحدود التي يجيزها النظام.</li>
              </ol>
            </div>

            {/* المادة 11 */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-1.5">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (11): الإقرار والقبول النهائي</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 text-right">
                يُقر الطرف الثاني بما يلي: اطلاعه الكامل على العقد وفهمه لآثاره، صحة التفويض الممنوح، صحة احتساب الأتعاب، وأن هذا الإقرار حجة قاطعة وملزمة أمام جميع الجهات القضائية والتنفيذية.
              </p>
            </div>

            {/* المادة 12 */}
            <div className="border border-gray-200 rounded-xl p-3.5 space-y-1.5 bg-gray-50/70">
              <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">المادة (12): التفويض الرسمي</h4>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-700 text-right">
                {isRescheduling ? (
                  <>
                    أقر أنا الموقع أدناه وبكامل أهليتي المعتبرة شرعاً ونظاماً بأنني قد فوضت شركة ريفانس المالية، سجل تجاري رقم 7038821125، تفويضاً كاملاً غير مشروط بمراجعة كافة الجهات الحكومية والخاصة والجهات التمويلية والبنوك والمصارف وشركات التمويل وشركة المعلومات الائتمانية (سمة)، وذلك للاطلاع على كافة بياناتي الائتمانية والتمويلية ومتابعة كافة الإجراءات.
                  </>
                ) : (
                  <>
                    أقر أنا الموقع أدناه وبكامل أهليتي المعتبرة شرعاً ونظاماً بأنني قد فوضت شركة ريفانس المالية، سجل تجاري رقم 7038821125 تفويضاً كاملاً غير مشروط بمراجعة كافة الجهات الحكومية والخاصة والجهات التمويلية (البنوك والمصارف وشركات التمويل) وشركة المعلومات الائتمانية (سمة)، وذلك للاطلاع على كافة بياناتي الائتمانية والتمويلية والطبية ومتابعة طلبات الإعفاء لدى البنك المركزي والجهات المختصة.
                  </>
                )}
              </p>
            </div>

          </div>

          {/* ══════════ التواقيع والاعتماد الإلكتروني (Signatures) ══════════ */}
          <div className="pt-4 border-t-2 border-gold/30 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-[#22042C]">التواقيع والاعتماد الإلكتروني</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* الطرف الأول (الشركة) */}
              <div className="border border-gray-200 rounded-xl p-3 text-center space-y-2 bg-[#FAF7FC]">
                <span className="text-xs font-bold text-[#22042C] block">توقيع وختم الطرف الأول</span>
                <div className="h-28 flex items-center justify-center">
                  <img src={rifansStampImg} alt="ختم شركة ريفانس" className="h-full w-auto object-contain mix-blend-multiply" />
                </div>
                <div className="text-[11px] text-gray-600 font-medium">شركة ريفانس المالية</div>
              </div>

              {/* الطرف الثاني (العميل) */}
              <div className="border border-gray-200 rounded-xl p-3 text-center space-y-2 bg-[#FAF7FC]">
                <span className="text-xs font-bold text-[#22042C] block">توقيع الطرف الثاني (العميل)</span>
                <div className="h-28 bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center p-2 overflow-hidden">
                  {isSuccess || isAlreadySigned ? (
                    <div className="space-y-1 text-center">
                      <img 
                        src={(isAlreadySigned && submission.signature_data) ? submission.signature_data : (canvasRef.current?.toDataURL() || '')} 
                        alt="توقيع العميل" 
                        className="h-14 max-w-full object-contain mx-auto" 
                      />
                      <div className="text-xs font-bold text-brand">{clientFullName}</div>
                      <div className="text-[10px] text-muted">{new Date(submission.signed_at || submission.timestamp).toLocaleDateString('ar-SA')}</div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-xs flex flex-col items-center gap-1">
                      <PenTool size={20} className="opacity-50" />
                      <span>بانتظار اعتماد التوقيع أدناه...</span>
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-gray-600 font-medium">{clientFullName}</div>
              </div>
            </div>
          </div>

          {/* Footer inside contract */}
          <div className="border-t border-gray-200 pt-3 text-center text-[10px] sm:text-xs text-gray-500 space-y-1">
            <p>هذه الوثيقة صادرة عن النظام الإلكتروني لشركة ريفانس المالية وتعتبر وثيقة رسمية ملزمة للطرفين فور اعتمادها.</p>
            <p className="font-mono text-gold font-bold">www.rifanss.com • 800 2440 432 • جدة، المملكة العربية السعودية</p>
          </div>

        </div>
      </main>

      {/* ── Fixed Bottom Signing Bar for Mobile (Only if not signed) ── */}
      {(!isSuccess && !isAlreadySigned) && (
        <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gold/30 p-3 sm:p-4 z-30 shadow-lg">
          <div className="max-w-2xl mx-auto space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand flex items-center gap-1.5">
                <PenTool size={14} className="text-gold" />
                ارسم توقيعك في المربع أدناه:
              </label>
              <button 
                onClick={clearSignature}
                className="text-[11px] text-red-600 hover:text-red-700 font-bold px-2 py-0.5 rounded transition-colors"
              >
                مسح التوقيع
              </button>
            </div>

            <div className="bg-[#FAF7FC] border-2 border-dashed border-gold/40 rounded-xl h-28 relative shadow-inner overflow-hidden">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair touch-none"
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <p className="text-xs text-muted font-bold">وقّع هنا بإصبعك أو الماوس</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSignSubmit}
                disabled={!hasSignature || isSubmitting}
                className="flex-1 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> جاري الاعتماد...</>
                ) : (
                  <>اعتماد التوقيع وإرسال العقد <ArrowRight size={15} className="rotate-180" /></>
                )}
              </Button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#22042C] rounded-xl text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-gold/30">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
              <CheckCircle size={36} />
            </div>
            <h3 className="text-lg font-black text-brand">تم توقيع العقد بنجاح</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              شكراً لك {clientFullName}، تم توثيق واعتماد توقيعك رسمياً في النظام.
            </p>
            <Button onClick={onClose} className="w-full py-2.5 bg-brand text-white rounded-xl text-xs font-bold">
              العودة إلى لوحة التحكم
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContractPage;
