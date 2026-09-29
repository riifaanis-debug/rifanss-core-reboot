import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import rifansLogo from '@/assets/rifans-logo.png';
import rifansStampImg from '@/assets/rifans-stamp.png';
import {
  ContractData,
  extractContractData,
  buildContractBlocks,
  normalizeContract,
} from './contractTemplate';
import { HtmlBlock } from '../components/rifans/documents/A4Document';
import { exportA4Pdf, printA4 } from '../components/rifans/documents/a4Export';
import { withOffscreenDocument } from '../components/rifans/documents/offscreen';
import { createElement } from 'react';

/** كتل العقد الموحدة + بيانات الترويسة — نفس ما يعرضه العارض */
export function contractDocument(target: HTMLElement | ContractData) {
  const c = normalizeContract(target);
  const blocks = buildContractBlocks(target).map((html, i) => createElement(HtmlBlock, { key: i, html }));
  return { blocks, meta: { docType: c.content.title, docNumber: `رقم العقد ${c.submissionId}` } };
}

/* ── Clean Arabic File Name (Handles URL Decoding & Character Formatting) ── */
export const cleanArabicFileName = (name?: string, fallbackId?: string): string => {
  let result = (name || '').trim();

  // Decode URL-encoded strings like %D8%B9%D9%82%D8%AF
  try {
    result = decodeURIComponent(result);
  } catch {}
  try {
    if (result.includes('%')) {
      result = decodeURIComponent(result);
    }
  } catch {}

  // Strip .pdf extension if present
  result = result.replace(/\.pdf$/i, '').trim();

  // Remove invalid filename characters
  result = result.replace(/[\\/:*?"<>|]/g, '_').trim();

  // If name is empty, generic, or just "عقد-xxx", build official format
  const numericId = (fallbackId || result.match(/\d+/) || [''])[0];

  if (!result || result === 'contract' || result === 'عقد' || result.startsWith('عقد-')) {
    if (numericId) {
      return `عقد ريفانس المالية - ${numericId}.pdf`;
    }
    return `عقد ريفانس المالية.pdf`;
  }

  // If name does not include company name, add it
  if (!result.includes('ريفانيس') && !result.includes('ريفانس')) {
    return `عقد ريفانس المالية - ${result}.pdf`;
  }

  return `${result}.pdf`;
};

/* ── Preload an image asset as Data URL ── */
async function toDataUrl(src: string): Promise<string> {
  if (src.startsWith('data:')) return src;
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(src);
      reader.readAsDataURL(blob);
    });
  } catch {
    return src;
  }
}

/* ── Wait for assets inside an element to load ── */
async function waitForAssets(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalHeight !== 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          setTimeout(done, 3000); // 3s safety timeout per image
        })
    )
  );
  try {
    await document.fonts.ready;
  } catch {}
}

/* ── Check if target is a contract or generic document ── */
function isContractTarget(target: HTMLElement | ContractData): boolean {
  if (typeof (target as any)?.submissionId === 'string') return true;
  const el = target as HTMLElement;
  if ((el as any)?.__contractData) return true;
  const text = el.innerText || el.textContent || '';
  return text.includes('عقد تفويض') || text.includes('شركة ريفانس المالية') || text.includes('المادة (');
}

/**
 * Generates an official, publication-ready PDF.
 * Uses dedicated A4 portrait pages with exact company headers, footers,
 * and page counts without slicing words or splitting headings.
 */
export const generateContractPdf = async (
  target: HTMLElement | ContractData,
  fileName?: string
): Promise<{ pdf: jsPDF; blob: Blob }> => {
  const isContract = isContractTarget(target);

  if (isContract) {
    const data = extractContractData(target);
    const id = data.submissionId || '1787873399904';
    const finalFileName = cleanArabicFileName(fileName, id);

    void finalFileName;
    const { blocks, meta } = contractDocument(data);
    const blob = await withOffscreenDocument(blocks, meta, (root) => exportA4Pdf(root));
    return { pdf: null as unknown as jsPDF, blob };
  }

  // Fallback for non-contract documents (e.g. receipts, invoices in Admin Dashboard)
  const el = target as HTMLElement;
  const clone = el.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    width: '794px',
    maxWidth: '794px',
    padding: '24px 30px',
    margin: '0',
    background: '#ffffff',
    position: 'fixed',
    left: '-9999px',
    top: '0',
    direction: 'rtl',
    boxShadow: 'none',
    border: 'none',
    overflow: 'visible',
  });
  document.body.appendChild(clone);

  try {
    await waitForAssets(clone);
    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const imgH = (canvas.height * 210) / canvas.width;

    if (imgH <= 297) {
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, imgH);
    } else {
      let position = 0;
      let heightLeft = imgH;
      while (heightLeft > 0) {
        if (position !== 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, 210, imgH);
        heightLeft -= 297;
        position -= 297;
      }
    }

    const blob = pdf.output('blob');
    return { pdf, blob };
  } finally {
    if (document.body.contains(clone)) {
      document.body.removeChild(clone);
    }
  }
};

/**
 * Downloads the official PDF directly with an uncorrupted Arabic filename.
 * Works flawlessly on iPhone, Android, Mac, and Windows.
 */
export const downloadContractPdf = async (
  target: HTMLElement | ContractData,
  fileName?: string
): Promise<void> => {
  const data = extractContractData(target);
  const cleanName = cleanArabicFileName(fileName, data.submissionId);

  const { blob } = await generateContractPdf(target, cleanName);

  // Trigger standard browser download
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = cleanName;
  link.setAttribute('download', cleanName);
  link.type = 'application/pdf';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    try {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {}
  }, 2500);
};

/**
 * Prints the official A4 contract using the device's native print engine.
 * Isolates the dedicated A4 sheets, hides all web UI elements (buttons, navs),
 * and guarantees official pagination matching the PDF.
 */
export const printContractPdf = async (
  target: HTMLElement | ContractData
): Promise<void> => {
  const isContract = isContractTarget(target);

  if (isContract) {
    const data = extractContractData(target);
    const { blocks, meta } = contractDocument(data);
    await withOffscreenDocument(blocks, meta, async (root) => {
      await printA4(root);
    });
    return;
  }

  // Fallback for non-contract elements
  window.print();
};
