/**
 * ============================================================
 * MODULE : Internationalisation (i18n)
 * ============================================================
 * Gère les traductions français/anglais de toute l'application.
 * Fonctionne avec un système de clés (ex: "btn_generate") qui
 * renvoient le texte dans la langue active.
 *
 * Utilise un pattern "observateur" : les modules peuvent s'abonner
 * aux changements de langue via onLangChange() pour se mettre à jour.
 * ============================================================
 */

// ============================================================
// SECTION : Dictionnaire de traductions
// ============================================================

const translations = {
  fr: {
    // --- Titres et descriptions de page ---
    page_title: "Nouveau Prompt",
    page_desc: "Structurez votre requête avec la méthode C.R.A.F.T.",

    // --- Labels des champs C.R.A.F.T. ---
    label_context: "Contexte",
    label_role: "Rôle",
    label_action: "Action",
    label_format: "Format",
    label_target: "Target",

    // --- Indices (hints) affichés à droite des labels ---
    hint_context: "Le pourquoi de la démarche",
    hint_role: "L'expertise que l'IA doit incarner",
    hint_action: "La tâche précise à accomplir",
    hint_format: "La forme attendue du résultat",
    hint_target: "À qui s'adresse le résultat",

    // --- Placeholders des textareas ---
    placeholder_context: "Ex : Je lance une boutique en ligne de produits artisanaux… | Notre association organise un événement caritatif en juin… | Je crée une formation en ligne sur la photographie…",
    placeholder_role: "Ex : Tu es un expert en marketing digital avec 10 ans d'expérience… | Un enseignant patient qui vulgarise les sujets complexes… | Un développeur full-stack avec 15 ans d'expérience…",
    placeholder_action: "Ex : Rédige un plan marketing en 5 étapes pour le lancement… | Rédige un email de relance client professionnel… | Crée un programme de formation sur 4 semaines…",
    placeholder_format: "Ex : Liste à puces, tableau, paragraphe de 200 mots… | Un plan de présentation en 10 slides… | Un tableau comparatif avec avantages et inconvénients…",
    placeholder_target: "Ex : Destiné à des étudiants débutants… | Un public non-technique qui découvre l'IA… | Des clients inquiets qui ont besoin d'être rassurés…",

    // --- Boutons d'action ---
    btn_generate: "Générer",
    btn_copy: "Copier",
    btn_email: "Email",
    btn_clear: "Effacer",
    btn_save: "Sauvegarder",
    btn_update: "Mettre à jour",
    btn_cancel: "Annuler",
    btn_delete: "Supprimer",
    btn_export: "Exporter",
    btn_import: "Importer",

    // --- Zone de résultat ---
    output_title: "Résultat généré",

    // --- Messages toast (notifications éphémères) ---
    toast_copied: "Copié dans le presse-papier",
    toast_generated: "Prompt généré",
    toast_empty: "Remplissez au moins un champ",
    toast_copy_fail: "Échec de la copie",
    toast_saved: "Prompt sauvegardé",
    toast_updated: "Prompt mis à jour",
    toast_deleted: "Prompt supprimé",
    toast_imported: "Import réussi",
    toast_export_done: "Export téléchargé",

    // --- Email ---
    email_subject: "Prompt C.R.A.F.T.",

    // --- Footer ---
    copyright: "© 2026 Fabrice Lamour — Tous droits réservés",

    // --- Bibliothèque (Sprint 2+) ---
    library_title: "Bibliothèque",
    search_placeholder: "Rechercher un prompt…",
    category_all: "Toutes",
    sort_alpha_asc: "A → Z",
    sort_alpha_desc: "Z → A",
    sort_date_asc: "Plus ancien",
    sort_date_desc: "Plus récent",

    // --- Modales ---
    modal_save_title: "Sauvegarder le prompt",
    modal_delete_title: "Confirmer la suppression",
    modal_delete_message: "Voulez-vous vraiment supprimer ce prompt ?",
    modal_replace_title: "Remplacer les champs ?",
    modal_replace_message: "Les champs actuels seront remplacés. Continuer ?",
    label_title: "Titre",
    label_category: "Catégorie",
    label_tags: "Tags"
  },

  en: {
    // --- Page titles ---
    page_title: "New Prompt",
    page_desc: "Structure your request with the C.R.A.F.T. method.",

    // --- C.R.A.F.T. field labels ---
    label_context: "Context",
    label_role: "Role",
    label_action: "Action",
    label_format: "Format",
    label_target: "Target",

    // --- Hints ---
    hint_context: "The why behind the request",
    hint_role: "The expertise AI should embody",
    hint_action: "The precise task to accomplish",
    hint_format: "The expected output format",
    hint_target: "Who the result is for",

    // --- Placeholders ---
    placeholder_context: "E.g.: I'm launching an online store for handmade products… | Our association is organizing a charity event in June… | I'm creating an online photography course…",
    placeholder_role: "E.g.: You are a digital marketing expert with 10 years of experience… | A patient teacher who simplifies complex topics… | A full-stack developer with 15 years of experience…",
    placeholder_action: "E.g.: Write a 5-step marketing plan for the launch… | Write a professional and engaging follow-up email… | Create a 4-week training program…",
    placeholder_format: "E.g.: Bullet list, table, 200-word paragraph… | A 10-slide presentation plan with key points… | A comparison table with pros and cons…",
    placeholder_target: "E.g.: Intended for beginner programming students… | A non-technical audience discovering AI… | Worried clients who need reassurance…",

    // --- Action buttons ---
    btn_generate: "Generate",
    btn_copy: "Copy",
    btn_email: "Email",
    btn_clear: "Clear",
    btn_save: "Save",
    btn_update: "Update",
    btn_cancel: "Cancel",
    btn_delete: "Delete",
    btn_export: "Export",
    btn_import: "Import",

    // --- Output ---
    output_title: "Generated Result",

    // --- Toast messages ---
    toast_copied: "Copied to clipboard",
    toast_generated: "Prompt generated",
    toast_empty: "Fill in at least one field",
    toast_copy_fail: "Copy failed",
    toast_saved: "Prompt saved",
    toast_updated: "Prompt updated",
    toast_deleted: "Prompt deleted",
    toast_imported: "Import successful",
    toast_export_done: "Export downloaded",

    // --- Email ---
    email_subject: "C.R.A.F.T. Prompt",

    // --- Footer ---
    copyright: "© 2026 Fabrice Lamour — All rights reserved",

    // --- Library ---
    library_title: "Library",
    search_placeholder: "Search prompts…",
    category_all: "All",
    sort_alpha_asc: "A → Z",
    sort_alpha_desc: "Z → A",
    sort_date_asc: "Oldest first",
    sort_date_desc: "Newest first",

    // --- Modals ---
    modal_save_title: "Save prompt",
    modal_delete_title: "Confirm deletion",
    modal_delete_message: "Are you sure you want to delete this prompt?",
    modal_replace_title: "Replace fields?",
    modal_replace_message: "Current fields will be replaced. Continue?",
    label_title: "Title",
    label_category: "Category",
    label_tags: "Tags"
  }
};

// ============================================================
// SECTION : État et gestion de la langue active
// ============================================================

// Langue courante de l'application
let currentLang = 'fr';

// Liste des fonctions à appeler quand la langue change (pattern observateur)
const listeners = [];

/**
 * Change la langue active de l'application.
 * Ignore silencieusement les langues non supportées.
 * Notifie tous les écouteurs enregistrés via onLangChange().
 * @param {string} lang - Code langue ("fr" ou "en")
 */
export function setLang(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  // Notifier tous les modules qui écoutent le changement de langue
  listeners.forEach(fn => fn(lang));
}

/**
 * Retourne le code de la langue active.
 * @returns {string} "fr" ou "en"
 */
export function getLang() {
  return currentLang;
}

// ============================================================
// SECTION : Fonctions de traduction
// ============================================================

/**
 * Traduit une clé dans la langue active.
 * Si la clé n'existe pas, retourne la clé elle-même (utile pour le debug).
 * @param {string} key - Clé de traduction (ex: "btn_generate")
 * @returns {string} Texte traduit
 */
export function t(key) {
  return translations[currentLang][key] || translations.fr[key] || key;
}

/**
 * Traduit une clé dans une langue spécifique (pas forcément la langue active).
 * Utile pour afficher du contenu bilingue (ex: prompts par défaut).
 * @param {string} lang - Code langue cible
 * @param {string} key - Clé de traduction
 * @returns {string} Texte traduit
 */
export function tFrom(lang, key) {
  return (translations[lang] && translations[lang][key]) || translations.fr[key] || key;
}

// ============================================================
// SECTION : Système d'abonnement aux changements
// ============================================================

/**
 * Enregistre une fonction qui sera appelée à chaque changement de langue.
 * Permet aux modules UI de se mettre à jour automatiquement.
 * @param {Function} fn - Callback recevant le nouveau code langue
 */
export function onLangChange(fn) {
  listeners.push(fn);
}

/**
 * Retourne la liste des langues disponibles.
 * @returns {string[]} Ex: ["fr", "en"]
 */
export function getAvailableLangs() {
  return Object.keys(translations);
}
