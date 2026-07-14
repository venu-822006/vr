// ---------------------------------------------------------------------------
// AUTH PRIMITIVES
// ---------------------------------------------------------------------------
// Small, dependency-free helpers used by both the customer OTP flow and the
// owner password flow. Hashing uses the browser's built-in Web Crypto API
// (SHA-256) so plain-text passwords are never stored. If Web Crypto isn't
// available (e.g. a non-HTTPS/non-localhost origin), it falls back to a
// simple non-cryptographic hash so the app still works — just note that the
// fallback is NOT secure and is only meant to keep the demo functional.

const hasWebCrypto = typeof crypto !== "undefined" && !!crypto.subtle;

function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

async function sha256Hex(text) {
  if (hasWebCrypto) {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return djb2Hash(text);
}

export function generateSalt() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function generateToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return generateSalt() + generateSalt();
}

export async function hashPassword(password, salt) {
  return sha256Hex(`${salt}:${password}`);
}

export async function verifyPassword(password, salt, hash) {
  const computed = await hashPassword(password, salt);
  return computed === hash;
}

// 4-digit OTP — plenty for a delivery-app login, easy to read/type on mobile.
export function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export const OTP_TTL_MS = 5 * 60 * 1000; // OTP is valid for 5 minutes
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // stay logged in for 30 days
