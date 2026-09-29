import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, Download, Printer, Loader2, FileText, Phone, Mail, Globe, 
  MapPin, FileCheck, User, Users, ArrowRight, CheckCircle, ShieldCheck 
} from 'lucide-react';
import { Button } from './Shared';
import { useAuth } from '../../contexts/AuthContext';
import { getPromissoryNoteById, signPromissoryNote } from '../../lib/api';
import { buildPromissoryView } from '../../lib/promissoryTemplate';
import DocumentViewer from './documents/DocumentViewer';
import rifansLogo from '@/assets/rifans-logo.png';
import rifansStampImg from '@/assets/rifans-stamp.png';

interface PromissoryNotePageProps {
  noteId: string;
  onClose: () => void;
}


const PromissoryNotePage: React.FC<PromissoryNotePageProps> = ({ noteId, onClose }) => {
  const { user } = useAuth();
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

  const v = buildPromissoryView(note);
  const statusLabel = v.docStatus === 'replaced' ? 'مستبدل' : v.docStatus === 'voided' ? 'ملغى' : null;

  const Row = ({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) => (
    <div className="flex flex-row items-center justify-between gap-2 py-1 border-b border-gray-200 last:border-b-0">
      <span className="text-gray-500 font-medium">{label}:</span>
      <span className={`font-bold text-[#22042C] ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );

  const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="bg-brand text-white px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs sm:text-sm print:rounded-md">
      {icon}
      <span>{children}</span>
    </div>
  );

  const blocks: React.ReactNode[] = [
    <div key="title" className="bg-[#FAF7FC] border border-brand/10 rounded-xl py-3 px-3 text-center">
      <h2 className="text-xl font-black text-[#2A0E32]">{v.title}</h2>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${v.isSigned ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
          {v.isSigned ? <><CheckCircle size={12} /> موقّع</> : 'بانتظار التوقيع'}
        </span>
        {statusLabel && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">{statusLabel}</span>
        )}
      </div>
    </div>,
    <div key="b0" className="space-y-2.5">
            <SectionTitle icon={<FileText size={16} className="text-gold shrink-0" />}>بيانات السند</SectionTitle>
            <div className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-1 text-xs sm:text-[13px]">
              <Row label="رقم السند" value={v.noteNumber} mono />
              <Row label="تاريخ الإصدار" value={v.issueDate} />
              <Row label="مكان الإصدار" value={v.issueCity} />
              <Row label="تاريخ الاستحقاق" value={v.dueDate} />
              <Row label="مكان الوفاء" value={v.paymentCity} />
              <Row label="قيمة السند رقمًا" value={<span className="text-brand font-black font-mono">{v.amountFigure}</span>} />
              <Row label="قيمة السند كتابةً" value={v.amountWords} />
            </div>
          </div>,
    <div key="b1" className="space-y-2.5">
            <SectionTitle icon={<User size={16} className="text-gold shrink-0" />}>المدين</SectionTitle>
            <div className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-1 text-xs sm:text-[13px]">
              <Row label="الاسم" value={v.debtorName} />
              <Row label="رقم الهوية الوطنية/الإقامة" value={v.debtorNationalId} mono />
            </div>
          </div>,
    <div key="b2" className="space-y-2.5">
            <SectionTitle icon={<Users size={16} className="text-gold shrink-0" />}>المستفيد</SectionTitle>
            <div className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-1 text-xs sm:text-[13px]">
              <Row label="الاسم" value={v.beneficiary.name} />
              <Row label="الرقم الوطني الموحد" value={v.beneficiary.unifiedNumber} mono />
              <Row label="يمثلها" value={v.beneficiary.representative} />
            </div>
          </div>,
    <div key="b3" className="border-2 border-gold/40 rounded-xl p-4 bg-gold/5 space-y-2.5">
            <h4 className="text-xs sm:text-sm font-bold text-brand">التعهد بالسداد</h4>
            <p className="text-xs sm:text-sm leading-relaxed text-gray-800 text-right font-bold">{v.pledge}</p>
            <p className="text-xs text-gray-700 leading-relaxed">{v.contractLink}</p>
          </div>,
    <div key="b4" className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-gray-200 rounded-xl p-3 bg-[#FAF7FC] space-y-2 text-xs">
                <span className="text-xs font-bold text-[#22042C] block text-center">توقيع المدين</span>
                <Row label="اسم المدين" value={v.debtorName} />
                <div className="h-24 bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2 overflow-hidden">
                  {v.isSigned && v.signatureData ? (
                    <img src={v.signatureData} alt="التوقيع الإلكتروني" className="h-full w-auto object-contain" />
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">بانتظار التوقيع الإلكتروني</span>
                  )}
                </div>
                <Row label="تاريخ ووقت التوقيع" value={v.signedAtLabel || 'لم يوقَّع بعد'} />
              </div>

              <div className="border border-gray-200 rounded-xl p-3 bg-[#FAF7FC] text-center space-y-2">
                <span className="text-xs font-bold text-[#22042C] block">المستفيد</span>
                <span className="text-[11px] text-gray-700 font-bold block">{v.beneficiary.name}</span>
                <div className="h-24 flex items-center justify-center">
                  <img src={rifansStampImg} alt="ختم شركة ريفانس المالية" className="h-full w-auto object-contain mix-blend-multiply" />
                </div>
              </div>
            </div>
          </div>,
    <div key="b5" className="border-t border-gray-200 pt-3 text-center text-[10px] sm:text-[11px] text-gray-500">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-medium">
              <span className="flex items-center gap-1"><Phone size={12} className="text-gold" /> 800 2440 432</span>
              <span className="flex items-center gap-1"><Mail size={12} className="text-gold" /> info@rifans.net</span>
              <span className="flex items-center gap-1"><Globe size={12} className="text-gold" /> www.rifanss.com</span>
              <span className="flex items-center gap-1"><MapPin size={12} className="text-gold" /> جدة، المملكة العربية السعودية</span>
            </div>
          </div>,
  ];

  return (
    <DocumentViewer
      blocks={blocks}
      docType={v.title}
      docNumber={`رقم السند ${v.noteNumber}`}
      fileName={`سند لأمر ريفانس المالية - ${noteId}.pdf`}
      onClose={onClose}
    >
        {/* Signature Capture Pad for mobile (Only if not signed) */}
        {isOwner && !isSigned && !isAdmin && (note.doc_status || 'active') === 'active' && (
          <div className="mt-4 mx-auto max-w-2xl bg-white print:hidden rounded-2xl border border-gold/30 shadow-md p-4 space-y-3">
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
    </DocumentViewer>
  );
};

export default PromissoryNotePage;
