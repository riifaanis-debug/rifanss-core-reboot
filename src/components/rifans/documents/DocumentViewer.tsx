import React, { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, Download, Loader2, Printer } from 'lucide-react';
import { A4Document, A4_W, A4_H, DOC_COLORS, type DocMeta } from './A4Document';
import { downloadA4Pdf, printA4 } from './a4Export';

interface DocumentViewerProps extends DocMeta {
  blocks: React.ReactNode[];
  fileName: string;
  onClose: () => void;
  /** محتوى إضافي تحت الصفحات (مثل لوحة التوقيع) — لا يدخل في المستند */
  children?: React.ReactNode;
  bottomPadding?: number;
}

/** عارض المستندات الموحد: صفحات A4 حقيقية مصغّرة لتناسب الشاشة */
const DocumentViewer: React.FC<DocumentViewerProps> = ({ blocks, docType, docNumber, fileName, onClose, children, bottomPadding = 32 }) => {
  const areaRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [busy, setBusy] = useState<'pdf' | 'print' | null>(null);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, (el.clientWidth - 16) / A4_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const n = Number(docRef.current?.querySelector('.a4-document')?.getAttribute('data-pages') || 1);
    if (n !== pageCount) setPageCount(n);
  });

  const LABEL_H = 34;
  const scaledH = pageCount * (A4_H * scale + LABEL_H);

  const run = async (kind: 'pdf' | 'print') => {
    if (busy || !docRef.current) return;
    setBusy(kind);
    try {
      if (kind === 'pdf') await downloadA4Pdf(docRef.current, fileName);
      else await printA4(docRef.current);
    } catch (e) {
      console.error('Document action failed', e);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Cairo'] text-right" dir="rtl" style={{ background: '#ECE8EE' }}>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold shrink-0" style={{ color: DOC_COLORS.purple }}>
            <ArrowRight size={16} className="rotate-180" />
            <span>رجوع</span>
          </button>
          <div className="min-w-0">
            <h2 className="text-xs font-bold leading-tight truncate" style={{ color: DOC_COLORS.purple }}>{docType}</h2>
            <p className="text-[10px] text-gray-500 font-mono truncate" dir="ltr">{docNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => run('print')} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold disabled:opacity-50" style={{ color: DOC_COLORS.purple, borderColor: `${DOC_COLORS.gold}66`, background: `${DOC_COLORS.gold}1a` }}>
            {busy === 'print' ? <Loader2 size={15} className="animate-spin" style={{ color: DOC_COLORS.gold }} /> : <Printer size={15} style={{ color: DOC_COLORS.gold }} />}
            <span>طباعة</span>
          </button>
          <button onClick={() => run('pdf')} disabled={!!busy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm disabled:opacity-50" style={{ background: DOC_COLORS.purple, color: DOC_COLORS.white }}>
            {busy === 'pdf' ? <Loader2 size={15} className="animate-spin" style={{ color: DOC_COLORS.gold }} /> : <Download size={15} style={{ color: DOC_COLORS.gold }} />}
            <span>تحميل PDF</span>
          </button>
        </div>
      </header>

      <main ref={areaRef} className="flex-1 w-full max-w-[860px] mx-auto px-2 py-3" style={{ paddingBottom: bottomPadding }}>
        <div style={{ width: A4_W * scale, height: scaledH, margin: '0 auto', position: 'relative' }}>
          <div
            ref={docRef}
            className="a4-viewer-scale"
            style={{ width: A4_W, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}
          >
            <A4DocumentWithLabels blocks={blocks} docType={docType} docNumber={docNumber} scale={scale} labelH={LABEL_H} />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

const A4DocumentWithLabels: React.FC<DocMeta & { blocks: React.ReactNode[]; scale: number; labelH: number }> = ({ scale, labelH, ...rest }) => (
  <div className="a4-with-labels">
    <style>{`.a4-with-labels .a4-page{box-shadow:0 4px 18px rgba(42,14,50,.14)}`}</style>
    <A4Document {...rest} showPageLabels labelHeight={labelH / scale} labelFontSize={12 / scale} />
  </div>
);

export default DocumentViewer;
