// Hero image for each service page, keyed by service id.
const files = import.meta.glob('../assets/services/*.jpg', { eager: true, import: 'default' }) as Record<string, string>;
const byName: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  byName[path.split('/').pop()!.replace('.jpg', '')] = url;
}

// Catalog products reuse the image of the closest matching service.
const ALIASES: Record<string, string> = {
  'cons-1': 'financial-consulting', 'cons-2': 'financial-settlements', 'cons-3': 'financial-consulting',
  'cr-1': 'credit-score', 'cr-2': 'credit-score', 'cr-3': 'debt-clearance', 'cr-4': 'financial-consulting',
  'bnk-1': 'digital-banking', 'bnk-2': 'business-banking', 'bnk-5': 'rescheduling-request',
  'bnk-11': 'statutory-ratio-request', 'bnk-12': 'financial-settlements', 'bnk-13': 'debt-clearance',
  're-1': 'rescheduling-request', 're-2': 'certified-valuation-reports', 're-3': 'real-estate-brokerage',
  're-4': 'lease', 're-5': 'lease', 're-6': 'certified-valuation',
  'jud-1': 'banking-disputes', 'jud-2': 'banking-disputes', 'jud-3': 'account-release',
  'jud-4': 'account-release', 'jud-5': 'real-estate-auctions', 'jud-7': 'judicial-followup', 'jud-8': 'legal-consulting',
};

export const getServiceImage = (id?: string): string | undefined => {
  if (!id) return undefined;
  return byName[id] || byName[ALIASES[id] || ''] || byName['financial-consulting'];
};
