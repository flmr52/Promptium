/**
 * ============================================================
 * TESTS UNITAIRES : Module Favoris
 * ============================================================
 * Vérifie :
 * - Le basculement d'un prompt en favori (toggleFavorite)
 * - La définition explicite du statut favori (setFavorite)
 * - Le filtrage des favoris (getFavorites)
 * - La vérification du statut favori (isFavorite)
 * ============================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { toggleFavorite, setFavorite, getFavorites, isFavorite } from '../../src/js/modules/favorites.js';
import { setAll } from '../../src/js/modules/storage.js';

// Préparer 3 prompts de test avant chaque test (p2 est favori)
beforeEach(() => {
  localStorage.clear();
  setAll('prompts', [
    { id: 'p1', title: 'First', favorite: false },
    { id: 'p2', title: 'Second', favorite: true },
    { id: 'p3', title: 'Third', favorite: false }
  ]);
});

describe('favorites', () => {
  // --- Basculement du statut favori ---
  describe('toggleFavorite', () => {
    it('passe de false à true', () => {
      expect(toggleFavorite('p1')).toBe(true);
    });

    it('passe de true à false', () => {
      expect(toggleFavorite('p2')).toBe(false);
    });

    it('retourne null pour un prompt inconnu', () => {
      expect(toggleFavorite('nonexistent')).toBeNull();
    });

    it('persiste le changement dans localStorage', () => {
      toggleFavorite('p1');
      const prompts = JSON.parse(localStorage.getItem('promptium_prompts'));
      expect(prompts.find(p => p.id === 'p1').favorite).toBe(true);
    });
  });

  // --- Définition explicite du favori ---
  describe('setFavorite', () => {
    it('marque un prompt comme favori', () => {
      expect(setFavorite('p1', true)).toBe(true);
      const prompts = JSON.parse(localStorage.getItem('promptium_prompts'));
      expect(prompts.find(p => p.id === 'p1').favorite).toBe(true);
    });

    it('retire le statut favori', () => {
      expect(setFavorite('p2', false)).toBe(true);
      const prompts = JSON.parse(localStorage.getItem('promptium_prompts'));
      expect(prompts.find(p => p.id === 'p2').favorite).toBe(false);
    });

    it('retourne false pour un prompt inconnu', () => {
      expect(setFavorite('nonexistent', true)).toBe(false);
    });
  });

  // --- Filtrage des favoris ---
  describe('getFavorites', () => {
    it('retourne uniquement les prompts marqués favoris', () => {
      const prompts = [
        { id: 'p1', favorite: false },
        { id: 'p2', favorite: true },
        { id: 'p3', favorite: true }
      ];
      expect(getFavorites(prompts)).toHaveLength(2);
    });

    it('retourne un tableau vide si aucun favori', () => {
      const prompts = [{ id: 'p1', favorite: false }];
      expect(getFavorites(prompts)).toHaveLength(0);
    });
  });

  // --- Vérification du statut ---
  describe('isFavorite', () => {
    it('retourne true pour un prompt favori', () => {
      const prompts = [{ id: 'p1', favorite: true }];
      expect(isFavorite(prompts, 'p1')).toBe(true);
    });

    it('retourne false pour un prompt non favori', () => {
      const prompts = [{ id: 'p1', favorite: false }];
      expect(isFavorite(prompts, 'p1')).toBe(false);
    });

    it('retourne false pour un prompt inconnu', () => {
      expect(isFavorite([], 'unknown')).toBe(false);
    });
  });
});
