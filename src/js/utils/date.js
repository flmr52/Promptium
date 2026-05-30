/**
 * ============================================================
 * UTILITAIRE : Gestion des dates
 * ============================================================
 * Fournit des fonctions pour créer et formater des dates ISO.
 * Utilisé pour les timestamps createdAt/updatedAt des prompts
 * et pour l'affichage des dates dans l'interface.
 * ============================================================
 */

/**
 * Retourne la date/heure actuelle au format ISO 8601.
 * Exemple : "2026-05-30T14:30:00.000Z"
 * Utilisé lors de la création ou modification d'un prompt.
 * @returns {string} Date ISO complète
 */
export function nowISO() {
  return new Date().toISOString();
}

/**
 * Formate une date ISO en texte lisible selon la langue.
 * Exemple FR : "30 mai 2026"
 * Exemple EN : "May 30, 2026"
 * @param {string} isoString - Date au format ISO à formater
 * @param {string} lang - Code langue ("fr" ou "en")
 * @returns {string} Date formatée pour l'affichage
 */
export function formatDate(isoString, lang = 'fr') {
  const date = new Date(isoString);
  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
