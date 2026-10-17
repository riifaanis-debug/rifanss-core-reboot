import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STATUS: Record<string, string> = { new: 'جديد', contacted: 'تم التواصل', closed: 'مغلق' };

export default function GuestWaiverRequests() {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const load = async () => {
    const { data } = await supabase.from('guest_waiver_requests').select('*').order('created_at', { ascending: false });
    setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  const setStatus = async (id: string, status: string) => {
    await supabase.from('guest_waiver_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    load();
  };
  return (
    <div className="space-y-3 p-2" dir="rtl">
      <h2 className="text-lg font-black text-brand dark:text-gold">طلبات الإعفاء من صفحة الهبوط ({rows.length})</h2>
      {rows.length === 0 && <p className="text-sm text-muted">لا توجد طلبات بعد.</p>}
      {rows.map(r => (
        <div key={r.id} className="rounded-xl border border-gold/20 bg-white dark:bg-[#12031a] p-3">
          <button onClick={() => setOpen(open === r.id ? null : r.id)} className="w-full flex justify-between items-center text-right">
            <div>
              <p className="font-black text-brand dark:text-white text-sm">{r.full_name}</p>
              <p className="text-[11px] text-muted" dir="ltr">{r.id} · {new Date(r.created_at).toLocaleString('ar-SA')}</p>
            </div>
            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-gold/15 text-gold">{STATUS[r.status] || r.status}</span>
          </button>
          {open === r.id && (
            <div className="mt-3 text-[12px] space-y-1 border-t border-gold/10 pt-2">
              <p>الجوال: <a className="font-bold text-gold" href={`tel:${r.phone}`}>{r.phone}</a></p>
              <p>الهوية: {r.national_id}</p><p>البريد: {r.email || '—'}</p>
              <p>المنطقة / المدينة: {r.region} / {r.city}</p><p>العمر: {r.age} · {r.job_status}</p>
              <p>الجهة المالية: {r.bank}</p>
              {(r.products || []).map((p: any, i: number) => <p key={i}>• {p.type} {p.account ? `(${p.account})` : ''}: {Number(p.amount).toFixed(2)} ر.س</p>)}
              <p className="font-bold">المجموع: {Number(r.total_amount).toFixed(2)} ر.س</p>
              {r.notes && <p>ملاحظات: {r.notes}</p>}
              <div className="flex gap-2 pt-2">
                {Object.entries(STATUS).map(([k, v]) => (
                  <button key={k} onClick={() => setStatus(r.id, k)} className={`px-3 py-1 rounded-lg text-[11px] font-bold border ${r.status === k ? 'bg-gold text-brand border-gold' : 'border-gold/30 text-gold'}`}>{v}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
