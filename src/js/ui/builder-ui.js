/**
 * ============================================================
 * UI : Builder C.R.A.F.T.
 * ============================================================
 * Gère l'interface du formulaire principal : les 5 champs
 * (Contexte, Rôle, Action, Format, Target), la génération du
 * Markdown, la copie, l'envoi par email et l'effacement.
 *
 * Ce module expose aussi setFieldValues() pour permettre à la
 * bibliothèque de pré-remplir les champs du builder.
 * ============================================================
 */

import { t, getLang, onLangChange } from '../modules/i18n.js';
import { generateMarkdown } from '../utils/markdown.js';
import { showToast } from './toast-ui.js';

// Stocke le Markdown généré pour la copie et l'envoi par email
let generatedMarkdown = '';

// ============================================================
// SECTION : Initialisation
// ============================================================

/**
 * Initialise le builder : branche les événements sur les boutons
 * et les textareas, et s'abonne aux changements de langue.
 * Doit être appelé une fois au démarrage de l'application.
 */
export function initBuilder() {
  // Auto-resize des textareas : la hauteur s'adapte au contenu
  document.querySelectorAll('textarea').forEach(ta => {
    ta.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.max(60, this.scrollHeight) + 'px';
    });
  });

  // Branchement des boutons d'action
  document.getElementById('btn-generate').addEventListener('click', generate);
  document.getElementById('btn-copy').addEventListener('click', copyToClipboard);
  document.getElementById('btn-email').addEventListener('click', sendByEmail);
  document.getElementById('btn-clear').addEventListener('click', clearAll);

  // Quand la langue change, mettre à jour les textes et regénérer si nécessaire
  onLangChange(() => {
    applyI18n();
    if (generatedMarkdown) generate();
  });
}

// ============================================================
// SECTION : Accès aux champs du formulaire
// ============================================================

/**
 * Lit les valeurs actuelles des 5 textareas du builder.
 * @returns {Object} {context, role, action, format, target} - valeurs nettoyées (trim)
 */
export function getFieldValues() {
  return {
    context: document.getElementById('field-context').value.trim(),
    role: document.getElementById('field-role').value.trim(),
    action: document.getElementById('field-action').value.trim(),
    format: document.getElementById('field-format').value.trim(),
    target: document.getElementById('field-target').value.trim()
  };
}

/**
 * Pré-remplit les 5 textareas avec les valeurs fournies.
 * Utilisé quand l'utilisateur sélectionne un prompt depuis la bibliothèque.
 * Ajuste automatiquement la hauteur de chaque textarea.
 * @param {Object} content - {context, role, action, format, target}
 */
export function setFieldValues(content) {
  const fields = ['context', 'role', 'action', 'format', 'target'];
  fields.forEach(field => {
    const el = document.getElementById(`field-${field}`);
    if (el) {
      el.value = content[field] || '';
      // Recalculer la hauteur pour s'adapter au nouveau contenu
      el.style.height = 'auto';
      el.style.height = Math.max(60, el.scrollHeight) + 'px';
    }
  });
}

/**
 * Vérifie si au moins un champ du builder contient du texte.
 * Utile pour savoir si on doit demander confirmation avant remplacement.
 * @returns {boolean} true si au moins un champ est rempli
 */
export function hasContent() {
  const values = getFieldValues();
  return Object.values(values).some(v => v.length > 0);
}

// ============================================================
// SECTION : Actions principales
// ============================================================

/**
 * Génère le Markdown à partir des champs C.R.A.F.T. et l'affiche
 * dans la zone de résultat. Affiche un toast de confirmation.
 */
function generate() {
  const content = getFieldValues();
  const isEmpty = Object.values(content).every(v => v === '');

  if (isEmpty) {
    showToast(t('toast_empty'));
    return;
  }

  // Générer le Markdown dans la langue active
  generatedMarkdown = generateMarkdown(content, getLang());

  // Afficher le résultat dans la zone de sortie
  document.getElementById('output-text').textContent = generatedMarkdown;
  document.getElementById('output-section').classList.add('visible');
  showToast(t('toast_generated'));
}

/**
 * Copie le Markdown généré dans le presse-papier.
 * Si rien n'a été généré, lance d'abord la génération.
 */
async function copyToClipboard() {
  if (!generatedMarkdown) {
    generate();
    if (!generatedMarkdown) return;
  }
  try {
    await navigator.clipboard.writeText(generatedMarkdown);
    showToast(t('toast_copied'));
  } catch {
    showToast(t('toast_copy_fail'));
  }
}

/**
 * Ouvre le client email avec le Markdown en corps de message.
 * Utilise le protocole mailto: (fonctionne sur desktop et mobile).
 */
function sendByEmail() {
  if (!generatedMarkdown) {
    generate();
    if (!generatedMarkdown) return;
  }
  const subject = encodeURIComponent(t('email_subject'));
  const body = encodeURIComponent(generatedMarkdown);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

/**
 * Vide tous les champs du builder et masque la zone de résultat.
 * Réinitialise aussi le Markdown stocké.
 */
function clearAll() {
  document.querySelectorAll('textarea').forEach(ta => {
    ta.value = '';
    ta.style.height = '';
  });
  document.getElementById('output-section').classList.remove('visible');
  generatedMarkdown = '';
}

// ============================================================
// SECTION : Application des traductions au DOM
// ============================================================

/**
 * Met à jour tous les éléments du DOM qui ont un attribut data-i18n
 * ou data-i18n-placeholder avec les textes de la langue active.
 * Préserve les icônes SVG contenues dans les boutons.
 */
function applyI18n() {
  // Mettre à jour les textes (labels, boutons, titres)
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (!text || text === key) return;

    // Si l'élément contient un SVG (icône), le préserver
    const svg = el.querySelector('svg');
    if (svg) {
      el.innerHTML = '';
      el.appendChild(svg);
      el.appendChild(document.createTextNode(' ' + text));
    } else {
      el.textContent = text;
    }
  });

  // Mettre à jour les placeholders des textareas
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const text = t(key);
    if (text && text !== key) el.placeholder = text;
  });
}

export { applyI18n };
