import rifansLogo from '@/assets/rifans-logo.png';
import rifansStampImg from '@/assets/rifans-stamp.png';

/* ═══════════════════════════════════════════════════════════════
 * المصدر الوحيد لنصوص وبيانات العقود (شاشة العميل + الطباعة + PDF)
 * ═══════════════════════════════════════════════════════════════ */

export type ContractKind = 'exemption' | 'rescheduling' | 'seized';

export interface ContractProduct {
  type: string;
  accountNumber?: string;
  account_number?: string;
  amount: number | string;
}

export interface ContractData {
  submissionId: string;
  submission?: any;
  fileNumber?: string;
  contractTitle?: string;
  kind?: ContractKind;
  isRescheduling?: boolean;
  isSeizedAmounts?: boolean;
  contractDate?: string;
  clientName?: string;
  nationalId?: string;
  mobile?: string;
  bank?: string;
  products?: ContractProduct[];
  totalDebt?: number;
  currentAccountNumber?: string;
  seizedAmount?: number | string;
  signatureData?: string | null;
  signedAt?: string | null;
  isAlreadySigned?: boolean;
}

/* ── بيانات الطرف الأول الثابتة ── */
export const FIRST_PARTY = {
  name: 'شركة ريفانس المالية',
  unifiedNumber: '7038821125',
  representative: 'AZZAH ALOBIDI',
  title: 'المدير العام',
  delegationNumber: 'DLG398908',
};

/* ── نسب الأتعاب حسب نوع الطلب ── */
export const FEE_RATES: Record<ContractKind, number> = {
  exemption: 0.04,
  rescheduling: 0.01,
  seized: 0.01,
};

export const FEE_BASIS_LABEL: Record<ContractKind, string> = {
  exemption: 'المبلغ المعفى فعلياً',
  rescheduling: 'إجمالي مديونية المنتجات التي تمت إعادة جدولتها فعلياً',
  seized: 'المبلغ الذي تمت إتاحته أو استرداده فعلياً',
};

export function resolveContractKind(type?: string | null): ContractKind {
  if (type === 'rescheduling_request' || type === 'scheduling_request') return 'rescheduling';
  if (type === 'seized_amounts_request') return 'seized';
  return 'exemption';
}

export function feeRateFor(kind: ContractKind): number {
  return FEE_RATES[kind];
}

export function calcFee(kind: ContractKind, actualAmount: number | string | null | undefined): number {
  const base = Number(actualAmount) || 0;
  if (base <= 0) return 0;
  return Math.round(base * FEE_RATES[kind] * 100) / 100;
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

/* ═══════════════════════════════════════════════════════════════
 * نصوص العقد المهيكلة
 * ═══════════════════════════════════════════════════════════════ */

export interface ContractSection {
  key: string;
  title: string;
  paragraphs?: string[];
  items?: string[];
  /** بلوك بيانات يُعرض داخل المادة: جدول المنتجات أو بيانات الحساب */
  block?: 'products' | 'account';
}

export interface ContractContent {
  kind: ContractKind;
  title: string;
  preamble: string[];
  sections: ContractSection[];
}

const ARTICLE_1: ContractSection = {
  key: 'a1',
  title: 'المادة (1): حجية التعامل والتوقيع الإلكتروني',
  paragraphs: [
    'يوافق الطرفان على إبرام هذا العقد وإتمام الإجراءات المرتبطة به باستخدام الوسائل الإلكترونية المعتمدة في المنصة، بما في ذلك التحقق الإلكتروني والتوقيع الإلكتروني والرسائل المرسلة إلى بيانات الاتصال المسجلة للطرف الثاني.',
    'ويتم توثيق موافقة الطرف الثاني وتوقيعه وفق الآلية الإلكترونية المعتمدة في النظام، مع الاحتفاظ بالسجلات الإلكترونية المرتبطة بعملية التحقق والتوقيع وفق الأنظمة المعمول بها في المملكة العربية السعودية.',
  ],
};

function requestLabel(kind: ContractKind): string {
  if (kind === 'rescheduling') return 'طلب إعادة الجدولة';
  if (kind === 'seized') return 'طلب إتاحة النسبة النظامية';
  return 'طلب الإعفاء';
}

function articles4and5(kind: ContractKind): ContractSection[] {
  const label = requestLabel(kind);
  return [
    {
      key: 'a4',
      title: 'المادة (4): التزامات الطرف الأول',
      paragraphs: [
        `يلتزم الطرف الأول ببذل العناية المهنية اللازمة، والمحافظة على سرية بيانات ومستندات الطرف الثاني، واستخدامها في حدود الغرض من الخدمة، ومتابعة ${label} وإبلاغ الطرف الثاني بالمستجدات الجوهرية، وعدم تقديم نتيجة الطلب على أنها نتيجة مضمونة.`,
      ],
    },
    {
      key: 'a5',
      title: 'المادة (5): التزامات الطرف الثاني',
      paragraphs: [
        `يلتزم الطرف الثاني بتقديم البيانات والمستندات الصحيحة والكاملة، والتعاون في استكمال المتطلبات، وإبلاغ الطرف الأول بأي تغيير جوهري يؤثر في ${label}، وسداد الأتعاب عند تحقق شروط استحقاقها.`,
      ],
    },
  ];
}

function commonTailSections(kind: ContractKind): ContractSection[] {
  const label = requestLabel(kind);

  const delegationParagraphs: string[] = [];
  if (kind === 'exemption') {
    delegationParagraphs.push(
      `يفوض الطرف الثاني الطرف الأول تفويضاً خاصاً بدراسة وتقديم ومتابعة طلب الإعفاء محل هذا العقد فقط، ولا يمتد هذا التفويض إلى إعادة الجدولة أو إتاحة النسبة النظامية أو أي خدمة أخرى.`
    );
  } else if (kind === 'rescheduling') {
    delegationParagraphs.push(
      `يفوض الطرف الثاني الطرف الأول تفويضاً خاصاً بدراسة وتقديم ومتابعة طلب إعادة جدولة المنتجات التمويلية محل هذا العقد فقط، ولا يمتد هذا التفويض إلى الإعفاء أو إتاحة النسبة النظامية أو أي خدمة أخرى.`
    );
  } else {
    delegationParagraphs.push(
      `يفوض الطرف الثاني الطرف الأول تفويضاً خاصاً بدراسة وتقديم ومتابعة طلب إتاحة النسبة النظامية واسترداد المبالغ المستثناة من الحجز محل هذا العقد فقط، ولا يمتد هذا التفويض إلى الإعفاء أو إعادة الجدولة أو أي خدمة أخرى.`
    );
    delegationParagraphs.push(
      '«ولا يمنح هذا التفويض الطرف الأول صلاحية السحب من الحساب أو التحويل منه أو إدارة الحساب أو التصرف في أموال الطرف الثاني.»'
    );
  }
  delegationParagraphs.push('وينتهي التفويض بانتهاء الغرض الذي صدر من أجله أو بانتهاء العقد.');

  const privacy: string[] = [
    'تتم معالجة البيانات والمستندات اللازمة لتنفيذ الخدمة في حدود الغرض من الطلب، ولا يمتد التفويض إلى بيانات غير لازمة للخدمة.',
  ];
  if (kind === 'exemption') {
    privacy.push('ويمكن معالجة المستندات الطبية المرتبطة بطلب الإعفاء بالقدر اللازم لتنفيذ الخدمة.');
  }

  return [
    {
      key: 'a8',
      title: 'المادة (8): مدة العقد وإنهاؤه',
      paragraphs: [
        `يبدأ سريان العقد من تاريخ اعتماده وتوقيعه إلكترونياً، ويستمر إلى حين تحقق الغرض منه، أو صدور نتيجة نهائية لـ${label}، أو إنهائه باتفاق الطرفين، أو طلب الطرف الثاني إنهاء المتابعة، أو تعذر استكمال الطلب بسبب عدم توفير البيانات أو المستندات المطلوبة، أو وجود مانع نظامي أو إجرائي يحول دون استمرار الخدمة.`,
        'ولا يؤثر انتهاء العقد على الحقوق المالية التي ثبت استحقاقها قبل انتهائه.',
      ],
    },
    {
      key: 'a9',
      title: 'المادة (9): السند لأمر',
      paragraphs: [
        'لا يُعد هذا العقد بذاته سنداً لأمر.',
        'وإذا استلزم توثيق الأتعاب إصدار سند لأمر، فيكون السند لأمر وثيقة مستقلة عن العقد ويتم إنشاؤه وإصداره وفق الإجراءات والبيانات والشروط النظامية المطبقة عليه.',
        'ويجب أن تتوافق قيمة السند مع الأتعاب المستحقة فعلياً وفق نوع الطلب ونتيجته.',
      ],
    },
    {
      key: 'a10',
      title: 'المادة (10): البيانات والخصوصية',
      paragraphs: privacy,
    },
    {
      key: 'a11',
      title: 'المادة (11): الإقرارات',
      paragraphs: [
        'يقر الطرف الثاني بصحة البيانات والمستندات المقدمة منه، واطلاعه على نطاق الخدمة وآلية احتساب الأتعاب، وعلمه بأن القرار النهائي يعود للجهة المختصة، وأنه قرأ العقد قبل اعتماده.',
        'ولا يُفسر أي حكم في العقد على أنه تنازل من أي طرف عن حق مقرر له بموجب الأنظمة المعمول بها.',
      ],
    },
    {
      key: 'a12',
      title: 'المادة (12): أحكام عامة',
      paragraphs: [
        'يخضع العقد للأنظمة المعمول بها في المملكة العربية السعودية، ولا يكون أي تعديل على أحكامه نافذاً إلا بعد اعتماده بالطريقة المتفق عليها بين الطرفين.',
        'وفي حال تعذر تطبيق أي حكم، فلا يؤثر ذلك على بقية أحكام العقد بالقدر الذي تسمح به الأنظمة.',
      ],
    },
    {
      key: 'a13',
      title: 'المادة (13): التفويض',
      paragraphs: delegationParagraphs,
    },
  ];
}

export function getContractContent(
  kind: ContractKind,
  vars: { bank: string }
): ContractContent {
  const bank = vars.bank;

  if (kind === 'rescheduling') {
    return {
      kind,
      title: 'عقد تفويض ومتابعة طلب إعادة جدولة منتجات تمويلية',
      preamble: [
        'حيث إن الطرف الثاني يرغب في الاستعانة بالطرف الأول لدراسة ومتابعة طلب إعادة جدولة المنتجات التمويلية المشمولة بهذا العقد لدى الجهة التمويلية، بما يتناسب مع ظروفه والتزاماته المالية، وحيث إن الطرف الأول يقدم خدمات دراسة ومتابعة الطلبات وإعداد المستندات والمخاطبات اللازمة في حدود الخدمة المتفق عليها؛ فقد اتفق الطرفان، وهما بكامل الأهلية المعتبرة شرعاً ونظاماً، على إبرام هذا العقد وفقاً للبنود التالية.',
        'ويُعد هذا التمهيد جزءاً لا يتجزأ من العقد ومكملاً ومفسراً لأحكامه.',
      ],
      sections: [
        ARTICLE_1,
        {
          key: 'a2',
          title: 'المادة (2): موضوع العقد ونطاق الخدمة',
          paragraphs: [
            `يفوض الطرف الثاني الطرف الأول في دراسة وإعداد وتقديم ومتابعة طلب إعادة جدولة المنتجات التمويلية المحددة في هذا العقد لدى ${bank}، واستكمال الإجراءات المرتبطة بالطلب في حدود التفويض.`,
            'ولا يمتد العقد تلقائياً إلى الإعفاء أو إتاحة النسبة النظامية أو أي خدمة أخرى.',
          ],
          block: 'products',
        },
        {
          key: 'a3',
          title: 'المادة (3): نطاق التفويض',
          paragraphs: [
            `يقتصر التفويض على الاطلاع على البيانات والمستندات المالية والتمويلية اللازمة للطلب، والتواصل مع ${bank} والجهات المختصة، وإعداد وتقديم ومتابعة طلب إعادة الجدولة واستكمال متطلباته.`,
          ],
        },
        ...articles4and5(kind),
        {
          key: 'a6',
          title: 'المادة (6): الأتعاب وشروط استحقاقها',
          paragraphs: [
            'لا تستحق أتعاب الطرف الأول لمجرد تقديم طلب إعادة الجدولة أو متابعته.',
            'تستحق الأتعاب عند الموافقة الفعلية على إعادة الجدولة وإتمامها للمنتجات المشمولة بالعقد وثبوت ذلك بمستند أو جدول سداد أو قرار صادر من الجهة التمويلية.',
            'الأتعاب = 1% من إجمالي مديونية المنتجات التي تمت إعادة جدولتها فعلياً.',
            'وفي حال عدم الموافقة وعدم تحقق إعادة الجدولة فعلياً، فلا تستحق أتعاب نجاح.',
          ],
        },
        {
          key: 'a7',
          title: 'المادة (7): عدم ضمان نتيجة الطلب',
          paragraphs: [
            'لا يضمن الطرف الأول موافقة الجهة التمويلية على إعادة الجدولة أو شروطها أو مقدار القسط أو مدة السداد، وتبقى الموافقة وشروطها من اختصاص الجهة التمويلية.',
          ],
        },
        ...commonTailSections(kind),
      ],
    };
  }

  if (kind === 'seized') {
    return {
      kind,
      title: 'عقد تفويض ومتابعة طلب إتاحة النسبة النظامية',
      preamble: [
        'حيث إن الطرف الثاني لديه مبلغ محجوز في حسابه الجاري، ويرغب في الاستعانة بالطرف الأول لدراسة ومتابعة طلب إتاحة النسبة النظامية واسترداد المبالغ المستثناة من الحجز، وفق الأنظمة والتعليمات والإجراءات ذات العلاقة، وحيث إن الطرف الأول يقدم خدمات دراسة ومتابعة الطلبات وإعداد المستندات والمخاطبات اللازمة في حدود الخدمة المتفق عليها؛ فقد اتفق الطرفان، وهما بكامل الأهلية المعتبرة شرعاً ونظاماً، على إبرام هذا العقد وفقاً للبنود التالية.',
        'ويُعد هذا التمهيد جزءاً لا يتجزأ من العقد ومكملاً ومفسراً لأحكامه.',
      ],
      sections: [
        ARTICLE_1,
        {
          key: 'a2',
          title: 'المادة (2): موضوع العقد ونطاق الخدمة',
          paragraphs: [
            `يفوض الطرف الثاني الطرف الأول في دراسة وإعداد وتقديم ومتابعة طلب إتاحة النسبة النظامية واسترداد المبالغ المستثناة من الحجز والموجودة في الحساب الجاري المحدد في هذا العقد لدى ${bank}، ومتابعة الإجراءات المتعلقة بالطلب لدى الجهات المختصة، وذلك في حدود هذا العقد والتفويض الممنوح بموجبه.`,
            'ولا يمتد هذا العقد إلى طلبات الإعفاء أو إعادة الجدولة أو أي خدمة أخرى غير مرتبطة مباشرة بطلب إتاحة النسبة النظامية.',
          ],
          block: 'account',
        },
        {
          key: 'a3',
          title: 'المادة (3): نطاق التفويض',
          paragraphs: ['يقتصر التفويض على:'],
          items: [
            'الاطلاع على البيانات والمستندات المرتبطة بالحساب الجاري والمبلغ المحجوز محل الطلب.',
            'الاطلاع على المستندات والقرارات والمعلومات اللازمة لإثبات المبالغ المستثناة من الحجز.',
            `التواصل والمتابعة مع ${bank} والجهات المختصة ذات العلاقة.`,
            'إعداد وتقديم ومتابعة الطلب والمذكرات والمخاطبات المتعلقة بإتاحة النسبة النظامية واسترداد المبالغ المستثناة من الحجز.',
            'استكمال متطلبات الطلب بالتنسيق مع الطرف الثاني.',
          ],
        },
        ...articles4and5(kind),
        {
          key: 'a6',
          title: 'المادة (6): الأتعاب وشروط استحقاقها',
          paragraphs: [
            'لا تستحق أتعاب الطرف الأول لمجرد تقديم الطلب أو متابعته.',
            'تستحق الأتعاب بعد نجاح الطلب فعلياً وثبوت المبلغ الذي تمت إتاحته أو استرداده للطرف الثاني من المبلغ المحجوز في الحساب والمستثنى من الحجز.',
            'الأتعاب = 1% من إجمالي المبلغ الذي تمت إتاحته أو استرداده فعلياً لصالح الطرف الثاني.',
            'وإذا تمت إتاحة جزء من المبلغ فقط، تحتسب نسبة 1% على المبلغ المتاح أو المسترد فعلياً فقط وليس على كامل المبلغ المحجوز.',
            'وفي حال عدم إتاحة أو استرداد أي مبلغ فعلياً، فلا تستحق أتعاب نجاح.',
          ],
        },
        {
          key: 'a7',
          title: 'المادة (7): عدم ضمان نتيجة الطلب',
          paragraphs: [
            'لا يمثل العقد وعداً أو ضماناً بقبول طلب إتاحة النسبة النظامية أو استرداد كامل المبلغ المحجوز، ويظل قرار الإتاحة وتحديد المبلغ من اختصاص الجهة صاحبة الصلاحية.',
          ],
        },
        ...commonTailSections(kind),
      ],
    };
  }

  /* الإعفاء التمويلي */
  return {
    kind,
    title: 'عقد تفويض ومتابعة طلب إعفاء تمويلي',
    preamble: [
      'حيث إن الطرف الثاني يرغب في الاستعانة بالطرف الأول لدراسة ومتابعة طلب إعفائه من الالتزامات التمويلية المشمولة بهذا العقد لدى الجهة التمويلية، وحيث إن الطرف الأول يقدم خدمات دراسة ومتابعة الطلبات وإعداد المستندات والمخاطبات اللازمة في حدود الخدمة المتفق عليها؛ فقد اتفق الطرفان، وهما بكامل الأهلية المعتبرة شرعاً ونظاماً، على إبرام هذا العقد وفقاً للبنود التالية.',
      'ويُعد هذا التمهيد جزءاً لا يتجزأ من العقد ومكملاً ومفسراً لأحكامه.',
    ],
    sections: [
      ARTICLE_1,
      {
        key: 'a2',
        title: 'المادة (2): موضوع العقد ونطاق الخدمة',
        paragraphs: [
          `يفوض الطرف الثاني الطرف الأول في دراسة وإعداد وتقديم ومتابعة طلب الإعفاء من الالتزامات التمويلية المحددة في هذا العقد لدى ${bank}، واتخاذ إجراءات المتابعة اللازمة في حدود هذا العقد والتفويض الممنوح بموجبه.`,
          'ولا يمتد هذا العقد تلقائياً إلى إعادة الجدولة أو إتاحة النسبة النظامية أو أي خدمة أخرى غير مرتبطة مباشرة بطلب الإعفاء محل هذا العقد.',
        ],
        block: 'products',
      },
      {
        key: 'a3',
        title: 'المادة (3): نطاق التفويض',
        paragraphs: ['يقتصر التفويض على الإجراءات اللازمة لتنفيذ طلب الإعفاء، ويشمل في حدود الحاجة:'],
        items: [
          'الاطلاع على المستندات والبيانات اللازمة لدراسة الطلب.',
          'الاطلاع على التقارير والمستندات الطبية المرتبطة بالطلب متى كانت ضرورية.',
          `التواصل والمتابعة مع ${bank} والجهات المختصة ذات العلاقة.`,
          'إعداد وتقديم ومتابعة الطلب والمذكرات والمخاطبات المتعلقة به.',
          'متابعة حالة الطلب واستكمال المتطلبات بالتنسيق مع الطرف الثاني.',
        ],
      },
      ...articles4and5(kind),
      {
        key: 'a6',
        title: 'المادة (6): الأتعاب وشروط استحقاقها',
        paragraphs: [
          'لا تستحق أتعاب الطرف الأول لمجرد تقديم الطلب أو متابعته.',
          'تستحق الأتعاب عند قبول طلب الإعفاء فعلياً وثبوت مقدار المبالغ المعفاة بموجب مستند نهائي صادر من الجهة التمويلية أو الجهة المختصة.',
          'الأتعاب = 4% من إجمالي المبالغ المعفاة فعلياً.',
          'ويقصد بالمبالغ المعفاة فعلياً قيمة الالتزامات التمويلية التي يثبت إعفاء الطرف الثاني منها بصورة نهائية.',
          'وفي حال عدم تحقق إعفاء فعلي، فلا تستحق أتعاب نجاح.',
        ],
      },
      {
        key: 'a7',
        title: 'المادة (7): عدم ضمان نتيجة الطلب',
        paragraphs: [
          'يقوم الطرف الأول بدراسة وإعداد ومتابعة الطلب وبذل العناية المهنية اللازمة، ولا يمثل هذا العقد وعداً أو ضماناً بقبول طلب الإعفاء، ويظل قرار القبول أو الرفض وتحديد نطاق الإعفاء من اختصاص الجهة صاحبة الصلاحية.',
        ],
      },
      ...commonTailSections(kind),
    ],
  };
}

/* ═══════════════════════════════════════════════════════════════
 * تطبيع بيانات العقد
 * ═══════════════════════════════════════════════════════════════ */

export interface NormalizedContract {
  kind: ContractKind;
  content: ContractContent;
  clientName: string;
  nationalId: string;
  mobile: string;
  bank: string;
  submissionId: string;
  fileNumber: string;
  contractDate: string;
  products: ContractProduct[];
  totalDebt: number;
  currentAccountNumber: string;
  seizedAmount: number;
  signatureData: string | null;
  signedAt: string | null;
  isSigned: boolean;
}

export function normalizeContract(input: HTMLElement | ContractData): NormalizedContract {
  const data: ContractData =
    input && typeof (input as any).submissionId === 'string'
      ? (input as ContractData)
      : (((input as any)?.__contractData as ContractData) || ({ submissionId: '' } as ContractData));

  const submission = data.submission || {};
  const subData = submission.data || {};

  const kind: ContractKind =
    data.kind ||
    (data.isSeizedAmounts ? 'seized' : data.isRescheduling ? 'rescheduling' : resolveContractKind(submission.type));

  const clientName =
    data.clientName ||
    [subData.firstName, subData.middleName, subData.lastName].filter(Boolean).join(' ') ||
    'العميل الكريم';

  const nationalId = data.nationalId || subData.nationalId || subData.userNationalId || '---';
  const mobile = data.mobile || subData.mobile || subData.phone || '---';
  const bank = data.bank || subData.bank || 'الجهة التمويلية';

  const submissionId = data.submissionId || subData.id || '';
  const fileNumber = data.fileNumber || submission.file_number || submissionId;
  const contractDate = data.contractDate || formatArabicDate(submission.timestamp || submission.created_at || new Date());

  const rawProducts: ContractProduct[] =
    kind === 'seized'
      ? []
      : Array.isArray(data.products) && data.products.length > 0
      ? data.products
      : Array.isArray(subData.products)
      ? subData.products
      : [];

  const totalDebt =
    kind === 'seized'
      ? 0
      : Number(data.totalDebt) ||
        rawProducts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) ||
        0;

  const currentAccountNumber =
    data.currentAccountNumber || subData.currentAccountNumber || subData.current_account_number || '---';
  const seizedAmount = Number(data.seizedAmount ?? subData.seizedAmount ?? subData.seized_amount) || 0;

  const signatureData = data.signatureData || submission.signature_data || null;
  const signedAt = data.signedAt || submission.signed_at || null;

  return {
    kind,
    content: getContractContent(kind, { bank }),
    clientName,
    nationalId,
    mobile,
    bank,
    submissionId,
    fileNumber,
    contractDate,
    products: rawProducts,
    totalDebt,
    currentAccountNumber,
    seizedAmount,
    signatureData,
    signedAt,
    isSigned: !!(data.isAlreadySigned || signatureData),
  };
}

/** توافق للخلف */
export function extractContractData(input: HTMLElement | ContractData): ContractData {
  if (input && typeof (input as any).submissionId === 'string') return input as ContractData;
  if ((input as any)?.__contractData) return (input as any).__contractData as ContractData;
  return { submissionId: '' };
}

/* ═══════════════════════════════════════════════════════════════
 * بناء صفحات A4 من النصوص نفسها (طباعة / PDF)
 * ═══════════════════════════════════════════════════════════════ */

export function buildOfficialContractA4Pages(raw: HTMLElement | ContractData): string {
  const c = normalizeContract(raw);

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

  const renderFooter = (pageIndex: number, totalPages: number) => `
    <div class="a4-footer" style="margin-top: auto; padding-top: 8px; border-top: 1.5px solid #E5E7EB;">
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; color: #4B5563; direction: ltr; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="font-weight: 700; color: #22042C;">rifanss.com</div>
        <div style="font-weight: 700; color: #22042C;">Page ${pageIndex} of ${totalPages}</div>
        <div style="font-weight: 600; color: #6B7280;">© 2026 Rifanis Financial</div>
      </div>
    </div>
  `;

  const productsBlock = () => {
    const rows =
      c.products.length === 0
        ? `<tr>
             <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right;">${c.bank}</td>
             <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right;">---</td>
             <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right; font-family: monospace;">---</td>
             <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right; font-weight: 700;">--- ريال</td>
           </tr>`
        : c.products
            .map(
              (p) => `
      <tr>
        <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right;">${c.bank}</td>
        <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right;">${p.type || 'منتج تمويلي'}</td>
        <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right; font-family: monospace;">${p.accountNumber || p.account_number || '---'}</td>
        <td style="padding: 7px 10px; border-top: 1px solid #E5E7EB; text-align: right; font-weight: 700; color: #22042C;">${formatAmount(p.amount)} ريال سعودي</td>
      </tr>`
            )
            .join('');

    return `
      <div style="border: 1px solid #D1D5DB; border-radius: 8px; overflow: hidden; margin-top: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <thead>
            <tr style="background: #F3EFF5; border-bottom: 1.5px solid #D1D5DB;">
              <th style="padding: 6px 10px; font-weight: 800; color: #22042C; text-align: right; border-left: 1px solid #D1D5DB;">الجهة التمويلية</th>
              <th style="padding: 6px 10px; font-weight: 800; color: #22042C; text-align: right; border-left: 1px solid #D1D5DB;">نوع المنتج</th>
              <th style="padding: 6px 10px; font-weight: 800; color: #22042C; text-align: right; border-left: 1px solid #D1D5DB;">رقم الحساب/العقد</th>
              <th style="padding: 6px 10px; font-weight: 800; color: #22042C; text-align: right;">مبلغ المديونية</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr style="background: #FAF6ED; border-top: 1.5px solid #C5A059;">
              <td colspan="3" style="padding: 7px 10px; font-weight: 800; color: #22042C; text-align: right; font-size: 11.5px;">إجمالي المديونية محل الطلب:</td>
              <td style="padding: 7px 10px; font-weight: 900; color: #22042C; text-align: right; font-size: 12.5px;">${formatAmount(c.totalDebt)} ريال سعودي</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  };

  const accountBlock = () => `
    <div style="border: 1px solid #D1D5DB; border-radius: 8px; overflow: hidden; margin-top: 8px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <tbody>
          <tr style="background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 6px 12px; font-weight: 700; color: #4B5563; width: 45%; border-left: 1px solid #E5E7EB;">الجهة المالية:</td>
            <td style="padding: 6px 12px; font-weight: 800; color: #22042C;">${c.bank}</td>
          </tr>
          <tr style="background: #ffffff; border-bottom: 1px solid #E5E7EB;">
            <td style="padding: 6px 12px; font-weight: 700; color: #4B5563; border-left: 1px solid #E5E7EB;">رقم الحساب الجاري:</td>
            <td style="padding: 6px 12px; font-weight: 800; color: #22042C; font-family: monospace;">${c.currentAccountNumber}</td>
          </tr>
          <tr style="background: #F9FAFB;">
            <td style="padding: 6px 12px; font-weight: 700; color: #4B5563; border-left: 1px solid #E5E7EB;">المبلغ المحجوز في الحساب من المبالغ المستثناة من الحجز:</td>
            <td style="padding: 6px 12px; font-weight: 800; color: #22042C;">${formatAmount(c.seizedAmount)} ريال سعودي</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const renderSection = (s: ContractSection) => `
    <div style="margin-bottom: 11px;">
      <h3 style="font-size: 13px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">${s.title}</h3>
      ${(s.paragraphs || [])
        .map(
          (p) =>
            `<p style="font-size: 11px; line-height: 1.65; text-align: right; margin: 0 0 4px 0; color: #1f2937;">${p}</p>`
        )
        .join('')}
      ${
        s.items && s.items.length
          ? `<div style="padding-right: 8px; font-size: 11px; line-height: 1.65; color: #1f2937;">${s.items
              .map((it, i) => `<div style="margin-bottom: 2px;"><strong>${i + 1}.</strong> ${it}</div>`)
              .join('')}</div>`
          : ''
      }
      ${s.block === 'products' ? productsBlock() : ''}
      ${s.block === 'account' ? accountBlock() : ''}
    </div>
  `;

  const pageStyle =
    "box-sizing: border-box; width: 210mm; height: 297mm; min-height: 297mm; max-height: 297mm; padding: 12mm 15mm; background: #ffffff; color: #1f2937; font-family: 'Tajawal', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; direction: rtl; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;";

  /* ── الصفحة 1: العنوان + الأطراف + التمهيد + المواد 1-3 ── */
  const sections = c.content.sections;
  const page1Sections = sections.filter((s) => ['a1', 'a2', 'a3'].includes(s.key));
  const page2Sections = sections.filter((s) => ['a4', 'a5', 'a6', 'a7', 'a8'].includes(s.key));
  const page3Sections = sections.filter((s) => ['a9', 'a10', 'a11', 'a12', 'a13'].includes(s.key));

  const page1Html = `
    <div class="contract-a4-page" style="${pageStyle}">
      <div>
        ${renderHeader()}

        <div style="text-align: center; margin-bottom: 14px;">
          <div style="font-size: 13.5px; font-weight: 800; color: #22042C; margin-bottom: 3px;">${FIRST_PARTY.name}</div>
          <div style="font-size: 15px; font-weight: 800; color: #22042C; background: #FAF6ED; border: 1.5px solid #EADBBA; border-radius: 8px; padding: 6px 18px; display: inline-block;">
            ${c.content.title}
          </div>
          <div style="display: flex; justify-content: center; gap: 20px; margin-top: 6px; font-size: 11px; color: #374151; background: #F9FAFB; padding: 6px 14px; border-radius: 6px; border: 1px solid #E5E7EB;">
            <span>رقم ملف العميل: <strong style="font-family: monospace; color: #22042C;">${c.fileNumber}</strong></span>
            <span>رقم العقد: <strong style="font-family: monospace; color: #22042C;">${c.submissionId}</strong></span>
            <span>تاريخ العقد: <strong style="color: #22042C;">${c.contractDate}</strong></span>
          </div>
        </div>

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
                  <div><strong>الاسم:</strong> ${FIRST_PARTY.name}</div>
                  <div><strong>الرقم الوطني الموحد:</strong> ${FIRST_PARTY.unifiedNumber}</div>
                  <div><strong>ويمثلها:</strong> ${FIRST_PARTY.representative} بصفة ${FIRST_PARTY.title}</div>
                  <div><strong>وبموجب تفويض رقم:</strong> ${FIRST_PARTY.delegationNumber}</div>
                </td>
                <td style="padding: 8px 12px; vertical-align: top; line-height: 1.75;">
                  <div><strong>اسم العميل:</strong> ${c.clientName}</div>
                  <div><strong>رقم الهوية الوطنية:</strong> <span style="font-family: monospace; font-weight: 700;">${c.nationalId}</span></div>
                  <div><strong>رقم الجوال:</strong> <span style="direction: ltr; display: inline-block; font-weight: 700;">${c.mobile}</span></div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 12px;">
          <h3 style="font-size: 13px; font-weight: 800; color: #22042C; margin: 0 0 4px 0;">التمهيد:</h3>
          ${c.content.preamble
            .map(
              (p) =>
                `<p style="font-size: 11px; line-height: 1.65; text-align: right; margin: 0 0 4px 0; color: #1f2937;">${p}</p>`
            )
            .join('')}
        </div>

        ${page1Sections.map(renderSection).join('')}
      </div>

      ${renderFooter(1, 3)}
    </div>
  `;

  const page2Html = `
    <div class="contract-a4-page" style="${pageStyle}">
      <div>
        ${renderHeader()}
        ${page2Sections.map(renderSection).join('')}
      </div>
      ${renderFooter(2, 3)}
    </div>
  `;

  const page3Html = `
    <div class="contract-a4-page" style="${pageStyle}">
      <div>
        ${renderHeader()}
        ${page3Sections.map(renderSection).join('')}

        <div style="border: 1.5px solid #22042C; border-radius: 8px; padding: 8px 12px; background: #FAFAFA; margin-bottom: 10px;">
          <div style="font-size: 13px; font-weight: 800; color: #22042C; text-align: center; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; margin-bottom: 8px;">
            اعتماد وتوقيع أطراف العقد
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="text-align: center; border-left: 1px solid #E5E7EB; padding-left: 8px;">
              <div style="font-size: 11.5px; font-weight: 800; color: #22042C; margin-bottom: 3px;">ختم وتوقيع الطرف الأول</div>
              <div style="height: 80px; display: flex; align-items: center; justify-content: center;">
                <img src="${rifansStampImg}" alt="ختم ريفانس المالية" style="max-height: 80px; width: auto; object-fit: contain; mix-blend-mode: multiply;" />
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #22042C; margin-top: 2px;">${FIRST_PARTY.name}</div>
              <div style="font-size: 9.5px; color: #4B5563;">الرقم الوطني الموحد: ${FIRST_PARTY.unifiedNumber}</div>
              <div style="font-size: 9.5px; color: #4B5563;">يمثلها: ${FIRST_PARTY.representative} – ${FIRST_PARTY.title}</div>
            </div>

            <div style="text-align: center; padding-right: 8px;">
              <div style="font-size: 11.5px; font-weight: 800; color: #22042C; margin-bottom: 3px;">توقيع الطرف الثاني (العميل)</div>
              <div style="height: 80px; display: flex; align-items: center; justify-content: center; background: #ffffff; border: 1px dashed #D1D5DB; border-radius: 6px; padding: 4px;">
                ${
                  c.signatureData
                    ? `<img src="${c.signatureData}" alt="توقيع العميل" style="max-height: 74px; max-width: 100%; object-fit: contain;" />`
                    : c.isSigned
                    ? `<div style="color: #16a34a; font-size: 10.5px; font-weight: 700;">✓ تم التوقيع والاعتماد الإلكتروني</div>`
                    : `<div style="color: #9CA3AF; font-size: 10.5px; font-style: italic;">بانتظار التوقيع الإلكتروني للعميل</div>`
                }
              </div>
              <div style="font-size: 11px; font-weight: 800; color: #22042C; margin-top: 3px;">${c.clientName}</div>
              <div style="font-size: 9.5px; color: #4B5563;">رقم الهوية: ${c.nationalId}</div>
              <div style="font-size: 9.5px; color: #4B5563;">${
                c.signedAt ? `تاريخ ووقت التوقيع: ${new Date(c.signedAt).toLocaleString('ar-SA')}` : 'تاريخ ووقت التوقيع: —'
              }</div>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid #E5E7EB; padding-top: 6px; text-align: center; font-size: 9.5px; color: #6B7280;">
          <div>رقم العقد: <strong style="font-family: monospace; color: #22042C;">${c.submissionId}</strong> • رقم ملف العميل: <strong style="font-family: monospace; color: #22042C;">${c.fileNumber}</strong> • رقم المرجع الإلكتروني: <strong style="font-family: monospace; color: #22042C;">${c.submissionId}</strong></div>
          <div style="margin-top: 2px;">هذه الوثيقة صادرة عن النظام الإلكتروني لشركة ريفانس المالية وتعد ملزمة نظاماً بمجرد اعتمادها والتوقيع عليها.</div>
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
