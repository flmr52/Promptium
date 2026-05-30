/**
 * ============================================================
 * TESTS UNITAIRES : Module Catégories
 * ============================================================
 * Vérifie :
 * - Le chargement des catégories par défaut
 * - La lecture (toutes, par défaut, utilisateur, par ID)
 * - La création, modification et suppression de catégories utilisateur
 * - La protection des catégories par défaut (non modifiables/supprimables)
 * ============================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadDefaultCategories,
  getAllCategories,
  getDefaultCategories,
  getUserCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../src/js/modules/categories.js';

// Charger des catégories par défaut et vider le localStorage avant chaque test
beforeEach(() => {
  localStorage.clear();
  loadDefaultCategories([
    { id: 'cat-writing', name: { fr: 'Rédaction', en: 'Writing' }, isDefault: true, order: 1 },
    { id: 'cat-dev', name: { fr: 'Développement', en: 'Development' }, isDefault: true, order: 2 }
  ]);
});

describe('categories', () => {
  // --- Lecture de toutes les catégories ---
  describe('getAllCategories', () => {
    it('retourne les catégories par défaut quand aucune catégorie utilisateur', () => {
      const cats = getAllCategories();
      expect(cats).toHaveLength(2);
      expect(cats[0].id).toBe('cat-writing');
    });

    it('trie les catégories par ordre croissant', () => {
      createCategory({ name: { fr: 'Perso', en: 'Personal' } });
      const cats = getAllCategories();
      // La catégorie utilisateur doit être en dernier (order=3)
      expect(cats[cats.length - 1].name.fr).toBe('Perso');
    });
  });

  // --- Lecture des catégories par défaut uniquement ---
  describe('getDefaultCategories', () => {
    it('ne retourne que les catégories par défaut', () => {
      createCategory({ name: { fr: 'Test', en: 'Test' } });
      expect(getDefaultCategories()).toHaveLength(2);
    });
  });

  // --- Lecture des catégories utilisateur ---
  describe('getUserCategories', () => {
    it('retourne un tableau vide initialement', () => {
      expect(getUserCategories()).toHaveLength(0);
    });

    it('retourne les catégories créées par l\'utilisateur', () => {
      createCategory({ name: { fr: 'Perso', en: 'Personal' } });
      expect(getUserCategories()).toHaveLength(1);
    });
  });

  // --- Recherche par ID ---
  describe('getCategoryById', () => {
    it('trouve une catégorie par défaut', () => {
      const cat = getCategoryById('cat-writing');
      expect(cat.name.fr).toBe('Rédaction');
    });

    it('trouve une catégorie utilisateur', () => {
      const created = createCategory({ name: { fr: 'Test', en: 'Test' } });
      expect(getCategoryById(created.id).name.fr).toBe('Test');
    });

    it('retourne undefined pour un ID inconnu', () => {
      expect(getCategoryById('nonexistent')).toBeUndefined();
    });
  });

  // --- Création ---
  describe('createCategory', () => {
    it('crée avec un ID généré et un ordre calculé', () => {
      const cat = createCategory({ name: { fr: 'Nouveau', en: 'New' } });
      expect(cat.id).toBeTruthy();
      expect(cat.isDefault).toBe(false);
      expect(cat.order).toBe(3); // Après les 2 catégories par défaut
      expect(cat.createdAt).toBeTruthy();
    });

    it('incrémente l\'ordre à chaque nouvelle catégorie', () => {
      createCategory({ name: { fr: 'A', en: 'A' } });
      const cat2 = createCategory({ name: { fr: 'B', en: 'B' } });
      expect(cat2.order).toBe(4);
    });
  });

  // --- Modification ---
  describe('updateCategory', () => {
    it('met à jour une catégorie utilisateur', () => {
      const cat = createCategory({ name: { fr: 'Old', en: 'Old' } });
      const updated = updateCategory(cat.id, { name: { fr: 'New', en: 'New' } });
      expect(updated.name.fr).toBe('New');
    });

    it('retourne null pour un ID inconnu', () => {
      expect(updateCategory('nonexistent', { name: 'x' })).toBeNull();
    });

    it('ne peut pas modifier une catégorie par défaut', () => {
      expect(updateCategory('cat-writing', { name: 'x' })).toBeNull();
    });
  });

  // --- Suppression ---
  describe('deleteCategory', () => {
    it('supprime une catégorie utilisateur', () => {
      const cat = createCategory({ name: { fr: 'Del', en: 'Del' } });
      expect(deleteCategory(cat.id)).toBe(true);
      expect(getUserCategories()).toHaveLength(0);
    });

    it('ne peut pas supprimer une catégorie par défaut', () => {
      expect(deleteCategory('cat-writing')).toBe(false);
    });

    it('retourne false pour un ID inconnu', () => {
      expect(deleteCategory('nonexistent')).toBe(false);
    });
  });
});
