import React, { useLayoutEffect, useRef, useState } from 'react';
import rifansLogo from '@/assets/rifans-logo.png';
import { FIRST_PARTY } from '../../../lib/contractTemplate';

/* ═══ الثوابت الرسمية لصفحة A4 (210×297mm @ 96DPI) ═══ */
export const A4_W = 794;
export const A4_H = 1123;
const PAD_X = 48;
const PAD_Y = 34;
const HEADER_H = 78;
const FOOTER_H = 38;
const BODY_PAD = 12;
const GAP = 10;
export const A4_CONTENT_W = A4_W - PAD_X * 2;
export const A4_CONTENT_H = A4_H - PAD_Y * 2 - HEADER_H - FOOTER_H - BODY_PAD * 2;

export const DOC_COLORS = {
  purple: '#2A0E32',
  gold: '#B99A55',
  white: '#FFFFFF',
  offWhite: '#FBFAF8',
};

const FONT = "Cairo, Tajawal, -apple-system, 'Segoe UI', sans-serif";

export interface DocMeta {
  docType: string;   // مثال: عقد / سند لأمر / فاتورة
  docNumber: string;
}

export const DocumentHeader: React.FC<DocMeta> = ({ docType, docNumber }) => (
  <div
    className="a4-header"
    style={{
      height: HEADER_H, boxSizing: 'border-box', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12, borderBottom: `2px solid ${DOC_COLORS.gold}`, paddingBottom: 8,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src={rifansLogo} alt="ريفانس المالية" style={{ height: 50, width: 'auto', objectFit: 'contain' }} />
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: DOC_COLORS.purple, lineHeight: 1.3 }}>{FIRST_PARTY.name}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#555', lineHeight: 1.4 }}>
          الرقم الوطني الموحد: <span style={{ fontWeight: 700, color: DOC_COLORS.purple }}>{FIRST_PARTY.unifiedNumber}</span>
        </div>
      </div>
    </div>
    <div style={{ textAlign: 'left', background: DOC_COLORS.offWhite, border: `1px solid ${DOC_COLORS.gold}55`, borderRadius: 8, padding: '6px 12px' }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: DOC_COLORS.purple, textAlign: 'right' }}>{docType}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: DOC_COLORS.gold, direction: 'ltr', textAlign: 'right' }}>{docNumber}</div>
    </div>
  </div>
);

export const DocumentFooter: React.FC<DocMeta & { page: number; total: number }> = ({ docNumber, page, total }) => (
  <div
    className="a4-footer"
    style={{
      height: FOOTER_H, boxSizing: 'border-box', borderTop: `1.5px solid ${DOC_COLORS.gold}`, paddingTop: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10.5, color: '#555',
    }}
  >
    <span style={{ fontWeight: 700, color: DOC_COLORS.purple }}>{FIRST_PARTY.name}</span>
    <span>الرقم الوطني الموحد: {FIRST_PARTY.unifiedNumber}</span>
    <span>رقم المستند: <span style={{ direction: 'ltr', display: 'inline-block' }}>{docNumber}</span></span>
    <span style={{ fontWeight: 700, color: DOC_COLORS.purple }}>صفحة {page} من {total}</span>
  </div>
);

export const A4Page: React.FC<DocMeta & { page: number; total: number; children: React.ReactNode }> = ({
  docType, docNumber, page, total, children,
}) => (
  <div
    className="a4-page"
    data-page={page}
    style={{
      width: A4_W, height: A4_H, boxSizing: 'border-box', padding: `${PAD_Y}px ${PAD_X}px`,
      background: DOC_COLORS.white, color: '#1f2937', fontFamily: FONT, direction: 'rtl', textAlign: 'right',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
    }}
  >
    <DocumentHeader docType={docType} docNumber={docNumber} />
    <div style={{ height: A4_CONTENT_H + BODY_PAD * 2, boxSizing: 'border-box', padding: `${BODY_PAD}px 0`, overflow: 'hidden' }}>
      {children}
    </div>
    <DocumentFooter docType={docType} docNumber={docNumber} page={page} total={total} />
  </div>
);

/** كتلة HTML نصية (تُستخدم لقالب العقد) */
export const HtmlBlock: React.FC<{ html: string }> = ({ html }) => <div dangerouslySetInnerHTML={{ __html: html }} />;

interface A4DocumentProps extends DocMeta {
  blocks: React.ReactNode[];
  showPageLabels?: boolean;
  labelHeight?: number;
  labelFontSize?: number;
}

/**
 * المصدر الموحد: يوزّع كتل المحتوى على صفحات A4 مستقلة بقياس ارتفاعها الفعلي.
 * نفس الصفحات تُعرض وتُطبع وتُحوَّل إلى PDF.
 */
export const A4Document: React.FC<A4DocumentProps> = ({ blocks, docType, docNumber, showPageLabels, labelHeight = 34, labelFontSize = 12 }) => {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][] | null>(null);
  const pagesKey = useRef('');

  useLayoutEffect(() => {
    let cancelled = false;
    const run = () => {
      const el = measureRef.current;
      if (!el || cancelled) return;
      const kids = Array.from(el.children) as HTMLElement[];
      const res: number[][] = [];
      let cur: number[] = [];
      let h = 0;
      kids.forEach((k, i) => {
        const bh = k.offsetHeight; // offsetHeight لا يتأثر بتصغير العارض
        const add = cur.length ? bh + GAP : bh;
        if (cur.length && h + add > A4_CONTENT_H) {
          res.push(cur); cur = [i]; h = bh;
        } else { cur.push(i); h += add; }
      });
      if (cur.length) res.push(cur);
      const key = JSON.stringify(res);
      if (key !== pagesKey.current) { pagesKey.current = key; setPages(res); }
    };
    run();
    const imgs = Array.from(measureRef.current?.querySelectorAll('img') || []);
    imgs.forEach((img) => { if (!img.complete) img.addEventListener('load', run, { once: true }); });
    (document as any).fonts?.ready?.then(run).catch(() => {});
    const t = setTimeout(run, 400);
    return () => { cancelled = true; clearTimeout(t); };
  });

  const list = pages || [blocks.map((_, i) => i)];
  const total = list.length;

  return (
    <div className="a4-document" data-ready={pages ? '1' : '0'} data-pages={total}>
      {/* منطقة قياس مخفية بعرض محتوى الصفحة الحقيقي */}
      <div
        ref={measureRef}
        aria-hidden
        style={{ position: 'fixed', left: -20000, top: 0, width: A4_CONTENT_W, visibility: 'hidden', fontFamily: FONT, direction: 'rtl', pointerEvents: 'none' }}
      >
        {blocks.map((b, i) => <div key={i} style={{ display: 'flow-root' }}>{b}</div>)}
      </div>

      <div className="a4-pages" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {list.map((idxs, p) => (
          <div key={p} className="a4-page-slot">
            {showPageLabels && (
              <div className="a4-page-label" style={{ height: labelHeight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: labelFontSize, fontWeight: 700, color: DOC_COLORS.purple, fontFamily: FONT }}>
                صفحة {p + 1} من {total}
              </div>
            )}
            <A4Page docType={docType} docNumber={docNumber} page={p + 1} total={total}>
              {idxs.map((i, j) => (
                <div key={i} style={{ marginTop: j ? GAP : 0, display: 'flow-root' }}>{blocks[i]}</div>
              ))}
            </A4Page>
          </div>
        ))}
      </div>
    </div>
  );
};
