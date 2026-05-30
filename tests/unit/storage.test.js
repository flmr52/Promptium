/**
 * ============================================================
 * TESTS UNITAIRES : Module Storage
 * ============================================================
 * Vérifie le bon fonctionnement de l'abstraction localStorage :
 * - Lecture/écriture de collections (getAll/setAll)
 * - Gestion des préférences utilisateur
 * - Versionnage du schéma et migrations
 * - Nettoyage sélectif des données Promptium
 * ============================================================
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAll, setAll,
  getPreferences, setPreferences,
  getSchemaVersion, setSchemaVersion,
  getHiddenDefaults, setHiddenDefaults, clearHiddenDefaults,
  migrate, clear
} from '../../src/js/modules/storage.js';

// Nettoyer le localStorage avant chaque test pour isoler les résultats
beforeEach(() => {
  localStorage.clear();
});

describe('storage', () => {
  // --- Tests de lecture/écriture de collections ---
  describe('getAll / setAll', () => {
    it('retourne un tableau vide quand la clé n\'existe pas', () => {
      expect(getAll('prompts')).toEqual([]);
    });

    it('stocke et récupère un tableau correctement', () => {
      const data = [{ id: '1', title: 'Test' }];
      setAll('prompts', data);
      expect(getAll('prompts')).toEqual(data);
    });

    it('gère un JSON corrompu sans crash', () => {
      localStorage.setItem('promptium_prompts', 'not json');
      expect(getAll('prompts')).toEqual([]);
    });

    it('retourne true en cas de succès', () => {
      expect(setAll('prompts', [])).toBe(true);
    });
  });

  // --- Tests des préférences utilisateur ---
  describe('preferences', () => {
    it('retourne les préférences par défaut si rien n\'est stocké', () => {
      const prefs = getPreferences();
      expect(prefs.lang).toBe('fr');
      expect(prefs.sortBy).toBe('date');
      expect(prefs.sortOrder).toBe('desc');
      expect(prefs.lastCategoryFilter).toBeNull();
    });

    it('stocke et récupère les préférences', () => {
      const prefs = { lang: 'en', sortBy: 'alpha', sortOrder: 'asc', lastCategoryFilter: 'cat-1' };
      setPreferences(prefs);
      expect(getPreferences()).toEqual(prefs);
    });

    it('gère des préférences corrompues sans crash', () => {
      localStorage.setItem('promptium_preferences', '{broken');
      const prefs = getPreferences();
      expect(prefs.lang).toBe('fr');
    });
  });

  // --- Tests du versionnage de schéma ---
  describe('schema version', () => {
    it('retourne 0 quand aucune version n\'est stockée', () => {
      expect(getSchemaVersion()).toBe(0);
    });

    it('stocke et récupère la version', () => {
      setSchemaVersion(3);
      expect(getSchemaVersion()).toBe(3);
    });
  });

  // --- Tests de la migration ---
  describe('migrate', () => {
    it('met à jour la version sur une installation fraîche', () => {
      migrate();
      expect(getSchemaVersion()).toBe(1);
    });

    it('ne rétrograde jamais la version', () => {
      setSchemaVersion(5);
      migrate();
      expect(getSchemaVersion()).toBe(5);
    });
  });

  // --- Tests des prompts par défaut masqués ---
  describe('hidden defaults', () => {
    it('retourne un tableau vide initialement', () => {
      expect(getHiddenDefaults()).toEqual([]);
    });

    it('persiste un tableau d\'IDs masqués', () => {
      setHiddenDefaults(['default-001', 'default-002']);
      expect(getHiddenDefaults()).toEqual(['default-001', 'default-002']);
    });

    it('clearHiddenDefaults remet à un tableau vide', () => {
      setHiddenDefaults(['default-001']);
      clearHiddenDefaults();
      expect(getHiddenDefaults()).toEqual([]);
    });

    it('clear() supprime aussi les hidden defaults', () => {
      setHiddenDefaults(['default-001']);
      clear();
      expect(getHiddenDefaults()).toEqual([]);
    });
  });

  // --- Tests du nettoyage ---
  describe('clear', () => {
    it('supprime les données Promptium sans toucher aux autres apps', () => {
      setAll('prompts', [{ id: '1' }]);
      setPreferences({ lang: 'en' });
      localStorage.setItem('other_app', 'keep');
      clear();
      expect(getAll('prompts')).toEqual([]);
      expect(localStorage.getItem('other_app')).toBe('keep');
    });
  });
});
