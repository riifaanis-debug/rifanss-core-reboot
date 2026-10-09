import React, { useEffect, useState } from 'react';
import { readConsent, setConsent, CONSENT_EVENT } from '../../lib/snapPixel';

export const OPEN_CONSENT_EVENT = 'open-ad-consent';

const ConsentBanner: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!readConsent());
    const reopen = () => setOpen(true);
    const sync = () => { if (readConsent()) setOpen(false); };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    window.addEventListener(CONSENT_EVENT, sync);
    return () => {
      window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
      window.removeEventListener(CONSENT_EVENT, sync);
    };
  }, []);

  if (!open) return null;
  const current = readConsent()?.choice;

  return (
    <div dir="rtl" role="dialog" aria-label="إعدادات الإعلانات" className="fixed inset-x-0 bottom-0 z-[250] p-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      <div className="mx-auto max-w-[520px] rounded-xl border border-gold/40 bg-white dark:bg-[#12031a] shadow-2xl p-3 text-right">
        <p className="text-[11px] leading-[19px] text-gray-700 dark:text-gray-300">
          نستخدم أداة قياس الإعلانات من سناب شات (Snap Pixel) لمعرفة أداء إعلاناتنا، مثل زيارة الصفحات وبدء الطلب وإرساله وإنشاء الحساب.
          لا نرسل اسمك أو هويتك أو جوالك أو بريدك أو بيانات طلبك. يمكنك تغيير اختيارك لاحقًا من «إعدادات الإعلانات» أسفل الموقع.{' '}
          <a href="#/cookies" className="text-brand dark:text-gold font-bold underline">التفاصيل</a>
          {current && <span className="block mt-1 text-[10px] text-gray-500">اختيارك الحالي: {current === 'accepted' ? 'موافق' : 'مرفوض'}</span>}
        </p>
        <div className="mt-2 flex gap-2">
          <button onClick={() => { setConsent('accepted'); setOpen(false); }} className="flex-1 py-1.5 rounded-md bg-brand text-white font-bold text-[11px]">
            أوافق
          </button>
          <button onClick={() => { setConsent('rejected'); setOpen(false); }} className="flex-1 py-1.5 rounded-md bg-brand text-white font-bold text-[11px]">
            أرفض
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
