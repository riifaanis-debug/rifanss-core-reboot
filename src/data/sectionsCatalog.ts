// Service sections and products catalog
// 6 sections, 40 products total
// Standardized initial fee for all products: 275 SAR

export interface ProductDef {
  id: string;
  name: string;
  shortDesc: string;
  description: string; // Detailed description for product page
  image: string;
}

export interface SectionDef {
  id: string;
  name: string;
  intro: string;
  heroImages: string[]; // for slider
  products: ProductDef[];
}

// Standard initial fee for any product application
export const INITIAL_FEE_SAR = 275;

// Unsplash abstract fintech imagery (no faces)
const IMG = {
  // Judicial
  legal1: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=1200',
  legal2: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200',
  legal3: 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?auto=format&fit=crop&q=80&w=1200',
  legal4: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&q=80&w=1200',
  // Banking
  bank1: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?auto=format&fit=crop&q=80&w=1200',
  bank2: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&q=80&w=1200',
  bank3: 'https://images.unsplash.com/photo-1616803140344-6682afb13cda?auto=format&fit=crop&q=80&w=1200',
  bank4: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=1200',
  bank5: 'https://images.unsplash.com/photo-1556742400-b5b7c5121f2c?auto=format&fit=crop&q=80&w=1200',
  bank6: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=1200',
  bank7: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=1200',
  bank8: 'https://images.unsplash.com/photo-1607863680198-23d4b2565df0?auto=format&fit=crop&q=80&w=1200',
  bank9: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1200',
  bank10: 'https://images.unsplash.com/photo-1579170053380-58828d4d8d6d?auto=format&fit=crop&q=80&w=1200',
  bank11: 'https://images.unsplash.com/photo-1556740772-1a741367b93e?auto=format&fit=crop&q=80&w=1200',
  bank12: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200',
  bank13: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&q=80&w=1200',
  // Real estate
  re1: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
  re2: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=1200',
  re3: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=1200',
  re4: 'https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&q=80&w=1200',
  re5: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1200',
  re6: 'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?auto=format&fit=crop&q=80&w=1200',
  // Tax/Zakat
  tax1: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200',
  tax2: 'https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?auto=format&fit=crop&q=80&w=1200',
  tax3: 'https://images.unsplash.com/photo-1554224154-26032cdc0c11?auto=format&fit=crop&q=80&w=1200',
  tax4: 'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&q=80&w=1200',
  tax5: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&q=80&w=1200',
  tax6: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&q=80&w=1200',
  // Credit
  credit1: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200',
  credit2: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
  credit3: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1200',
  credit4: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1200',
  // Consulting
  cons1: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=1200',
  cons2: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200',
  cons3: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
};

export const SECTIONS: SectionDef[] = [
  // 1. الاستشارات المالية
  {
    id: 'consulting',
    name: 'الاستشارات المالية',
    intro:
      'استشارات وحلول مالية وائتمانية متخصصة تساعدك على اتخاذ قرارات أفضل، تحسين السجل الائتماني وسمة، دراسة الملاءة المالية، وإعادة هيكلة الالتزامات والتخطيط لمستقبل مالي مستدام.',
    heroImages: [IMG.cons1, IMG.credit1, IMG.cons2, IMG.credit3],
    products: [
      {
        id: 'cons-1',
        name: 'الاستشارات المالية المتخصصة',
        shortDesc: 'استشارات مالية فردية تشمل التخطيط والادخار والاستثمار.',
        description:
          'نقدم استشارات مالية متخصصة تشمل التخطيط المالي الشخصي، الميزانية الشهرية، إدارة الديون، التخطيط للتقاعد، وأساسيات الاستثمار. خدمة مفصّلة بحسب وضعك المالي وأهدافك المستقبلية.',
        image: IMG.cons1,
      },
      {
        id: 'cr-1',
        name: 'تحسين السجل الائتماني وتحديث سمة',
        shortDesc: 'خطة عملية لتحسين تقييمك الائتماني لدى سمة.',
        description:
          'نقدم خدمة استشارية وتنفيذية لتحسين السجل الائتماني لدى الشركة السعودية للمعلومات الائتمانية (سمة). تشمل الخدمة تحليل تقريرك الائتماني، تحديد النقاط السلبية، ووضع خطة زمنية واضحة لرفع تقييمك خلال أشهر محدودة.',
        image: IMG.credit1,
      },
      {
        id: 'cr-2',
        name: 'تحديث حالة العميل لدى سمة بعد التسوية',
        shortDesc: 'تحديث رسمي لحالتك لدى سمة بعد إتمام تسوية الالتزامات.',
        description:
          'خدمة تحديث حالة العميل لدى الشركة السعودية للمعلومات الائتمانية (سمة) بعد إتمام تسوية الالتزامات. نتولى التواصل مع الجهات الممولة لرفع التحديث، ومتابعة سمة حتى تظهر الحالة الجديدة في تقريرك بشكل صحيح.',
        image: IMG.credit2,
      },
      {
        id: 'cr-4',
        name: 'دراسة الملاءة المالية والتخطيط المالي',
        shortDesc: 'تقرير شامل لتقييم وضعك المالي وقدرتك على التمويل.',
        description:
          'نقدم تقرير دراسة ملاءة مالية شامل يحلل وضعك المالي بالكامل: الدخل، الالتزامات، الأصول، والقدرة الائتمانية. يفيدك التقرير في التقدم للتمويلات، الشراكات، أو أمام الجهات المالية والقضائية.',
        image: IMG.credit4,
      },
      {
        id: 'cons-2',
        name: 'تحليل الالتزامات وإعادة الهيكلة',
        shortDesc: 'دراسة شاملة للالتزامات مع خطة إعادة هيكلة عملية.',
        description:
          'خدمة شاملة لتحليل التزاماتك المالية الحالية ووضع خطة إعادة هيكلة عملية. نتولى دراسة كل التزام (نوعه، شروطه، تكلفته)، التفاوض مع الجهات الممولة، وإعداد خطة هيكلة جديدة تخفّض الأعباء وتطيل فترة السداد.',
        image: IMG.cons2,
      },
      {
        id: 'cons-3',
        name: 'تقديم التوصيات الائتمانية وفق التحليل',
        shortDesc: 'توصيات ائتمانية مبنية على تحليل دقيق لوضعك المالي.',
        description:
          'بعد إجراء التحليل المالي والائتماني الشامل، نقدم لك توصيات عملية تشمل: أنسب أنواع التمويل لك، الجهات الممولة المناسبة، فرص الجدولة أو إعادة التمويل، وأفضل الخطوات لتحسين وضعك الائتماني خلال الفترة القادمة.',
        image: IMG.cons3,
      },
      {
        id: 'cr-3',
        name: 'استخراج خطابات عدم مديونية وإخلاء طرف',
        shortDesc: 'إصدار رسمي لخطابات إثبات عدم وجود مديونيات قائمة.',
        description:
          'نتولى استخراج خطابات عدم المديونية وإخلاء الطرف من البنوك والجهات التمويلية لإثبات خلو ذمتك المالية من أي التزامات قائمة وتسليمها للمستفيد.',
        image: IMG.credit3,
      },
    ],
  },

  // 2. الخدمات المصرفية
  {
    id: 'banking',
    name: 'الخدمات المصرفية',
    intro:
      'باقة شاملة من الخدمات والحلول المصرفية للأفراد والمنشآت، تغطي فتح الحسابات، طلبات الجدولة، الإعفاء، إتاحة النسب النظامية، والتسوية المالية للمنتجات المتعثرة وفق ضوابط البنك المركزي السعودي.',
    heroImages: [IMG.bank1, IMG.bank4, IMG.bank7, IMG.bank10],
    products: [
      {
        id: 'bnk-5',
        name: 'طلب جدولة المنتجات التمويلية',
        shortDesc: 'إعادة جدولة الالتزامات التمويلية بأقساط مخفّضة وفترة أطول.',
        description:
          'خدمة شاملة لإعادة جدولة منتجاتك التمويلية لدى البنوك والممولين. نتولى تحليل وضعك المالي، التفاوض مع الجهة الممولة، وإعداد طلب الجدولة بأقساط أنسب وفترة سداد أطول، مع متابعة الموافقة وتنفيذ الجدولة.',
        image: IMG.bank5,
      },
      {
        id: 'bnk-6',
        name: 'الإعفاء بسبب (الوفاة أو العجز الطبي)',
        shortDesc: 'متابعة طلبات الإعفاء من الالتزامات في حالات الوفاة أو العجز.',
        description:
          'نتولى إعداد ورفع طلبات الإعفاء من الالتزامات التمويلية بسبب الوفاة أو العجز الطبي الكلي وفق الأنظمة المعتمدة. تشمل الخدمة جمع المستندات الطبية والرسمية، التنسيق مع شركات التأمين والجهات الممولة، حتى صدور قرار الإعفاء النهائي.',
        image: IMG.bank6,
      },
      {
        id: 'bnk-11',
        name: 'طلب إتاحة النسبة النظامية والمبالغ المستثناة',
        shortDesc: 'إتاحة النسبة النظامية من الراتب والمبالغ المستثناة من الحجز.',
        description:
          'خدمة متخصصة لتقديم طلب إتاحة النسبة النظامية من الراتب والمبالغ المستثناة نظاماً من إجراءات الحجز والتنفيذ وفق تعليمات البنك المركزي السعودي.',
        image: IMG.bank11,
      },
      {
        id: 'bnk-12',
        name: 'التسوية المالية للمنتجات التمويلية المتعثّرة',
        shortDesc: 'حلول تسوية مالية احترافية للالتزامات المتعثرة.',
        description:
          'نقدم حلول تسوية مالية احترافية للالتزامات التمويلية المتعثرة. تشمل الخدمة دراسة شاملة لوضعك المالي، التفاوض مع الجهات الممولة للحصول على أفضل عرض تسوية، وإعداد اتفاقيات التسوية بشكل نظامي يحمي حقوقك.',
        image: IMG.bank12,
      },
      {
        id: 'bnk-13',
        name: 'سداد المديونيات وتعزيز التوازن المالي',
        shortDesc: 'خطط سداد منظمة للمديونيات لاستعادة التوازن المالي.',
        description:
          'خدمة استشارية وتنفيذية لسداد المديونيات بأسلوب منظم يعزز التوازن المالي. نتولى ترتيب أولويات السداد، التفاوض على تخفيض الأرصدة، وإعداد خطة سداد عملية تعيد لك الاستقرار المالي.',
        image: IMG.bank13,
      },
      {
        id: 'bnk-1',
        name: 'تنشيط وإدارة الحسابات البنكية',
        shortDesc: 'تنشيط وتحديث وتفعيل الحسابات المجمدة أو الراكدة.',
        description:
          'خدمة تنشيط وتفعيل الحسابات البنكية (المجمدة أو الراكدة) ومعالجة قيود التعامل البنكي وفق المتطلبات الرسمية.',
        image: IMG.bank1,
      },
      {
        id: 'bnk-2',
        name: 'فتح وإدارة الحسابات البنكية للمنشآت',
        shortDesc: 'حسابات بنكية مخصصة للشركات والمؤسسات بكافة أحجامها.',
        description:
          'نقدم خدمة متكاملة لفتح الحسابات البنكية للمنشآت التجارية والشركات والمؤسسات مع ربطها بالقنوات الإلكترونية وخدمات السداد.',
        image: IMG.bank2,
      },
    ],
  },

  // 3. الحلول العقارية
  {
    id: 'realestate',
    name: 'الحلول العقارية',
    intro:
      'حلول وخدمات عقارية متكاملة تغطي الوساطة والتسويق، إدارة الأملاك، التقييم العقاري المعتمد، توثيق العقود، وحل النزاعات الإيجارية لحفظ حقوقك وتنمية أصولك.',
    heroImages: [IMG.re1, IMG.re3, IMG.re5],
    products: [
      {
        id: 're-4',
        name: 'توثيق عقود الإيجار عبر منصة "إيجار"',
        shortDesc: 'توثيق رسمي وموثوق لعقود الإيجار عبر المنصة الموحدة.',
        description:
          'نتولى توثيق عقود الإيجار السكنية والتجارية عبر منصة "إيجار" الموحدة. تشمل الخدمة صياغة العقد، تسجيله في المنصة، وضمان توافقه مع لوائح وزارة الإسكان لحفظ حقوق جميع الأطراف.',
        image: IMG.re4,
      },
      {
        id: 're-5',
        name: 'إنهاء عقود الإيجار النظامية في حالات النزاع',
        shortDesc: 'إنهاء عقود الإيجار في حالات النزاع وفق إجراءات نظامية.',
        description:
          'خدمة متخصصة لإنهاء عقود الإيجار في حالات النزاع بين الأطراف. نتولى دراسة العقد، إعداد إخطارات الإنهاء، والتواصل مع منصة إيجار والمحاكم المختصة حتى إنهاء العقد بصورة نظامية.',
        image: IMG.re5,
      },
      {
        id: 're-6',
        name: 'التقييم العقاري ومعالجة الاعتراضات',
        shortDesc: 'إعداد تقارير التقييم العقاري ومتابعة الاعتراضات الرسمية.',
        description:
          'نقوم بتقديم خدمات التقييم العقاري وإعداد ومتابعة الاعتراضات الرسمية على نتائج التقييم لدى الجهات المعتمدة وفق معايير الهيئة السعودية للمقيمين المعتمدين.',
        image: IMG.re6,
      },
      {
        id: 're-2',
        name: 'تحديث وتوثيق بيانات السجل العقاري',
        shortDesc: 'تحديث البيانات في السجل العقاري الإلكتروني الرسمي.',
        description:
          'نقوم بتحديث بياناتك في السجل العقاري الإلكتروني وفق المتطلبات الرسمية. تشمل الخدمة تحديث صكوك الملكية، بيانات الملاك، ومواصفات العقار، مع التنسيق مع الجهات المختصة.',
        image: IMG.re2,
      },
      {
        id: 're-1',
        name: 'طلب تأجيل الأقساط التمويلية العقارية',
        shortDesc: 'تأجيل الأقساط التمويلية العقارية وفق الأنظمة المعتمدة.',
        description:
          'خدمة متخصصة لتقديم طلبات تأجيل الأقساط التمويلية العقارية لدى البنوك وصندوق التنمية العقارية ومتابعة الطلب حتى الموافقة وتطبيق التأجيل.',
        image: IMG.re1,
      },
      {
        id: 're-3',
        name: 'الوساطة والتسويق العقاري وإدارة الأملاك',
        shortDesc: 'خدمات الوساطة والتسويق وإدارة الأملاك بكفاءة عالية.',
        description:
          'خدمة احترافية لإدارة العقارات والمرافق والتسويق العقاري وتوثيق الصفقات بما يحقق أعلى عائد استثماري للأصول العقارية.',
        image: IMG.re3,
      },
    ],
  },

  // 4. الخدمات القانونية
  {
    id: 'legal',
    name: 'الخدمات القانونية',
    intro:
      'يقدم هذا القسم باقة متكاملة من الخدمات القانونية والقضائية المتخصصة لحماية حقوق العملاء، تشمل تقديم الشكاوى لدى حماية العملاء بالبنك المركزي، رفع الدعاوى أمام لجان المنازعات المصرفية، ورفع إيقاف الخدمات والحجوزات البنكية.',
    heroImages: [IMG.legal1, IMG.legal2, IMG.legal3, IMG.legal4],
    products: [
      {
        id: 'jud-1',
        name: 'رفع وتقديم شكوى لإدارة حماية العملاء (ساما تهتم)',
        shortDesc: 'إعداد ورفع شكوى رسمية إلى إدارة حماية العملاء بالبنك المركزي.',
        description:
          'نتولى نيابةً عنك إعداد ورفع الشكوى الرسمية إلى إدارة حماية العملاء في البنك المركزي السعودي عبر منصة "ساما تهتم". تشمل الخدمة صياغة قانونية محكمة ومتابعة الرد حتى حصولك على حقك النظامي.',
        image: IMG.legal1,
      },
      {
        id: 'jud-2',
        name: 'رفع الدعاوى أمام لجان المنازعات المصرفية',
        shortDesc: 'تمثيل وإعداد لوائح الدعاوى أمام لجان المنازعات المصرفية.',
        description:
          'خدمة متخصصة لإعداد ورفع لوائح الدعاوى أمام لجان المنازعات والمخالفات المصرفية والتمويلية وصياغة اللوائح القانونية ومتابعة الجلسات حتى صدور القرار.',
        image: IMG.legal2,
      },
      {
        id: 'jud-3',
        name: 'تقديم طلب رفع إيقاف الخدمات',
        shortDesc: 'رفع إيقاف الخدمات الحكومية المترتب على المطالبات والقضايا.',
        description:
          'نتقدم بطلب رفع إيقاف الخدمات الحكومية المترتب على وجود قضايا أو قرارات تنفيذية. تشمل الخدمة دراسة سبب الإيقاف ومتابعة الجهات المعنية حتى رفعه تماماً.',
        image: IMG.legal3,
      },
      {
        id: 'jud-4',
        name: 'تقديم طلب رفع الحجز عن الحسابات البنكية',
        shortDesc: 'إجراءات نظامية لرفع الحجز التحفظي أو التنفيذي عن الحسابات.',
        description:
          'نتولى تقديم طلب رفع الحجز عن حساباتك البنكية، ودراسة قرار الحجز، والتواصل مع محكمة التنفيذ والجهات المختصة لاسترداد صلاحية التصرف بالحسابات.',
        image: IMG.legal4,
      },
      {
        id: 'jud-5',
        name: 'تقديم طلب الإفراج عن العقارات المحجوزة',
        shortDesc: 'متابعة طلبات الإفراج عن العقارات المحجوزة لدى الجهات.',
        description:
          'خدمة متكاملة لإعداد ومتابعة طلبات الإفراج عن العقارات المحجوزة لدى محاكم التنفيذ والجهات المعنية حتى صدور قرار الإفراج النهائي.',
        image: IMG.legal1,
      },
      {
        id: 'jud-7',
        name: 'تقديم لوائح اعتراضات على قرارات الجهات التمويلية',
        shortDesc: 'صياغة قانونية للوائح الاعتراض على قرارات البنوك والممولين.',
        description:
          'خدمة قانونية متخصصة لإعداد ورفع لوائح الاعتراض على قرارات الجهات التمويلية بدراسة القرار وصياغة لائحة مدعومة بالأنظمة واللوائح المعتمدة.',
        image: IMG.legal3,
      },
      {
        id: 'jud-8',
        name: 'تقديم طلب المعالجة النظامية لتجاوزات شركات التحصيل',
        shortDesc: 'معالجة نظامية لتجاوزات شركات التحصيل مع الجهات الرقابية.',
        description:
          'نقوم بإعداد ورفع طلبات المعالجة النظامية لأي تجاوزات تصدر من شركات التحصيل والرفع للبنك المركزي السعودي لحماية حقوقك القانونية.',
        image: IMG.legal4,
      },
    ],
  },
];

export const getSection = (id: string): SectionDef | undefined => {
  const mappedId = id === 'credit' || id === 'tax' || id === 'consult' ? 'consulting'
    : id === 'judicial' ? 'legal'
    : id;
  return SECTIONS.find((s) => s.id === mappedId) || SECTIONS.find((s) => s.id === id);
};

export const getProduct = (
  productId: string
): { product: ProductDef; section: SectionDef } | undefined => {
  for (const section of SECTIONS) {
    const product = section.products.find((p) => p.id === productId);
    if (product) return { product, section };
  }
  return undefined;
};
