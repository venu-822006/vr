// Custom service worker source for vite-plugin-pwa's "injectManifest" strategy.
// self.__WB_MANIFEST gets replaced at build time with the list of files to
// precache — this is what generateSW mode did automatically; we still want
// that (offline support), PLUS our own push notification handling, which
// generateSW mode has no hook for.

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { createHandlerBoundToURL } from "workbox-precaching";

self.skipWaiting();
cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

registerRoute(
  /^\/api\/products/,
  new StaleWhileRevalidate({
    cacheName: "products-cache",
    plugins: [new ExpirationPlugin({ maxAgeSeconds: 300 })],
  }),
  "GET"
);

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// ─── Push notifications (order status updates) ─────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: "VR Vegetables", body: event.data.text() };
  }

  const title = payload.title || "VR Vegetables";
  const options = {
    body: payload.body || "",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { orderId: payload.orderId || null },
    tag: payload.orderId ? `order-${payload.orderId}` : undefined,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Clicking the notification focuses an existing tab if one's open,
// otherwise opens a new one. (Deep-linking straight to the order's tracking
// view would need a small addition to App.jsx's routing — not wired up yet.)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    })
  );
});
