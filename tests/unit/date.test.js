/**
 * ============================================================
 * TESTS UNITAIRES : Utilitaire Date
 * ============================================================
 * Vérifie :
 * - nowISO() retourne une date ISO valide
 * - formatDate() affiche correctement en FR et EN
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { nowISO, formatDate } from '../../src/js/utils/date.js';

describe('date utils', () => {
  describe('nowISO', () => {
    it('retourne une chaîne ISO 8601 valide', () => {
      const iso = nowISO();
      // Vérifier que c'est une date parsable qui se re-sérialise identiquement
      expect(new Date(iso).toISOString()).toBe(iso);
    });
  });

  describe('formatDate', () => {
    it('formate en français (ex: 30 mai 2026)', () => {
      const result = formatDate('2026-05-30T10:00:00.000Z', 'fr');
      expect(result).toContain('30');
      expect(result).toContain('2026');
    });

    it('formate en anglais (ex: May 30, 2026)', () => {
      const result = formatDate('2026-05-30T10:00:00.000Z', 'en');
      expect(result).toContain('30');
      expect(result).toContain('2026');
    });
  });
});
