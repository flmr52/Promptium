/**
 * ============================================================
 * TESTS UNITAIRES : Module Bibliothèque (Library)
 * ============================================================
 * Vérifie le module central de gestion des prompts :
 * - Chargement des prompts par défaut
 * - Fusion des collections (défaut + utilisateur)
 * - CRUD complet (création, modification, suppression)
 * - Duplication de prompts (résolution bilingue)
 * - Protection des prompts par défaut (lecture seule)
 * ============================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadDefaults,
  fetchDefaults,
  getAllPrompts,
  getDefaultPrompts,
  getUserPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  duplicatePrompt
} from '../../src/js/modules/library.js';

// Données de test simulant le contenu de default-prompts.json
const mockDefaults = {
  version: 1,
  categories: [
    { id: 'cat-writing', name: { fr: 'Rédaction', en: 'Writing' }, isDefault: true, order: 1 }
  ],
  prompts: [
    {
      id: 'default-001',
      title: { fr: 'Article SEO', en: 'SEO Article' },
      content: {
        context: { fr: 'Blog pro', en: 'Pro blog' },
        role: { fr: 'Rédacteur', en: 'Writer' },
        action: { fr: 'Rédige', en: 'Write' },
        format: { fr: 'Markdown', en: 'Markdown' },
        target: { fr: 'Lecteurs', en: 'Readers' }
      },
      categoryId: 'cat-writing',
      tags: ['seo'],
      isDefault: true,
      favorite: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z'
    }
  ]
};

// Charger les données par défaut et vider le localStorage avant chaque test
beforeEach(() => {
  localStorage.clear();
  loadDefaults(mockDefaults);
});

describe('library', () => {
  // --- Chargement des données par défaut ---
  describe('loadDefaults', () => {
    it('charge les prompts par défaut', () => {
      expect(getDefaultPrompts()).toHaveLength(1);
    });

    it('gère un appel avec null sans crash', () => {
      loadDefaults(null);
      // Les prompts précédemment chargés sont conservés
      expect(getDefaultPrompts()).toHaveLength(1);
    });
  });

  // --- Lecture de tous les prompts ---
  describe('getAllPrompts', () => {
    it('retourne les prompts par défaut quand aucun prompt utilisateur', () => {
      expect(getAllPrompts()).toHaveLength(1);
    });

    it('fusionne les prompts par défaut et utilisateur', () => {
      createPrompt({ title: 'User prompt', content: { context: 'test' } });
      expect(getAllPrompts()).toHaveLength(2);
    });
  });

  // --- Prompts utilisateur ---
  describe('getUserPrompts', () => {
    it('retourne un tableau vide initialement', () => {
      expect(getUserPrompts()).toHaveLength(0);
    });
  });

  // --- Recherche par ID ---
  describe('getPromptById', () => {
    it('trouve un prompt par défaut', () => {
      const p = getPromptById('default-001');
      expect(p.title.fr).toBe('Article SEO');
    });

    it('trouve un prompt utilisateur', () => {
      const created = createPrompt({ title: 'Mon prompt' });
      expect(getPromptById(created.id).title).toBe('Mon prompt');
    });

    it('retourne undefined pour un ID inconnu', () => {
      expect(getPromptById('unknown')).toBeUndefined();
    });
  });

  // --- Création de prompts ---
  describe('createPrompt', () => {
    it('crée avec un ID, des timestamps et des valeurs par défaut', () => {
      const p = createPrompt({ title: 'Nouveau', content: { context: 'ctx' } });
      expect(p.id).toBeTruthy();
      expect(p.createdAt).toBeTruthy();
      expect(p.updatedAt).toBeTruthy();
      expect(p.isDefault).toBe(false);
      expect(p.favorite).toBe(false);
    });

    it('utilise des valeurs vides par défaut pour les champs manquants', () => {
      const p = createPrompt({});
      expect(p.title).toBe('');
      expect(p.tags).toEqual([]);
      expect(p.categoryId).toBeNull();
    });

    it('stocke la langue du prompt (par défaut fr)', () => {
      const p = createPrompt({ title: 'French' });
      expect(p.lang).toBe('fr');
    });

    it('stocke la langue spécifiée', () => {
      const p = createPrompt({ title: 'English', lang: 'en' });
      expect(p.lang).toBe('en');
    });

    it('persiste dans localStorage', () => {
      createPrompt({ title: 'Persisted' });
      expect(getUserPrompts()).toHaveLength(1);
    });
  });

  // --- Modification de prompts ---
  describe('updatePrompt', () => {
    it('met à jour le titre et le timestamp updatedAt', () => {
      const p = createPrompt({ title: 'Old' });
      const updated = updatePrompt(p.id, { title: 'New' });
      expect(updated.title).toBe('New');
      expect(updated.updatedAt).toBeTruthy();
      expect(updated.id).toBe(p.id);
    });

    it('retourne null pour un ID inconnu', () => {
      expect(updatePrompt('nonexistent', { title: 'x' })).toBeNull();
    });

    it('ne peut pas modifier un prompt par défaut', () => {
      expect(updatePrompt('default-001', { title: 'x' })).toBeNull();
    });
  });

  // --- Suppression de prompts ---
  describe('deletePrompt', () => {
    it('supprime un prompt utilisateur', () => {
      const p = createPrompt({ title: 'Temp' });
      expect(deletePrompt(p.id)).toBe(true);
      expect(getUserPrompts()).toHaveLength(0);
    });

    it('ne peut pas supprimer un prompt par défaut', () => {
      expect(deletePrompt('default-001')).toBe(false);
    });

    it('retourne false pour un ID inconnu', () => {
      expect(deletePrompt('nonexistent')).toBe(false);
    });
  });

  // --- Duplication de prompts ---
  describe('duplicatePrompt', () => {
    it('duplique un prompt par défaut en prompt utilisateur', () => {
      const dup = duplicatePrompt('default-001');
      expect(dup.isDefault).toBe(false);
      expect(dup.title).toContain('Article SEO');
      expect(dup.title).toContain('(copie)');
      // Le contenu bilingue est résolu en français
      expect(dup.content.context).toBe('Blog pro');
    });

    it('duplique un prompt utilisateur', () => {
      const p = createPrompt({ title: 'Original', content: { context: 'hello' } });
      const dup = duplicatePrompt(p.id);
      expect(dup.title).toBe('Original (copie)');
      expect(dup.id).not.toBe(p.id);
    });

    it('retourne null pour un ID inconnu', () => {
      expect(duplicatePrompt('nonexistent')).toBeNull();
    });

    it('résout le contenu bilingue en français', () => {
      const dup = duplicatePrompt('default-001');
      expect(dup.content.role).toBe('Rédacteur');
    });
  });
});
