/**
 * ============================================================
 * MODULE : Bibliothèque (Library)
 * ============================================================
 * Module central qui orchestre la gestion des prompts :
 * - Chargement des prompts par défaut (depuis JSON)
 * - CRUD des prompts utilisateur (création, modification, suppression)
 * - Fusion des deux collections pour l'affichage
 * - Duplication d'un prompt par défaut vers la collection utilisateur
 *
 * Ce module utilise storage.js pour la persistance et categories.js
 * pour la résolution des catégories.
 * ============================================================
 */

import { getAll, setAll } from './storage.js';
import { loadDefaultCategories } from './categories.js';
import { generateId } from '../utils/id.js';
import { nowISO } from '../utils/date.js';

// Clé localStorage pour les prompts utilisateur
const STORAGE_KEY = 'prompts';

// Cache des prompts par défaut (chargés depuis le JSON)
let defaultPrompts = [];

// ============================================================
// SECTION : Chargement des données par défaut
// ============================================================

/**
 * Charge les prompts et catégories par défaut depuis le fichier JSON embarqué.
 * En production (build single-file), le JSON est importé inline.
 * En développement, il est chargé via fetch().
 * @param {Object} data - Contenu de default-prompts.json {version, categories, prompts}
 */
export function loadDefaults(data) {
  if (!data) return;
  defaultPrompts = data.prompts || [];
  loadDefaultCategories(data.categories || []);
}

/**
 * Charge les prompts par défaut depuis une URL (mode développement).
 * @param {string} url - Chemin vers le fichier JSON
 */
export async function fetchDefaults(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    loadDefaults(data);
    return data;
  } catch {
    // En cas d'erreur (offline, fichier absent), continuer sans prompts par défaut
    return null;
  }
}

// ============================================================
// SECTION : Lecture des prompts
// ============================================================

/**
 * Retourne tous les prompts (par défaut + utilisateur).
 * C'est cette liste qui est affichée dans la bibliothèque.
 * @returns {Array} Tous les prompts fusionnés
 */
export function getAllPrompts() {
  const userPrompts = getAll(STORAGE_KEY);
  return [...defaultPrompts, ...userPrompts];
}

/**
 * Retourne uniquement les prompts par défaut (lecture seule).
 * @returns {Array}
 */
export function getDefaultPrompts() {
  return [...defaultPrompts];
}

/**
 * Retourne uniquement les prompts créés par l'utilisateur.
 * @returns {Array}
 */
export function getUserPrompts() {
  return getAll(STORAGE_KEY);
}

/**
 * Trouve un prompt par son identifiant (cherche partout).
 * @param {string} id - Identifiant du prompt
 * @returns {Object|undefined}
 */
export function getPromptById(id) {
  return getAllPrompts().find(p => p.id === id);
}

// ============================================================
// SECTION : CRUD (prompts utilisateur uniquement)
// ============================================================

/**
 * Crée un nouveau prompt utilisateur.
 * @param {Object} data - { title, content, categoryId, tags }
 *   - title: string (titre du prompt)
 *   - content: { context, role, action, format, target }
 *   - categoryId: string (id de la catégorie)
 *   - tags: string[] (liste de tags)
 * @returns {Object} Le prompt créé avec id et timestamps
 */
export function createPrompt(data) {
  const prompts = getAll(STORAGE_KEY);
  const now = nowISO();

  const prompt = {
    id: generateId(),
    title: data.title || '',
    content: data.content || { context: '', role: '', action: '', format: '', target: '' },
    categoryId: data.categoryId || null,
    tags: data.tags || [],
    isDefault: false,
    favorite: false,
    createdAt: now,
    updatedAt: now
  };

  prompts.push(prompt);
  setAll(STORAGE_KEY, prompts);
  return prompt;
}

/**
 * Met à jour un prompt utilisateur existant.
 * Les prompts par défaut ne peuvent pas être modifiés directement
 * (il faut d'abord les dupliquer).
 * @param {string} id - Identifiant du prompt à modifier
 * @param {Object} data - Champs à mettre à jour
 * @returns {Object|null} Le prompt mis à jour, ou null si non trouvé/par défaut
 */
export function updatePrompt(id, data) {
  const prompts = getAll(STORAGE_KEY);
  const index = prompts.findIndex(p => p.id === id);

  if (index === -1) return null;

  // Fusionner les modifications et mettre à jour le timestamp
  prompts[index] = {
    ...prompts[index],
    ...data,
    updatedAt: nowISO()
  };

  setAll(STORAGE_KEY, prompts);
  return prompts[index];
}

/**
 * Supprime un prompt utilisateur.
 * Les prompts par défaut ne peuvent pas être supprimés.
 * @param {string} id - Identifiant du prompt à supprimer
 * @returns {boolean} true si supprimé, false si non trouvé ou par défaut
 */
export function deletePrompt(id) {
  const prompts = getAll(STORAGE_KEY);
  const filtered = prompts.filter(p => p.id !== id);

  if (filtered.length === prompts.length) return false;

  setAll(STORAGE_KEY, filtered);
  return true;
}

/**
 * Duplique un prompt (par défaut ou utilisateur) vers la collection utilisateur.
 * Utile pour personnaliser un prompt par défaut sans le modifier.
 * @param {string} id - Identifiant du prompt source
 * @returns {Object|null} Le nouveau prompt dupliqué, ou null si source non trouvée
 */
export function duplicatePrompt(id) {
  const source = getPromptById(id);
  if (!source) return null;

  // Résoudre les champs bilingues en texte simple (prend le français)
  const title = typeof source.title === 'string'
    ? source.title
    : (source.title.fr || source.title.en || '');

  const content = {};
  const fields = ['context', 'role', 'action', 'format', 'target'];
  for (const field of fields) {
    const value = source.content && source.content[field];
    if (!value) {
      content[field] = '';
    } else if (typeof value === 'string') {
      content[field] = value;
    } else {
      content[field] = value.fr || value.en || '';
    }
  }

  return createPrompt({
    title: `${title} (copie)`,
    content,
    categoryId: source.categoryId,
    tags: [...(source.tags || [])]
  });
}
