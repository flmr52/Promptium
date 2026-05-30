/**
 * ============================================================
 * MODULE : Storage
 * ============================================================
 * Gère la persistance des données via localStorage.
 * Toutes les clés sont préfixées par "promptium_" pour éviter
 * les conflits avec d'autres applications sur le même domaine.
 *
 * Ce module fournit une abstraction au-dessus de localStorage
 * avec gestion d'erreurs intégrée (quota dépassé, JSON invalide).
 * ============================================================
 */

// Préfixe ajouté à toutes les clés localStorage
const PREFIX = 'promptium_';

// Version actuelle du schéma de données (pour migrations futures)
const SCHEMA_VERSION = 1;

// ============================================================
// SECTION : Lecture / Écriture de collections
// ============================================================

/**
 * Récupère un tableau stocké sous une clé donnée.
 * Retourne un tableau vide si la clé n'existe pas ou si le JSON est corrompu.
 * @param {string} key - Nom de la collection (ex: "prompts", "categories")
 * @returns {Array} Le tableau stocké ou un tableau vide
 */
export function getAll(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Enregistre un tableau sous une clé donnée.
 * @param {string} key - Nom de la collection
 * @param {Array} data - Les données à persister
 * @returns {boolean} true si succès, false si erreur (ex: quota dépassé)
 */
export function setAll(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// SECTION : Préférences utilisateur
// ============================================================

/**
 * Récupère les préférences de l'utilisateur (langue, tri, filtre).
 * Retourne les valeurs par défaut si rien n'est stocké.
 * @returns {Object} Objet contenant lang, sortBy, sortOrder, lastCategoryFilter
 */
export function getPreferences() {
  try {
    const raw = localStorage.getItem(PREFIX + 'preferences');
    return raw ? JSON.parse(raw) : getDefaultPreferences();
  } catch {
    return getDefaultPreferences();
  }
}

/**
 * Sauvegarde les préférences utilisateur.
 * @param {Object} prefs - Objet de préférences à persister
 * @returns {boolean} true si succès
 */
export function setPreferences(prefs) {
  try {
    localStorage.setItem(PREFIX + 'preferences', JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// SECTION : Gestion de version du schéma
// ============================================================

/**
 * Retourne la version du schéma actuellement stockée.
 * Retourne 0 si c'est une installation fraîche (aucune version enregistrée).
 */
export function getSchemaVersion() {
  const raw = localStorage.getItem(PREFIX + 'version');
  return raw ? parseInt(raw, 10) : 0;
}

/**
 * Enregistre la version du schéma.
 * @param {number} version - Numéro de version à stocker
 */
export function setSchemaVersion(version) {
  localStorage.setItem(PREFIX + 'version', String(version));
}

/**
 * Exécute les migrations nécessaires.
 * Compare la version stockée à SCHEMA_VERSION et met à jour si nécessaire.
 * Ne rétrograde jamais la version (protection contre les downgrades).
 */
export function migrate() {
  const current = getSchemaVersion();
  if (current < SCHEMA_VERSION) {
    // Ici on pourra ajouter des migrations futures (v1 → v2, etc.)
    setSchemaVersion(SCHEMA_VERSION);
  }
}

// ============================================================
// SECTION : Nettoyage
// ============================================================

/**
 * Supprime toutes les données Promptium du localStorage.
 * Ne touche pas aux données des autres applications.
 * Utile pour un "reset factory" de l'application.
 */
export function clear() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(k => localStorage.removeItem(k));
}

// ============================================================
// SECTION : Fonctions internes
// ============================================================

/**
 * Retourne les préférences par défaut pour un nouvel utilisateur.
 * Appelé quand aucune préférence n'est encore stockée.
 */
function getDefaultPreferences() {
  return {
    lang: 'fr',                  // Langue par défaut : français
    sortBy: 'date',              // Tri par date par défaut
    sortOrder: 'desc',           // Du plus récent au plus ancien
    lastCategoryFilter: null     // Aucun filtre de catégorie actif
  };
}
