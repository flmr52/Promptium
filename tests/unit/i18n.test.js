/**
 * ============================================================
 * TESTS UNITAIRES : Module i18n (Internationalisation)
 * ============================================================
 * Vérifie :
 * - Le changement de langue (setLang/getLang)
 * - La traduction par clé (t / tFrom)
 * - Le système d'abonnement aux changements (onLangChange)
 * - La liste des langues disponibles
 * ============================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { setLang, getLang, t, tFrom, onLangChange, getAvailableLangs } from '../../src/js/modules/i18n.js';

// Remettre le français par défaut avant chaque test
beforeEach(() => {
  setLang('fr');
});

describe('i18n', () => {
  // --- Tests de changement de langue ---
  describe('getLang / setLang', () => {
    it('la langue par défaut est le français', () => {
      expect(getLang()).toBe('fr');
    });

    it('peut basculer en anglais', () => {
      setLang('en');
      expect(getLang()).toBe('en');
    });

    it('ignore les langues non supportées', () => {
      setLang('xx');
      expect(getLang()).toBe('fr');
    });
  });

  // --- Tests de traduction ---
  describe('t', () => {
    it('retourne la traduction française par défaut', () => {
      expect(t('btn_generate')).toBe('Générer');
    });

    it('retourne la traduction anglaise quand la langue est en', () => {
      setLang('en');
      expect(t('btn_generate')).toBe('Generate');
    });

    it('retourne la clé elle-même si la traduction n\'existe pas', () => {
      expect(t('nonexistent_key')).toBe('nonexistent_key');
    });
  });

  // --- Tests de traduction dans une langue spécifique ---
  describe('tFrom', () => {
    it('traduit dans la langue demandée', () => {
      expect(tFrom('en', 'btn_copy')).toBe('Copy');
    });

    it('fallback vers le français pour une langue inconnue', () => {
      expect(tFrom('xx', 'btn_copy')).toBe('Copier');
    });
  });

  // --- Tests du système d'abonnement ---
  describe('onLangChange', () => {
    it('appelle le listener quand la langue change', () => {
      let called = '';
      onLangChange(lang => { called = lang; });
      setLang('en');
      expect(called).toBe('en');
    });
  });

  // --- Tests des langues disponibles ---
  describe('getAvailableLangs', () => {
    it('retourne fr et en', () => {
      expect(getAvailableLangs()).toEqual(['fr', 'en']);
    });
  });
});
