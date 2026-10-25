import { BUSINESS_FIELDS_DATA, getSubServiceById } from '@/data/businessFieldsData';
import { getSection, getProduct } from '@/data/sectionsCatalog';
import { getServiceImageName } from '@/data/serviceImages';
import { SITE_URL } from './routes';

export interface PageMeta { title: string; description: string; image: string; private?: boolean }

const BRAND = 'ريفانس المالية';
const DEFAULT_DESC = 'ريفانس المالية ، شركة سعودية ذات مسؤولية محدودة مرخصة من قِبل البنك المركزي السعودي وخاضعة لإشراف ورقابة هيئة السوق المالية';
const DEFAULT_IMG = `${SITE_URL}/og-share.jpg`;
const WAIVER_IMG = `${SITE_URL}/og-waiver.jpg`;
const og = (id: string) => `${SITE_URL}/og/${getServiceImageName(id)}.jpg`;
const short = (t: string) => (t.length > 180 ? t.slice(0, 177) + '…' : t);

const STATIC: Record<string, [string, string?]> = {
  about: ['من نحن'], goal: ['هدفنا'], vision: ['رؤيتنا'], message: ['رسالتنا'], mission: ['مهمتنا'],
  contact: ['اتصل بنا', 'تواصل مع فريق ريفانس المالية.'], complaints: ['الشكاوى والمقترحات'],
  services: ['خدماتنا', 'تعرّف على جميع خدمات ريفانس المالية المالية والمصرفية والعقارية والقانونية والإلكترونية.'],
  terms: ['الشروط والأحكام'], privacy: ['سياسة الخصوصية'], cookies: ['سياسة ملفات الارتباط'],
  'acceptable-use': ['سياسة الاستخدام المقبول'], disclaimer: ['إخلاء المسؤولية'],
  'data-protection': ['سياسة حماية البيانات'], 'user-rights': ['حقوق المستفيدين'],
  'intellectual-property': ['الملكية الفكرية'], 'electronic-services': ['الخدمات الإلكترونية'],
  'client-card': ['بطاقة العميل'], 'business-fields': ['مجالات أعمالنا'],
};
const PRIVATE = ['dashboard', 'admin', 'contract', 'invoice', 'promissory', 'domain-check'];

export function getPageMeta(splat: string): PageMeta {
  const parts = splat.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  const [a, b, c] = parts;
  const mk = (t: string, d = DEFAULT_DESC, image = DEFAULT_IMG): PageMeta => ({ title: `${t} | ${BRAND}`, description: short(d), image });

  if (!a) return mk(BRAND);
  if (PRIVATE.includes(a)) return { ...mk('حسابي'), private: true };
  if (a === 'health-waiver')
    return mk('طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي', 'قدّم طلب الإعفاء من الالتزامات التمويلية بسبب العجز الصحي مع فريق ريفانس المالية المختص.', WAIVER_IMG);
  if ((a === 'services' || a === 'electronic-services') && b) {
    const f = getSubServiceById(b);
    if (f) return mk(c === 'apply' ? `طلب ${f.subService.name}` : f.subService.name, f.subService.description, f.subService.id === 'waiver-request' ? WAIVER_IMG : og(b));
  }
  if (a === 'fields' && b) {
    const field = BUSINESS_FIELDS_DATA.find((x) => x.id === b);
    if (field) return mk(field.title, field.intro || DEFAULT_DESC, og(field.subServices?.[0]?.id || ''));
  }
  if ((a === 'section' || a === 'category') && b) {
    const s = getSection(b);
    if (s) return mk(s.name, s.intro);
  }
  if (a === 'product' && b) {
    const p = getProduct(b);
    if (p) return mk(c === 'apply' ? `طلب ${p.product.name}` : p.product.name, p.product.description || p.product.shortDesc, og(b));
  }
  if (STATIC[a]) return mk(STATIC[a][0], STATIC[a][1]);
  return mk(BRAND);
}
