import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Download, Printer, Loader2, FileText, Phone, Mail, Globe, 
  MapPin, FileCheck, User, Users, ArrowRight, CheckCircle, ShieldCheck 
} from 'lucide-react';
import { Button } from './Shared';
import { useAuth } from '../../contexts/AuthContext';
import { getPromissoryNoteById, signPromissoryNote } from '../../lib/api';
import { formatAmount } from '../../lib/formatNumber';
import { numberToArabicWords } from '../../lib/arabicNumberToWords';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import rifansLogo from '@/assets/rifans-logo.png';
import rifansStampImg from '@/assets/rifans-stamp.png';

interface PromissoryNotePageProps {
  noteId: string;
  onClose: () => void;
}

// Build full Arabic Hijri + Gregorian date label
const buildIssueDate = (iso: string) => {
  const d = new Date(iso);
  const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(d);
  const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  const gregorian = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  const time = new Intl.DateTimeFormat('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: true }).format(d);
  return `${dayName} ، ${hijri} هـ ، الموافق ${gregorian} ، ${time}`;
};

const PromissoryNotePage: React.FC<PromissoryNotePageProps> = ({ noteId, onClose }) => {
  const { user } = useAuth();
  const printSheetRef = useRef<HTMLDivElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [note, setNote] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPromissoryNoteById(noteId);
      setNote(data);
    } catch (err) {
      console.error('Error fetching promissory note:', err);
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const isOwner = !!(user && note && (user.id === note.user_id));
  const isAdmin = user?.role === 'admin';
  const isSigned = !!note?.signed_at;

  // ----- Signature canvas handlers -----
  const getCanvasPos = (canvas: HTMLCanvasElement, e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { x, y } = getCanvasPos(canvas, e);
    ctx.beginPath(); ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { x, y } = getCanvasPos(canvas, e);
    ctx.lineTo(x, y); ctx.strokeStyle = '#1d4ed8'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
    setHasSignature(true);
  };

  const endDraw = () => setIsDrawing(false);

  const clearSig = () => {
    const canvas = sigCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const submitSignature = async () => {
    if (!hasSignature || !sigCanvasRef.current) return;
    setIsSubmitting(true);
    try {
      const sig = sigCanvasRef.current.toDataURL('image/png');
      await signPromissoryNote(noteId, sig);
      await fetchData();
    } catch (err) {
      console.error('signing failed', err);
      alert('تعذر حفظ التوقيع، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async () => {
    const el = printSheetRef.current;
    if (!el) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(el, { quality: 1, backgroundColor: '#ffffff', pixelRatio: 2 });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2;

      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => { img.onload = res; });
      const ratio = img.width / img.height;
      let drawW = availW;
      let drawH = drawW / ratio;
      if (drawH > availH) { drawH = availH; drawW = drawH * ratio; }
      const x = (pageW - drawW) / 2;
      const y = (pageH - drawH) / 2;
      pdf.addImage(dataUrl, 'PNG', x, y, drawW, drawH);
      pdf.save(`سند لأمر ريفانس المالية - ${noteId}.pdf`);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-6 text-center font-['Tajawal']" dir="rtl">
        <Loader2 className="w-12 h-12 text-brand animate-spin mb-3" />
        <p className="text-brand font-bold text-sm">جاري جلب بيانات سند الأمر...</p>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-4 p-6 font-['Tajawal']" dir="rtl">
        <FileText className="text-muted" size={48} />
        <p className="text-muted text-sm font-bold">لم يتم العثور على سند الأمر</p>
        <Button onClick={onClose} className="bg-brand text-white text-xs px-6 py-2">العودة</Button>
      </div>
    );
  }

  const issueDateLabel = buildIssueDate(note.created_at);
  const wordsAmount = note.amount_in_words || numberToArabicWords(Number(note.amount) || 0);
  const formattedAmount = `${formatAmount(Number(note.amount) || 0)} ر.س`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col font-['Tajawal'] text-right" dir="rtl">
      
      {/* ── Sticky Mobile-Friendly Top Action Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-3 sm:px-6 py-2.5 flex items-center justify-between print:hidden">
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
            <h2 className="text-xs font-bold text-brand leading-tight">سند لأمر إلكتروني</h2>
            <p className="text-[10px] text-muted font-mono">رقم {note.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-[#22042C] border border-gold/30 text-xs font-bold transition-all active:scale-95"
            title="طباعة السند"
          >
            <Printer size={15} className="text-gold" />
            <span>طباعة</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22042C] hover:bg-[#22042C]/90 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 active:scale-95"
            title="تحميل السند بصيغة PDF الرسمية"
          >
            {isDownloading ? <Loader2 size={15} className="animate-spin text-gold" /> : <Download size={15} className="text-gold" />}
            <span>تحميل PDF</span>
          </button>
        </div>
      </header>

      {/* ── Main Mobile View Document Viewer (Fluid, Full Width, Natural Scroll) ── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-3 sm:px-6 py-4 pb-24 print:hidden">
        <div className="bg-white rounded-2xl shadow-sm border border-gold/20 p-4 sm:p-7 space-y-5 text-[#222222]">
          
          {/* Document Header Card */}
          <div className="border-b-2 border-gold/30 pb-4 space-y-3 text-center">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-right">
                <img src={rifansLogo} alt="ريفانس المالية" className="h-12 sm:h-14 w-auto object-contain" />
                <div>
                  <h1 className="text-sm sm:text-base font-black text-[#22042C] leading-tight">شركة ريفانس المالية</h1>
                  <span className="text-[10px] sm:text-xs text-gold font-bold">RIFANIS FINANCIAL COMPANY</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${isSigned ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                  {isSigned ? <><CheckCircle size={12} /> موثق وموقع</> : 'بانتظار التوقيع'}
                </span>
                <span className="text-[10px] text-muted font-mono">سند رقم: {note.id}</span>
              </div>
            </div>

            {/* Official Title */}
            <div className="bg-[#FAF7FC] border border-brand/10 rounded-xl py-3 px-3 text-center">
              <h2 className="text-lg sm:text-xl font-black text-[#22042C]">سند لأمر</h2>
              <p className="text-xs text-gray-600 mt-1">سند لأمر واجب النفاذ وفق نظام الأوراق التجارية ونظام التنفيذ السعودي</p>
            </div>
          </div>

          {/* تفاصيل السند (Amount, Dates, Cities) */}
          <div className="space-y-2.5">
            <div className="bg-brand text-white px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs sm:text-sm">
              <FileText size={16} className="text-gold shrink-0" />
              <span>تفاصيل السند</span>
            </div>

            <div className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-2.5 text-xs sm:text-[13px]">
              {/* Highlighted Amount */}
              <div className="bg-white border border-gold/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-gray-600 font-bold">قيمة السند رقماً:</span>
                <span className="text-lg sm:text-xl font-black text-brand font-mono">{formattedAmount}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-gray-200">
                <span className="text-gray-500 font-medium">قيمة السند كتابة:</span>
                <span className="font-bold text-[#22042C]">{wordsAmount}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-gray-200">
                <span className="text-gray-500 font-medium">تاريخ الاستحقاق:</span>
                <span className="font-bold text-[#22042C]">{note.due_date || 'عند الطلب'}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-gray-200">
                <span className="text-gray-500 font-medium">تاريخ الإنشاء:</span>
                <span className="text-gray-700">{issueDateLabel}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-gray-500 text-[11px] block">مدينة الإصدار:</span>
                  <span className="font-bold text-[#22042C]">{note.issue_city || 'جدة'}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <span className="text-gray-500 text-[11px] block">مدينة الوفاء:</span>
                  <span className="font-bold text-[#22042C]">{note.payment_city || 'جدة'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل المدين (Debtor) */}
          <div className="space-y-2.5">
            <div className="bg-brand text-white px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs sm:text-sm">
              <User size={16} className="text-gold shrink-0" />
              <span>تفاصيل المدين (الطرف الملتزم)</span>
            </div>

            <div className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs sm:text-[13px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-gray-200">
                <span className="text-gray-500 font-medium">اسم المدين الكامل:</span>
                <span className="font-bold text-[#22042C]">{note.debtor_name}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                <span className="text-gray-500 font-medium">رقم الهوية الوطنية / الإقامة:</span>
                <span className="font-mono font-bold text-brand">{note.debtor_national_id}</span>
              </div>
            </div>
          </div>

          {/* تفاصيل الدائن (Creditor) */}
          <div className="space-y-2.5">
            <div className="bg-brand text-white px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs sm:text-sm">
              <Users size={16} className="text-gold shrink-0" />
              <span>تفاصيل الدائن (المستفيد)</span>
            </div>

            <div className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs sm:text-[13px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-gray-200">
                <span className="text-gray-500 font-medium">اسم الدائن:</span>
                <span className="font-bold text-[#22042C]">شركة ريفانس المالية</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-gray-200">
                <span className="text-gray-500 font-medium">الرقم الوطني الموحد:</span>
                <span className="font-mono font-bold text-brand">7038811125</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                <span className="text-gray-500 font-medium">يمثلها قانونياً:</span>
                <span className="text-gray-700">AZZAH Ali ALOBIDI</span>
              </div>
            </div>
          </div>

          {/* صيغة التعهد النظامية (Pledge) */}
          <div className="border-2 border-gold/40 rounded-xl p-4 bg-gold/5 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-brand">صيغة التعهد النظامية:</h4>
            <p className="text-xs sm:text-sm leading-relaxed text-gray-800 text-right font-bold">
              أتعهد بأن أدفع لأمر شركة ريفانس المالية دون قيد أو شرط مبلغاً وقدره (
              <span className="text-brand font-black underline underline-offset-4 mx-1">
                {formattedAmount}
              </span>
              ) وفق البيانات المذكورة أعلاه. ولحامل هذا السند حقُّ الرجوع دون أي مصاريف أو احتجاج بعدم الوفاء.
            </p>
          </div>

          {/* السند الإلكتروني والإقرار النظامي */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs space-y-2 text-gray-700 text-right">
            <p>
              هذا السند لأمر صادر من خلال منصة ريفانس الإلكترونية بموجب العقد الإلكتروني رقم : 
              <strong className="font-mono text-brand mx-1">({note.contract_id || note.submission_id})</strong>
              وقد تم إنشاؤه والمصادقة عليه إلكترونياً.
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              ويُقر المدين باطلاعه الكامل على العقد وفهمه لآثاره، وصحة احتساب الأتعاب، والتنازل عن أي دفع أو منازعات تتعلق بسند الأمر وعدم الطعن أو الاعتراض على التنفيذ أمام محكمة التنفيذ إلا في الحدود التي يجيزها النظام، وأن هذا الإقرار حجة قاطعة وملزمة أمام جميع الجهات القضائية والتنفيذية.
            </p>
          </div>

          {/* التوقيع والاعتماد */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <h4 className="text-xs sm:text-sm font-bold text-[#22042C]">التوقيع والاعتماد الرسمي</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* توقيع المدين */}
              <div className="border border-gray-200 rounded-xl p-3 bg-[#FAF7FC] text-center space-y-2">
                <span className="text-xs font-bold text-[#22042C] block">توقيع المدين</span>
                <div className="h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                  {isSigned && note.signature_data ? (
                    <img src={note.signature_data} alt="توقيع المدين" className="h-full w-auto object-contain" />
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">بانتظار توقيع المدين</span>
                  )}
                </div>
                <span className="text-[11px] text-gray-600 block">{note.debtor_name}</span>
              </div>

              {/* ختم الشركة */}
              <div className="border border-gray-200 rounded-xl p-3 bg-[#FAF7FC] text-center space-y-2">
                <span className="text-xs font-bold text-[#22042C] block">ختم المستفيد (الدائن)</span>
                <div className="h-24 flex items-center justify-center">
                  <img src={rifansStampImg} alt="ختم شركة ريفانس" className="h-full w-auto object-contain mix-blend-multiply" />
                </div>
                <span className="text-[11px] text-gray-600 block">شركة ريفانس المالية</span>
              </div>
            </div>
          </div>

          {/* Footer Contact Details */}
          <div className="border-t border-gray-200 pt-3 text-center text-[10px] sm:text-[11px] text-gray-500 space-y-1">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-medium">
              <span className="flex items-center gap-1"><Phone size={12} className="text-gold" /> 800 2440 432</span>
              <span className="flex items-center gap-1"><Mail size={12} className="text-gold" /> info@rifans.net</span>
              <span className="flex items-center gap-1"><Globe size={12} className="text-gold" /> www.rifanss.com</span>
              <span className="flex items-center gap-1"><MapPin size={12} className="text-gold" /> جدة، المملكة العربية السعودية</span>
            </div>
          </div>

        </div>

        {/* Signature Capture Pad for mobile (Only if not signed) */}
        {isOwner && !isSigned && !isAdmin && (
          <div className="mt-4 bg-white rounded-2xl border border-gold/30 shadow-md p-4 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-brand flex items-center gap-1.5">
              <FileCheck size={16} className="text-gold" />
              توقيع المدين على سند الأمر
            </h3>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              بالتوقيع أدناه، تُقر بقبولك جميع البنود الواردة أعلاه وبصحة المبلغ المذكور، وأنه التزام نظامي واجب النفاذ.
            </p>
            <div className="border-2 border-dashed border-gold/40 rounded-xl bg-[#FAF7FC] h-28 relative overflow-hidden">
              <canvas
                ref={sigCanvasRef}
                className="w-full h-full cursor-crosshair touch-none bg-white"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                  <p className="text-xs text-muted font-bold">وقّع هنا بإصبعك أو الماوس</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={submitSignature} 
                disabled={!hasSignature || isSubmitting} 
                className="flex-1 bg-brand text-white py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                {isSubmitting ? 'جاري الحفظ...' : 'اعتماد التوقيع وإصدار السند'}
              </Button>
              <button 
                onClick={clearSig} 
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
              >
                مسح التوقيع
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════
          OFFSCREEN DEDICATED A4 PRINT SHEET (Used exclusively for PDF & Print)
          ══════════════════════════════════════════════════════════════ */}
      <div 
        ref={printSheetRef}
        className="fixed -left-[9999px] -top-[9999px] w-[794px] min-h-[1123px] bg-white px-8 py-8 text-right print:static print:w-full print:min-h-0 print:p-0 print:m-0"
        dir="rtl"
        style={{ fontFamily: 'Tajawal, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b pb-3 border-gray-200">
          <div className="flex items-center gap-3">
            <img src={rifansLogo} alt="ريفانس المالية" className="h-16 w-auto object-contain" />
            <div>
              <div className="text-[17px] font-black text-[#22042C]">ريفانس المالية</div>
              <div className="text-[10px] tracking-wider font-bold text-[#22042C]">RIFANIS FINANCE</div>
            </div>
          </div>
          <div className="text-left">
            <div className="text-[26px] font-black text-[#22042C] leading-none">سند لأمر</div>
            <div className="text-xs text-gray-500 mt-1">سند لأمر واجب النفاذ</div>
          </div>
        </div>

        {/* رقم السند */}
        <div className="flex items-center gap-3 mb-3 text-xs">
          <div className="w-[120px] font-bold text-[#22042C]">رقم السند:</div>
          <div className="font-mono font-bold bg-gray-50 border border-gray-300 rounded px-3 py-1">{note.id}</div>
        </div>

        {/* تفاصيل السند */}
        <div className="bg-[#22042C] text-white px-3 py-1.5 rounded-t-md font-bold text-xs mb-2">تفاصيل السند</div>
        <div className="border border-gray-300 rounded-b-md p-3 mb-3 text-xs space-y-1.5">
          <div className="flex justify-between"><span className="text-gray-500">تاريخ الإنشاء:</span><span>{issueDateLabel}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">مدينة الإصدار:</span><span>{note.issue_city || 'جدة'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">مدينة الوفاء:</span><span>{note.payment_city || 'جدة'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">قيمة السند رقماً:</span><span className="font-mono font-bold text-base">{formattedAmount}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">قيمة السند كتابة:</span><span className="font-bold">{wordsAmount}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">تاريخ الإستحقاق:</span><span>{note.due_date || 'عند الطلب'}</span></div>
        </div>

        {/* تفاصيل المدين */}
        <div className="bg-[#22042C] text-white px-3 py-1.5 rounded-t-md font-bold text-xs mb-2">تفاصيل المدين</div>
        <div className="border border-gray-300 rounded-b-md p-3 mb-3 text-xs space-y-1.5">
          <div className="flex justify-between"><span className="text-gray-500">الإسم:</span><span className="font-bold">{note.debtor_name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">رقم الهوية:</span><span className="font-mono font-bold">{note.debtor_national_id}</span></div>
        </div>

        {/* تفاصيل الدائن */}
        <div className="bg-[#22042C] text-white px-3 py-1.5 rounded-t-md font-bold text-xs mb-2">تفاصيل الدائن</div>
        <div className="border border-gray-300 rounded-b-md p-3 mb-3 text-xs space-y-1.5">
          <div className="flex justify-between"><span className="text-gray-500">الإسم:</span><span className="font-bold">شركة ريفانس المالية</span></div>
          <div className="flex justify-between"><span className="text-gray-500">الرقم الوطني الموحد:</span><span className="font-mono font-bold">7038811125</span></div>
          <div className="flex justify-between"><span className="text-gray-500">يمثلها قانونياً:</span><span>AZZAH Ali ALOBIDI</span></div>
        </div>

        {/* Pledge */}
        <div className="border border-gray-300 rounded-md p-3 bg-gray-50/40 text-xs mb-3">
          <p className="font-bold leading-relaxed text-right">
            أتعهد بأن أدفع لامر شركة ريفانس المالية دون قيد أو شرط مبلغاً وقدره (
            <span className="underline font-black mx-1">{formattedAmount}</span>
            ) وفق البيانات المذكورة أعلاه. ولحامل هذا السند حقُّ الرجوع دون أي مصاريف أو احتجاج بعدم الوفاء.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-3 pt-2 border-t border-gray-200">
            <div>
              <div className="text-[11px] font-bold text-gray-500 mb-1">إسم المدين:</div>
              <div className="border border-gray-300 rounded p-1.5 font-bold">{note.debtor_name}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-gray-500 mb-1">التوقيع:</div>
              <div className="border border-gray-300 rounded h-16 flex items-center justify-center p-1">
                {isSigned && note.signature_data ? (
                  <img src={note.signature_data} alt="توقيع المدين" className="h-full object-contain" />
                ) : (
                  <span className="text-gray-400 text-[10px]">بانتظار التوقيع</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Legal Text */}
        <div className="text-[10px] text-gray-600 leading-relaxed text-right mb-4">
          <p>
            هذا السند لأمر صادر من خلال منصة ريفانس الإلكترونية وذلك بموجب العقد الإلكتروني رقم ({note.contract_id || note.submission_id}) وقد تم إنشاؤه والمصادقة عليه إلكترونياً.
          </p>
          <p className="mt-1">
            ويُقر المدين باطلاعه الكامل على العقد وفهمه لآثاره، وصحة احتساب الأتعاب، والتنازل عن أي دفع أو منازعات تتعلق بسند الأمر وعدم الطعن أو الاعتراض على التنفيذ أمام محكمة التنفيذ إلا في الحدود التي يجيزها النظام.
          </p>
        </div>

        {/* Stamp & Signatures */}
        <div className="flex items-end justify-between border-t border-gray-200 pt-3">
          <img src={rifansStampImg} alt="ختم شركة ريفانس" className="h-24 w-auto object-contain" />
          <div className="text-left text-[10px] text-gray-500 space-y-0.5">
            <div>www.rifanss.com • 800 2440 432</div>
            <div>Jeddah, Saudi Arabia</div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PromissoryNotePage;
