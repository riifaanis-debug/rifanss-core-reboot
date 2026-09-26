// SINGLE SOURCE OF TRUTH for every wallet / customer table in the app.
// The order below is MANDATORY and identical in every section
// (محفظتي، طلبات الإعفاء، طلبات إعادة الجدولة، طلبات التسوية، التحصيل الذكي،
//  نتائج البحث، وأي جدول محفظة مستقبلي).
// Columns are rendered left-to-right exactly in this order.

export type UnifiedColType =
  | "text"
  | "currency"
  | "phone"
  | "date"
  | "reqType";

export type UnifiedColumn = {
  key: string; // canonical column name (must match the official portfolio file)
  label: string; // header text shown in every table
  type: UnifiedColType;
  aliases: string[]; // accepted source headers on import
};

export const UNIFIED_COLUMNS: UnifiedColumn[] = [
  {
    key: "رقم الحساب",
    label: "رقم الحساب",
    type: "text",
    aliases: ["رقم الحساب", "account", "account number", "acc no", "ACCOUNT_NUMBER", "رقم العقد"],
  },
  {
    key: "مبلغ المديونية",
    label: "مبلغ المديونية",
    type: "currency",
    aliases: [
      "مبلغ المديونية",
      "مبلغ المديونيه",
      "LOAN_BALANCE",
      "Loan Balance",
      "Outstanding",
      "Amount",
      "Balance",
      "المبلغ",
      "المبلغ المستحق",
      "رصيد التمويل",
      "رصيد",
    ],
  },
  {
    key: "اسم العميل",
    label: "اسم العميل",
    type: "text",
    aliases: ["اسم العميل", "CUST_NAME_1", "CUST_NAME_2", "Customer Name", "Client Name", "Name", "العميل", "الاسم"],
  },
  {
    key: "نوع المنتج",
    label: "نوع المنتج",
    type: "text",
    aliases: [
      "نوع المنتج",
      "PRODUCT_CATEGORY",
      "Product",
      "Product Type",
      "المنتج",
      "التمويل العقاري",
      "التمويل الشخصي",
      "التمويل التأجيري",
      "البطاقات الائتمانية",
      "بطاقات ائتمانية",
    ],
  },
  {
    key: "رقم الهوية",
    label: "رقم الهوية",
    type: "text",
    aliases: ["رقم الهوية", "رقم الهويه", "CUST_ID_NO", "National ID", "ID Number", "السجل المدني", "هوية"],
  },
  {
    key: "تاريخ التجميد",
    label: "تاريخ التجميد",
    type: "date",
    aliases: ["تاريخ التجميد", "jWO_DT", "jWO-DT", "JWO_DT", "JWO-DT", "jwodt", "WO_DT", "Write Off Date", "تاريخ الشطب"],
  },
  {
    key: "رقم الجوال",
    label: "رقم الجوال",
    type: "phone",
    aliases: ["رقم الجوال", "الجوال", "CUST_PHONE_MOBILE_1", "CUST_PHONE_MOBILE_2", "Mobile", "Phone", "موبايل"],
  },
  {
    key: "نوع الطلب",
    label: "نوع الطلب",
    type: "reqType",
    aliases: ["نوع الطلب", "Request Type", "RequestType", "نوع طلب"],
  },
  {
    key: "رقم الطلب",
    label: "رقم الطلب",
    type: "text",
    aliases: [
      "رقم الطلب",
      "Request Number",
      "Request No",
      "رقم طلب سبيل",
      "رقم طلب سيبل",
      "رقم الطلب في نظام سيبل",
      "Siebel Request No",
      "Siebel No",
    ],
  },
  {
    key: "حالة الطلب",
    label: "حالة الطلب",
    type: "text",
    aliases: ["حالة الطلب", "حاله الطلب", "Request Status", "Status", "تصنيف الطلب"],
  },
  {
    key: "تاريخ فتح الطلب",
    label: "تاريخ فتح الطلب",
    type: "date",
    aliases: ["تاريخ فتح الطلب", "Open Date", "Created Date", "تاريخ الطلب"],
  },
  {
    key: "الوصف",
    label: "الوصف",
    type: "text",
    aliases: ["الوصف", "Description", "Desc", "تفاصيل", "ملخص"],
  },
];


export const UNIFIED_KEYS = UNIFIED_COLUMNS.map((c) => c.key);

/**
 * Guarantees a row exposes every unified column, in the mandatory order.
 * Missing columns are created with a `null` value; existing data is untouched.
 */
export function ensureUnifiedRow<T extends Record<string, any>>(row: T): T {
  const src: Record<string, any> = { ...(row || {}) };
  const out: Record<string, any> = {};
  // unified columns first, in the mandatory order
  for (const k of UNIFIED_KEYS) out[k] = src[k] === undefined ? null : src[k];
  // any extra source columns keep their data after the unified block
  for (const k of Object.keys(src)) if (!(k in out)) out[k] = src[k];
  return out as T;
}

/** Applies `ensureUnifiedRow` to a list of rows. */
export function ensureUnifiedRows<T extends Record<string, any>>(rows: T[]): T[] {
  return (rows || []).map(ensureUnifiedRow);
}
