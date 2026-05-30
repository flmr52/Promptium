/**
 * ============================================================
 * TESTS UNITAIRES : Utilitaire ID (UUID)
 * ============================================================
 * Vérifie que la génération d'identifiants uniques :
 * - Produit une string au format UUID v4
 * - Ne génère jamais deux IDs identiques
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { generateId } from '../../src/js/utils/id.js';

describe('generateId', () => {
  it('retourne une chaîne de caractères', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('respecte le format UUID v4 (8-4-4-4-12 hex)', () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('génère des IDs uniques (100 tentatives)', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
