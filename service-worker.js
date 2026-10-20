const CACHE_NAME = "ciu-courses-v2";
const CORE_ASSETS = ["./index.html", "./styles.css", "./suag403-data.js", "./script.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(cacheNames
        .filter((cacheName) => (cacheName.startsWith("ciu-suag309-") || cacheName.startsWith("ciu-courses-")) && cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok || response.type === "opaque") return response;
        const responseCopy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
        return response;
      })
      .catch(() => caches.match(event.request)
        .then((cachedResponse) => cachedResponse || (event.request.mode === "navigate"
          ? caches.match("./index.html")
          : Response.error())))
  );
});