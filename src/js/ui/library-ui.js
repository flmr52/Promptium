/**
 * ============================================================
 * UI : Panneau Bibliothèque
 * ============================================================
 * Gère l'affichage et les interactions du panneau latéral :
 * - Liste des prompts (cartes cliquables)
 * - Barre de recherche instantanée
 * - Filtrage par catégorie (onglets)
 * - Contrôle de tri (alpha/date, asc/desc)
 * - Actions sur chaque prompt (charger, favori, supprimer)
 *
 * Émet des événements personnalisés pour communiquer avec le builder :
 * - promptium:load-prompt → pré-remplir les champs du builder
 * ============================================================
 */

import { t, getLang, onLangChange } from '../modules/i18n.js';
import { getAllPrompts, deletePrompt, duplicatePrompt, restoreDefaults, hasHiddenDefaults, hiddenDefaultsCount } from '../modules/library.js';
import { getAllCategories } from '../modules/categories.js';
import { sortPrompts } from '../modules/sorting.js';
import { filterPrompts } from '../modules/search.js';
import { toggleFavorite } from '../modules/favorites.js';
import { getPreferences, setPreferences } from '../modules/storage.js';
import { showToast } from './toast-ui.js';
import { showConfirm } from './modal-ui.js';

// État local du panneau
let currentSearch = '';
let currentCategory = null;
let currentSort = 'date';
let currentOrder = 'desc';

// ============================================================
// SECTION : Initialisation
// ============================================================

/**
 * Initialise le panneau bibliothèque : injecte le HTML,
 * branche les événements et affiche les prompts.
 */
export function initLibrary() {
  const panel = document.getElementById('library-panel');
  if (!panel) return;

  // Restaurer les préférences de tri
  const prefs = getPreferences();
  currentSort = prefs.sortBy || 'date';
  currentOrder = prefs.sortOrder || 'desc';
  currentCategory = prefs.lastCategoryFilter || null;

  // Injecter le contenu HTML du panneau
  panel.innerHTML = buildPanelHTML();

  // Brancher les événements
  bindSearchEvent();
  bindCategoryEvents();
  bindSortEvents();

  // Afficher les prompts
  renderPromptList();

  // Brancher l'ouverture/fermeture du drawer
  initDrawer();

  // Se mettre à jour quand la langue change
  onLangChange(() => {
    panel.innerHTML = buildPanelHTML();
    bindSearchEvent();
    bindCategoryEvents();
    bindSortEvents();
    renderPromptList();
  });
}

// ============================================================
// SECTION : Drawer (panneau latéral)
// ============================================================

/**
 * Branche les boutons d'ouverture/fermeture du drawer et l'overlay.
 */
function initDrawer() {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  const btnOpen = document.getElementById('btn-open-library');
  const btnFab = document.getElementById('btn-fab-library');
  const btnClose = document.getElementById('btn-close-library');

  if (btnOpen) btnOpen.addEventListener('click', openDrawer);
  if (btnFab) btnFab.addEventListener('click', openDrawer);
  if (btnClose) btnClose.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // Fermer avec Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/**
 * Ouvre le drawer bibliothèque.
 */
export function openDrawer() {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * Ferme le drawer bibliothèque.
 */
export function closeDrawer() {
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================================
// SECTION : Construction du HTML
// ============================================================

/**
 * Génère le HTML complet du panneau bibliothèque.
 */
function buildPanelHTML() {
  const categories = getAllCategories();
  const lang = getLang();

  // Onglets de catégories
  const categoryTabs = categories.map(cat => {
    const name = typeof cat.name === 'string' ? cat.name : (cat.name[lang] || cat.name.fr || '');
    const active = cat.id === currentCategory ? 'active' : '';
    return `<button class="cat-tab ${active}" data-cat-id="${cat.id}">${name}</button>`;
  }).join('');

  // Options de tri
  const sortOptions = [
    { value: 'date-desc', label: t('sort_date_desc') },
    { value: 'date-asc', label: t('sort_date_asc') },
    { value: 'alpha-asc', label: t('sort_alpha_asc') },
    { value: 'alpha-desc', label: t('sort_alpha_desc') }
  ];
  const sortSelect = sortOptions.map(opt => {
    const selected = opt.value === `${currentSort}-${currentOrder}` ? 'selected' : '';
    return `<option value="${opt.value}" ${selected}>${opt.label}</option>`;
  }).join('');

  return `
    <div class="library-header">
      <select class="library-sort" id="library-sort">${sortSelect}</select>
    </div>
    <div class="library-search">
      <input type="text" id="library-search-input" placeholder="${t('search_placeholder')}" value="${currentSearch}" />
    </div>
    <div class="library-categories">
      <button class="cat-tab ${!currentCategory ? 'active' : ''}" data-cat-id="">${t('category_all')}</button>
      ${categoryTabs}
    </div>
    <div class="library-restore-banner" id="library-restore-banner"></div>
    <div class="library-list" id="library-list"></div>
  `;
}

// ============================================================
// SECTION : Rendu de la liste de prompts
// ============================================================

/**
 * Filtre, trie et affiche la liste des prompts dans le panneau.
 */
export function renderPromptList() {
  const listEl = document.getElementById('library-list');
  if (!listEl) return;

  let prompts = getAllPrompts();

  // Filtrer par catégorie si un filtre est actif
  if (currentCategory) {
    prompts = prompts.filter(p => p.categoryId === currentCategory);
  }

  // Filtrer par recherche
  prompts = filterPrompts(prompts, currentSearch);

  // Trier
  prompts = sortPrompts(prompts, currentSort, currentOrder);

  // Mettre à jour la bannière de restauration (toujours, même si liste vide)
  updateRestoreButton();

  // Générer les cartes
  if (prompts.length === 0) {
    listEl.innerHTML = '<div class="library-empty">Aucun prompt trouvé</div>';
    return;
  }

  const lang = getLang();
  listEl.innerHTML = prompts.map(prompt => buildPromptCard(prompt, lang)).join('');

  // Brancher les événements sur chaque carte
  bindCardEvents(listEl);
}

/**
 * Génère le(s) badge(s) de langue (mini drapeaux SVG) pour une carte de prompt.
 * Les prompts par défaut sont bilingues (FR+EN), les prompts utilisateur
 * affichent la langue dans laquelle ils ont été rédigés.
 */
function buildLangBadge(prompt) {
  const flagFR = `<svg class="card-flag" viewBox="0 0 36 24" title="Français"><rect width="12" height="24" fill="#002395"/><rect x="12" width="12" height="24" fill="#fff"/><rect x="24" width="12" height="24" fill="#ED2939"/></svg>`;
  const flagEN = `<svg class="card-flag" viewBox="0 0 60 30" title="English"><clipPath id="cf-s"><path d="M0,0 v30 h60 v-30 z"/></clipPath><clipPath id="cf-t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath><g clip-path="url(#cf-s)"><path d="M0,0 v30 h60 v-30 z" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" clip-path="url(#cf-t)" stroke="#C8102E" stroke-width="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></g></svg>`;

  if (prompt.isDefault) {
    return `<span class="card-lang">${flagFR}${flagEN}</span>`;
  }
  const langCode = prompt.lang || 'fr';
  return `<span class="card-lang">${langCode === 'en' ? flagEN : flagFR}</span>`;
}

/**
 * Génère le HTML d'une carte de prompt.
 */
function buildPromptCard(prompt, lang) {
  // Résoudre le titre (bilingue ou string)
  const title = typeof prompt.title === 'string'
    ? prompt.title
    : (prompt.title[lang] || prompt.title.fr || '');

  // Résoudre la catégorie
  const categories = getAllCategories();
  const category = categories.find(c => c.id === prompt.categoryId);
  const catName = category
    ? (typeof category.name === 'string' ? category.name : (category.name[lang] || category.name.fr || ''))
    : '';

  // Icône favori
  const favClass = prompt.favorite ? 'fav-active' : '';
  const favIcon = prompt.favorite ? '★' : '☆';

  // Badge "par défaut"
  const defaultBadge = prompt.isDefault ? '<span class="card-badge">défaut</span>' : '';

  // Badge(s) de langue : les prompts par défaut sont bilingues (FR+EN),
  // les prompts utilisateur affichent la langue dans laquelle ils ont été écrits
  const langBadge = buildLangBadge(prompt);

  // Tags
  const tagsHtml = (prompt.tags || []).slice(0, 3)
    .map(tag => `<span class="card-tag">${tag}</span>`)
    .join('');

  return `
    <div class="prompt-card" data-prompt-id="${prompt.id}">
      <div class="card-top">
        <span class="card-title">${title}</span>
        ${langBadge}
        <button class="card-fav ${favClass}" data-fav-id="${prompt.id}" title="Favori">${favIcon}</button>
      </div>
      <div class="card-meta">
        ${catName ? `<span class="card-cat">${catName}</span>` : ''}
        ${defaultBadge}
        ${tagsHtml}
      </div>
      <div class="card-actions">
        <button class="card-btn card-load" data-load-id="${prompt.id}">${t('btn_generate')}</button>
        <button class="card-btn card-delete" data-delete-id="${prompt.id}" data-is-default="${prompt.isDefault ? 'true' : 'false'}" title="${t('btn_delete')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>
      </div>
    </div>
  `;
}

// ============================================================
// SECTION : Gestion des événements
// ============================================================

/**
 * Branche la recherche instantanée (événement input).
 */
function bindSearchEvent() {
  const input = document.getElementById('library-search-input');
  if (!input) return;

  input.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderPromptList();
  });
}

/**
 * Branche le clic sur les onglets de catégories.
 */
function bindCategoryEvents() {
  const tabs = document.querySelectorAll('.cat-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      currentCategory = tab.dataset.catId || null;

      // Mettre à jour l'état visuel des onglets
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Sauvegarder la préférence
      setPreferences({ ...getPreferences(), lastCategoryFilter: currentCategory });

      renderPromptList();
    });
  });
}

/**
 * Branche le changement de tri (select).
 */
function bindSortEvents() {
  const select = document.getElementById('library-sort');
  if (!select) return;

  select.addEventListener('change', (e) => {
    const [sort, order] = e.target.value.split('-');
    currentSort = sort;
    currentOrder = order;

    // Sauvegarder la préférence
    setPreferences({ ...getPreferences(), sortBy: currentSort, sortOrder: currentOrder });

    renderPromptList();
  });
}

/**
 * Branche les événements sur les boutons de chaque carte de prompt.
 * - Charger : émet un événement pour pré-remplir le builder
 * - Favori : bascule le statut et rafraîchit la liste
 * - Supprimer : demande confirmation puis supprime
 */
function bindCardEvents(container) {
  // Bouton "Charger dans le builder"
  container.querySelectorAll('.card-load').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.loadId;
      const prompt = getAllPrompts().find(p => p.id === id);
      if (prompt) {
        // Émettre un événement personnalisé pour le builder
        document.dispatchEvent(new CustomEvent('promptium:load-prompt', { detail: prompt }));
      }
    });
  });

  // Bouton "Favori"
  container.querySelectorAll('.card-fav').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.favId;
      toggleFavorite(id);
      renderPromptList();
    });
  });

  // Bouton "Supprimer"
  container.querySelectorAll('.card-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.deleteId;
      const isDefault = btn.dataset.isDefault === 'true';
      // Message adapté : réversible pour les défauts, définitif pour les utilisateur
      const message = isDefault ? t('modal_delete_default_message') : t('modal_delete_message');
      const confirmed = await showConfirm(t('modal_delete_title'), message);
      if (confirmed) {
        deletePrompt(id);
        showToast(t('toast_deleted'));
        renderPromptList();
      }
    });
  });
}

/**
 * Met à jour la bannière de restauration au-dessus de la liste.
 * Affiche le nombre de prompts masqués dans la catégorie active
 * et un bouton "Restaurer" avec icône.
 * N'apparaît que quand des prompts par défaut de la catégorie sont supprimés.
 */
function updateRestoreButton() {
  const banner = document.getElementById('library-restore-banner');
  if (!banner) return;

  // Compter les masqués dans la catégorie active (ou globalement si "Toutes")
  const count = hiddenDefaultsCount(currentCategory);

  if (count > 0) {
    const label = count === 1 ? 'prompt masqué' : 'prompts masqués';
    banner.innerHTML = `
      <div class="restore-banner">
        <span class="restore-banner-text">
          <svg class="restore-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          ${count} ${label}
        </span>
        <button class="restore-banner-btn" id="btn-restore-defaults">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1,4 1,10 7,10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          Restaurer
        </button>
      </div>
    `;
    document.getElementById('btn-restore-defaults').addEventListener('click', async () => {
      const confirmed = await showConfirm(t('modal_restore_title'), t('modal_restore_message'), t('btn_restore_defaults'));
      if (confirmed) {
        // Restaurer selon le filtre : catégorie active ou tous
        restoreDefaults(currentCategory);
        showToast(t('toast_restored'));
        renderPromptList();
      }
    });
  } else {
    banner.innerHTML = '';
  }
}
