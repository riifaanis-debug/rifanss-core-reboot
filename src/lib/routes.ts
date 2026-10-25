// Clean URL <-> internal legacy hash route key mapping.
// The app logic still matches on legacy keys ("#/about"); the address bar shows clean paths ("/about").

const PREFIX_MAP: [string, string][] = [
  ['#/service-apply/', '/services/:id/apply'],
  ['#/service-page/', '/services/'],
  ['#/electronic-service/', '/electronic-services/'],
  ['#/business-field/', '/fields/'],
];

const SIMPLE_ALIASES: Record<string, string> = {
  '#/waiver-health': '/health-waiver',
  '#/waive-info': '/health-waiver',
  '#/product/bnk-6': '/health-waiver',
  '#/product/bnk-6/apply': '/health-waiver',
};

/** "#/service-page/x?tab=1" -> "/services/x?tab=1" */
export function legacyToClean(hash: string): string {
  if (!hash || hash === '#' || hash === '#/') return '/';
  const [path, query] = hash.split('?');
  const q = query ? `?${query}` : '';
  if (SIMPLE_ALIASES[path]) return SIMPLE_ALIASES[path] + q;
  for (const [legacy, clean] of PREFIX_MAP) {
    if (path.startsWith(legacy)) {
      const rest = path.slice(legacy.length);
      return (clean.includes(':id') ? clean.replace(':id', rest) : clean + rest) + q;
    }
  }
  return path.replace(/^#/, '') + q;
}

/** "/services/x?tab=1" -> "#/service-page/x?tab=1" */
export function cleanToLegacy(pathAndQuery: string): string {
  const [rawPath, query] = pathAndQuery.split('?');
  const path = rawPath.replace(/\/+$/, '') || '/';
  const q = query ? `?${query}` : '';
  if (path === '/') return '';
  let m = path.match(/^\/services\/([^/]+)\/apply$/);
  if (m) return `#/service-apply/${m[1]}${q}`;
  m = path.match(/^\/services\/([^/]+)$/);
  if (m) return `#/service-page/${m[1]}${q}`;
  m = path.match(/^\/electronic-services\/([^/]+)$/);
  if (m) return `#/electronic-service/${m[1]}${q}`;
  m = path.match(/^\/fields\/([^/]+)$/);
  if (m) return `#/business-field/${m[1]}${q}`;
  return `#${path}${q}`;
}

/** Navigate with a clean URL; accepts either "/about" or legacy "#/about". */
export function navigate(to: string) {
  const clean = to.startsWith('#/') || to === '#' ? legacyToClean(to) : to;
  if (clean === window.location.pathname + window.location.search) return;
  window.history.pushState({}, '', clean);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export const SITE_URL = 'https://rifanss.com';
