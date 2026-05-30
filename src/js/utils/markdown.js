const FIELD_LABELS = {
  fr: { context: 'Contexte', role: 'Rôle', action: 'Action', format: 'Format', target: 'Cible' },
  en: { context: 'Context', role: 'Role', action: 'Action', format: 'Format', target: 'Target' }
};

const FIELD_ORDER = ['context', 'role', 'action', 'format', 'target'];

export function generateMarkdown(content, lang = 'fr') {
  const labels = FIELD_LABELS[lang] || FIELD_LABELS.fr;
  const sections = [];

  for (const field of FIELD_ORDER) {
    const value = content[field];
    if (value && value.trim()) {
      sections.push(`## ${labels[field]}\n\n${value.trim()}`);
    }
  }

  if (sections.length === 0) return '';
  return `# C.R.A.F.T. Prompt\n\n${sections.join('\n\n')}`;
}
