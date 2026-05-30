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

beforeEach(() => {
  localStorage.clear();
  loadDefaults(mockDefaults);
});

describe('library', () => {
  describe('loadDefaults', () => {
    it('loads default prompts', () => {
      expect(getDefaultPrompts()).toHaveLength(1);
    });

    it('handles null gracefully', () => {
      loadDefaults(null);
      expect(getDefaultPrompts()).toHaveLength(1); // retains previous
    });
  });

  describe('getAllPrompts', () => {
    it('returns defaults when no user prompts', () => {
      expect(getAllPrompts()).toHaveLength(1);
    });

    it('merges defaults and user prompts', () => {
      createPrompt({ title: 'User prompt', content: { context: 'test' } });
      expect(getAllPrompts()).toHaveLength(2);
    });
  });

  describe('getUserPrompts', () => {
    it('returns empty initially', () => {
      expect(getUserPrompts()).toHaveLength(0);
    });
  });

  describe('getPromptById', () => {
    it('finds a default prompt', () => {
      const p = getPromptById('default-001');
      expect(p.title.fr).toBe('Article SEO');
    });

    it('finds a user prompt', () => {
      const created = createPrompt({ title: 'Mon prompt' });
      expect(getPromptById(created.id).title).toBe('Mon prompt');
    });

    it('returns undefined for unknown id', () => {
      expect(getPromptById('unknown')).toBeUndefined();
    });
  });

  describe('createPrompt', () => {
    it('creates with id and timestamps', () => {
      const p = createPrompt({ title: 'Nouveau', content: { context: 'ctx' } });
      expect(p.id).toBeTruthy();
      expect(p.createdAt).toBeTruthy();
      expect(p.updatedAt).toBeTruthy();
      expect(p.isDefault).toBe(false);
      expect(p.favorite).toBe(false);
    });

    it('defaults empty fields', () => {
      const p = createPrompt({});
      expect(p.title).toBe('');
      expect(p.tags).toEqual([]);
      expect(p.categoryId).toBeNull();
    });

    it('persists in localStorage', () => {
      createPrompt({ title: 'Persisted' });
      expect(getUserPrompts()).toHaveLength(1);
    });
  });

  describe('updatePrompt', () => {
    it('updates title and updatedAt', () => {
      const p = createPrompt({ title: 'Old' });
      const updated = updatePrompt(p.id, { title: 'New' });
      expect(updated.title).toBe('New');
      expect(updated.updatedAt).toBeTruthy();
      expect(updated.id).toBe(p.id);
    });

    it('returns null for unknown id', () => {
      expect(updatePrompt('nonexistent', { title: 'x' })).toBeNull();
    });

    it('cannot update default prompt', () => {
      expect(updatePrompt('default-001', { title: 'x' })).toBeNull();
    });
  });

  describe('deletePrompt', () => {
    it('deletes a user prompt', () => {
      const p = createPrompt({ title: 'Temp' });
      expect(deletePrompt(p.id)).toBe(true);
      expect(getUserPrompts()).toHaveLength(0);
    });

    it('returns false for default prompt', () => {
      expect(deletePrompt('default-001')).toBe(false);
    });

    it('returns false for unknown id', () => {
      expect(deletePrompt('nonexistent')).toBe(false);
    });
  });

  describe('duplicatePrompt', () => {
    it('duplicates a default prompt as user prompt', () => {
      const dup = duplicatePrompt('default-001');
      expect(dup.isDefault).toBe(false);
      expect(dup.title).toContain('Article SEO');
      expect(dup.title).toContain('(copie)');
      expect(dup.content.context).toBe('Blog pro');
    });

    it('duplicates a user prompt', () => {
      const p = createPrompt({ title: 'Original', content: { context: 'hello' } });
      const dup = duplicatePrompt(p.id);
      expect(dup.title).toBe('Original (copie)');
      expect(dup.id).not.toBe(p.id);
    });

    it('returns null for unknown id', () => {
      expect(duplicatePrompt('nonexistent')).toBeNull();
    });

    it('resolves bilingual content to french', () => {
      const dup = duplicatePrompt('default-001');
      expect(dup.content.role).toBe('Rédacteur');
    });
  });
});
