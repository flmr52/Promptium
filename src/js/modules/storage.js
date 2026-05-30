const PREFIX = 'promptium_';
const SCHEMA_VERSION = 1;

export function getAll(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setAll(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function getPreferences() {
  try {
    const raw = localStorage.getItem(PREFIX + 'preferences');
    return raw ? JSON.parse(raw) : getDefaultPreferences();
  } catch {
    return getDefaultPreferences();
  }
}

export function setPreferences(prefs) {
  try {
    localStorage.setItem(PREFIX + 'preferences', JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}

export function getSchemaVersion() {
  const raw = localStorage.getItem(PREFIX + 'version');
  return raw ? parseInt(raw, 10) : 0;
}

export function setSchemaVersion(version) {
  localStorage.setItem(PREFIX + 'version', String(version));
}

export function migrate() {
  const current = getSchemaVersion();
  if (current < SCHEMA_VERSION) {
    setSchemaVersion(SCHEMA_VERSION);
  }
}

export function clear() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(k => localStorage.removeItem(k));
}

function getDefaultPreferences() {
  return {
    lang: 'fr',
    sortBy: 'date',
    sortOrder: 'desc',
    lastCategoryFilter: null
  };
}
