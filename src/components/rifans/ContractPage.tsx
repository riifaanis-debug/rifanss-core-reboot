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
import { contractDocument } from '../../lib/generateContractPdf';
import DocumentViewer from './documents/DocumentViewer';
import {
  resolveContractKind,
  normalizeContract,
  FIRST_PARTY,
  type ContractData,
} from '../../lib/contractTemplate';

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
  const contractKind = resolveContractKind(submission?.type);

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

  const getContractPayload = (): ContractData => ({
    submissionId,
    submission,
    kind: contractKind,
    products,
    totalDebt,
    currentAccountNumber: submission?.data?.currentAccountNumber,
    seizedAmount: submission?.data?.seizedAmount,
    isAlreadySigned,
    signatureData: isAlreadySigned
      ? (submission?.signature_data || canvasRef.current?.toDataURL() || null)
      : null,
    signedAt: submission?.signed_at || (isSuccess ? new Date().toISOString() : null),
    clientName: [submission?.data?.firstName, submission?.data?.middleName, submission?.data?.lastName].filter(Boolean).join(' ') || 'العميل الكريم',
    nationalId: submission?.data?.nationalId || submission?.data?.userNationalId || '---',
    mobile: submission?.data?.mobile || submission?.data?.phone || '---',
    bank: submission?.data?.bank || 'الجهة التمويلية',
    fileNumber: submission?.file_number || submissionId,
    contractDate: new Date(submission?.timestamp || Date.now()).toLocaleDateString('ar-SA'),
  });

  const handleSignSubmit = async () => {
    if (!canvasRef.current || !hasSignature) return;
    setIsSubmitting(true);
    try {
      const signatureBase64 = canvasRef.current.toDataURL('image/png');
      await submitSignature(submissionId, signatureBase64);
      setIsSuccess(true);
      setIsAlreadySigned(true);
      notifyAdminContractSigned(submissionId);
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

  /* المصدر الوحيد لنص العقد وبياناته */
  const norm = normalizeContract(getContractPayload());
  const contractTitle = norm.content.title;
  const clientFullName = norm.clientName;
  const clientNationalId = norm.nationalId;
  const clientMobile = norm.mobile;
  const targetBank = norm.bank;
  const contractDateFormatted = norm.contractDate;

  const contractDoc = contractDocument(getContractPayload());

  return (
    <div dir="rtl">
      <DocumentViewer
        blocks={contractDoc.blocks}
        docType={contractDoc.meta.docType}
        docNumber={contractDoc.meta.docNumber}
        fileName={`عقد ريفانس المالية - ${submissionId}.pdf`}
        onClose={onClose}
        bottomPadding={(!isSuccess && !isAlreadySigned) ? 300 : 32}
      />

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
