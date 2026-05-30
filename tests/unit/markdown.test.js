import { describe, it, expect } from 'vitest';
import { generateMarkdown } from '../../src/js/utils/markdown.js';

describe('generateMarkdown', () => {
  it('generates full markdown with all fields', () => {
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

  it('generates english labels when lang is en', () => {
    const content = { context: 'My context', role: '', action: 'My action', format: '', target: '' };
    const result = generateMarkdown(content, 'en');
    expect(result).toContain('## Context\n\nMy context');
    expect(result).toContain('## Action\n\nMy action');
    expect(result).not.toContain('## Role');
  });

  it('skips empty fields', () => {
    const content = { context: 'Only this', role: '', action: '', format: '', target: '' };
    const result = generateMarkdown(content, 'fr');
    expect(result).toContain('## Contexte\n\nOnly this');
    expect(result).not.toContain('## Rôle');
  });

  it('returns empty string when all fields empty', () => {
    const content = { context: '', role: '', action: '', format: '', target: '' };
    expect(generateMarkdown(content, 'fr')).toBe('');
  });

  it('trims whitespace from fields', () => {
    const content = { context: '  test  ', role: '', action: '', format: '', target: '' };
    const result = generateMarkdown(content, 'fr');
    expect(result).toContain('## Contexte\n\ntest');
  });

  it('skips whitespace-only fields', () => {
    const content = { context: '   ', role: 'valid', action: '', format: '', target: '' };
    const result = generateMarkdown(content, 'fr');
    expect(result).not.toContain('## Contexte');
    expect(result).toContain('## Rôle\n\nvalid');
  });
});
