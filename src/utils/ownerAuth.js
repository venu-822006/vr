import { storage } from "./storage";

const OWNER_TOKEN_KEY = "vr-veg-owner-token";

export async function verifyOwnerLogin(username, password) {
  try {
    const res = await fetch('/api/owner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      const data = await res.json();
      await storage.set(OWNER_TOKEN_KEY, data.token, false);
      return { success: true };
    }
    // Backend is up but rejected credentials
    const data = await res.json().catch(() => ({}));
    return { success: false, reason: 'invalid', error: data.error || 'Incorrect username or password' };
  } catch (e) {
    console.error('Owner login failed:', e.message);
    return { success: false, reason: 'network', error: "⚠️ Couldn't reach the server. Please check your connection and try again." };
  }
}

export async function changeOwnerPassword(currentPassword, newPassword, token) {
  try {
    const res = await fetch('/api/owner/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (res.ok) return { success: true };
    const data = await res.json().catch(() => ({}));
    return { success: false, error: data.error || 'Failed to change password' };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
}

export async function changeOwnerUsername(newUsername, password, token) {
  try {
    const res = await fetch('/api/owner/username', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ newUsername, password })
    });
    if (res.ok) {
      const data = await res.json();
      await storage.set(OWNER_TOKEN_KEY, data.token, false);
      return { success: true };
    }
    const data = await res.json().catch(() => ({}));
    return { success: false, error: data.error || 'Failed to change username' };
  } catch (e) {
    return { success: false, error: 'Network error' };
  }
}

export async function getOwnerToken() {
  const token = await storage.get(OWNER_TOKEN_KEY, false);
  return token ? token.value : null;
}

export async function clearOwnerToken() {
  await storage.remove(OWNER_TOKEN_KEY, false);
}
