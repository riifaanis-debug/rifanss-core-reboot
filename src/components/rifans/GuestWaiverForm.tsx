import React, { useMemo, useState } from 'react';
import { ArrowRight, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { KSA_REGIONS, REGION_NAMES } from '@/lib/ksa-regions';

const BANKS = [
  'البنك الأهلي السعودي (SNB)', 'مصرف الراجحي', 'بنك الرياض',
  'البنك السعودي البريطاني (ساب)', 'البنك السعودي الفرنسي', 'بنك البلاد',
  'بنك الجزيرة', 'بنك الإنماء', 'بنك الخليج الدولي - السعودية', 'جهة تمويلية أخرى',
];
const JOBS = ['موظف حكومي', 'موظف قطاع خاص', 'متقاعد', 'لا يوجد عمل'];
const PRODUCT_TYPES = ['تمويل شخصي', 'تمويل عقاري', 'التمويل التأجيري'];

type Product = { type: string; account: string; amount: string };

const input = 'w-full rounded-[10px] bg-gray-50 border border-gray-200 px-2 py-1.5 text-[12px] font-bold outline-none focus:border-gold';
const label = 'block text-[11px] font-bold text-brand mb-1';

const Req = () => <span className="text-red-500">*</span>;

export default function GuestWaiverForm({ onBack }: { onBack: () => void }) {
  const [f, setF] = useState({ first: '', middle: '', last: '', nationalId: '', phone: '', email: '', region: '', city: '', age: '', job: '', bank: '', notes: '' });
  const [products, setProducts] = useState<Product[]>([{ type: '', account: '', amount: '' }]);
  const [errors, setErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [hp, setHp] = useState('');

  const total = useMemo(() => products.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0), [products]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<any>) => setF({ ...f, [k]: e.target.value });

  const validate = () => {
    const e: string[] = [];
    if (!f.first.trim() || !f.middle.trim() || !f.last.trim()) e.push('الاسم الثلاثي مطلوب');
    if (!/^\d{10}$/.test(f.nationalId)) e.push('رقم الهوية يجب أن يكون 10 أرقام');
    if (!/^05\d{8}$/.test(f.phone)) e.push('رقم الجوال يبدأ بـ 05 ومكون من 10 أرقام');
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.push('البريد الإلكتروني غير صحيح');
    if (!f.region || !f.city) e.push('المنطقة والمدينة مطلوبة');
    const age = parseInt(f.age); if (!(age >= 18 && age <= 100)) e.push('العمر غير صحيح');
    if (!f.job) e.push('الحالة الوظيفية مطلوبة');
    if (!f.bank) e.push('الجهة المالية مطلوبة');
    if (products.some(p => !p.type || !(parseFloat(p.amount) > 0))) e.push('يرجى تحديد نوع كل منتج والمبلغ المتبقي');
    return e;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(); setErrors(e);
    if (e.length) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setSending(true);
    try {
      const res = await fetch('/api/public/fn/guest-waiver', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, age: parseInt(f.age), products: products.map(p => ({ ...p, amount: parseFloat(p.amount) })), website: hp }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setErrors([j.error || 'تعذر إرسال الطلب، حاول مرة أخرى']); window.scrollTo({ top: 0 }); return; }
      setDoneId(j.id); window.scrollTo({ top: 0 });
    } catch { setErrors(['تعذر الاتصال، حاول مرة أخرى']); }
    finally { setSending(false); }
  };

  const Top = (
    <div className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center justify-center relative pt-[env(safe-area-inset-top)]">
      <button type="button" onClick={onBack} aria-label="رجوع" className="absolute right-3 w-9 h-9 flex items-center justify-center text-brand"><ArrowRight size={22} /></button>
      <h1 className="text-[15px] font-black text-brand">نموذج طلب الإعفاء</h1>
    </div>
  );

  if (doneId) return (
    <div className="min-h-screen bg-[#FCFBF8] font-['Tajawal']" dir="rtl">{Top}
      <div className="max-w-lg mx-auto p-6 mt-10 text-center bg-white rounded-2xl border border-gold/30 shadow-sm">
        <CheckCircle2 className="mx-auto text-gold" size={56} />
        <h2 className="mt-3 text-lg font-black text-brand">تم استلام طلبك بنجاح</h2>
        <p className="mt-2 text-sm text-gray-600">رقم الطلب: <b className="text-brand" dir="ltr">{doneId}</b></p>
        <p className="mt-1 text-sm text-gray-600">سيتواصل معك فريقنا المختص قريبًا.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FCFBF8] font-['Tajawal'] pb-10" dir="rtl">{Top}
      <form onSubmit={submit} noValidate className="max-w-2xl mx-auto p-3">
        <div className="bg-white rounded-2xl border border-gold/30 p-4 space-y-3">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-black text-brand">بيانات الطلب الأساسية</h2>
            <p className="text-[11px] text-gray-500 mt-1">يرجى تعبئة جميع البيانات المطلوبة بدقة لضمان سرعة معالجة الطلب.</p>
          </div>
          {errors.length > 0 && <ul className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-600 font-bold list-disc pr-5">{errors.map(e => <li key={e}>{e}</li>)}</ul>}
          <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={e => setHp(e.target.value)} className="hidden" aria-hidden />
          <div>
            <label className={label}>الاسم الثلاثي <Req /></label>
            <div className="grid grid-cols-3 gap-2">
              <input className={input} placeholder="الأول" value={f.first} onChange={set('first')} maxLength={40} />
              <input className={input} placeholder="الأوسط" value={f.middle} onChange={set('middle')} maxLength={40} />
              <input className={input} placeholder="الأخير" value={f.last} onChange={set('last')} maxLength={40} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={label}>رقم الهوية <Req /></label><input className={input} inputMode="numeric" placeholder="10 أرقام" maxLength={10} value={f.nationalId} onChange={e => setF({ ...f, nationalId: e.target.value.replace(/\D/g, '') })} /></div>
            <div><label className={label}>رقم الجوال <Req /></label><input className={input} inputMode="numeric" placeholder="05xxxxxxxx" maxLength={10} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value.replace(/\D/g, '') })} /></div>
          </div>
          <div><label className={label}>البريد الإلكتروني <Req /></label><input className={input} type="email" autoCapitalize="none" placeholder="example@mail.com" maxLength={120} value={f.email} onChange={set('email')} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={label}>المنطقة <Req /></label><select className={input} value={f.region} onChange={e => setF({ ...f, region: e.target.value, city: '' })}><option value="">اختر المنطقة</option>{REGION_NAMES.map(r => <option key={r}>{r}</option>)}</select></div>
            <div><label className={label}>المدينة <Req /></label><select className={input} value={f.city} onChange={set('city')} disabled={!f.region}><option value="">اختر المدينة</option>{(KSA_REGIONS[f.region] || []).map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className={label}>العمر <Req /></label><input className={input} inputMode="numeric" placeholder="بالسنوات" maxLength={3} value={f.age} onChange={e => setF({ ...f, age: e.target.value.replace(/\D/g, '') })} /></div>
            <div><label className={label}>الحالة الوظيفية <Req /></label><select className={input} value={f.job} onChange={set('job')}><option value="">اختر الحالة</option>{JOBS.map(j => <option key={j}>{j}</option>)}</select></div>
          </div>
          <div><label className={label}>الجهة المالية <Req /></label><select className={input} value={f.bank} onChange={set('bank')}><option value="">اختر البنك أو الجهة التمويلية</option>{BANKS.map(b => <option key={b}>{b}</option>)}</select></div>

          <div className="rounded-2xl border border-gold/30 bg-[#FFFDF6] p-3 space-y-3 mt-4">
            <h3 className="font-black text-brand">المنتجات التمويلية</h3>
            {products.map((p, i) => (
              <div key={i} className="space-y-2 border-b border-gold/10 pb-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={label}>نوع المنتج <Req /></label><select className={input} value={p.type} onChange={e => setProducts(products.map((x, k) => k === i ? { ...x, type: e.target.value } : x))}><option value="">اختر النوع</option>{PRODUCT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className={label}>رقم حساب التمويل (اختياري)</label><input className={input} placeholder="رقم الحساب" maxLength={40} value={p.account} onChange={e => setProducts(products.map((x, k) => k === i ? { ...x, account: e.target.value } : x))} /></div>
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1"><label className={label}>المبلغ المتبقي <Req /></label><input className={input} inputMode="decimal" placeholder="0.00" value={p.amount} onChange={e => setProducts(products.map((x, k) => k === i ? { ...x, amount: e.target.value.replace(/[^\d.]/g, '') } : x))} /></div>
                  {products.length > 1 && <button type="button" onClick={() => setProducts(products.filter((_, k) => k !== i))} className="h-9 w-9 flex items-center justify-center text-red-500" aria-label="حذف"><Trash2 size={16} /></button>}
                </div>
              </div>
            ))}
            {products.length < 10 && <button type="button" onClick={() => setProducts([...products, { type: '', account: '', amount: '' }])} className="text-[12px] font-bold text-gold flex items-center gap-1"><Plus size={14} /> إضافة منتج آخر</button>}
            <div className="flex justify-between items-center pt-1"><span className="text-[13px] text-gray-600 font-bold">المجموع الكلي:</span><span className="font-black text-brand" dir="ltr">{total.toFixed(2)} ر.س</span></div>
          </div>
          <div><label className={label}>ملاحظات (اختياري)</label><textarea className={input} rows={3} maxLength={1000} value={f.notes} onChange={set('notes')} /></div>
          <button type="submit" disabled={sending} className="w-full rounded-full py-3 bg-gold-gradient text-brand font-black shadow disabled:opacity-60">{sending ? 'جاري الإرسال...' : 'إرسال الطلب'}</button>
        </div>
      </form>
    </div>
  );
}
