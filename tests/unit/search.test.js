import { describe, it, expect } from 'vitest';
import { filterPrompts } from '../../src/js/modules/search.js';

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
    it('returns all prompts when query is empty', () => {
      expect(filterPrompts(prompts, '')).toHaveLength(3);
    });

    it('returns all prompts when query is whitespace', () => {
      expect(filterPrompts(prompts, '   ')).toHaveLength(3);
    });

    it('returns all prompts when query is null', () => {
      expect(filterPrompts(prompts, null)).toHaveLength(3);
    });

    it('searches in title (string)', () => {
      expect(filterPrompts(prompts, 'SEO')).toHaveLength(1);
      expect(filterPrompts(prompts, 'seo')[0].id).toBe('1');
    });

    it('searches in title (bilingual object)', () => {
      expect(filterPrompts(prompts, 'relance')).toHaveLength(1);
      expect(filterPrompts(prompts, 'follow-up')).toHaveLength(1);
    });

    it('searches in content fields', () => {
      expect(filterPrompts(prompts, 'React')).toHaveLength(1);
      expect(filterPrompts(prompts, 'react')[0].id).toBe('3');
    });

    it('searches in tags', () => {
      expect(filterPrompts(prompts, 'javascript')).toHaveLength(1);
      expect(filterPrompts(prompts, 'blog')).toHaveLength(1);
    });

    it('is case insensitive', () => {
      expect(filterPrompts(prompts, 'ARTICLE')).toHaveLength(1);
      expect(filterPrompts(prompts, 'article')).toHaveLength(1);
    });

    it('is accent insensitive', () => {
      expect(filterPrompts(prompts, 'redige')).toHaveLength(2);
      expect(filterPrompts(prompts, 'Rédige')).toHaveLength(2);
    });

    it('returns empty when no match', () => {
      expect(filterPrompts(prompts, 'zzzzz')).toHaveLength(0);
    });

    it('handles prompts without tags', () => {
      const noTags = [{ id: '1', title: 'Test', content: { context: 'Hi' } }];
      expect(filterPrompts(noTags, 'Test')).toHaveLength(1);
    });

    it('handles prompts without content', () => {
      const noContent = [{ id: '1', title: 'Test', tags: ['abc'] }];
      expect(filterPrompts(noContent, 'abc')).toHaveLength(1);
    });
  });
});
