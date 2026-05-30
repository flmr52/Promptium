/**
 * ============================================================
 * UI : Notifications Toast
 * ============================================================
 * Affiche des messages éphémères en bas de l'écran (2 secondes).
 * Utilisé pour confirmer les actions utilisateur : copie, génération,
 * sauvegarde, suppression, etc.
 * ============================================================
 */

// Référence au timer en cours pour pouvoir l'annuler si un nouveau toast arrive
let toastTimeout = null;

/**
 * Affiche un message toast pendant 2 secondes.
 * Si un toast est déjà visible, il est remplacé immédiatement.
 * @param {string} message - Texte à afficher dans la notification
 */
export function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Mettre à jour le contenu et afficher
  toast.textContent = message;
  toast.classList.add('show');

  // Annuler le timer précédent pour éviter que le toast disparaisse trop tôt
  clearTimeout(toastTimeout);

  // Masquer automatiquement après 2 secondes
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
}
