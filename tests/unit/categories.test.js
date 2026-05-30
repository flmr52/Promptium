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

beforeEach(() => {
  localStorage.clear();
  loadDefaultCategories([
    { id: 'cat-writing', name: { fr: 'Rédaction', en: 'Writing' }, isDefault: true, order: 1 },
    { id: 'cat-dev', name: { fr: 'Développement', en: 'Development' }, isDefault: true, order: 2 }
  ]);
});

describe('categories', () => {
  describe('getAllCategories', () => {
    it('returns default categories when no user categories exist', () => {
      const cats = getAllCategories();
      expect(cats).toHaveLength(2);
      expect(cats[0].id).toBe('cat-writing');
    });

    it('returns sorted by order', () => {
      createCategory({ name: { fr: 'Perso', en: 'Personal' } });
      const cats = getAllCategories();
      expect(cats[cats.length - 1].name.fr).toBe('Perso');
    });
  });

  describe('getDefaultCategories', () => {
    it('returns only defaults', () => {
      createCategory({ name: { fr: 'Test', en: 'Test' } });
      expect(getDefaultCategories()).toHaveLength(2);
    });
  });

  describe('getUserCategories', () => {
    it('returns empty array initially', () => {
      expect(getUserCategories()).toHaveLength(0);
    });

    it('returns created categories', () => {
      createCategory({ name: { fr: 'Perso', en: 'Personal' } });
      expect(getUserCategories()).toHaveLength(1);
    });
  });

  describe('getCategoryById', () => {
    it('finds a default category', () => {
      const cat = getCategoryById('cat-writing');
      expect(cat.name.fr).toBe('Rédaction');
    });

    it('finds a user category', () => {
      const created = createCategory({ name: { fr: 'Test', en: 'Test' } });
      expect(getCategoryById(created.id).name.fr).toBe('Test');
    });

    it('returns undefined for unknown id', () => {
      expect(getCategoryById('nonexistent')).toBeUndefined();
    });
  });

  describe('createCategory', () => {
    it('creates with generated id and order', () => {
      const cat = createCategory({ name: { fr: 'Nouveau', en: 'New' } });
      expect(cat.id).toBeTruthy();
      expect(cat.isDefault).toBe(false);
      expect(cat.order).toBe(3);
      expect(cat.createdAt).toBeTruthy();
    });

    it('increments order for each new category', () => {
      createCategory({ name: { fr: 'A', en: 'A' } });
      const cat2 = createCategory({ name: { fr: 'B', en: 'B' } });
      expect(cat2.order).toBe(4);
    });
  });

  describe('updateCategory', () => {
    it('updates a user category', () => {
      const cat = createCategory({ name: { fr: 'Old', en: 'Old' } });
      const updated = updateCategory(cat.id, { name: { fr: 'New', en: 'New' } });
      expect(updated.name.fr).toBe('New');
    });

    it('returns null for unknown id', () => {
      expect(updateCategory('nonexistent', { name: 'x' })).toBeNull();
    });

    it('cannot update default category', () => {
      expect(updateCategory('cat-writing', { name: 'x' })).toBeNull();
    });
  });

  describe('deleteCategory', () => {
    it('deletes a user category', () => {
      const cat = createCategory({ name: { fr: 'Del', en: 'Del' } });
      expect(deleteCategory(cat.id)).toBe(true);
      expect(getUserCategories()).toHaveLength(0);
    });

    it('cannot delete a default category', () => {
      expect(deleteCategory('cat-writing')).toBe(false);
    });

    it('returns false for unknown id', () => {
      expect(deleteCategory('nonexistent')).toBe(false);
    });
  });
});
