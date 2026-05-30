import { describe, it, expect } from 'vitest';
import { sortPrompts } from '../../src/js/modules/sorting.js';

const prompts = [
  { id: '1', title: 'Banana', favorite: false, createdAt: '2026-03-01T00:00:00.000Z' },
  { id: '2', title: 'Apple', favorite: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: '3', title: 'Cherry', favorite: false, createdAt: '2026-02-01T00:00:00.000Z' },
  { id: '4', title: { fr: 'Datte', en: 'Date' }, favorite: true, createdAt: '2026-04-01T00:00:00.000Z' }
];

describe('sorting', () => {
  describe('sortPrompts - alpha strategy', () => {
    it('sorts A-Z with favorites first', () => {
      const result = sortPrompts(prompts, 'alpha', 'asc');
      // Favoris en premier (Apple, Datte), puis le reste (Banana, Cherry)
      expect(result[0].id).toBe('2'); // Apple (favori)
      expect(result[1].id).toBe('4'); // Datte (favori)
      expect(result[2].id).toBe('1'); // Banana
      expect(result[3].id).toBe('3'); // Cherry
    });

    it('sorts Z-A with favorites first', () => {
      const result = sortPrompts(prompts, 'alpha', 'desc');
      expect(result[0].id).toBe('4'); // Datte (favori, Z-A)
      expect(result[1].id).toBe('2'); // Apple (favori)
      expect(result[2].id).toBe('3'); // Cherry
      expect(result[3].id).toBe('1'); // Banana
    });
  });

  describe('sortPrompts - date strategy', () => {
    it('sorts oldest first with favorites first', () => {
      const result = sortPrompts(prompts, 'date', 'asc');
      // Favoris : Apple (jan) puis Datte (apr)
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('4');
      // Non-favoris : Cherry (feb) puis Banana (mar)
      expect(result[2].id).toBe('3');
      expect(result[3].id).toBe('1');
    });

    it('sorts newest first with favorites first', () => {
      const result = sortPrompts(prompts, 'date', 'desc');
      // Favoris : Datte (apr) puis Apple (jan)
      expect(result[0].id).toBe('4');
      expect(result[1].id).toBe('2');
      // Non-favoris : Banana (mar) puis Cherry (feb)
      expect(result[2].id).toBe('1');
      expect(result[3].id).toBe('3');
    });
  });

  describe('edge cases', () => {
    it('handles empty array', () => {
      expect(sortPrompts([], 'alpha', 'asc')).toEqual([]);
    });

    it('does not modify original array', () => {
      const original = [...prompts];
      sortPrompts(prompts, 'alpha', 'asc');
      expect(prompts).toEqual(original);
    });

    it('handles prompts without createdAt', () => {
      const noDate = [
        { id: '1', title: 'A', favorite: false },
        { id: '2', title: 'B', favorite: false, createdAt: '2026-01-01T00:00:00.000Z' }
      ];
      const result = sortPrompts(noDate, 'date', 'asc');
      expect(result).toHaveLength(2);
    });

    it('defaults to date desc', () => {
      const result = sortPrompts(prompts);
      // Favoris first, then by date desc
      expect(result[0].favorite).toBe(true);
    });
  });
});
