export function getStorageItem(key, fallback = null) {
  if (typeof window === "undefined") return fallback;

  const value = window.localStorage.getItem(key);
  if (value === null) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export function setStorageItem(key, value) {
  if (typeof window === "undefined") return;

  const serialized =
    typeof value === "string" ? value : JSON.stringify(value);
  window.localStorage.setItem(key, serialized);
}

export function removeStorageItem(key) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

export function clearStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.clear();
}
