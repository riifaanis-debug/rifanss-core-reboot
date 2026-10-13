import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { A4_W, A4_H } from './A4Document';

async function waitForAssets(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(imgs.map((img) => new Promise<void>((resolve) => {
    if (img.complete && img.naturalHeight !== 0) return resolve();
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
    setTimeout(resolve, 3000);
  })));
  try { await (document as any).fonts?.ready; } catch {}
}

/** ينسخ صفحات A4 بحجمها الحقيقي (دون تصغير العارض) إلى حاوية مستقلة */
function clonePages(source: HTMLElement, hostId: string): HTMLElement {
  document.getElementById(hostId)?.remove();
  const host = document.createElement('div');
  host.id = hostId;
  host.setAttribute('dir', 'rtl');
  const pages = Array.from(source.querySelectorAll('.a4-page:not(.a4-measure)')) as HTMLElement[];
  pages.forEach((p) => host.appendChild(p.cloneNode(true)));
  document.body.appendChild(host);
  return host;
}

export async function exportA4Pdf(source: HTMLElement): Promise<Blob> {
  const host = clonePages(source, 'a4-pdf-host');
  Object.assign(host.style, { position: 'fixed', left: '-20000px', top: '0', width: `${A4_W}px`, background: '#fff', zIndex: '-1' });
  try {
    await waitForAssets(host);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const pages = Array.from(host.querySelectorAll('.a4-page:not(.a4-measure)')) as HTMLElement[];
    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], {
        scale: 2.5, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false,
        width: A4_W, height: A4_H, windowWidth: A4_W,
      });
      if (i > 0) pdf.addPage('a4', 'p');
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }
    return pdf.output('blob');
  } finally {
    host.remove();
  }
}

export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fileName; a.style.display = 'none';
  document.body.appendChild(a); a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 2500);
}

export async function downloadA4Pdf(source: HTMLElement, fileName: string) {
  saveBlob(await exportA4Pdf(source), fileName);
}

/** الطباعة: نفس صفحات A4 فقط، دون عناصر الموقع */
export async function printA4(source: HTMLElement) {
  const host = clonePages(source, 'a4-print-host');
  await waitForAssets(host);
  document.body.classList.add('a4-printing');
  const cleanup = () => { document.body.classList.remove('a4-printing'); host.remove(); };
  window.addEventListener('afterprint', cleanup, { once: true });
  setTimeout(cleanup, 20000);
  requestAnimationFrame(() => setTimeout(() => window.print(), 100));
}
