/**
 * ============================================================
 * POINT D'ENTRÉE : main.js
 * ============================================================
 * Fichier principal de l'application Promptium.
 * Initialise tous les modules et orchestre la communication
 * entre le builder C.R.A.F.T. et la bibliothèque de prompts.
 * ============================================================
 */

import { setLang, getLang, t } from './modules/i18n.js';
import { getPreferences, setPreferences, migrate } from './modules/storage.js';
import { loadDefaults, createPrompt, updatePrompt } from './modules/library.js';
import { getAllCategories } from './modules/categories.js';
import { exportToJSON, downloadFile, importFromJSON, readFile } from './modules/export-import.js';
import { initBuilder, applyI18n, setFieldValues, getFieldValues, hasContent, setEditMode, clearEditMode, getEditingPromptId } from './ui/builder-ui.js';
import { initLibrary, renderPromptList } from './ui/library-ui.js';
import { showConfirm, showSaveForm } from './ui/modal-ui.js';
import { showToast } from './ui/toast-ui.js';
import defaultData from '../data/default-prompts.json';

/**
 * Fonction d'initialisation principale.
 * Appelée une fois le DOM entièrement chargé.
 */
function init() {
  // Exécuter les migrations de schéma
  migrate();

  // Charger les prompts et catégories par défaut depuis le JSON embarqué
  loadDefaults(defaultData);

  // Restaurer la langue sauvegardée
  const prefs = getPreferences();
  setLang(prefs.lang || 'fr');

  // Appliquer les traductions au DOM
  applyI18n();

  // Initialiser le formulaire C.R.A.F.T.
  initBuilder();

  // Initialiser la bibliothèque
  initLibrary();

  // Initialiser les contrôles globaux
  initLangSwitcher();
  initPromptLoading();
  initSaveButton();
  initExportImport();
}

// ============================================================
// SECTION : Sélecteur de langue
// ============================================================

/**
 * Configure les boutons FR/EN dans le header.
 */
function initLangSwitcher() {
  const btnFr = document.getElementById('lang-fr');
  const btnEn = document.getElementById('lang-en');

  function updateActive() {
    const lang = getLang();
    btnFr.classList.toggle('active', lang === 'fr');
    btnEn.classList.toggle('active', lang === 'en');
    // Accessibilité : mettre à jour aria-pressed
    btnFr.setAttribute('aria-pressed', lang === 'fr');
    btnEn.setAttribute('aria-pressed', lang === 'en');
  }

  btnFr.addEventListener('click', () => {
    setLang('fr');
    setPreferences({ ...getPreferences(), lang: 'fr' });
    updateActive();
  });

  btnEn.addEventListener('click', () => {
    setLang('en');
    setPreferences({ ...getPreferences(), lang: 'en' });
    updateActive();
  });

  updateActive();
}

// ============================================================
// SECTION : Chargement d'un prompt dans le builder
// ============================================================

/**
 * Écoute l'événement émis par la bibliothèque quand l'utilisateur
 * clique "Charger" sur un prompt. Pré-remplit le builder.
 */
function initPromptLoading() {
  document.addEventListener('promptium:load-prompt', async (e) => {
    const prompt = e.detail;
    if (!prompt || !prompt.content) return;

    // Si le builder contient déjà du texte, demander confirmation
    if (hasContent()) {
      const confirmed = await showConfirm(
        t('modal_replace_title'),
        t('modal_replace_message')
      );
      if (!confirmed) return;
    }

    // Résoudre le contenu bilingue → texte simple
    const lang = getLang();
    const content = resolveContent(prompt.content, lang);

    // Pré-remplir le builder
    setFieldValues(content);

    // Si c'est un prompt utilisateur, activer le mode édition
    if (!prompt.isDefault) {
      setEditMode(prompt.id);
    } else {
      clearEditMode();
    }

    // Scroll vers le builder pour voir les champs remplis
    document.querySelector('.fields-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ============================================================
// SECTION : Sauvegarde / Mise à jour de prompt
// ============================================================

/**
 * Branche le bouton "Sauvegarder" qui permet d'enregistrer
 * le contenu du builder dans la bibliothèque utilisateur.
 */
function initSaveButton() {
  const btn = document.getElementById('btn-save');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const content = getFieldValues();
    const isEmpty = Object.values(content).every(v => v === '');

    if (isEmpty) {
      showToast(t('toast_empty'));
      return;
    }

    const editingId = getEditingPromptId();

    if (editingId) {
      // Mode édition : mettre à jour le prompt existant
      updatePrompt(editingId, { content });
      showToast(t('toast_updated'));
      renderPromptList();
    } else {
      // Mode création : ouvrir le formulaire de sauvegarde
      const categories = getAllCategories();
      const result = await showSaveForm(categories, getLang());

      if (!result) return; // Annulé

      createPrompt({
        title: result.title,
        content,
        categoryId: result.categoryId,
        tags: result.tags
      });

      showToast(t('toast_saved'));
      renderPromptList();
    }
  });
}

// ============================================================
// SECTION : Export / Import
// ============================================================

/**
 * Branche les boutons d'export et d'import.
 */
function initExportImport() {
  const btnExport = document.getElementById('btn-export');
  const btnImport = document.getElementById('btn-import');

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const json = exportToJSON();
      downloadFile(json);
      showToast(t('toast_export_done'));
    });
  }

  if (btnImport) {
    btnImport.addEventListener('click', () => {
      // Créer un input file invisible et déclencher le sélecteur
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const json = await readFile(file);
          const result = importFromJSON(json);

          if (result.errors.length > 0) {
            showToast(result.errors[0]);
          } else {
            showToast(`${t('toast_imported')} (+${result.added})`);
            renderPromptList();
          }
        } catch {
          showToast('Erreur de lecture');
        }
      });
      input.click();
    });
  }
}

// ============================================================
// SECTION : Utilitaires
// ============================================================

/**
 * Résout un objet content bilingue en texte simple.
 * @param {Object} content - Contenu potentiellement bilingue
 * @param {string} lang - Langue active
 * @returns {Object} {context, role, action, format, target} en texte simple
 */
function resolveContent(content, lang) {
  const resolved = {};
  const fields = ['context', 'role', 'action', 'format', 'target'];
  for (const field of fields) {
    const value = content[field];
    if (!value) {
      resolved[field] = '';
    } else if (typeof value === 'string') {
      resolved[field] = value;
    } else {
      resolved[field] = value[lang] || value.fr || '';
    }
  }
  return resolved;
}

// Lancer l'initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', init);
