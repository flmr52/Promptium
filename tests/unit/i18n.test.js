import { describe, it, expect, beforeEach } from 'vitest';
import { setLang, getLang, t, tFrom, onLangChange, getAvailableLangs } from '../../src/js/modules/i18n.js';

beforeEach(() => {
  setLang('fr');
});

describe('i18n', () => {
  describe('getLang / setLang', () => {
    it('defaults to fr', () => {
      expect(getLang()).toBe('fr');
    });

    it('switches to en', () => {
      setLang('en');
      expect(getLang()).toBe('en');
    });

    it('ignores invalid language', () => {
      setLang('xx');
      expect(getLang()).toBe('fr');
    });
  });

  describe('t', () => {
    it('returns french translation by default', () => {
      expect(t('btn_generate')).toBe('Générer');
    });

    it('returns english translation when lang is en', () => {
      setLang('en');
      expect(t('btn_generate')).toBe('Generate');
    });

    it('returns key when translation missing', () => {
      expect(t('nonexistent_key')).toBe('nonexistent_key');
    });
  });

  describe('tFrom', () => {
    it('returns translation for specified language', () => {
      expect(tFrom('en', 'btn_copy')).toBe('Copy');
    });

    it('falls back to french for unknown language', () => {
      expect(tFrom('xx', 'btn_copy')).toBe('Copier');
    });
  });

  describe('onLangChange', () => {
    it('calls listener when language changes', () => {
      let called = '';
      onLangChange(lang => { called = lang; });
      setLang('en');
      expect(called).toBe('en');
    });
  });

  describe('getAvailableLangs', () => {
    it('returns fr and en', () => {
      expect(getAvailableLangs()).toEqual(['fr', 'en']);
    });
  });
});
