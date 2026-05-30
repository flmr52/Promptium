/**
 * ============================================================
 * UI : Modales (Dialogues)
 * ============================================================
 * Gère les fenêtres modales de l'application :
 * - Confirmation de suppression
 * - Confirmation de remplacement des champs
 * - Formulaire de sauvegarde d'un prompt
 *
 * Chaque modale est créée dynamiquement dans le DOM,
 * affichée en overlay, et détruite après fermeture.
 * ============================================================
 */

import { t } from '../modules/i18n.js';

// ============================================================
// SECTION : Modale de confirmation (oui/non)
// ============================================================

/**
 * Affiche une modale de confirmation avec un titre et un message.
 * Retourne une Promise qui résout à true (confirmer) ou false (annuler).
 * @param {string} title - Titre de la modale
 * @param {string} message - Message explicatif
 * @returns {Promise<boolean>}
 */
export function showConfirm(title, message, confirmLabel) {
  return new Promise(resolve => {
    const overlay = createOverlay();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', title);
    modal.innerHTML = `
      <div class="modal-header">${title}</div>
      <div class="modal-body">${message}</div>
      <div class="modal-actions">
        <button class="btn btn-ghost modal-cancel">${t('btn_cancel')}</button>
        <button class="btn btn-primary modal-confirm">${confirmLabel || t('btn_delete')}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Fermer avec Annuler, clic sur l'overlay, ou touche Escape
    const dismiss = () => { close(overlay); resolve(false); };

    modal.querySelector('.modal-cancel').addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismiss();
    });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', onKey);
        dismiss();
      }
    });

    // Confirmer
    modal.querySelector('.modal-confirm').addEventListener('click', () => {
      close(overlay);
      resolve(true);
    });

    // Focus sur le bouton annuler par défaut (sécurité)
    modal.querySelector('.modal-cancel').focus();
  });
}

// ============================================================
// SECTION : Modale de sauvegarde (formulaire)
// ============================================================

/**
 * Affiche un formulaire modal pour sauvegarder un prompt.
 * Champs : titre, catégorie (dropdown), tags (texte séparé par virgules).
 * @param {Array} categories - Liste des catégories disponibles
 * @param {string} lang - Langue active pour résoudre les noms de catégories
 * @param {Object} [defaults] - Valeurs pré-remplies {title, categoryId, tags}
 * @returns {Promise<Object|null>} Les données saisies ou null si annulé
 */
export function showSaveForm(categories, lang, defaults = {}) {
  return new Promise(resolve => {
    const overlay = createOverlay();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', t('modal_save_title'));

    // Construire les options du dropdown catégorie
    const categoryOptions = categories.map(cat => {
      const name = typeof cat.name === 'string' ? cat.name : (cat.name[lang] || cat.name.fr || '');
      const selected = cat.id === defaults.categoryId ? 'selected' : '';
      return `<option value="${cat.id}" ${selected}>${name}</option>`;
    }).join('');

    // Formater les tags par défaut en texte
    const tagsValue = (defaults.tags || []).join(', ');

    modal.innerHTML = `
      <div class="modal-header">${t('modal_save_title')}</div>
      <div class="modal-body">
        <div class="modal-field">
          <label for="modal-title">${t('label_title')}</label>
          <input type="text" id="modal-title" class="modal-input" value="${defaults.title || ''}" />
        </div>
        <div class="modal-field">
          <label for="modal-category">${t('label_category')}</label>
          <select id="modal-category" class="modal-input">${categoryOptions}</select>
        </div>
        <div class="modal-field">
          <label for="modal-tags">${t('label_tags')}</label>
          <input type="text" id="modal-tags" class="modal-input" value="${tagsValue}" placeholder="tag1, tag2, tag3" />
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-ghost modal-cancel">${t('btn_cancel')}</button>
        <button class="btn btn-primary modal-save">${defaults.title ? t('btn_update') : t('btn_save')}</button>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus sur le champ titre
    const titleInput = modal.querySelector('#modal-title');
    titleInput.focus();
    titleInput.select();

    // Annuler : bouton, clic overlay, ou Escape
    const dismiss = () => { close(overlay); resolve(null); };

    modal.querySelector('.modal-cancel').addEventListener('click', dismiss);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) dismiss();
    });
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', onKey);
        dismiss();
      }
    });

    // Sauvegarder
    modal.querySelector('.modal-save').addEventListener('click', () => {
      const title = modal.querySelector('#modal-title').value.trim();
      const categoryId = modal.querySelector('#modal-category').value;
      const tagsRaw = modal.querySelector('#modal-tags').value;
      const tags = tagsRaw.split(',').map(s => s.trim()).filter(Boolean);

      if (!title) {
        titleInput.style.borderColor = 'var(--danger)';
        return;
      }

      close(overlay);
      resolve({ title, categoryId, tags });
    });

    // Soumettre avec Entrée dans le champ titre
    titleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        modal.querySelector('.modal-save').click();
      }
    });
  });
}

// ============================================================
// SECTION : Utilitaires internes
// ============================================================

/**
 * Crée l'overlay semi-transparent derrière la modale.
 */
function createOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  return overlay;
}

/**
 * Ferme et supprime une modale du DOM.
 */
function close(overlay) {
  overlay.classList.add('modal-closing');
  setTimeout(() => overlay.remove(), 200);
}
