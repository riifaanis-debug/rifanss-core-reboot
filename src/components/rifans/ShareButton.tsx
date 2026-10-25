import { useState } from 'react';
import { Share2, Link2, Check, MessageCircle } from 'lucide-react';

// Shares the current page URL (never the home page).
export default function ShareButton({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = () => window.location.origin + window.location.pathname + window.location.search;

  const onShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, url: url() }); return; } catch (e: any) { if (e?.name === 'AbortError') return; }
    }
    setOpen((v) => !v);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(url()); } catch { /* ignore */ }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const item = 'flex items-center gap-2 w-full px-3 py-2.5 text-sm font-bold text-[#240738] dark:text-white hover:bg-gold/10 rounded-lg';

  return (
    <div className="relative inline-block">
      <button type="button" onClick={onShare} aria-label="مشاركة"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/50 text-gold text-xs sm:text-sm font-bold bg-white/80 dark:bg-[#14031c]/80">
        <Share2 size={14} /> مشاركة
      </button>
      {open && (
        <div className="absolute z-30 mt-2 right-0 w-48 p-1.5 rounded-xl border border-gold/30 bg-white dark:bg-[#14031c] shadow-lg">
          <a className={item} href={`https://wa.me/?text=${encodeURIComponent(`${title}\n${url()}`)}`} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <MessageCircle size={16} className="text-gold" /> واتساب
          </a>
          <button type="button" className={item} onClick={copy}>
            {copied ? <Check size={16} className="text-gold" /> : <Link2 size={16} className="text-gold" />}
            {copied ? 'تم نسخ الرابط' : 'نسخ الرابط'}
          </button>
        </div>
      )}
    </div>
  );
}
