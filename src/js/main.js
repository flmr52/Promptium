/**
 * ============================================================
 * POINT D'ENTRÉE : main.js
 * ============================================================
 * Fichier principal de l'application Promptium.
 * Initialise les modules au chargement de la page :
 * - Migration du schéma localStorage si nécessaire
 * - Restauration de la langue préférée
 * - Initialisation du builder C.R.A.F.T.
 * - Branchement du sélecteur de langue (FR/EN)
 * ============================================================
 */

import { setLang, getLang } from './modules/i18n.js';
import { getPreferences, setPreferences, migrate } from './modules/storage.js';
import { initBuilder, applyI18n } from './ui/builder-ui.js';

/**
 * Fonction d'initialisation principale.
 * Appelée une fois le DOM entièrement chargé.
 */
function init() {
  // Exécuter les migrations de schéma (prépare les futures mises à jour)
  migrate();

  // Restaurer la langue sauvegardée dans les préférences utilisateur
  const prefs = getPreferences();
  setLang(prefs.lang || 'fr');

  // Appliquer les traductions au DOM
  applyI18n();

  // Initialiser le formulaire C.R.A.F.T.
  initBuilder();

  // Initialiser les boutons de changement de langue
  initLangSwitcher();
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

// Lancer l'initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', init);
