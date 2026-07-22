import { describe, it, expect } from 'vitest';
import { ALL_CATEGORIES, API_BASE_URL } from './constants';

describe('Constants', () => {
  it('should export an array of categories', () => {
    expect(Array.isArray(ALL_CATEGORIES)).toBe(true);
    expect(ALL_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('should have a valid API_BASE_URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });
});
