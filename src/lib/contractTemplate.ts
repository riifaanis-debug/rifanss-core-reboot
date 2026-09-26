import rifansLogo from '@/assets/rifans-logo.png';
import rifansStampImg from '@/assets/rifans-stamp.png';

export interface ContractData {
  submissionId: string;
  submission?: any;
  fileNumber?: string;
  contractTitle?: string;
  isRescheduling?: boolean;
  isSeizedAmounts?: boolean;
  contractDate?: string;
  clientName?: string;
  nationalId?: string;
  mobile?: string;
  bank?: string;
  products?: Array<{
    type: string;
    accountNumber?: string;
    account_number?: string;
    amount: number | string;
  }>;
  totalDebt?: number;
  signatureData?: string | null;
  signedAt?: string | null;
  isAlreadySigned?: boolean;
}

export function formatAmount(val: any): string {
  const num = Number(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

export function formatArabicDate(dateInput?: any): string {
  if (!dateInput) return new Date().toLocaleDateString('ar-SA');
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('ar-SA');
  } catch {
    return String(dateInput);
  }
}

/**
 * Extracts normalized ContractData from either a ContractData object,
 * an HTMLElement with __contractData attached, or by parsing the DOM.
 */
export function extractContractData(input: HTMLElement | ContractData): ContractData {
  if (input && typeof (input as any).submissionId === 'string') {
    return input as ContractData;
  }

  const el = input as HTMLElement;
  if ((el as any)?.__contractData) {
    return (el as any).__contractData as ContractData;
  }

  // Fallback: Parse from DOM
  const text = el.innerText || el.textContent || '';
  const isRescheduling = text.includes('جدولة') || text.includes('rescheduling');
  const isSeizedAmounts = text.includes('النسبة النظامية') || text.includes('المبالغ المحجوزة') || text.includes('seized');

  // Extract reference / file number
  const refMatch = text.match(/(?:رقم ملف العميل|رقم العقد|رقم المرجع|المرجع|الملف)\s*[:：]?\s*([0-9A-Za-z_-]+)/);
  const submissionId = refMatch ? refMatch[1] : `CR-${Date.now()}`;

  // Extract client name
  const nameMatch = text.match(/(?:اسم العميل|الطرف الثاني)\s*[:：]?\s*([^\n\r,]+)/);
  const clientName = nameMatch ? nameMatch[1].trim() : 'العميل الكريم';

  // Extract national id
  const idMatch = text.match(/(?:رقم الهوية الوطنية|رقم الهوية|السجل المدني)\s*[:：]?\s*([0-9]{10})/);
  const nationalId = idMatch ? idMatch[1] : '---';

  // Extract mobile
  const mobMatch = text.match(/(?:رقم الجوال|الجوال)\s*[:：]?\s*([0-9+]{9,14})/);
  const mobile = mobMatch ? mobMatch[1] : '---';

  // Extract bank
  const bankMatch = text.match(/(?:اسم الجهة التمويلية|الجهة التمويلية|البنك)\s*[:：]?\s*([^\n\r,]+)/);
  const bank = bankMatch ? bankMatch[1].trim() : 'الجهة المالية';

  // Extract contract title
  let contractTitle = 'عقد تفويض ومتابعة طلب إعفاء تمويلي';
  if (isRescheduling) contractTitle = 'عقد تفويض ومتابعة طلب جدولة منتجات تمويلية';
  if (isSeizedAmounts) contractTitle = 'عقد تفويض ومتابعة طلب إتاحة النسبة النظامية';

  // Extract signature img
  const sigImg = el.querySelector('img[alt*="توقيع"], img[alt*="signature"]') as HTMLImageElement;
  const signatureData = sigImg ? sigImg.src : null;

  return {
    submissionId,
    clientName,
    nationalId,
    mobile,
    bank,
    contractTitle,
    isRescheduling,
    isSeizedAmounts,
    contractDate: formatArabicDate(new Date()),
    products: [],
    totalDebt: 0,
    signatureData,
    isAlreadySigned: !!signatureData,
  };
}

/**
 * Builds the official 3-page A4 contract HTML structure.
 * Designed strictly to A4 proportions (210mm x 297mm) with balanced margins,
 * unified company headers, dynamic page-numbered footers, and unbreakable clauses.
 */
export function buildOfficialContractA4Pages(raw: HTMLElement | ContractData): string {
  const data = extractContractData(raw);

  const submission = data.submission || {};
  const subData = submission.data || {};

  const clientName =
    data.clientName ||
    [subData.firstName, subData.middleName, subData.lastName].filter(Boolean).join(' ') ||
    'العميل الكريم';

  const nationalId =
    data.nationalId ||
    subData.nationalId ||
    subData.userNationalId ||
    '---';

  const mobile =
    data.mobile ||
    subData.mobile ||
    subData.phone ||
    '---';

  const bank =
    data.bank ||
    subData.bank ||
    (data.isRescheduling ? 'الجهات التمويلية والبنوك' : 'البنك الأهلي السعودي');

  const submissionId = data.submissionId || data.fileNumber || subData.id || `1787873399904`;
  const contractDate = data.contractDate || formatArabicDate(submission.timestamp || new Date());

  const isRescheduling = !!data.isRescheduling;
  const isSeizedAmounts = !!data.isSeizedAmounts;

  let contractTitle = data.contractTitle;
  if (!contractTitle) {
    if (isRescheduling) contractTitle = 'عقد تفويض ومتابعة طلب جدولة منتجات تمويلية';
    else if (isSeizedAmounts) contractTitle = 'عقد تفويض ومتابعة طلب إتاحة النسبة النظامية';
    else contractTitle = 'عقد تفويض ومتابعة طلب إعفاء تمويلي';
  }

  // Products
  const products = Array.isArray(data.products) && data.products.length > 0
    ? data.products
    : (Array.isArray(subData.products) ? subData.products : []);

  const totalDebt = data.totalDebt || products.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0) || 0;

  // Signature
  const signatureData = data.signatureData || submission.signature_data || null;
  const signedAt = data.signedAt || submission.signed_at || null;
  const isSigned = data.isAlreadySigned || !!signatureData;

  // Render Header
  const renderHeader = () => `
    <div class="a4-header" style="margin-bottom: 14px; padding-bottom: 10px; border-bottom: 2.5px solid #C5A059;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="text-align: left; direction: ltr;">
          <div style="font-size: 14px; font-weight: 800; color: #22042C; letter-spacing: 0.5px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            RIFANIS FINANCIAL COMPANY
          </div>
          <div style="font-size: 10px; font-weight: 500; color: #666666; margin-top: 2px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Limited Liability Company | Riyadh, KSA
          </div>
        </div>
        <div>
          <img src="${rifansLogo}" alt="Rifanis Financial" style="height: 48px; width: auto; object-fit: contain;" />
        </div>
      </div>
    </div>
  `;

  // Render Footer
  const renderFooter = (pageIndex: number, totalPages: number = 3) => `
    <div class="a4-footer" style="margin-top: auto; padding-top: 8px; border-top: 1.5px solid #E5E7EB;">
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #4B5563; direction: ltr; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="font-weight: 700; color: #22042C;">rifanss.com</div>
        <div style="font-weight: 700; color: #22042C;">Page ${pageIndex} of ${totalPages}</div>
        <div style="font-weight: 600; color: #6B7280;">© 2026 Rifanis Financial</div>
      </div>
    </div>
  `;

  // Content Preamble Text
  let preambleText = '';
  if (isRescheduling) {
    preambleText = `حيث إن الطرف الثاني يرغب في توكيل الطرف الأول ومتابعته لدى الجهات التمويلية والبنوك لإعادة جدولة المنتجات التمويلية القائمة في ذمته وتخفيض الالتزامات الشهرية بما يتناسب مع دخله المالي وإعادة هيكلة مديونياته، وحيث إن الطرف الأول يمتلك الخبرة المهنية والنظامية في دراسة ومتابعة طلبات إعادة الجدولة وإعداد الحلول الائتمانية لدى البنوك والجهات التمويلية، فقد التقت إرادة الطرفين بكامل الأهلية المعتبرة شرعاً ونظاماً على إبرام هذا العقد وفقاً للشروط والبنود التالية:`;
  } else if (isSeizedAmounts) {
    preambleText = `حيث إن الطرف الثاني يرغب في توكيل الطرف الأول ومتابعته لدى الجهات التمويلية والبنوك لإتاحة النسبة النظامية المستثناة واسترداد المبالغ المحجوزة من مستحقاته ورواتبه بما يتوافق مع الأنظمة والتعليمات الصادرة من البنك المركزي السعودي ومحاكم التنفيذ، وحيث إن الطرف الأول يمتلك الخبرة المهنية والنظامية في دراسة ومتابعة طلبات استرداد المبالغ وإتاحة النسب المستثناة وإعداد المذكرات والمخاطبات الرسمية لدى البنوك والجهات المختصة، فقد التقت إرادة الطرفين بكامل الأهلية المعتبرة شرعاً ونظاماً على إبرام هذا العقد وفقاً للشروط والبنود التالية:`;
  } else {
    preambleText = `حيث إن الطرف الثاني يرغب في تفويض الطرف الأول ومتابعته لدى ${bank} لطلب الإعفاء من الالتزامات التمويلية المترتبة عليه وفقاً للتعليمات والأنظمة واللوائح المعتمدة، وحيث إن الطرف الأول يمتلك الخبرة المهنية في دراسة ومتابعة طلبات الإعفاء وإعداد المذكرات القانونية والمخاطبات الرسمية لدى البنوك والجهات التمويلية ، فقد التقت إرادة الطرفين بكامل الأهلية المعتبرة شرعاً ونظاماً على إبرام هذا العقد وفقاً للشروط والبنود التالية:`;
  }

  // Article 2 text
  let article2Text = '';
  if (isRescheduling) {
    article2Text = `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب إعادة جدولة المنتجات التمويلية الخاصة به لدى ${bank}، وذلك فيما يتعلق بمنتجات التمويل الموضحة أدناه:`;
  } else if (isSeizedAmounts) {
    article2Text = `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز لدى ${bank}، وذلك فيما يتعلق بالمبالغ والمنتجات الموضحة أدناه:`;
  } else {
    article2Text = `يفوض الطرف الثاني بموجب هذا العقد تفويضاً صريحاً ومباشراً وقابلاً للتنفيذ للطرف الأول في استلام وتقديم ومتابعة طلب الإعفاء المقدم من الطرف الثاني لدى ${bank}، وذلك فيما يتعلق بمنتجات التمويل الموضحة أدناه:`;
  }

  // Article 3 items
  const scopeItems = isRescheduling
    ? [
        'الاطلاع على المستندات والبيانات المالية وتفاصيل المنتجات التمويلية والأقساط الشهرية الخاصة بالطرف الثاني.',
        'التواصل المباشر مع البنوك والجهات التمويلية واللجان الائتمانية والبنك المركزي السعودي فيما يخص طلب إعادة الجدولة وتخفيض الأقساط.',
        'إعداد وصياغة ومتابعة طلبات إعادة الهيكلة وتقديم الحلول التمويلية البديلة وإرفاق المذكرات المالية اللازمة لتعزيز قبول الطلب.'
      ]
    : (isSeizedAmounts
      ? [
          'الاطلاع على الحسابات البنكية والقرارات التنفيذية والمستندات الرسمية الصادرة بحق الطرف الثاني.',
          'التواصل مع البنوك ومحاكم التنفيذ ومؤسسة النقد (البنك المركزي السعودي) لمتابعة واسترداد المبالغ المحجوزة خارج النسبة النظامية.',
          'رفع الطلبات ومتابعتها وإعداد المذكرات النظامية والحضور النظامي أمام اللجان المصرفية وجهات الاختصاص لإنفاذ النسبة المستثناة.'
        ]
      : [
          'الاطلاع على التقارير الطبية والمستندات الرسمية الخاصة بالطرف الثاني.',
          'التواصل مع البنك الأهلي السعودي، البنك المركزي السعودي، واللجان المختصة.',
          'رفع طلبات الإعفاء ومتابعتها، وإعداد المذكرات القانونية والاعتراضات والحضور النظامي عند الحاجة.'
        ]);

  // Article 6 text
  let article6Text = '';
  if (isRescheduling) {
    article6Text = 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قرار الموافقة على إعادة جدولة المنتجات التمويلية وإتمام الإجراءات ذات العلاقة. وفي حال صدور القرار يستحق الطرف الأول أتعاباً مقطوعة قدرها: 2,000 ريال سعودي فقط.';
  } else if (isSeizedAmounts) {
    article6Text = 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قرار إتاحة النسبة النظامية واسترداد المبالغ المستثناه من الحجز وإيداعها في حساب الطرف الثاني. وفي حال صدور القرار، يستحق الطرف الأول أتعاباً مقطوعة قدرها (1%) من إجمالي المبالغ المستردة فعلياً.';
  } else {
    article6Text = 'لا تستحق أتعاب الطرف الأول إلا بعد صدور قبول طلب الإعفاء وإصدار خطاب المخالصة المالية، وفي حال قبول طلب الإعفاء، يستحق الطرف الأول أتعاباً مقطوعة قدرها (4%) من إجمالي المبالغ المعفاة فعلياً.';
  }

  // Article 7 text
  let article7Text = '';
  if (isRescheduling) {
    article7Text = 'يبدأ العمل بهذا العقد من تاريخ توقيعه، ويستمر سارياً حتى صدور القرار النهائي بشأن طلب إعادة الجدولة وإتمام كافة الإجراءات ذات العلاقة، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.';
  } else if (isSeizedAmounts) {
    article7Text = 'يبدأ العمل بهذا العقد من تاريخ توقيعه، ويستمر سارياً حتى صدور القرار النهائي بشأن استرداد المبالغ وإتاحة النسبة النظامية، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.';
  } else {
    article7Text = 'يبدأ العمل بهذا العقد من تاريخ توقيعه، ويستمر سارياً حتى قبول طلب الإعفاء، ما لم يتم إنهاؤه باتفاق مكتوب بين الطرفين أو وفقاً للأنظمة.';
  }

  // Article 8 values
  let bondValueText = '';
  let bondDueText = '';
  if (isRescheduling) {
    bondValueText = '2,000 ريال سعودي';
    bondDueText = 'فور صدور الموافقة على طلب إعادة الجدولة';
  } else if (isSeizedAmounts) {
    bondValueText = 'تمثل نسبة (1%) من إجمالي المبالغ المستردة فعلياً';
    bondDueText = 'فور صدور قرار إتاحة النسبة النظامية واسترداد المبالغ';
  } else {
    bondValueText = 'تمثل نسبة (4%) من إجمالي مبالغ المنتجات التمويلية المعفاة فعليًا';
    bondDueText = 'فور قبول طلب الإعفاء واستلام خطاب المخالصة المالية الصادر من الجهة المختصة';
  }

  // Article 12 text
  let article12Text = '';
  if (isRescheduling) {
    article12Text = `
      <p style="margin: 0 0 6px 0; text-align: right; font-size: 11px; line-height: 1.65;">أقر أنا الموقع أدناه وبكامل أهليتي المعتبرة شرعاً ونظاماً بأنني قد فوضت شركة ريفانس المالية، سجل تجاري رقم 7038821125 تفويضاً كاملاً غير مشروط بمراجعة كافة الجهات الحكومية والخاصة والجهات التمويلية (البنوك والمصارف وشركات التمويل) والبنك المركزي السعودي وشركة المعلومات الائتمانية (سمة)، وذلك للاطلاع على كافة بياناتي الائتمانية والتمويلية والالتزامات القائمة.</p>
      <p style="margin: 0 0 6px 0; text-align: right; font-size: 11px; line-height: 1.65;">كما يشمل هذا التفويض حق تقديم طلبات إعادة جدولة المنتجات التمويلية، وطلب تخفيض الأقساط الشهرية أو تسوية الالتزامات واستلام خطابات الموافقة وقرارات إعادة الهيكلة وجداول السداد الجديدة، ومتابعة كافة الإجراءات المتعلقة بملفي لدى البنك المركزي السعودي وكافة اللجان القضائية والرقابية والتمويلية.</p>
      <p style="margin: 0; text-align: right; font-size: 11px; line-height: 1.65;">ويعد هذا التفويض سارياً من تاريخ توقيعه وحتى انتهاء الغرض الذي أعد من أجله أو قيامي بإلغائه رسمياً عبر القنوات المعتمدة لدى الشركة، مع التزامي بكافة النتائج والآثار القانونية والمالية المترتبة على هذا التفويض.</p>
    `;
  } else {
    article12Text = `
      <p style="margin: 0 0 6px 0; text-align: right; font-size: 11px; line-height: 1.65;">أقر أنا الموقع أدناه وبكامل أهليتي المعتبرة شرعاً ونظاماً بأنني قد فوضت شركة ريفانس المالية، سجل تجاري رقم 7038821125 تفويضاً كاملاً غير مشروط بمراجعة كافة الجهات الحكومية والخاصة والجهات التمويلية (البنوك والمصارف وشركات التمويل) وشركة المعلومات الائتمانية (سمة)، وذلك للاطلاع على كافة بياناتي الائتمانية والتمويلية والطبية.</p>
      <p style="margin: 0 0 6px 0; text-align: right; font-size: 11px; line-height: 1.65;">كما يشمل هذا التفويض حق تقديم طلبات الإعفاء من المديونيات، أو طلبات إعادة الجدولة، أو تسوية الالتزامات واستلام خطابات المخالصة أو قرارات الإعفاء، ومتابعة كافة الإجراءات المتعلقة بملفي لدى البنك المركزي السعودي وكافة اللجان القضائية والرقابية.</p>
      <p style="margin: 0; text-align: right; font-size: 11px; line-height: 1.65;">ويعد هذا التفويض سارياً من تاريخ توقيعه وحتى انتهاء الغرض الذي أعد من أجله أو قيامي بإلغائه رسمياً عبر القنوات المعتمدة لدى الشركة، مع التزامي بكافة النتائج والآثار القانونية المترتبة على هذا التفويض.</p>
    `;
  }

  // Render Product Rows
  const renderProductRows = () => {
    if (products.length === 0) {
      return `
        <tr>
          <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right;">${bank}</td>
          <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right;">تمويل شخصي / عقاري</td>
          <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right; font-family: monospace;">---</td>
          <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right; font-weight: 700;">--- ريال</td>
        </tr>
      `;
    }
    return products.map((p: any) => `
      <tr>
        <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right;">${bank}</td>
        <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right;">${p.type || 'منتج تمويلي'}</td>
        <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right; font-family: monospace;">${p.accountNumber || p.account_number || '---'}</td>
        <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right; font-weight: 700; color: #22042C;">${formatAmount(p.amount)} ريال سعودي</td>
      </tr>
    `).join('');
  };

  /* ─────────────────────────────────────────────────────────────
   * HTML FOR PAGE 1
   * ───────────────────────────────────────────────────────────── */
  const page1Html = `
    <div class="contract-a4-page" style="box-sizing: border-box; width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; padding: 12mm 15mm 12mm 15mm; background: #ffffff; color: #1f2937; font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; direction: rtl; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;">
      <div>
        ${renderHeader()}

        <!-- Title & Metadata -->
        <div style="text-align: center; margin-bottom: 14px;">
          <div style="font-size: 13.5px; font-weight: 800; color: #22042C; margin-bottom: 3px;">
            شركة ريفانس المالية
          </div>
          <div style="font-size: 15px; font-weight: 800; color: #22042C; background: #FAF6ED; border: 1.5px solid #EADBBA; border-radius: 8px; padding: 6px 18px; display: inline-block;">
            ${contractTitle}
          </div>
          <div style="display: flex; justify-content: center; gap: 20px; margin-top: 6px; font-size: 11px; color: #374151; background: #F9FAFB; padding: 6px 14px; border-radius: 6px; border: 1px solid #E5E7EB;">
            <span>رقم ملف العميل: <strong style="font-family: monospace; color: #22042C; font-size: 11.5px;">${submissionId}</strong></span>
            <span>رقم العقد: <strong style="font-family: monospace; color: #22042C; font-size: 11.5px;">${submissionId}</strong></span>
            <span>تاريخ العقد: <strong style="color: #22042C;">${contractDate}</strong></span>
          </div>
        </div>

        <!-- Parties Table -->
        <div style="border: 1px solid #D1D5DB; border-radius: 8px; overflow: hidden; margin-bottom: 14px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
            <thead>
              <tr style="background: #F3EFF5; border-bottom: 1.5px solid #D1D5DB;">
                <th style="padding: 6px 12px; font-weight: 800; color: #22042C; text-align: right; width: 50%; border-left: 1px solid #D1D5DB; font-size: 12px;">الطرف الأول</th>
                <th style="padding: 6px 12px; font-weight: 800; color: #22042C; text-align: right; width: 50%; font-size: 12px;">الطرف الثاني</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px 12px; vertical-align: top; border-left: 1px solid #E5E7EB; line-height: 1.75;">
                  <div><strong>الاسم:</strong> شركة ريفانس المالية</div>
                  <div><strong>الرقم الوطني الموحد:</strong> 7038821125</div>
                  <div><strong>ويمثلها:</strong> AZZAH ALOBIDI بصفة المدير العام</div>
                  <div><strong>وبموجب تفويض رقم:</strong> DLG398908</div>
                </td>
                <td style="padding: 8px 12px; vertical-align: top; line-height: 1.75;">
                  <div><strong>اسم العميل:</strong> ${clientName}</div>
                  <div><strong>رقم الهوية الوطنية:</strong> <span style="font-family: monospace; font-weight: 700;">${nationalId}</span></div>
                  <div><strong>رقم الجوال:</strong> <span style="direction: ltr; display: inline-block; font-weight: 700;">${mobile}</span></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Preamble -->
        <div style="margin-bottom: 14px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">التمهيد:</h3>
          <p style="font-size: 11.5px; line-height: 1.7; text-align: right; margin: 0; color: #1f2937;">${preambleText}</p>
        </div>

        <!-- Article 1 -->
        <div style="margin-bottom: 14px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (1): حجية التعامل الإلكتروني</h3>
          <p style="font-size: 11.5px; line-height: 1.7; text-align: right; margin: 0; color: #1f2937;">
            يقر الطرفان بموافقتهما على إبرام هذا العقد واستخدام الوسائل الإلكترونية (البريد الإلكتروني والرسائل النصية) لتوثيقه، وتعد هذه الوسائل حجة ملزمة وقائمة بذاتها وفقاً لنظام التعاملات الإلكترونية السعودي، ولها ذات الحجية القانونية للتوقيع اليدوي أمام كافة الجهات الرسمية والقضائية.
          </p>
        </div>

        <!-- Article 2 + Financial Products Table -->
        <div style="margin-bottom: 6px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (2): موضوع العقد والتفويض</h3>
          <p style="font-size: 11.5px; line-height: 1.7; text-align: right; margin: 0 0 8px 0; color: #1f2937;">
            ${article2Text}
          </p>
          <div style="border: 1px solid #D1D5DB; border-radius: 8px; overflow: hidden;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <thead>
                <tr style="background: #F3EFF5; border-bottom: 1.5px solid #D1D5DB;">
                  <th style="padding: 6px 10px; font-weight: 800; color: #22042C; text-align: right; border-left: 1px solid #D1D5DB;">الجهة التمويلية</th>
                  <th style="padding: 6px 10px; font-weight: 800; color: #22042C; text-align: right; border-left: 1px solid #D1D5DB;">نوع المنتج</th>
                  <th style="padding: 6px 10px; font-weight: 800; color: #22042C; text-align: right; border-left: 1px solid #D1D5DB;">رقم الحساب</th>
                  <th style="padding: 6px 10px; font-weight: 800; color: #22042C; text-align: right;">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                ${renderProductRows()}
                <tr style="background: #FAF6ED; border-top: 1.5px solid #C5A059;">
                  <td colspan="3" style="padding: 7px 10px; font-weight: 800; color: #22042C; text-align: right; font-size: 11.5px;">إجمالي المديونية:</td>
                  <td style="padding: 7px 10px; font-weight: 900; color: #dc2626; text-align: right; font-size: 12.5px;">${formatAmount(totalDebt)} ريال سعودي</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      ${renderFooter(1, 3)}
    </div>
  `;

  /* ─────────────────────────────────────────────────────────────
   * HTML FOR PAGE 2
   * ───────────────────────────────────────────────────────────── */
  const page2Html = `
    <div class="contract-a4-page" style="box-sizing: border-box; width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; padding: 12mm 15mm 12mm 15mm; background: #ffffff; color: #1f2937; font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; direction: rtl; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;">
      <div>
        ${renderHeader()}

        <!-- Article 3 -->
        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (3): نطاق التفويض</h3>
          <p style="font-size: 11.5px; line-height: 1.65; margin: 0 0 4px 0; color: #1f2937;">يشمل التفويض الممنوح للطرف الأول الصلاحيات التالية:</p>
          <div style="padding-right: 8px; font-size: 11.5px; line-height: 1.65; color: #1f2937;">
            ${scopeItems.map((item, idx) => `<div style="margin-bottom: 2px;"><strong>${idx + 1}.</strong> ${item}</div>`).join('')}
          </div>
        </div>

        <!-- Article 4 -->
        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (4): التزامات الطرف الأول</h3>
          <p style="font-size: 11.5px; line-height: 1.65; text-align: right; margin: 0; color: #1f2937;">
            يلتزم الطرف الأول بالمحافظة على سرية بيانات الطرف الثاني، وبذل أقصى درجات العناية المهنية، ورفع الطلبات بصيغة رسمية تعزز فرص القبول، وإبلاغ الطرف الثاني بالمستجدات دورياً.
          </p>
        </div>

        <!-- Article 5 -->
        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (5): التزامات الطرف الثاني</h3>
          <p style="font-size: 11.5px; line-height: 1.65; text-align: right; margin: 0; color: #1f2937;">
            يلتزم الطرف الثاني بتقديم كافة المستندات والبيانات الصحيحة، التعاون مع الطرف الأول لاستكمال النواقص، والالتزام بسداد الأتعاب المستحقة وفقاً لأحكام العقد.
          </p>
        </div>

        <!-- Article 6 -->
        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (6): المستحقات المالية والأتعاب</h3>
          <p style="font-size: 11.5px; line-height: 1.65; text-align: right; margin: 0 0 4px 0; color: #1f2937;">
            ${article6Text}
          </p>
          <div style="font-size: 11.5px; font-weight: 800; color: #dc2626; background: #FEF2F2; padding: 4px 10px; border-radius: 5px; border: 1px solid #FECACA; display: inline-block;">
            "وفي حال عدم قبول الطلب، لا يحق للطرف الأول المطالبة بأي أتعاب"
          </div>
        </div>

        <!-- Article 7 -->
        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (7): مدة العقد</h3>
          <p style="font-size: 11.5px; line-height: 1.65; text-align: right; margin: 0; color: #1f2937;">
            ${article7Text}
          </p>
        </div>

        <!-- Article 8 + Promissory Note Table -->
        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (8): سند لأمر وإقرار دين واجب النفاذ</h3>
          <p style="font-size: 11.5px; line-height: 1.65; text-align: right; margin: 0 0 6px 0; color: #1f2937;">
            اتفق الطرفان على أن يُعد هذا العقد بمثابة سندٍ لأمرٍ واجب النفاذ وفقًا لأحكام نظام الأوراق التجارية ونظام التنفيذ السعودي، ويقر الطرف الثاني إقرارًا صريحًا ونهائيًا بالتزامه بسداد أتعاب الطرف الأول فور تحقق موجبات استحقاقها النظامية الموضحة في هذا العقد.
          </p>

          <div style="border: 1px solid #D1D5DB; border-radius: 8px; overflow: hidden; margin-bottom: 6px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
              <tbody>
                <tr style="background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 5px 12px; font-weight: 700; color: #4B5563; width: 140px; border-left: 1px solid #E5E7EB;">رقم ملف العميل:</td>
                  <td style="padding: 5px 12px; font-weight: 800; color: #22042C; font-family: monospace;">${submissionId}</td>
                </tr>
                <tr style="background: #ffffff; border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 5px 12px; font-weight: 700; color: #4B5563; border-left: 1px solid #E5E7EB;">رقم السند:</td>
                  <td style="padding: 5px 12px; font-weight: 800; color: #22042C; font-family: monospace;">${submissionId}</td>
                </tr>
                <tr style="background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 5px 12px; font-weight: 700; color: #4B5563; border-left: 1px solid #E5E7EB;">قيمة السند:</td>
                  <td style="padding: 5px 12px; font-weight: 800; color: #22042C;">${bondValueText}</td>
                </tr>
                <tr style="background: #ffffff; border-bottom: 1px solid #E5E7EB;">
                  <td style="padding: 5px 12px; font-weight: 700; color: #4B5563; border-left: 1px solid #E5E7EB;">تاريخ الاستحقاق:</td>
                  <td style="padding: 5px 12px; font-weight: 800; color: #22042C;">${bondDueText}</td>
                </tr>
                <tr style="background: #F9FAFB;">
                  <td style="padding: 5px 12px; font-weight: 700; color: #4B5563; border-left: 1px solid #E5E7EB;">مكان الوفاء:</td>
                  <td style="padding: 5px 12px; font-weight: 800; color: #22042C;">مدينة جدة – المملكة العربية السعودية</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style="font-size: 10px; line-height: 1.55; text-align: right; margin: 0; color: #4B5563;">
            ويُعد هذا السند مستوفيًا لكافة البيانات والشروط النظامية المقررة، ويُعد دينًا ثابتًا في ذمة الطرف الثاني، ويحق للطرف الأول التقدم به مباشرة إلى محكمة التنفيذ المختصة لتنفيذه وفقًا للأنظمة المعمول بها في المملكة العربية السعودية.
          </p>
        </div>

        <!-- Article 9 -->
        <div>
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (9): أحكام عامة</h3>
          <p style="font-size: 11.5px; line-height: 1.65; text-align: right; margin: 0; color: #1f2937;">
            يخضع العقد لأنظمة المملكة العربية السعودية. لا يُعد أي تعديل نافذاً إلا إذا كان مكتوباً وموقعاً من الطرفين.
          </p>
        </div>
      </div>

      ${renderFooter(2, 3)}
    </div>
  `;

  /* ─────────────────────────────────────────────────────────────
   * HTML FOR PAGE 3
   * ───────────────────────────────────────────────────────────── */
  const page3Html = `
    <div class="contract-a4-page" style="box-sizing: border-box; width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; padding: 12mm 15mm 12mm 15mm; background: #ffffff; color: #1f2937; font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; direction: rtl; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;">
      <div>
        ${renderHeader()}

        <!-- Article 10 -->
        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (10): الإقرار والتنازل عن الدفوع</h3>
          <p style="font-size: 11.5px; line-height: 1.65; margin: 0 0 4px 0; color: #1f2937;">يُقر الطرف الثاني إقراراً صريحاً ونهائياً بما يلي:</p>
          <div style="padding-right: 8px; font-size: 11px; line-height: 1.65; color: #1f2937;">
            <div style="margin-bottom: 2px;"><strong>1.</strong> صحة جميع البيانات والمستندات المقدمة منه.</div>
            <div style="margin-bottom: 2px;"><strong>2.</strong> صحة احتساب الأتعاب وفق ما ورد في هذا العقد.</div>
            <div style="margin-bottom: 2px;"><strong>3.</strong> التنازل عن أي دفوع أو منازعات تتعلق بسند الأمر متى ما تم إصداره عبر منصة نافذ وفق أحكام هذا العقد.</div>
            <div><strong>4.</strong> عدم الطعن أو الاعتراض على التنفيذ أمام محكمة التنفيذ إلا في الحدود التي يجيزها النظام.</div>
          </div>
        </div>

        <!-- Article 11 -->
        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (11): الإقرار والقبول النهائي</h3>
          <p style="font-size: 11.5px; line-height: 1.65; text-align: right; margin: 0; color: #1f2937;">
            يُقر الطرف الثاني بما يلي: اطلاعه الكامل على العقد وفهمه لآثاره، صحة التفويض الممنوح، صحة احتساب الأتعاب، وأن هذا الإقرار حجة قاطعة وملزمة أمام جميع الجهات القضائية والتنفيذية.
          </p>
        </div>

        <!-- Article 12 -->
        <div style="margin-bottom: 14px;">
          <h3 style="font-size: 13.5px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">المادة (12): التفويض</h3>
          <div style="font-size: 11px; line-height: 1.65; color: #1f2937;">
            ${article12Text}
          </div>
        </div>

        <!-- Official Signatures Section -->
        <div style="border: 1.5px solid #22042C; border-radius: 8px; padding: 8px 12px; background: #FAFAFA; margin-bottom: 10px;">
          <div style="font-size: 13px; font-weight: 800; color: #22042C; text-align: center; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; margin-bottom: 8px;">
            اعتماد وتوقيع أطراف العقد
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <!-- First Party Stamp -->
            <div style="text-align: center; border-left: 1px solid #E5E7EB; padding-left: 8px;">
              <div style="font-size: 11.5px; font-weight: 800; color: #22042C; margin-bottom: 3px;">
                ختم وتوقيع الطرف الأول
              </div>
              <div style="height: 85px; display: flex; align-items: center; justify-content: center;">
                <img src="${rifansStampImg}" alt="ختم ريفانس المالية" style="max-height: 85px; width: auto; object-fit: contain; mix-blend-mode: multiply;" />
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #22042C; margin-top: 2px;">
                شركة ريفانس المالية
              </div>
              <div style="font-size: 9.5px; color: #16a34a; font-weight: 700;">
                ✓ معتمد وموثق إلكترونياً
              </div>
            </div>

            <!-- Second Party Signature -->
            <div style="text-align: center; padding-right: 8px;">
              <div style="font-size: 11.5px; font-weight: 800; color: #22042C; margin-bottom: 3px;">
                توقيع الطرف الثاني (العميل)
              </div>
              <div style="height: 85px; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px dashed #D1D5DB; border-radius: 6px; padding: 4px;">
                ${signatureData ? `
                  <img src="${signatureData}" alt="توقيع العميل" style="max-height: 80px; max-width: 100%; object-fit: contain;" />
                ` : (isSigned ? `
                  <div style="color: #16a34a; font-size: 10.5px; font-weight: 700;">
                    ✓ تم التوقيع والاعتماد الإلكتروني
                  </div>
                ` : `
                  <div style="color: #9CA3AF; font-size: 10.5px; font-style: italic;">
                    بانتظار التوقيع الإلكتروني للعميل
                  </div>
                `)}
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #22042C; margin-top: 3px;">
                ${clientName}
              </div>
              <div style="font-size: 9.5px; color: #6B7280;">
                ${nationalId !== '---' ? `الهوية: ${nationalId}` : ''}
                ${signedAt ? ` • ${new Date(signedAt).toLocaleDateString('ar-SA')}` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Electronic Document Notice -->
        <div style="border-top: 1px solid #E5E7EB; padding-top: 6px; text-align: center; font-size: 9.5px; color: #6B7280;">
          <div>هذه الوثيقة صادرة عن النظام الإلكتروني لشركة ريفانس المالية وتعد ملزمة قانوناً ونظاماً بمجرد التوقيع والموافقة عليها.</div>
          <div style="margin-top: 2px;">رقم المرجع الإلكتروني: <strong style="font-family: monospace; color: #22042C;">${submissionId}</strong></div>
        </div>
      </div>

      ${renderFooter(3, 3)}
    </div>
  `;

  return `
    <div id="rifans-official-contract-wrapper" style="direction: rtl;">
      ${page1Html}
      ${page2Html}
      ${page3Html}
    </div>
  `;
}
