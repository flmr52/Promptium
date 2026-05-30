/**
 * ============================================================
 * TESTS UNITAIRES : Module Export / Import
 * ============================================================
 * Vérifie :
 * - L'export génère un JSON valide avec prompts et catégories
 * - L'import fusionne correctement (ajout, mise à jour, skip)
 * - La gestion des erreurs (JSON invalide, structure incorrecte)
 * - La protection contre l'import de prompts par défaut
 * ============================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { exportToJSON, importFromJSON } from '../../src/js/modules/export-import.js';
import { setAll, getAll } from '../../src/js/modules/storage.js';

beforeEach(() => {
  localStorage.clear();
});

describe('export-import', () => {
  // --- Tests d'export ---
  describe('exportToJSON', () => {
    it('retourne un JSON valide', () => {
      setAll('prompts', [{ id: 'p1', title: 'Test' }]);
      const json = exportToJSON();
      const data = JSON.parse(json);
      expect(data.version).toBe(1);
      expect(data.exportedAt).toBeTruthy();
      expect(data.prompts).toHaveLength(1);
    });

    it('inclut les catégories utilisateur', () => {
      setAll('categories', [{ id: 'cat-1', name: 'Perso' }]);
      const data = JSON.parse(exportToJSON());
      expect(data.categories).toHaveLength(1);
    });

    it('retourne un export vide quand aucune donnée', () => {
      const data = JSON.parse(exportToJSON());
      expect(data.prompts).toEqual([]);
      expect(data.categories).toEqual([]);
    });
  });

  // --- Tests d'import ---
  describe('importFromJSON', () => {
    it('ajoute les nouveaux prompts', () => {
      const json = JSON.stringify({
        prompts: [
          { id: 'new-1', title: 'Imported', isDefault: false, updatedAt: '2026-01-01T00:00:00.000Z' }
        ]
      });
      const result = importFromJSON(json);
      expect(result.added).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(getAll('prompts')).toHaveLength(1);
    });

    it('met à jour un prompt existant si la version importée est plus récente', () => {
      setAll('prompts', [
        { id: 'p1', title: 'Old', updatedAt: '2026-01-01T00:00:00.000Z' }
      ]);
      const json = JSON.stringify({
        prompts: [
          { id: 'p1', title: 'New', updatedAt: '2026-06-01T00:00:00.000Z' }
        ]
      });
      const result = importFromJSON(json);
      expect(result.updated).toBe(1);
      expect(getAll('prompts')[0].title).toBe('New');
    });

    it('ignore un prompt importé si la version locale est plus récente', () => {
      setAll('prompts', [
        { id: 'p1', title: 'Local', updatedAt: '2026-06-01T00:00:00.000Z' }
      ]);
      const json = JSON.stringify({
        prompts: [
          { id: 'p1', title: 'Older', updatedAt: '2026-01-01T00:00:00.000Z' }
        ]
      });
      const result = importFromJSON(json);
      expect(result.skipped).toBe(1);
      expect(getAll('prompts')[0].title).toBe('Local');
    });

    it('ignore les prompts par défaut', () => {
      const json = JSON.stringify({
        prompts: [
          { id: 'default-001', title: 'Default', isDefault: true }
        ]
      });
      const result = importFromJSON(json);
      expect(result.skipped).toBe(1);
      expect(getAll('prompts')).toHaveLength(0);
    });

    it('ajoute les nouvelles catégories', () => {
      const json = JSON.stringify({
        prompts: [],
        categories: [
          { id: 'cat-new', name: 'Imported Cat', isDefault: false }
        ]
      });
      const result = importFromJSON(json);
      expect(result.added).toBe(1);
      expect(getAll('categories')).toHaveLength(1);
    });

    it('ignore les catégories déjà existantes', () => {
      setAll('categories', [{ id: 'cat-1', name: 'Existing' }]);
      const json = JSON.stringify({
        categories: [{ id: 'cat-1', name: 'Duplicate' }]
      });
      const result = importFromJSON(json);
      expect(getAll('categories')).toHaveLength(1);
      expect(getAll('categories')[0].name).toBe('Existing');
    });

    it('retourne une erreur pour un JSON invalide', () => {
      const result = importFromJSON('not json {{{');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('JSON invalide');
    });

    it('retourne une erreur pour une structure invalide', () => {
      const result = importFromJSON('"just a string"');
      expect(result.errors).toHaveLength(1);
    });

    it('gère un import sans prompts ni catégories', () => {
      const result = importFromJSON(JSON.stringify({ version: 1 }));
      expect(result.added).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('ignore les prompts sans ID', () => {
      const json = JSON.stringify({
        prompts: [{ title: 'No ID' }]
      });
      const result = importFromJSON(json);
      expect(result.skipped).toBe(1);
    });
  });
});
