/**
 * ============================================================
 * MODULE : Tri
 * ============================================================
 * Fournit les stratégies de tri pour la liste de prompts.
 * Supporte le tri alphabétique (A-Z / Z-A) et par date
 * (plus récent / plus ancien). Les favoris sont toujours
 * affichés en premier, quel que soit le critère de tri.
 * ============================================================
 */

// ============================================================
// SECTION : Fonction principale de tri
// ============================================================

/**
 * Trie un tableau de prompts selon une stratégie et un ordre donnés.
 * Les favoris sont toujours placés en premier (dans leur propre ordre de tri).
 *
 * @param {Array} prompts - Liste de prompts à trier
 * @param {string} strategy - "alpha" (alphabétique) ou "date" (chronologique)
 * @param {string} order - "asc" (croissant) ou "desc" (décroissant)
 * @returns {Array} Nouvelle liste triée (ne modifie pas l'original)
 */
export function sortPrompts(prompts, strategy = 'date', order = 'desc') {
  // Copier le tableau pour ne pas modifier l'original
  const sorted = [...prompts];

  // Sélectionner la fonction de comparaison selon la stratégie
  const compareFn = strategy === 'alpha' ? compareAlpha : compareDate;

  // Trier les prompts
  sorted.sort((a, b) => {
    // Règle n°1 : les favoris passent toujours en premier
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;

    // Règle n°2 : appliquer le tri choisi
    const result = compareFn(a, b);
    return order === 'asc' ? result : -result;
  });

  return sorted;
}

// ============================================================
// SECTION : Fonctions de comparaison
// ============================================================

/**
 * Compare deux prompts par titre (alphabétique, insensible à la casse).
 * Gère les titres multilingues (objet {fr, en}) et les titres simples (string).
 */
function compareAlpha(a, b) {
  const titleA = extractTitle(a).toLowerCase();
  const titleB = extractTitle(b).toLowerCase();
  return titleA.localeCompare(titleB);
}

/**
 * Compare deux prompts par date de création.
 * Les prompts sans date sont placés à la fin.
 */
function compareDate(a, b) {
  const dateA = a.createdAt || '';
  const dateB = b.createdAt || '';
  return dateA.localeCompare(dateB);
}

// ============================================================
// SECTION : Utilitaires
// ============================================================

/**
 * Extrait le titre d'un prompt, qu'il soit un objet bilingue ou une string.
 * Pour les prompts par défaut : title = { fr: "...", en: "..." }
 * Pour les prompts utilisateur : title = "..."
 * @param {Object} prompt
 * @returns {string} Titre en texte brut
 */
function extractTitle(prompt) {
  if (!prompt.title) return '';
  if (typeof prompt.title === 'string') return prompt.title;
  // Objet bilingue : prendre le français par défaut
  return prompt.title.fr || prompt.title.en || '';
}
