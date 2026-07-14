// ---------------------------------------------------------------------------
// STORAGE
// ---------------------------------------------------------------------------
// This app was originally built for the Claude Artifacts `window.storage`
// key/value API. When you drop this project into your own React app,
// `window.storage` won't exist — so this wrapper transparently falls back to
// `localStorage`, and finally to an in-memory Map if even that is
// unavailable (e.g. server-side rendering). Every other file just calls
// `storage.get/set/delete/list` and never has to know which backend is
// actually in use.
//
// NOTE: the in-memory and localStorage fallbacks are per-browser / per-device
// only — they do NOT sync data between the owner's dashboard and a
// customer's phone the way a real backend would. For production use, swap
// this file out for calls to your own server/database API; every other file
// in this project only depends on the four functions exported below.

const memoryStore = new Map();

function hasWindowStorage() {
  return typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
}

function hasLocalStorage() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch (e) {
    return false;
  }
}

const ns = (key, shared) => `vr-veg:${shared ? "shared" : "local"}:${key}`;

export const storage = {
  async get(key, shared = false) {
    if (hasWindowStorage()) {
      try {
        return await window.storage.get(key, shared);
      } catch (e) {
        return null;
      }
    }
    if (hasLocalStorage()) {
      const raw = window.localStorage.getItem(ns(key, shared));
      return raw === null ? null : { key, value: raw, shared };
    }
    const raw = memoryStore.get(ns(key, shared));
    return raw === undefined ? null : { key, value: raw, shared };
  },

  async set(key, value, shared = false) {
    if (hasWindowStorage()) {
      try {
        return await window.storage.set(key, value, shared);
      } catch (e) {
        return null;
      }
    }
    if (hasLocalStorage()) {
      window.localStorage.setItem(ns(key, shared), value);
      return { key, value, shared };
    }
    memoryStore.set(ns(key, shared), value);
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    if (hasWindowStorage()) {
      try {
        return await window.storage.delete(key, shared);
      } catch (e) {
        return null;
      }
    }
    if (hasLocalStorage()) {
      window.localStorage.removeItem(ns(key, shared));
      return { key, deleted: true, shared };
    }
    memoryStore.delete(ns(key, shared));
    return { key, deleted: true, shared };
  },
};

// Convenience JSON helpers — every value we store is JSON, so callers don't
// have to repeat try/catch JSON.parse boilerplate everywhere.
export async function getJSON(key, shared = false, fallback = null) {
  try {
    const res = await storage.get(key, shared);
    return res && res.value ? JSON.parse(res.value) : fallback;
  } catch (e) {
    return fallback;
  }
}

export async function setJSON(key, value, shared = false) {
  return storage.set(key, JSON.stringify(value), shared);
}
