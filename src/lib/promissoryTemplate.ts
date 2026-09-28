/**
 * المصدر الموحد لنص وبيانات السند لأمر.
 * تستخدمه شاشة العميل ومعاينة الإدارة والطباعة وPDF دون أي نسخة نصية أخرى.
 */
import { FIRST_PARTY } from './contractTemplate';
import { formatAmount } from './formatNumber';
import { numberToArabicWords } from './arabicNumberToWords';

export const MISSING = 'غير مسجل';

const fmtDate = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(iso)) : MISSING;
const fmtDateTime = (iso?: string | null) =>
  iso
    ? new Intl.DateTimeFormat('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(iso))
    : '';

export interface PromissoryView {
  title: string;
  noteNumber: string;
  issueDate: string;
  issueCity: string;
  dueDate: string;
  paymentCity: string;
  amountFigure: string;
  amountWords: string;
  debtorName: string;
  debtorNationalId: string;
  beneficiary: { name: string; unifiedNumber: string; representative: string };
  pledge: string;
  contractLink: string;
  contractId: string | null;
  signatureData: string | null;
  signedAtLabel: string;
  isSigned: boolean;
  docStatus: string;
}

export const buildPromissoryView = (note: any): PromissoryView => {
  const amount = Number(note?.amount) || 0;
  const amountText = `${formatAmount(amount)} ريال سعودي`;
  const contractId: string | null = note?.contract_id || null;
  return {
    title: 'سند لأمر',
    noteNumber: note?.id || MISSING,
    issueDate: fmtDate(note?.created_at),
    issueCity: note?.issue_city || MISSING,
    dueDate: note?.due_date || MISSING,
    paymentCity: note?.payment_city || MISSING,
    amountFigure: amountText,
    amountWords: note?.amount_in_words || numberToArabicWords(amount),
    debtorName: note?.debtor_name || MISSING,
    debtorNationalId: note?.debtor_national_id || MISSING,
    beneficiary: {
      name: FIRST_PARTY.name,
      unifiedNumber: FIRST_PARTY.unifiedNumber,
      representative: FIRST_PARTY.representative,
    },
    pledge: `أتعهد بأن أدفع لأمر ${FIRST_PARTY.name} دون قيد أو شرط مبلغًا وقدره (${amountText}) وفقًا للبيانات المبينة في هذا السند، وذلك في تاريخ الاستحقاق المحدد أعلاه.`,
    contractLink: `هذا السند لأمر صادر إلكترونيًا ومرتبط بالعقد الإلكتروني رقم (${contractId || MISSING}).`,
    contractId,
    signatureData: note?.signature_data || null,
    signedAtLabel: fmtDateTime(note?.signed_at),
    isSigned: !!note?.signed_at,
    docStatus: note?.doc_status || 'active',
  };
};
