/**
 * ============================================================
 * MODULE : Favoris
 * ============================================================
 * Gère l'épinglage des prompts en favoris.
 * Les prompts favoris apparaissent toujours en premier dans la liste,
 * quel que soit le critère de tri actif.
 * ============================================================
 */

import { getAll, setAll } from './storage.js';

// Clé localStorage pour les prompts utilisateur
const STORAGE_KEY = 'prompts';

// ============================================================
// SECTION : Gestion des favoris
// ============================================================

/**
 * Bascule l'état favori d'un prompt utilisateur.
 * @param {string} promptId - Identifiant du prompt
 * @returns {boolean|null} Nouvel état du favori, ou null si prompt non trouvé
 */
export function toggleFavorite(promptId) {
  const prompts = getAll(STORAGE_KEY);
  const index = prompts.findIndex(p => p.id === promptId);

  if (index === -1) return null;

  prompts[index].favorite = !prompts[index].favorite;
  setAll(STORAGE_KEY, prompts);
  return prompts[index].favorite;
}

/**
 * Définit explicitement l'état favori d'un prompt.
 * @param {string} promptId - Identifiant du prompt
 * @param {boolean} isFavorite - true pour épingler, false pour désépingler
 * @returns {boolean} true si l'opération a réussi
 */
export function setFavorite(promptId, isFavorite) {
  const prompts = getAll(STORAGE_KEY);
  const index = prompts.findIndex(p => p.id === promptId);

  if (index === -1) return false;

  prompts[index].favorite = isFavorite;
  setAll(STORAGE_KEY, prompts);
  return true;
}

/**
 * Retourne uniquement les prompts marqués comme favoris.
 * @param {Array} prompts - Liste de prompts à filtrer
 * @returns {Array} Les prompts favoris
 */
export function getFavorites(prompts) {
  return prompts.filter(p => p.favorite);
}

/**
 * Vérifie si un prompt est en favori.
 * @param {Array} prompts - Liste de prompts
 * @param {string} promptId - Identifiant à vérifier
 * @returns {boolean}
 */
export function isFavorite(prompts, promptId) {
  const prompt = prompts.find(p => p.id === promptId);
  return prompt ? !!prompt.favorite : false;
}
