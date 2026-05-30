/**
 * ============================================================
 * UTILITAIRE : Génération Markdown
 * ============================================================
 * Transforme les 5 champs C.R.A.F.T. en un document Markdown
 * structuré, prêt à être copié ou envoyé par email.
 * Les labels des sections s'adaptent à la langue active.
 * ============================================================
 */

// Labels des sections Markdown selon la langue
const FIELD_LABELS = {
  fr: { context: 'Contexte', role: 'Rôle', action: 'Action', format: 'Format', target: 'Cible' },
  en: { context: 'Context', role: 'Role', action: 'Action', format: 'Format', target: 'Target' }
};

// Ordre d'apparition des champs dans le Markdown généré (correspond à C.R.A.F.T.)
const FIELD_ORDER = ['context', 'role', 'action', 'format', 'target'];

/**
 * Génère un document Markdown à partir des champs C.R.A.F.T.
 * Seuls les champs non vides sont inclus dans le résultat.
 *
 * Exemple de sortie :
 * ```
 * # C.R.A.F.T. Prompt
 *
 * ## Contexte
 *
 * Je lance une boutique en ligne...
 *
 * ## Rôle
 *
 * Tu es un expert marketing...
 * ```
 *
 * @param {Object} content - Objet avec les 5 champs {context, role, action, format, target}
 * @param {string} lang - Code langue pour les labels ("fr" ou "en")
 * @returns {string} Document Markdown complet, ou chaîne vide si tous les champs sont vides
 */
export function generateMarkdown(content, lang = 'fr') {
  const labels = FIELD_LABELS[lang] || FIELD_LABELS.fr;
  const sections = [];

  // Parcourir les champs dans l'ordre C.R.A.F.T. et ignorer les vides
  for (const field of FIELD_ORDER) {
    const value = content[field];
    if (value && value.trim()) {
      sections.push(`## ${labels[field]}\n\n${value.trim()}`);
    }
  }

  // Si aucun champ n'est rempli, retourner une chaîne vide
  if (sections.length === 0) return '';

  // Assembler le document avec un titre principal
  return `# C.R.A.F.T. Prompt\n\n${sections.join('\n\n')}`;
}
