/**
 * ============================================================
 * MODULE : Favoris
 * ============================================================
 * Gère l'épinglage des prompts en favoris.
 * Les prompts favoris apparaissent toujours en premier dans la liste,
 * quel que soit le critère de tri actif.
 *
 * Les favoris des prompts utilisateur sont stockés dans leur objet
 * (champ `favorite`). Les favoris des prompts par défaut sont stockés
 * dans une liste d'IDs séparée (`promptium_default_favorites`).
 * ============================================================
 */

import { getAll, setAll } from './storage.js';

// Clé localStorage pour les prompts utilisateur
const STORAGE_KEY = 'prompts';

// Clé localStorage pour les favoris des prompts par défaut
const DEFAULT_FAVS_KEY = 'default_favorites';

// ============================================================
// SECTION : Gestion des favoris
// ============================================================

/**
 * Bascule l'état favori d'un prompt (utilisateur ou par défaut).
 * @param {string} promptId - Identifiant du prompt
 * @returns {boolean|null} Nouvel état du favori, ou null si prompt non trouvé
 */
export function toggleFavorite(promptId) {
  // Essayer d'abord dans les prompts utilisateur
  const prompts = getAll(STORAGE_KEY);
  const index = prompts.findIndex(p => p.id === promptId);

  if (index !== -1) {
    prompts[index].favorite = !prompts[index].favorite;
    setAll(STORAGE_KEY, prompts);
    return prompts[index].favorite;
  }

  // Sinon c'est un prompt par défaut → gérer via la liste séparée
  const defaultFavs = getAll(DEFAULT_FAVS_KEY);
  const favIndex = defaultFavs.indexOf(promptId);

  if (favIndex === -1) {
    defaultFavs.push(promptId);
    setAll(DEFAULT_FAVS_KEY, defaultFavs);
    return true;
  } else {
    defaultFavs.splice(favIndex, 1);
    setAll(DEFAULT_FAVS_KEY, defaultFavs);
    return false;
  }
}

/**
 * Définit explicitement l'état favori d'un prompt.
 * @param {string} promptId - Identifiant du prompt
 * @param {boolean} isFavorite - true pour épingler, false pour désépingler
 * @returns {boolean} true si l'opération a réussi
 */
export function setFavorite(promptId, isFavorite) {
  // Essayer d'abord dans les prompts utilisateur
  const prompts = getAll(STORAGE_KEY);
  const index = prompts.findIndex(p => p.id === promptId);

  if (index !== -1) {
    prompts[index].favorite = isFavorite;
    setAll(STORAGE_KEY, prompts);
    return true;
  }

  // Prompt par défaut
  const defaultFavs = getAll(DEFAULT_FAVS_KEY);
  const favIndex = defaultFavs.indexOf(promptId);

  if (isFavorite && favIndex === -1) {
    defaultFavs.push(promptId);
    setAll(DEFAULT_FAVS_KEY, defaultFavs);
  } else if (!isFavorite && favIndex !== -1) {
    defaultFavs.splice(favIndex, 1);
    setAll(DEFAULT_FAVS_KEY, defaultFavs);
  }
  return true;
}

/**
 * Vérifie si un prompt par défaut est favori.
 * @param {string} promptId
 * @returns {boolean}
 */
export function isDefaultFavorite(promptId) {
  const defaultFavs = getAll(DEFAULT_FAVS_KEY);
  return defaultFavs.includes(promptId);
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
