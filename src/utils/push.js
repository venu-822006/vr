// Browser push notifications for order status updates.
// Gracefully does nothing on browsers/contexts that don't support it
// (Safari < 16, HTTP without localhost, private/incognito restrictions, etc.)

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

// vite-plugin-pwa (registerType: "autoUpdate") already registers /sw.js on
// page load — this just waits for that registration to become active,
// rather than registering a second, redundant one.
async function getServiceWorkerRegistration() {
  if (!isPushSupported()) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch (e) {
    console.error("Service worker not ready:", e);
    return null;
  }
}

// Returns 'granted' | 'denied' | 'default' | 'unsupported'
export function getPushPermissionState() {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

export async function subscribeToPush(token) {
  if (!isPushSupported()) throw new Error("Push notifications aren't supported in this browser.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted.");

  const keyRes = await fetch("/api/push/vapid-public-key");
  if (!keyRes.ok) throw new Error("Push notifications aren't configured on the server.");
  const { publicKey } = await keyRes.json();

  const registration = await getServiceWorkerRegistration();
  if (!registration) throw new Error("Couldn't reach the service worker.");

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ subscription }),
  });
  if (!res.ok) throw new Error("Couldn't save your subscription. Please try again.");

  return subscription;
}

export async function unsubscribeFromPush(token) {
  if (!isPushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return;

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await subscription.unsubscribe();

  await fetch("/api/push/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  }).catch(() => {}); // best-effort — the local unsubscribe already succeeded
}

export async function isCurrentlySubscribed() {
  if (!isPushSupported()) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;
  const subscription = await registration.pushManager.getSubscription();
  return !!subscription;
}
