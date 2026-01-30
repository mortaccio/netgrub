const CACHE_NAME = "ifast-shell-v1";
const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./logo.svg",
  "./favicon.svg",
  "./manifest.webmanifest",
];

const API_PATHS = new Set([
  "/info",
  "/public-ip",
  "/netinfo",
  "/troubleshoot",
  "/latency",
  "/summary",
  "/diag",
  "/provider-check",
  "/dns-test",
  "/icmp",
]);

function toScopeUrl(path) {
  return new URL(path, self.location).toString();
}

self.addEventListener("install", (event) => {
  const scoped = SHELL_ASSETS.map((asset) => toScopeUrl(asset));
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(scoped)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isSameOrigin(requestUrl) {
  return new URL(requestUrl).origin === self.location.origin;
}

function isApiRequest(requestUrl) {
  const { pathname } = new URL(requestUrl);
  if (API_PATHS.has(pathname)) return true;
  return pathname.startsWith("/dns-test") || pathname.startsWith("/icmp");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(toScopeUrl("./index.html"), copy));
          return response;
        })
        .catch(() => caches.match(toScopeUrl("./index.html")))
    );
    return;
  }

  if (!isSameOrigin(request.url)) return;
  if (isApiRequest(request.url)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
