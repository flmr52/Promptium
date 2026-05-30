import { t, getLang, onLangChange } from '../modules/i18n.js';
import { generateMarkdown } from '../utils/markdown.js';
import { showToast } from './toast-ui.js';

let generatedMarkdown = '';

export function initBuilder() {
  document.querySelectorAll('textarea').forEach(ta => {
    ta.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.max(60, this.scrollHeight) + 'px';
    });
  });

  document.getElementById('btn-generate').addEventListener('click', generate);
  document.getElementById('btn-copy').addEventListener('click', copyToClipboard);
  document.getElementById('btn-email').addEventListener('click', sendByEmail);
  document.getElementById('btn-clear').addEventListener('click', clearAll);

  onLangChange(() => {
    applyI18n();
    if (generatedMarkdown) generate();
  });
}

export function getFieldValues() {
  return {
    context: document.getElementById('field-context').value.trim(),
    role: document.getElementById('field-role').value.trim(),
    action: document.getElementById('field-action').value.trim(),
    format: document.getElementById('field-format').value.trim(),
    target: document.getElementById('field-target').value.trim()
  };
}

export function setFieldValues(content) {
  const fields = ['context', 'role', 'action', 'format', 'target'];
  fields.forEach(field => {
    const el = document.getElementById(`field-${field}`);
    if (el) {
      el.value = content[field] || '';
      el.style.height = 'auto';
      el.style.height = Math.max(60, el.scrollHeight) + 'px';
    }
  });
}

export function hasContent() {
  const values = getFieldValues();
  return Object.values(values).some(v => v.length > 0);
}

function generate() {
  const content = getFieldValues();
  const isEmpty = Object.values(content).every(v => v === '');

  if (isEmpty) {
    showToast(t('toast_empty'));
    return;
  }

  generatedMarkdown = generateMarkdown(content, getLang());
  document.getElementById('output-text').textContent = generatedMarkdown;
  document.getElementById('output-section').classList.add('visible');
  showToast(t('toast_generated'));
}

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

function sendByEmail() {
  if (!generatedMarkdown) {
    generate();
    if (!generatedMarkdown) return;
  }
  const subject = encodeURIComponent(t('email_subject'));
  const body = encodeURIComponent(generatedMarkdown);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function clearAll() {
  document.querySelectorAll('textarea').forEach(ta => {
    ta.value = '';
    ta.style.height = '';
  });
  document.getElementById('output-section').classList.remove('visible');
  generatedMarkdown = '';
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (!text || text === key) return;
    const svg = el.querySelector('svg');
    if (svg) {
      el.innerHTML = '';
      el.appendChild(svg);
      el.appendChild(document.createTextNode(' ' + text));
    } else {
      el.textContent = text;
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const text = t(key);
    if (text && text !== key) el.placeholder = text;
  });
}

export { applyI18n };
