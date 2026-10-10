// Snap Pixel — loaded only after explicit advertising consent. No personal data is ever sent.
const PIXEL_ID = '2196cf76-372a-41d9-b85a-ba6a4e6d1f45';
const CONSENT_KEY = 'rifans_ad_consent';
export const CONSENT_NOTICE_VERSION = 'snap-v1-2026-10';
export const CONSENT_EVENT = 'rifans-ad-consent-change';

export type AdConsent = { choice: 'accepted' | 'rejected'; at: string; version: string };

export function readConsent(): AdConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as AdConsent) : null;
  } catch {
    return null;
  }
}

const hasConsent = () => readConsent()?.choice === 'accepted';

export function setConsent(choice: AdConsent['choice']) {
  const rec: AdConsent = { choice, at: new Date().toISOString(), version: CONSENT_NOTICE_VERSION };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(rec));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
  if (choice === 'accepted') {
    loadPixel();
    trackPageView();
  }
}

let loaded = false;
let lastPath: string | null = null;

function loadPixel() {
  if (loaded || typeof window === 'undefined' || !hasConsent()) return;
  const w = window as any;
  if (w.snaptr) { loaded = true; return; }
  const a: any = (w.snaptr = function (...args: any[]) {
    a.handleRequest ? a.handleRequest.apply(a, args) : a.queue.push(args);
  });
  a.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://sc-static.net/scevent.min.js';
  document.head.appendChild(s);
  w.snaptr('init', PIXEL_ID, {});
  loaded = true;
}

/** Path without IDs (request/contract/invoice numbers etc.) and without query strings. */
function safePageUrl() {
  const hash = (window.location.hash || '#/').split('?')[0];
  const clean = hash
    .split('/')
    .map((seg, i) => (i >= 2 && /\d/.test(seg) ? ':id' : seg))
    .join('/')
    .replace(/^#(contract|invoice|promissory)\/.*/, '#/$1');
  return `${window.location.origin}/${clean}`;
}

function send(event: string, params: Record<string, string> = {}) {
  if (!hasConsent()) return; // read consent at send time
  // Snap reads the page URL itself — never fire on pages whose URL carries record IDs or private areas.
  if (/^#\/(contract|invoice|promissory|dashboard|admin)/.test(window.location.hash)) return;
  loadPixel();
  const w = window as any;
  if (!w.snaptr) return;
  w.snaptr('track', event, { page_url: safePageUrl(), ...params });
}

export function trackPageView() {
  if (typeof window === 'undefined') return;
  const key = safePageUrl();
  if (key === lastPath) return;
  if (!hasConsent()) return;
  lastPath = key;
  send('PAGE_VIEW');
}

export const trackViewContent = (category: string) => send('VIEW_CONTENT', { item_category: category });
export const trackStartCheckout = () => send('START_CHECKOUT');
export const trackSignUp = () => send('SIGN_UP');
const SENT_KEY = 'rifans_snap_sent_requests';
const REQUEST_EVENTS: Record<string, string> = {
  waive_request: 'CUSTOM_EVENT_1',
  rescheduling_request: 'CUSTOM_EVENT_2',
  scheduling_request: 'CUSTOM_EVENT_2',
};

/** Call only after the database returned the saved request. Sends once per request ID; no data attached. */
export function trackRequestSaved(type: string | undefined, requestId: string | undefined) {
  if (typeof window === 'undefined' || !type || !requestId) return;
  const event = REQUEST_EVENTS[type];
  if (!event || !hasConsent()) return;
  let sent: string[] = [];
  try { sent = JSON.parse(localStorage.getItem(SENT_KEY) || '[]'); } catch { sent = []; }
  if (sent.includes(requestId)) return;
  sent.push(requestId);
  try { localStorage.setItem(SENT_KEY, JSON.stringify(sent.slice(-200))); } catch { /* ignore */ }
  send(event);
}

/** Call once on app mount. */
export function initSnapPixel() {
  if (hasConsent()) loadPixel();
  const onStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_KEY) window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
