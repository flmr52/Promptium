/**
 * ============================================================
 * UTILITAIRE : Génération d'identifiants uniques
 * ============================================================
 * Produit des UUID v4 pour identifier les prompts et catégories.
 * Utilise crypto.randomUUID() si disponible (navigateurs modernes),
 * sinon un fallback basé sur Math.random() pour compatibilité.
 * ============================================================
 */

/**
 * Génère un identifiant unique au format UUID v4.
 * Exemple de résultat : "3b241101-e2bb-4d5a-a3c7-9b2f8a1d4e5f"
 * @returns {string} UUID v4
 */
export function generateId() {
  // Méthode native (plus sécurisée, disponible dans les navigateurs récents)
  return crypto.randomUUID
    ? crypto.randomUUID()
    // Fallback pour les environnements sans crypto.randomUUID
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        // Le "4" dans le 3e groupe et "8/9/a/b" dans le 4e sont imposés par la spec UUID v4
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
}
