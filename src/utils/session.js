import { storage, getJSON, setJSON } from "./storage";

const SESSION_KEY = "vr-veg-session-jwt";

function hasSessionStorage() {
  try {
    return typeof window !== "undefined" && !!window.sessionStorage;
  } catch (e) {
    return false;
  }
}

// When "remember me" is off, the session lives only in sessionStorage so it
// disappears when the tab/browser closes, instead of the usual persistent
// storage (localStorage / window.storage) that survives restarts.
export async function createSession(sessionData, remember = true) {
  // sessionData expects { user, token }
  if (!remember && hasSessionStorage()) {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    await storage.delete(SESSION_KEY, false).catch(() => {});
    return sessionData;
  }
  await setJSON(SESSION_KEY, sessionData, false);
  return sessionData;
}

export async function loadSession() {
  let session = await getJSON(SESSION_KEY, false, null);
  if (!session && hasSessionStorage()) {
    try {
      const raw = window.sessionStorage.getItem(SESSION_KEY);
      if (raw) session = JSON.parse(raw);
    } catch (e) { /* ignore */ }
  }
  if (!session || !session.token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${session.token}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      // Return flat structure that App.jsx expects (name, phone) plus token/role
      return { 
        name: data.user.name, 
        phone: data.user.phone,
        role: data.user.role,
        token: session.token 
      };
    }
  } catch (e) {
    console.error("Session verification failed", e);
  }
  
  await clearSession();
  return null;
}

export async function clearSession() {
  await storage.delete(SESSION_KEY, false);
  if (hasSessionStorage()) {
    try { window.sessionStorage.removeItem(SESSION_KEY); } catch (e) { /* ignore */ }
  }
}
