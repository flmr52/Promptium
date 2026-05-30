import { setLang, getLang } from './modules/i18n.js';
import { getPreferences, setPreferences, migrate } from './modules/storage.js';
import { initBuilder, applyI18n } from './ui/builder-ui.js';

function init() {
  migrate();

  const prefs = getPreferences();
  setLang(prefs.lang || 'fr');
  applyI18n();

  initBuilder();
  initLangSwitcher();
}

function initLangSwitcher() {
  const btnFr = document.getElementById('lang-fr');
  const btnEn = document.getElementById('lang-en');

  function updateActive() {
    const lang = getLang();
    btnFr.classList.toggle('active', lang === 'fr');
    btnEn.classList.toggle('active', lang === 'en');
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

document.addEventListener('DOMContentLoaded', init);
