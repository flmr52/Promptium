/**
 * ============================================================
 * MODULE : Recherche
 * ============================================================
 * Recherche instantanée parmi les prompts sur :
 * - le titre
 * - le contenu des 5 champs C.R.A.F.T.
 * - les tags
 *
 * La recherche est insensible à la casse et aux accents.
 * C'est un module pur (sans état) : il reçoit des données
 * et retourne un résultat filtré.
 * ============================================================
 */

// ============================================================
// SECTION : Fonction principale
// ============================================================

/**
 * Filtre les prompts selon une requête de recherche.
 * Cherche dans le titre, le contenu (5 champs) et les tags.
 * Retourne tous les prompts si la requête est vide.
 *
 * @param {Array} prompts - Liste complète de prompts à filtrer
 * @param {string} query - Texte saisi par l'utilisateur
 * @returns {Array} Prompts correspondant à la recherche
 */
export function filterPrompts(prompts, query) {
  if (!query || !query.trim()) return prompts;

  const normalizedQuery = normalize(query);

  return prompts.filter(prompt => {
    // Chercher dans le titre
    if (matchTitle(prompt.title, normalizedQuery)) return true;

    // Chercher dans les 5 champs de contenu
    if (matchContent(prompt.content, normalizedQuery)) return true;

    // Chercher dans les tags
    if (matchTags(prompt.tags, normalizedQuery)) return true;

    return false;
  });
}

// ============================================================
// SECTION : Fonctions de correspondance
// ============================================================

/**
 * Vérifie si le titre correspond à la requête.
 * Gère les titres bilingues ({fr, en}) et simples (string).
 */
function matchTitle(title, query) {
  if (!title) return false;
  if (typeof title === 'string') {
    return normalize(title).includes(query);
  }
  // Titre bilingue : chercher dans les deux langues
  return (title.fr && normalize(title.fr).includes(query)) ||
         (title.en && normalize(title.en).includes(query));
}

/**
 * Vérifie si le contenu d'un prompt correspond à la requête.
 * Parcourt les 5 champs C.R.A.F.T. (context, role, action, format, target).
 */
function matchContent(content, query) {
  if (!content) return false;
  const fields = ['context', 'role', 'action', 'format', 'target'];
  return fields.some(field => {
    const value = content[field];
    if (!value) return false;
    if (typeof value === 'string') return normalize(value).includes(query);
    // Champ bilingue
    return (value.fr && normalize(value.fr).includes(query)) ||
           (value.en && normalize(value.en).includes(query));
  });
}

/**
 * Vérifie si un des tags correspond à la requête.
 */
function matchTags(tags, query) {
  if (!tags || !Array.isArray(tags)) return false;
  return tags.some(tag => normalize(tag).includes(query));
}

// ============================================================
// SECTION : Normalisation
// ============================================================

/**
 * Normalise un texte pour la recherche :
 * - Convertit en minuscules
 * - Supprime les accents (décomposition Unicode + suppression des diacritiques)
 * Permet de trouver "résumé" en tapant "resume".
 * @param {string} str - Texte à normaliser
 * @returns {string} Texte normalisé
 */
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}
