import { describe, it, expect } from 'vitest';
import { legacyToClean, cleanToLegacy } from '@/lib/routes';

describe('clean URL mapping', () => {
  it('old waiver links go to /health-waiver', () => {
    expect(legacyToClean('#/health-waiver')).toBe('/health-waiver');
    expect(legacyToClean('#/product/bnk-6')).toBe('/health-waiver');
  });
  it('service pages use /services/<id>', () => {
    expect(legacyToClean('#/service-page/cv-design')).toBe('/services/cv-design');
    expect(cleanToLegacy('/services/cv-design')).toBe('#/service-page/cv-design');
  });
  it('service forms use /services/<id>/apply', () => {
    expect(legacyToClean('#/service-apply/lease')).toBe('/services/lease/apply');
    expect(cleanToLegacy('/services/lease/apply')).toBe('#/service-apply/lease');
  });
  it('keeps query parameters', () => {
    expect(legacyToClean('#/dashboard?tab=contracts')).toBe('/dashboard?tab=contracts');
    expect(cleanToLegacy('/dashboard?tab=contracts')).toBe('#/dashboard?tab=contracts');
  });
  it('home page has no hash', () => {
    expect(legacyToClean('#/')).toBe('/');
    expect(cleanToLegacy('/')).toBe('');
  });
});
