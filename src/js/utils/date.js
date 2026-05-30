export function nowISO() {
  return new Date().toISOString();
}

export function formatDate(isoString, lang = 'fr') {
  const date = new Date(isoString);
  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
