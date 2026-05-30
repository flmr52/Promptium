/**
 * ============================================================
 * POINT D'ENTRÉE : main.js
 * ============================================================
 * Fichier principal de l'application Promptium.
 * Initialise les modules au chargement de la page :
 * - Migration du schéma localStorage si nécessaire
 * - Chargement des prompts par défaut
 * - Restauration de la langue préférée
 * - Initialisation du builder C.R.A.F.T.
 * - Initialisation de la bibliothèque
 * - Branchement du sélecteur de langue (FR/EN)
 * - Communication builder ↔ bibliothèque
 * ============================================================
 */

import { setLang, getLang } from './modules/i18n.js';
import { getPreferences, setPreferences, migrate } from './modules/storage.js';
import { loadDefaults } from './modules/library.js';
import { initBuilder, applyI18n, setFieldValues, hasContent } from './ui/builder-ui.js';
import { initLibrary, renderPromptList } from './ui/library-ui.js';
import { showConfirm } from './ui/modal-ui.js';
import { t } from './modules/i18n.js';
import defaultData from '../data/default-prompts.json';

/**
 * Fonction d'initialisation principale.
 * Appelée une fois le DOM entièrement chargé.
 */
function init() {
  // Exécuter les migrations de schéma (prépare les futures mises à jour)
  migrate();

  // Charger les prompts et catégories par défaut depuis le JSON embarqué
  loadDefaults(defaultData);

  // Restaurer la langue sauvegardée dans les préférences utilisateur
  const prefs = getPreferences();
  setLang(prefs.lang || 'fr');

  // Appliquer les traductions au DOM
  applyI18n();

  // Initialiser le formulaire C.R.A.F.T.
  initBuilder();

  // Initialiser la bibliothèque
  initLibrary();

  // Initialiser les boutons de changement de langue
  initLangSwitcher();

  // Écouter l'événement "charger un prompt dans le builder"
  initPromptLoading();
}

/**
 * Configure les boutons FR/EN dans le header.
 * Au clic, change la langue active et sauvegarde la préférence.
 */
function initLangSwitcher() {
  const btnFr = document.getElementById('lang-fr');
  const btnEn = document.getElementById('lang-en');

  // Met à jour la classe "active" sur le bon bouton
  function updateActive() {
    const lang = getLang();
    btnFr.classList.toggle('active', lang === 'fr');
    btnEn.classList.toggle('active', lang === 'en');
  }

  // Événements de clic sur les drapeaux
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

  // État initial
  updateActive();
}

/**
 * Écoute l'événement personnalisé émis par la bibliothèque
 * quand l'utilisateur clique "Charger" sur un prompt.
 * Pré-remplit les champs du builder avec le contenu du prompt sélectionné.
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

    // Résoudre le contenu (bilingue → texte simple dans la langue active)
    const lang = getLang();
    const content = {};
    const fields = ['context', 'role', 'action', 'format', 'target'];
    for (const field of fields) {
      const value = prompt.content[field];
      if (!value) {
        content[field] = '';
      } else if (typeof value === 'string') {
        content[field] = value;
      } else {
        content[field] = value[lang] || value.fr || '';
      }
    }

    // Pré-remplir le builder
    setFieldValues(content);
  });
}

// Lancer l'initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', init);
