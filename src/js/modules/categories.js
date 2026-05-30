/**
 * ============================================================
 * MODULE : Catégories
 * ============================================================
 * Gère les catégories de prompts : catégories par défaut (livrées
 * avec l'app, non supprimables) et catégories utilisateur (CRUD).
 *
 * Les catégories par défaut sont chargées depuis default-prompts.json.
 * Les catégories utilisateur sont persistées dans localStorage.
 * ============================================================
 */

import { getAll, setAll } from './storage.js';
import { generateId } from '../utils/id.js';
import { nowISO } from '../utils/date.js';

// Clé localStorage pour les catégories utilisateur
const STORAGE_KEY = 'categories';

// Cache des catégories par défaut (chargées depuis le JSON)
let defaultCategories = [];

// ============================================================
// SECTION : Initialisation
// ============================================================

/**
 * Charge les catégories par défaut depuis le fichier JSON.
 * Doit être appelé au démarrage de l'application.
 * @param {Array} categories - Tableau de catégories issu de default-prompts.json
 */
export function loadDefaultCategories(categories) {
  defaultCategories = categories || [];
}

// ============================================================
// SECTION : Lecture
// ============================================================

/**
 * Retourne toutes les catégories (par défaut + utilisateur), triées par ordre.
 * @returns {Array} Liste complète des catégories
 */
export function getAllCategories() {
  const userCategories = getAll(STORAGE_KEY);
  return [...defaultCategories, ...userCategories].sort((a, b) => a.order - b.order);
}

/**
 * Retourne uniquement les catégories par défaut.
 * @returns {Array}
 */
export function getDefaultCategories() {
  return [...defaultCategories];
}

/**
 * Retourne uniquement les catégories créées par l'utilisateur.
 * @returns {Array}
 */
export function getUserCategories() {
  return getAll(STORAGE_KEY);
}

/**
 * Trouve une catégorie par son identifiant.
 * Cherche dans les catégories par défaut puis utilisateur.
 * @param {string} id - Identifiant de la catégorie
 * @returns {Object|undefined} La catégorie trouvée ou undefined
 */
export function getCategoryById(id) {
  return getAllCategories().find(c => c.id === id);
}

// ============================================================
// SECTION : CRUD (catégories utilisateur uniquement)
// ============================================================

/**
 * Crée une nouvelle catégorie utilisateur.
 * @param {Object} data - { name: {fr, en} } ou { name: "string" }
 * @returns {Object} La catégorie créée avec son id et son ordre
 */
export function createCategory(data) {
  const userCategories = getAll(STORAGE_KEY);
  const allCategories = getAllCategories();

  // L'ordre est calculé pour que la nouvelle catégorie apparaisse en dernier
  const maxOrder = allCategories.reduce((max, c) => Math.max(max, c.order || 0), 0);

  const category = {
    id: generateId(),
    name: data.name,
    isDefault: false,
    order: maxOrder + 1,
    createdAt: nowISO()
  };

  userCategories.push(category);
  setAll(STORAGE_KEY, userCategories);
  return category;
}

/**
 * Met à jour une catégorie utilisateur existante.
 * Les catégories par défaut ne peuvent pas être modifiées.
 * @param {string} id - Identifiant de la catégorie à modifier
 * @param {Object} data - Champs à mettre à jour (ex: { name: {fr, en} })
 * @returns {Object|null} La catégorie mise à jour, ou null si non trouvée/par défaut
 */
export function updateCategory(id, data) {
  const userCategories = getAll(STORAGE_KEY);
  const index = userCategories.findIndex(c => c.id === id);

  if (index === -1) return null;

  userCategories[index] = { ...userCategories[index], ...data };
  setAll(STORAGE_KEY, userCategories);
  return userCategories[index];
}

/**
 * Supprime une catégorie utilisateur.
 * Les catégories par défaut ne peuvent pas être supprimées.
 * @param {string} id - Identifiant de la catégorie à supprimer
 * @returns {boolean} true si supprimée, false si non trouvée ou par défaut
 */
export function deleteCategory(id) {
  // Vérifier que ce n'est pas une catégorie par défaut
  if (defaultCategories.some(c => c.id === id)) return false;

  const userCategories = getAll(STORAGE_KEY);
  const filtered = userCategories.filter(c => c.id !== id);

  if (filtered.length === userCategories.length) return false;

  setAll(STORAGE_KEY, filtered);
  return true;
}
