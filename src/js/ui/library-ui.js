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
import { getAllPrompts, deletePrompt, duplicatePrompt } from '../modules/library.js';
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
      <h2 class="library-title">${t('library_title')}</h2>
      <select class="library-sort" id="library-sort">${sortSelect}</select>
    </div>
    <div class="library-search">
      <input type="text" id="library-search-input" placeholder="${t('search_placeholder')}" value="${currentSearch}" />
    </div>
    <div class="library-categories">
      <button class="cat-tab ${!currentCategory ? 'active' : ''}" data-cat-id="">${t('category_all')}</button>
      ${categoryTabs}
    </div>
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

  // Tags
  const tagsHtml = (prompt.tags || []).slice(0, 3)
    .map(tag => `<span class="card-tag">${tag}</span>`)
    .join('');

  return `
    <div class="prompt-card" data-prompt-id="${prompt.id}">
      <div class="card-top">
        <span class="card-title">${title}</span>
        <button class="card-fav ${favClass}" data-fav-id="${prompt.id}" title="Favori">${favIcon}</button>
      </div>
      <div class="card-meta">
        ${catName ? `<span class="card-cat">${catName}</span>` : ''}
        ${defaultBadge}
        ${tagsHtml}
      </div>
      <div class="card-actions">
        <button class="card-btn card-load" data-load-id="${prompt.id}">${t('btn_generate')}</button>
        ${!prompt.isDefault ? `<button class="card-btn card-delete" data-delete-id="${prompt.id}">${t('btn_delete')}</button>` : ''}
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
      const confirmed = await showConfirm(t('modal_delete_title'), t('modal_delete_message'));
      if (confirmed) {
        deletePrompt(id);
        showToast(t('toast_deleted'));
        renderPromptList();
      }
    });
  });
}
