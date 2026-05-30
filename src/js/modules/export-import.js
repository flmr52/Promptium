/**
 * ============================================================
 * MODULE : Export / Import
 * ============================================================
 * Gère l'export et l'import de la bibliothèque utilisateur en JSON.
 *
 * Export : génère un fichier JSON téléchargeable contenant tous les
 * prompts et catégories utilisateur.
 *
 * Import : fusionne les données importées avec les données existantes
 * de manière intelligente (évite les doublons, conserve les IDs,
 * garde la version la plus récente en cas de conflit).
 * ============================================================
 */

import { getAll, setAll } from './storage.js';

// ============================================================
// SECTION : Export
// ============================================================

/**
 * Exporte toutes les données utilisateur (prompts + catégories) en JSON.
 * @returns {string} JSON formaté prêt à être téléchargé
 */
export function exportToJSON() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    prompts: getAll('prompts'),
    categories: getAll('categories')
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Déclenche le téléchargement d'un fichier JSON dans le navigateur.
 * Crée un lien <a> temporaire avec un Blob et simule un clic.
 * @param {string} json - Contenu JSON à télécharger
 * @param {string} [filename] - Nom du fichier (par défaut avec la date du jour)
 */
export function downloadFile(json, filename) {
  const name = filename || `promptium-backup-${formatDateForFile()}.json`;
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();

  // Nettoyage
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// SECTION : Import
// ============================================================

/**
 * Importe des données JSON et les fusionne avec les données existantes.
 * Logique de fusion intelligente :
 * - Si un prompt a le même ID → garde celui avec updatedAt le plus récent
 * - Si un prompt est nouveau (ID inconnu) → l'ajouter
 * - Ne supprime jamais de données existantes
 *
 * @param {string} json - Chaîne JSON à importer
 * @returns {Object} Résultat de l'import { added, updated, skipped, errors }
 */
export function importFromJSON(json) {
  const result = { added: 0, updated: 0, skipped: 0, errors: [] };

  // Parser le JSON
  let data;
  try {
    data = JSON.parse(json);
  } catch {
    result.errors.push('Format JSON invalide');
    return result;
  }

  // Valider la structure minimale
  if (!data || typeof data !== 'object') {
    result.errors.push('Structure de données invalide');
    return result;
  }

  // Importer les prompts
  if (Array.isArray(data.prompts)) {
    mergePrompts(data.prompts, result);
  }

  // Importer les catégories
  if (Array.isArray(data.categories)) {
    mergeCategories(data.categories, result);
  }

  return result;
}

/**
 * Lit un fichier sélectionné par l'utilisateur et retourne son contenu texte.
 * @param {File} file - Objet File issu d'un <input type="file">
 * @returns {Promise<string>} Contenu texte du fichier
 */
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsText(file);
  });
}

// ============================================================
// SECTION : Logique de fusion
// ============================================================

/**
 * Fusionne les prompts importés avec les prompts existants.
 * Stratégie : même ID → comparer updatedAt, nouveau → ajouter.
 */
function mergePrompts(imported, result) {
  const existing = getAll('prompts');
  const existingMap = new Map(existing.map(p => [p.id, p]));

  for (const prompt of imported) {
    // Ignorer les prompts sans ID
    if (!prompt.id) {
      result.skipped++;
      continue;
    }

    // Ignorer les prompts par défaut (on ne les importe pas)
    if (prompt.isDefault) {
      result.skipped++;
      continue;
    }

    const existingPrompt = existingMap.get(prompt.id);

    if (!existingPrompt) {
      // Nouveau prompt → ajouter
      existing.push(prompt);
      existingMap.set(prompt.id, prompt);
      result.added++;
    } else {
      // Même ID → garder le plus récent
      const importedDate = prompt.updatedAt || prompt.createdAt || '';
      const existingDate = existingPrompt.updatedAt || existingPrompt.createdAt || '';

      if (importedDate > existingDate) {
        // La version importée est plus récente → mettre à jour
        const index = existing.findIndex(p => p.id === prompt.id);
        existing[index] = prompt;
        result.updated++;
      } else {
        result.skipped++;
      }
    }
  }

  setAll('prompts', existing);
}

/**
 * Fusionne les catégories importées avec les catégories existantes.
 * Ajoute les nouvelles catégories, ignore celles qui existent déjà.
 */
function mergeCategories(imported, result) {
  const existing = getAll('categories');
  const existingIds = new Set(existing.map(c => c.id));

  for (const category of imported) {
    if (!category.id || category.isDefault) {
      continue;
    }

    if (!existingIds.has(category.id)) {
      existing.push(category);
      existingIds.add(category.id);
      result.added++;
    }
  }

  setAll('categories', existing);
}

// ============================================================
// SECTION : Utilitaires
// ============================================================

/**
 * Formate la date du jour pour le nom de fichier (YYYY-MM-DD).
 */
function formatDateForFile() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
