import React, { useState, useRef, useEffect } from 'react';
import rifansStampImg from '@/assets/rifans-stamp.png';
import bankAccountImg from '@/assets/rifans-bank-account.png';
import { 
  X, Download, Printer, FileText, Loader2, ArrowRight, 
  CheckCircle, Building2, User, CreditCard, Receipt, Phone, Mail, Globe, MapPin 
} from 'lucide-react';
import { Button } from './Shared';
import { useAuth } from '../../contexts/AuthContext';
import { safeParse } from '../../utils/safeJson';
import { getSubmission, getInvoiceBySubmission } from '../../lib/api';
import { formatAmount } from '../../lib/formatNumber';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import Logo from './Logo';
import PayPalPayButton from './PayPalPayButton';

interface InvoicePageProps {
  submissionId: string;
  onClose: () => void;
}

const InvoicePage: React.FC<InvoicePageProps> = ({ submissionId, onClose }) => {
  const { token } = useAuth();
  const printSheetRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (token && submissionId) {
      fetchData();
    }
  }, [token, submissionId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [subData, invData] = await Promise.all([
        getSubmission(submissionId),
        getInvoiceBySubmission(submissionId),
      ]);
      setSubmission(subData);
      setInvoice(invData);
    } catch (err) {
      console.error('Error fetching invoice data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const products = Array.isArray(submission?.data?.products)
    ? submission.data.products
    : (typeof submission?.data?.products === 'string' ? safeParse(submission.data.products, []) : []);
  const totalDebt = products.reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0) || 0;

  const isRescheduling = submission?.type === 'rescheduling_request' || submission?.type === 'scheduling_request';
  const isSeizedAmounts = submission?.type === 'seized_amounts_request';

  const getServiceName = () => {
    if (isRescheduling) return 'إعادة جدولة المنتجات التمويلية';
    if (isSeizedAmounts) return 'إتاحة النسبة النظامية والمبالغ المستثناه من الحجز';
    return 'إعفاء من الالتزامات المالية';
  };

  const getFeeDescription = () => {
    if (isRescheduling) return '2,000 ريال سعودي (مبلغ مقطوع)';
    if (isSeizedAmounts) return `1% من إجمالي المبالغ المستردة`;
    return `4% من إجمالي المبالغ المعفية`;
  };

  const handleDownload = async () => {
    const el = printSheetRef.current;
    if (!el) return;
    setIsDownloading(true);
    try {
      const opt: any = {
        margin: 5,
        filename: `فاتورة ريفانس المالية - ${submissionId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all'] },
      };
      await html2pdf().set(opt).from(el).save();
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
        <p className="text-brand font-bold text-sm">جاري جلب تفاصيل الفاتورة...</p>
      </div>
    );
  }

  if (!submission || !invoice) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center gap-4 p-6 font-['Tajawal']" dir="rtl">
        <FileText className="text-muted" size={48} />
        <p className="text-muted text-sm font-bold">لم يتم العثور على الفاتورة</p>
        <Button onClick={onClose} className="bg-brand text-white text-xs px-6 py-2">العودة</Button>
      </div>
    );
  }

  const invoiceDate = new Date(invoice.created_at).toLocaleDateString('ar-SA', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const clientName = submission.data?.fullName || [submission.data?.firstName, submission.data?.lastName].filter(Boolean).join(' ') || '---';
  const clientNationalId = submission.data?.nationalId || submission.data?.userNationalId || '---';
  const clientPhone = submission.data?.phone || submission.data?.mobile || submission.data?.phoneNumber || '---';
  const isPaid = invoice.status === 'paid';

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
            <h2 className="text-xs font-bold text-brand leading-tight">فاتورة تقديم خدمات</h2>
            <p className="text-[10px] text-muted font-mono">رقم {invoice.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-[#22042C] border border-gold/30 text-xs font-bold transition-all active:scale-95"
            title="طباعة الفاتورة"
          >
            <Printer size={15} className="text-gold" />
            <span>طباعة</span>
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22042C] hover:bg-[#22042C]/90 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 active:scale-95"
            title="تحميل الفاتورة بصيغة PDF الرسمية"
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
                <Logo />
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                  {isPaid ? <><CheckCircle size={12} /> تم السداد</> : 'بانتظار السداد'}
                </span>
                <span className="text-[10px] text-muted font-mono">فاتورة: {invoice.id}</span>
              </div>
            </div>

            {/* Official Title */}
            <div className="bg-[#FAF7FC] border border-brand/10 rounded-xl py-3 px-3 text-center">
              <h1 className="text-lg sm:text-xl font-black text-[#22042C]">فاتورة تقديم خدمات</h1>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-1 text-[11px] sm:text-xs text-gray-600 font-medium">
                <span>تاريخ الفاتورة: <strong className="text-[#22042C]">{invoiceDate}</strong></span>
                <span>رقم الطلب: <strong className="font-mono text-[#22042C]">{submissionId}</strong></span>
              </div>
            </div>
          </div>

          {/* بيانات العميل (Client Info) */}
          <div className="space-y-2.5">
            <div className="bg-brand text-white px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs sm:text-sm">
              <User size={16} className="text-gold shrink-0" />
              <span>بيانات العميل</span>
            </div>

            <div className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs sm:text-[13px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-gray-200">
                <span className="text-gray-500 font-medium">الاسم الكامل:</span>
                <span className="font-bold text-[#22042C]">{clientName}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-gray-200">
                <span className="text-gray-500 font-medium">رقم الهوية الوطنية:</span>
                <span className="font-mono font-bold text-brand">{clientNationalId}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                <span className="text-gray-500 font-medium">رقم الجوال:</span>
                <span className="font-mono font-bold text-[#22042C]" dir="ltr">{clientPhone}</span>
              </div>
            </div>
          </div>

          {/* تفاصيل الخدمة (Service Info) */}
          <div className="space-y-2.5">
            <div className="bg-brand text-white px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs sm:text-sm">
              <Building2 size={16} className="text-gold shrink-0" />
              <span>تفاصيل الخدمة والجهة التمويلية</span>
            </div>

            <div className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs sm:text-[13px]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-gray-200">
                <span className="text-gray-500 font-medium">نوع الخدمة:</span>
                <span className="font-bold text-[#22042C]">{getServiceName()}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                <span className="text-gray-500 font-medium">الجهة التمويلية:</span>
                <span className="font-bold text-brand">{submission.data?.bank || 'البنك الأهلي السعودي'}</span>
              </div>
            </div>
          </div>

          {/* المنتجات التمويلية (Financing Products) */}
          {products.length > 0 && (
            <div className="space-y-2.5">
              <div className="bg-brand text-white px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs sm:text-sm">
                <CreditCard size={16} className="text-gold shrink-0" />
                <span>المنتجات التمويلية المشمولة</span>
              </div>

              <div className="space-y-2">
                {products.map((p: any, i: number) => (
                  <div key={i} className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <CreditCard size={15} className="text-gold shrink-0" />
                      <div>
                        <span className="font-bold text-[#22042C]">{p.type}</span>
                        <span className="text-[11px] text-gray-500 mr-2 font-mono">({p.accountNumber || '---'})</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right font-bold text-red-700 font-mono text-sm">
                      {formatAmount(p.amount)} ر.س
                    </div>
                  </div>
                ))}

                {/* إجمالي المديونية */}
                <div className="bg-white border border-gold/40 rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm font-bold shadow-sm">
                  <span className="text-[#22042C]">إجمالي المديونية:</span>
                  <span className="text-base sm:text-lg font-black text-brand font-mono">{formatAmount(totalDebt)} ر.س</span>
                </div>
              </div>
            </div>
          )}

          {/* احتساب الأتعاب والمبلغ المستحق (Fee Summary) */}
          <div className="space-y-2.5">
            <div className="bg-brand text-white px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-xs sm:text-sm">
              <Receipt size={16} className="text-gold shrink-0" />
              <span>احتساب الأتعاب والمبلغ المستحق</span>
            </div>

            <div className="bg-gold/5 border-2 border-gold/30 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <span className="text-gray-600 font-medium">طريقة الاحتساب:</span>
                <span className="font-bold text-[#22042C]">{getFeeDescription()}</span>
              </div>

              {!isRescheduling && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <span className="text-gray-600 font-medium">إجمالي المبلغ الأساسي:</span>
                  <span className="font-mono font-bold text-brand">{formatAmount(totalDebt)} ر.س</span>
                </div>
              )}

              <div className="pt-3 border-t border-gold/30 flex items-center justify-between">
                <span className="text-sm sm:text-base font-black text-brand">المبلغ المستحق للسداد:</span>
                <span className="text-xl sm:text-2xl font-black text-gold font-mono">{formatAmount(invoice.amount)} ر.س</span>
              </div>
            </div>
          </div>

          {/* تفاصيل السداد والحساب البنكي */}
          {isPaid ? (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={24} />
                <div>
                  <span className="text-sm font-bold text-green-800 block">تم سداد الفاتورة بنجاح</span>
                  {invoice.paid_at && (
                    <span className="text-xs text-green-600">{new Date(invoice.paid_at).toLocaleDateString('ar-SA')}</span>
                  )}
                </div>
              </div>
              <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">مدفوعة</span>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-brand text-center">
                يتم سداد الفاتورة عن طريق حساب شركة ريفانيس المالية لدى STC BANK كما هو موضح أدناه:
              </p>
              
              <div className="flex flex-col items-center gap-3 bg-[#FAF7FC] p-3 rounded-xl border border-gray-200">
                <img src={bankAccountImg} alt="بيانات الحساب البنكي" className="w-full max-w-sm h-auto object-contain rounded-lg shadow-sm" />
                <div className="flex items-center justify-center pt-2">
                  <img src={rifansStampImg} alt="ختم شركة ريفانس" className="h-24 w-auto object-contain mix-blend-multiply" />
                </div>
              </div>
            </div>
          )}

          {/* Footer Contact */}
          <div className="border-t border-gray-200 pt-3 text-center text-[10px] sm:text-[11px] text-gray-500 space-y-1">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 font-medium">
              <span className="flex items-center gap-1"><Phone size={12} className="text-gold" /> 800 2440 432</span>
              <span className="flex items-center gap-1"><Mail size={12} className="text-gold" /> info@rifans.net</span>
              <span className="flex items-center gap-1"><Globe size={12} className="text-gold" /> www.rifanss.com</span>
              <span className="flex items-center gap-1"><MapPin size={12} className="text-gold" /> جدة، المملكة العربية السعودية</span>
            </div>
          </div>

        </div>

        {/* سداد إلكتروني (Payment Action) */}
        {!isPaid && (
          <div className="mt-4 bg-white rounded-2xl border border-gold/30 shadow-md p-4 space-y-3">
            <h3 className="text-xs sm:text-sm font-bold text-brand text-center">خيارات السداد الإلكتروني المباشر</h3>
            <PayPalPayButton kind="invoice" recordId={invoice.id} label="سداد الفاتورة إلكترونياً" />
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════
          OFFSCREEN DEDICATED A4 PRINT SHEET (Used exclusively for PDF & Print)
          ══════════════════════════════════════════════════════════════ */}
      <div
        ref={printSheetRef}
        className="fixed -left-[9999px] -top-[9999px] w-[800px] min-h-[1050px] bg-white p-8 text-right print:static print:w-full print:min-h-0 print:p-0 print:m-0"
        dir="rtl"
        style={{ fontFamily: 'Tajawal, sans-serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b-2 border-gold/30 mb-4">
          <div>
            <h1 className="text-2xl font-black text-brand">فاتورة تقديم خدمات</h1>
            <p className="text-xs text-gray-600 font-mono mt-1">رقم الفاتورة: {invoice.id}</p>
          </div>
          <Logo />
        </div>

        {/* Client Info */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-brand mb-2">بيانات العميل</h2>
          <div className="grid grid-cols-3 gap-4 text-xs pb-2 border-b border-gray-200">
            <div><span className="text-gray-500">الاسم:</span> <strong className="text-brand">{clientName}</strong></div>
            <div><span className="text-gray-500">رقم الهوية:</span> <strong className="text-brand font-mono">{clientNationalId}</strong></div>
            <div><span className="text-gray-500">رقم الجوال:</span> <strong className="text-brand font-mono" dir="ltr">{clientPhone}</strong></div>
          </div>
        </div>

        {/* Service Block */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 text-xs">
          <div className="flex justify-between">
            <div><span className="text-gray-500">نوع الخدمة:</span> <strong className="text-brand mr-1">{getServiceName()}</strong></div>
            <div><span className="text-gray-500">الجهة التمويلية:</span> <strong className="text-brand mr-1">{submission.data?.bank || 'البنك الأهلي السعودي'}</strong></div>
          </div>
        </div>

        {/* Products Table */}
        {products.length > 0 && (
          <table className="w-full text-xs mb-4 border border-gray-200">
            <thead>
              <tr className="bg-[#22042C] text-white">
                <th className="p-2 text-right">المنتج التمويلي</th>
                <th className="p-2 text-right">رقم الحساب</th>
                <th className="p-2 text-right">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any, i: number) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="p-2">{p.type}</td>
                  <td className="p-2 font-mono text-gray-600">{p.accountNumber || '---'}</td>
                  <td className="p-2 font-bold font-mono">{formatAmount(p.amount)} ر.س</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold border-t border-gold/40">
                <td colSpan={2} className="p-2 text-right">إجمالي المديونية</td>
                <td className="p-2 font-mono">{formatAmount(totalDebt)} ر.س</td>
              </tr>
            </tfoot>
          </table>
        )}

        {/* Fee Calculation */}
        <div className="border border-gold/30 rounded-lg p-3 bg-gold/5 mb-4 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-gray-600">طريقة الاحتساب:</span>
            <span className="font-bold">{getFeeDescription()}</span>
          </div>
          {!isRescheduling && (
            <div className="flex justify-between">
              <span className="text-gray-600">إجمالي المبلغ الأساسي:</span>
              <span className="font-mono font-bold">{formatAmount(totalDebt)} ر.س</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-gold/30 text-sm font-bold">
            <span>المبلغ المستحق:</span>
            <span className="font-mono font-black text-brand text-base">{formatAmount(invoice.amount)} ر.س</span>
          </div>
        </div>

        {/* Stamp & Bank Info */}
        <div className="flex justify-between items-center pt-2">
          <img src={bankAccountImg} alt="بيانات الحساب البنكي" className="h-32 object-contain" />
          <img src={rifansStampImg} alt="ختم شركة ريفانس" className="h-24 object-contain" />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 mt-6 pt-2 flex justify-between text-[10px] text-gray-500">
          <div>www.rifanss.com • 800 2440 432</div>
          <div>info@rifans.net • Jeddah, Saudi Arabia</div>
        </div>
      </div>

    </div>
  );
};

export default InvoicePage;
