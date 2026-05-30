import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAll, setAll,
  getPreferences, setPreferences,
  getSchemaVersion, setSchemaVersion,
  migrate, clear
} from '../../src/js/modules/storage.js';

beforeEach(() => {
  localStorage.clear();
});

describe('storage', () => {
  describe('getAll / setAll', () => {
    it('returns empty array when key does not exist', () => {
      expect(getAll('prompts')).toEqual([]);
    });

    it('stores and retrieves an array', () => {
      const data = [{ id: '1', title: 'Test' }];
      setAll('prompts', data);
      expect(getAll('prompts')).toEqual(data);
    });

    it('handles corrupted data gracefully', () => {
      localStorage.setItem('promptium_prompts', 'not json');
      expect(getAll('prompts')).toEqual([]);
    });

    it('returns true on successful set', () => {
      expect(setAll('prompts', [])).toBe(true);
    });
  });

  describe('preferences', () => {
    it('returns default preferences when none stored', () => {
      const prefs = getPreferences();
      expect(prefs.lang).toBe('fr');
      expect(prefs.sortBy).toBe('date');
      expect(prefs.sortOrder).toBe('desc');
      expect(prefs.lastCategoryFilter).toBeNull();
    });

    it('stores and retrieves preferences', () => {
      const prefs = { lang: 'en', sortBy: 'alpha', sortOrder: 'asc', lastCategoryFilter: 'cat-1' };
      setPreferences(prefs);
      expect(getPreferences()).toEqual(prefs);
    });

    it('handles corrupted preferences gracefully', () => {
      localStorage.setItem('promptium_preferences', '{broken');
      const prefs = getPreferences();
      expect(prefs.lang).toBe('fr');
    });
  });

  describe('schema version', () => {
    it('returns 0 when no version stored', () => {
      expect(getSchemaVersion()).toBe(0);
    });

    it('stores and retrieves version', () => {
      setSchemaVersion(3);
      expect(getSchemaVersion()).toBe(3);
    });
  });

  describe('migrate', () => {
    it('sets schema version on fresh install', () => {
      migrate();
      expect(getSchemaVersion()).toBe(1);
    });

    it('does not downgrade version', () => {
      setSchemaVersion(5);
      migrate();
      expect(getSchemaVersion()).toBe(5);
    });
  });

  describe('clear', () => {
    it('removes all promptium keys', () => {
      setAll('prompts', [{ id: '1' }]);
      setPreferences({ lang: 'en' });
      localStorage.setItem('other_app', 'keep');
      clear();
      expect(getAll('prompts')).toEqual([]);
      expect(localStorage.getItem('other_app')).toBe('keep');
    });
  });
});
