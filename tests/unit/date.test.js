import { describe, it, expect } from 'vitest';
import { nowISO, formatDate } from '../../src/js/utils/date.js';

describe('date utils', () => {
  describe('nowISO', () => {
    it('returns a valid ISO string', () => {
      const iso = nowISO();
      expect(new Date(iso).toISOString()).toBe(iso);
    });
  });

  describe('formatDate', () => {
    it('formats date in french', () => {
      const result = formatDate('2026-05-30T10:00:00.000Z', 'fr');
      expect(result).toContain('30');
      expect(result).toContain('2026');
    });

    it('formats date in english', () => {
      const result = formatDate('2026-05-30T10:00:00.000Z', 'en');
      expect(result).toContain('30');
      expect(result).toContain('2026');
    });
  });
});
