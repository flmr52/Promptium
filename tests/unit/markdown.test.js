/**
 * ============================================================
 * TESTS UNITAIRES : Utilitaire Markdown
 * ============================================================
 * Vérifie la génération correcte du document Markdown C.R.A.F.T. :
 * - Tous les champs remplis → document complet
 * - Champs vides → omis dans le résultat
 * - Gestion des espaces et du multilangue
 * ============================================================
 */

import { describe, it, expect } from 'vitest';
import { generateMarkdown } from '../../src/js/utils/markdown.js';

describe('generateMarkdown', () => {
  it('génère le Markdown complet avec tous les champs', () => {
    const content = {
      context: 'Mon contexte',
      role: 'Mon rôle',
      action: 'Mon action',
      format: 'Mon format',
      target: 'Ma cible'
    };
    const result = generateMarkdown(content, 'fr');
    expect(result).toContain('# C.R.A.F.T. Prompt');
    expect(result).toContain('## Contexte\n\nMon contexte');
    expect(result).toContain('## Rôle\n\nMon rôle');
    expect(result).toContain('## Action\n\nMon action');
    expect(result).toContain('## Format\n\nMon format');
    expect(result).toContain('## Cible\n\nMa cible');
  });

  it('utilise les labels anglais quand lang=en', () => {
    const content = { context: 'My context', role: '', action: 'My action', format: '', target: '' };
    const result = generateMarkdown(content, 'en');
    expect(result).toContain('## Context\n\nMy context');
    expect(result).toContain('## Action\n\nMy action');
    expect(result).not.toContain('## Role');
  });

  it('ignore les champs vides', () => {
    const content = { context: 'Only this', role: '', action: '', format: '', target: '' };
    const result = generateMarkdown(content, 'fr');
    expect(result).toContain('## Contexte\n\nOnly this');
    expect(result).not.toContain('## Rôle');
  });

  it('retourne une chaîne vide si tous les champs sont vides', () => {
    const content = { context: '', role: '', action: '', format: '', target: '' };
    expect(generateMarkdown(content, 'fr')).toBe('');
  });

  it('supprime les espaces en début et fin des champs', () => {
    const content = { context: '  test  ', role: '', action: '', format: '', target: '' };
    const result = generateMarkdown(content, 'fr');
    expect(result).toContain('## Contexte\n\ntest');
  });

  it('ignore les champs contenant uniquement des espaces', () => {
    const content = { context: '   ', role: 'valid', action: '', format: '', target: '' };
    const result = generateMarkdown(content, 'fr');
    expect(result).not.toContain('## Contexte');
    expect(result).toContain('## Rôle\n\nvalid');
  });
});
