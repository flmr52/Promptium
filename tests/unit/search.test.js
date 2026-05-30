/**
 * ============================================================
 * TESTS UNITAIRES : Module Recherche (Search)
 * ============================================================
 * Vérifie la recherche instantanée :
 * - Recherche dans le titre (string et objet bilingue)
 * - Recherche dans les champs de contenu C.R.A.F.T.
 * - Recherche dans les tags
 * - Insensibilité à la casse et aux accents
 * - Gestion des requêtes vides et des données incomplètes
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { filterPrompts } from '../../src/js/modules/search.js';

// Jeu de données de test avec différents types de titres et contenus
const prompts = [
  {
    id: '1',
    title: 'Article SEO',
    content: { context: 'Blog professionnel', role: 'Rédacteur web', action: 'Rédige un article', format: 'Markdown', target: 'Lecteurs' },
    tags: ['seo', 'blog']
  },
  {
    id: '2',
    title: { fr: 'Email de relance', en: 'Follow-up Email' },
    content: { context: 'Relancer un client', role: 'Commercial', action: 'Rédige un email', format: 'Email court', target: 'Décideur' },
    tags: ['email', 'commercial']
  },
  {
    id: '3',
    title: 'Débug JavaScript',
    content: { context: 'Application React', role: 'Développeur senior', action: 'Trouve le bug', format: 'Liste', target: 'Développeur' },
    tags: ['debug', 'javascript', 'react']
  }
];

describe('search', () => {
  describe('filterPrompts', () => {
    // --- Requêtes vides : retourne tout ---
    it('retourne tous les prompts quand la requête est vide', () => {
      expect(filterPrompts(prompts, '')).toHaveLength(3);
    });

    it('retourne tous les prompts quand la requête est un espace', () => {
      expect(filterPrompts(prompts, '   ')).toHaveLength(3);
    });

    it('retourne tous les prompts quand la requête est null', () => {
      expect(filterPrompts(prompts, null)).toHaveLength(3);
    });

    // --- Recherche dans le titre ---
    it('trouve par titre (string simple)', () => {
      expect(filterPrompts(prompts, 'SEO')).toHaveLength(1);
      expect(filterPrompts(prompts, 'seo')[0].id).toBe('1');
    });

    it('trouve par titre (objet bilingue FR et EN)', () => {
      expect(filterPrompts(prompts, 'relance')).toHaveLength(1);
      expect(filterPrompts(prompts, 'follow-up')).toHaveLength(1);
    });

    // --- Recherche dans le contenu ---
    it('trouve dans les champs de contenu C.R.A.F.T.', () => {
      expect(filterPrompts(prompts, 'React')).toHaveLength(1);
      expect(filterPrompts(prompts, 'react')[0].id).toBe('3');
    });

    // --- Recherche dans les tags ---
    it('trouve par tag', () => {
      expect(filterPrompts(prompts, 'javascript')).toHaveLength(1);
      expect(filterPrompts(prompts, 'blog')).toHaveLength(1);
    });

    // --- Insensibilité à la casse ---
    it('est insensible à la casse (majuscules/minuscules)', () => {
      expect(filterPrompts(prompts, 'ARTICLE')).toHaveLength(1);
      expect(filterPrompts(prompts, 'article')).toHaveLength(1);
    });

    // --- Insensibilité aux accents ---
    it('est insensible aux accents (é → e)', () => {
      expect(filterPrompts(prompts, 'redige')).toHaveLength(2);
      expect(filterPrompts(prompts, 'Rédige')).toHaveLength(2);
    });

    // --- Aucun résultat ---
    it('retourne un tableau vide quand rien ne correspond', () => {
      expect(filterPrompts(prompts, 'zzzzz')).toHaveLength(0);
    });

    // --- Données incomplètes ---
    it('gère les prompts sans tags', () => {
      const noTags = [{ id: '1', title: 'Test', content: { context: 'Hi' } }];
      expect(filterPrompts(noTags, 'Test')).toHaveLength(1);
    });

    it('gère les prompts sans contenu', () => {
      const noContent = [{ id: '1', title: 'Test', tags: ['abc'] }];
      expect(filterPrompts(noContent, 'abc')).toHaveLength(1);
    });
  });
});
