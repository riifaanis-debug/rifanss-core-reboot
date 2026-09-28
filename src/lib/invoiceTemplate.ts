/**
 * المصدر الموحد لبيانات الفاتورة — تستخدمه الشاشة والطباعة وPDF.
 * القيم تُقرأ من لقطة الفاتورة المحفوظة وقت الإصدار، ثم من الطلب عند غيابها.
 */
import { FIRST_PARTY, resolveContractKind, feeRateFor, type ContractKind } from './contractTemplate';
import { formatAmount } from './formatNumber';
import { safeParse } from '../utils/safeJson';

export const MISSING = 'غير مسجل';

export interface InvoiceLine { label: string; value: string; emphasis?: boolean }

export interface InvoiceView {
  kind: ContractKind;
  title: string;
  invoiceNumber: string;
  invoiceDate: string;
  requestNumber: string;
  clientName: string;
  clientNationalId: string;
  clientPhone: string;
  serviceName: string;
  bankLabel: string;
  bank: string;
  products: { type: string; accountNumber: string; amount: string }[];
  amountLines: InvoiceLine[];
  feeAmount: string;
  isPaid: boolean;
  statusLabel: string;
  paidAtLabel: string;
  docStatusLabel: string | null;
  companyName: string;
}

const sar = (n: any) => `${formatAmount(Number(n) || 0)} ريال سعودي`;
const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' }) : MISSING;

export const buildInvoiceView = (invoice: any, submission: any): InvoiceView => {
  const data = submission?.data || {};
  const kind = resolveContractKind(invoice?.type || submission?.type);
  const rate = `${Math.round(feeRateFor(kind) * 100)}%`;
  const rawProducts = Array.isArray(data.products)
    ? data.products
    : (typeof data.products === 'string' ? safeParse(data.products, []) : []);
  const productsTotal = (rawProducts || []).reduce((a: number, p: any) => a + (Number(p?.amount) || 0), 0);
  const totalDebt = invoice?.total_debt != null ? Number(invoice.total_debt) : productsTotal;
  const actual = invoice?.actual_amount != null ? Number(invoice.actual_amount) : Number(submission?.actual_amount) || 0;
  const bank = invoice?.bank || data.bank || MISSING;

  let amountLines: InvoiceLine[] = [];
  if (kind === 'exemption') {
    amountLines = [
      { label: 'إجمالي المديونية محل طلب الإعفاء', value: sar(totalDebt) },
      { label: 'المبلغ المعفى فعليًا', value: sar(actual) },
      { label: 'نسبة الأتعاب', value: rate },
    ];
  } else if (kind === 'rescheduling') {
    amountLines = [
      { label: 'إجمالي مديونية المنتجات محل طلب الجدولة', value: sar(totalDebt) },
      { label: 'إجمالي مديونية المنتجات التي تمت إعادة جدولتها فعليًا', value: sar(actual) },
      { label: 'نسبة الأتعاب', value: rate },
    ];
  } else {
    const seized = invoice?.seized_amount != null ? invoice.seized_amount : data.seizedAmount;
    amountLines = [
      { label: 'الجهة المالية', value: bank },
      { label: 'رقم الحساب الجاري', value: invoice?.current_account_number || data.currentAccountNumber || MISSING },
      { label: 'المبلغ المحجوز في الحساب من المبالغ المستثناة من الحجز', value: seized != null && seized !== '' ? sar(seized) : MISSING },
      { label: 'المبلغ الذي تمت إتاحته/استرداده فعليًا', value: sar(actual) },
      { label: 'نسبة الأتعاب', value: rate },
    ];
  }

  const isPaid = invoice?.status === 'paid';
  const docStatus = invoice?.doc_status || 'active';
  const clientName = data.fullName || [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ') || MISSING;

  return {
    kind,
    title: 'فاتورة تقديم خدمات',
    invoiceNumber: invoice?.id || MISSING,
    invoiceDate: fmtDate(invoice?.created_at),
    requestNumber: submission?.id || invoice?.submission_id || MISSING,
    clientName,
    clientNationalId: data.nationalId || data.userNationalId || MISSING,
    clientPhone: data.phone || data.mobile || data.phoneNumber || MISSING,
    serviceName:
      kind === 'rescheduling' ? 'إعادة جدولة المنتجات التمويلية'
      : kind === 'seized' ? 'إتاحة النسبة النظامية والمبالغ المستثناة من الحجز'
      : 'إعفاء من الالتزامات المالية',
    bankLabel: kind === 'seized' ? 'الجهة المالية' : 'الجهة التمويلية',
    bank,
    products: kind === 'seized' ? [] : (rawProducts || []).map((p: any) => ({
      type: p?.type || MISSING,
      accountNumber: p?.accountNumber || MISSING,
      amount: sar(p?.amount),
    })),
    amountLines,
    feeAmount: sar(invoice?.amount),
    isPaid,
    statusLabel: isPaid ? 'مدفوعة' : 'بانتظار السداد',
    paidAtLabel: isPaid && invoice?.paid_at ? fmtDate(invoice.paid_at) : '',
    docStatusLabel: docStatus === 'replaced' ? 'مستبدلة' : docStatus === 'voided' ? 'ملغاة' : null,
    companyName: FIRST_PARTY.name,
  };
};
