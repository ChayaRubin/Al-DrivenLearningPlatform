import { describe, it, expect } from 'vitest';
import { getCategoryImageUrl, CATEGORY_IMAGES } from './categoryImage';

describe('getCategoryImageUrl', () => {
  it('returns imageUrl when set', () => {
    const url = 'https://example.com/custom.png';
    expect(
      getCategoryImageUrl({ name: 'Math', imageUrl: url })
    ).toBe(url);
  });

  it('returns hardcoded URL for known category name', () => {
    expect(
      getCategoryImageUrl({ name: 'Programming', imageUrl: null })
    ).toBe(CATEGORY_IMAGES.Programming);
    expect(
      getCategoryImageUrl({ name: 'Mathematics' })
    ).toBe(CATEGORY_IMAGES.Mathematics);
  });

  it('returns Picsum URL for unknown category name', () => {
    const result = getCategoryImageUrl({ name: 'Unknown Category' });
    expect(result).toContain('picsum.photos');
    expect(result).toContain('seed');
    expect(result).toContain(encodeURIComponent('Unknown Category'));
  });

  it('uses empty string imageUrl as missing', () => {
    const result = getCategoryImageUrl({ name: 'Programming', imageUrl: '' });
    expect(result).toBe(CATEGORY_IMAGES.Programming);
  });
});
