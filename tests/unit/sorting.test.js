/**
 * ============================================================
 * TESTS UNITAIRES : Module Tri (Sorting)
 * ============================================================
 * Vérifie les stratégies de tri :
 * - Tri alphabétique A→Z et Z→A
 * - Tri par date (plus ancien / plus récent)
 * - Les favoris sont TOUJOURS affichés en premier
 * - Gestion des cas limites (tableau vide, titres bilingues)
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { sortPrompts } from '../../src/js/modules/sorting.js';

// Jeu de données de test : 4 prompts avec des favoris et titres variés
const prompts = [
  { id: '1', title: 'Banana', favorite: false, createdAt: '2026-03-01T00:00:00.000Z' },
  { id: '2', title: 'Apple', favorite: true, createdAt: '2026-01-01T00:00:00.000Z' },
  { id: '3', title: 'Cherry', favorite: false, createdAt: '2026-02-01T00:00:00.000Z' },
  { id: '4', title: { fr: 'Datte', en: 'Date' }, favorite: true, createdAt: '2026-04-01T00:00:00.000Z' }
];

describe('sorting', () => {
  // --- Tri alphabétique ---
  describe('sortPrompts - stratégie alpha', () => {
    it('trie A→Z avec les favoris en premier', () => {
      const result = sortPrompts(prompts, 'alpha', 'asc');
      // Favoris d'abord (Apple, Datte), puis le reste (Banana, Cherry)
      expect(result[0].id).toBe('2'); // Apple (favori)
      expect(result[1].id).toBe('4'); // Datte (favori)
      expect(result[2].id).toBe('1'); // Banana
      expect(result[3].id).toBe('3'); // Cherry
    });

    it('trie Z→A avec les favoris en premier', () => {
      const result = sortPrompts(prompts, 'alpha', 'desc');
      expect(result[0].id).toBe('4'); // Datte (favori, Z→A)
      expect(result[1].id).toBe('2'); // Apple (favori)
      expect(result[2].id).toBe('3'); // Cherry
      expect(result[3].id).toBe('1'); // Banana
    });
  });

  // --- Tri par date ---
  describe('sortPrompts - stratégie date', () => {
    it('trie du plus ancien au plus récent avec favoris en premier', () => {
      const result = sortPrompts(prompts, 'date', 'asc');
      // Favoris : Apple (jan) puis Datte (apr)
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('4');
      // Non-favoris : Cherry (feb) puis Banana (mar)
      expect(result[2].id).toBe('3');
      expect(result[3].id).toBe('1');
    });

    it('trie du plus récent au plus ancien avec favoris en premier', () => {
      const result = sortPrompts(prompts, 'date', 'desc');
      // Favoris : Datte (apr) puis Apple (jan)
      expect(result[0].id).toBe('4');
      expect(result[1].id).toBe('2');
      // Non-favoris : Banana (mar) puis Cherry (feb)
      expect(result[2].id).toBe('1');
      expect(result[3].id).toBe('3');
    });
  });

  // --- Cas limites ---
  describe('cas limites', () => {
    it('gère un tableau vide', () => {
      expect(sortPrompts([], 'alpha', 'asc')).toEqual([]);
    });

    it('ne modifie pas le tableau original (immutabilité)', () => {
      const original = [...prompts];
      sortPrompts(prompts, 'alpha', 'asc');
      expect(prompts).toEqual(original);
    });

    it('gère les prompts sans date de création', () => {
      const noDate = [
        { id: '1', title: 'A', favorite: false },
        { id: '2', title: 'B', favorite: false, createdAt: '2026-01-01T00:00:00.000Z' }
      ];
      const result = sortPrompts(noDate, 'date', 'asc');
      expect(result).toHaveLength(2);
    });

    it('utilise date/desc par défaut', () => {
      const result = sortPrompts(prompts);
      // Les favoris doivent être en premier
      expect(result[0].favorite).toBe(true);
    });
  });
});
