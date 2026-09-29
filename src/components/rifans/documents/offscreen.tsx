import React from 'react';
import { createRoot } from 'react-dom/client';
import { A4Document, A4_W, type DocMeta } from './A4Document';

/** يرسم المستند الموحد خارج الشاشة (لاستخدامات لوحة الإدارة) ثم ينفّذ إجراءً على صفحاته */
export async function withOffscreenDocument<T>(
  blocks: React.ReactNode[],
  meta: DocMeta,
  fn: (root: HTMLElement) => Promise<T>,
): Promise<T> {
  const host = document.createElement('div');
  Object.assign(host.style, { position: 'fixed', left: '-30000px', top: '0', width: `${A4_W}px`, zIndex: '-1' });
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    root.render(<A4Document blocks={blocks} docType={meta.docType} docNumber={meta.docNumber} />);
    const start = Date.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        const ready = host.querySelector('.a4-document')?.getAttribute('data-ready') === '1';
        if ((ready && Date.now() - start > 600) || Date.now() - start > 5000) resolve();
        else setTimeout(tick, 100);
      };
      tick();
    });
    return await fn(host);
  } finally {
    root.unmount();
    host.remove();
  }
}
