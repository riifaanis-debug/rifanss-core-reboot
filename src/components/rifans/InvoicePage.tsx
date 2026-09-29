import React, { useState, useRef, useEffect } from 'react';
import rifansStampImg from '@/assets/rifans-stamp.png';
import bankAccountImg from '@/assets/rifans-bank-account.png';
import {
  Download, Printer, FileText, Loader2, ArrowRight,
  CheckCircle, Building2, User, CreditCard, Receipt, Phone, Mail, Globe, MapPin
} from 'lucide-react';
import { Button } from './Shared';
import { useAuth } from '../../contexts/AuthContext';
import { getSubmission, getInvoiceBySubmission } from '../../lib/api';
import { buildInvoiceView } from '../../lib/invoiceTemplate';
import DocumentViewer from './documents/DocumentViewer';

interface InvoicePageProps {
  submissionId: string;
  onClose: () => void;
}

const Row = ({ label, value, mono, strong }: { label: string; value: React.ReactNode; mono?: boolean; strong?: boolean }) => (
  <div className="flex flex-row items-center justify-between gap-2 py-1 border-b border-gray-200 last:border-b-0">
    <span className="text-gray-500 font-medium">{label}:</span>
    <span className={`font-bold ${strong ? 'text-brand' : 'text-[#22042C]'} ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

const SectionTitle = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-brand text-white px-3.5 py-2 rounded-xl flex items-center gap-2 font-bold text-sm">
    {icon}
    <span>{children}</span>
  </div>
);

const InvoicePage: React.FC<InvoicePageProps> = ({ submissionId, onClose }) => {
  const { token } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);
  const [invoice, setInvoice] = useState<any>(null);

  useEffect(() => {
    if (token && submissionId) fetchData();
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

  const v = buildInvoiceView(invoice, submission);

  const blocks: React.ReactNode[] = [
    <div key="title" className="bg-[#FAF7FC] border border-brand/10 rounded-xl py-3 px-3 text-center">
      <h1 className="text-xl font-black text-[#2A0E32]">{v.title}</h1>
      <div className="flex flex-wrap items-center justify-center gap-6 mt-1 text-xs text-gray-600 font-medium">
        <span>رقم الفاتورة: <strong className="font-mono text-[#2A0E32]">{v.invoiceNumber}</strong></span>
        <span>تاريخ الفاتورة: <strong className="text-[#2A0E32]">{v.invoiceDate}</strong></span>
        <span>رقم الطلب: <strong className="font-mono text-[#2A0E32]">{v.requestNumber}</strong></span>
      </div>
      <div className="flex items-center justify-center gap-2 mt-2">
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${v.isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
          {v.isPaid ? <><CheckCircle size={12} /> {v.statusLabel}</> : v.statusLabel}
        </span>
        {v.docStatusLabel && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">{v.docStatusLabel}</span>
        )}
      </div>
    </div>,

    <div key="client" className="space-y-2.5">
      <SectionTitle icon={<User size={16} className="text-gold shrink-0" />}>بيانات العميل</SectionTitle>
      <div className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-1 text-[13px]">
        <Row label="الاسم" value={v.clientName} />
        <Row label="رقم الهوية" value={v.clientNationalId} mono strong />
        <Row label="رقم الجوال" value={<span dir="ltr">{v.clientPhone}</span>} mono />
      </div>
    </div>,

    <div key="service" className="space-y-2.5">
      <SectionTitle icon={<Building2 size={16} className="text-gold shrink-0" />}>تفاصيل الخدمة</SectionTitle>
      <div className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-1 text-[13px]">
        <Row label="نوع الخدمة" value={v.serviceName} />
        <Row label={v.bankLabel} value={v.bank} strong />
      </div>
    </div>,
  ];

  if (v.products.length > 0) {
    blocks.push(
      <SectionTitle key="prod-title" icon={<CreditCard size={16} className="text-gold shrink-0" />}>المنتجات التمويلية المشمولة</SectionTitle>
    );
    v.products.forEach((p, i) => blocks.push(
      <div key={`prod-${i}`} className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3 flex flex-row items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-2">
          <CreditCard size={15} className="text-gold shrink-0" />
          <div>
            <span className="font-bold text-[#2A0E32]">{p.type}</span>
            <span className="text-[11px] text-gray-500 mr-2 font-mono">({p.accountNumber})</span>
          </div>
        </div>
        <div className="font-bold text-[#2A0E32] font-mono text-sm">{p.amount}</div>
      </div>
    ));
  }

  blocks.push(
    <div key="fees" className="space-y-2.5">
      <SectionTitle icon={<Receipt size={16} className="text-gold shrink-0" />}>احتساب الأتعاب والمبلغ المستحق</SectionTitle>
      <div className="bg-gold/5 border-2 border-gold/30 rounded-xl p-4 space-y-1 text-xs">
        {v.amountLines.map((l, i) => (
          <Row key={i} label={l.label} value={l.value} />
        ))}
        <div className="pt-3 mt-2 border-t border-gold/30 flex items-center justify-between">
          <span className="text-base font-black text-brand">قيمة الأتعاب المستحقة:</span>
          <span className="text-2xl font-black text-gold font-mono">{v.feeAmount}</span>
        </div>
      </div>
    </div>,
    <div key="status" className="bg-[#FAF7FC] border border-gray-200 rounded-xl p-3.5 space-y-1 text-[13px]">
      <Row label="حالة الفاتورة" value={v.statusLabel} />
      {v.isPaid && <Row label="تاريخ السداد" value={v.paidAtLabel || 'غير مسجل'} />}
    </div>,
  );

  if (!v.isPaid) {
    blocks.push(
      <div key="pay" className="space-y-3">
        <SectionTitle icon={<Receipt size={16} className="text-gold shrink-0" />}>بيانات السداد</SectionTitle>
        <p className="text-xs font-bold text-brand text-center">
          يتم سداد الفاتورة إلى حساب {v.companyName} الموضح في بيانات السداد المعتمدة.
        </p>
        <div className="flex flex-col items-center gap-3 bg-[#FAF7FC] p-3 rounded-xl border border-gray-200">
          <img src={bankAccountImg} alt="بيانات الحساب البنكي" className="w-full max-w-sm h-auto object-contain rounded-lg" />
        </div>
      </div>
    );
  }

  blocks.push(
    <div key="stamp" className="flex items-center justify-center pt-2">
      <img src={rifansStampImg} alt="ختم شركة ريفانس المالية" className="h-24 w-auto object-contain mix-blend-multiply" />
    </div>,
    <div key="contact" className="border-t border-gray-200 pt-3 text-center text-[11px] text-gray-500">
      <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
        <span className="flex items-center gap-1"><Phone size={12} className="text-gold" /> 800 2440 432</span>
        <span className="flex items-center gap-1"><Mail size={12} className="text-gold" /> info@rifans.net</span>
        <span className="flex items-center gap-1"><Globe size={12} className="text-gold" /> www.rifanss.com</span>
        <span className="flex items-center gap-1"><MapPin size={12} className="text-gold" /> جدة، المملكة العربية السعودية</span>
      </div>
    </div>,
  );

  return (
    <DocumentViewer
      blocks={blocks}
      docType={v.title}
      docNumber={`رقم الفاتورة ${v.invoiceNumber}`}
      fileName={`فاتورة ريفانس المالية - ${submissionId}.pdf`}
      onClose={onClose}
    />
  );
};

export default InvoicePage;
