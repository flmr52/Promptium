import { describe, it, expect, beforeEach } from 'vitest';
import { toggleFavorite, setFavorite, getFavorites, isFavorite } from '../../src/js/modules/favorites.js';
import { setAll } from '../../src/js/modules/storage.js';

beforeEach(() => {
  localStorage.clear();
  setAll('prompts', [
    { id: 'p1', title: 'First', favorite: false },
    { id: 'p2', title: 'Second', favorite: true },
    { id: 'p3', title: 'Third', favorite: false }
  ]);
});

describe('favorites', () => {
  describe('toggleFavorite', () => {
    it('toggles false to true', () => {
      expect(toggleFavorite('p1')).toBe(true);
    });

    it('toggles true to false', () => {
      expect(toggleFavorite('p2')).toBe(false);
    });

    it('returns null for unknown prompt', () => {
      expect(toggleFavorite('nonexistent')).toBeNull();
    });

    it('persists the change', () => {
      toggleFavorite('p1');
      const prompts = JSON.parse(localStorage.getItem('promptium_prompts'));
      expect(prompts.find(p => p.id === 'p1').favorite).toBe(true);
    });
  });

  describe('setFavorite', () => {
    it('sets a prompt as favorite', () => {
      expect(setFavorite('p1', true)).toBe(true);
      const prompts = JSON.parse(localStorage.getItem('promptium_prompts'));
      expect(prompts.find(p => p.id === 'p1').favorite).toBe(true);
    });

    it('removes favorite status', () => {
      expect(setFavorite('p2', false)).toBe(true);
      const prompts = JSON.parse(localStorage.getItem('promptium_prompts'));
      expect(prompts.find(p => p.id === 'p2').favorite).toBe(false);
    });

    it('returns false for unknown prompt', () => {
      expect(setFavorite('nonexistent', true)).toBe(false);
    });
  });

  describe('getFavorites', () => {
    it('returns only favorited prompts', () => {
      const prompts = [
        { id: 'p1', favorite: false },
        { id: 'p2', favorite: true },
        { id: 'p3', favorite: true }
      ];
      expect(getFavorites(prompts)).toHaveLength(2);
    });

    it('returns empty array when no favorites', () => {
      const prompts = [{ id: 'p1', favorite: false }];
      expect(getFavorites(prompts)).toHaveLength(0);
    });
  });

  describe('isFavorite', () => {
    it('returns true for favorited prompt', () => {
      const prompts = [{ id: 'p1', favorite: true }];
      expect(isFavorite(prompts, 'p1')).toBe(true);
    });

    it('returns false for non-favorited prompt', () => {
      const prompts = [{ id: 'p1', favorite: false }];
      expect(isFavorite(prompts, 'p1')).toBe(false);
    });

    it('returns false for unknown prompt', () => {
      expect(isFavorite([], 'unknown')).toBe(false);
    });
  });
});
