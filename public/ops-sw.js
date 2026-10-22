const CACHE = "naturalizer-ops-v2";
const PRECACHE = [
  "/ops/manifest.webmanifest",
  "/ops/icon-192.png",
  "/ops/icon-512.png",
  "/ops/maskable-512.png",
  "/ops/apple-touch-icon.png",
];

const OFFLINE_HTML = `<!doctype html>
<html lang="zh-HK">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#070b12" />
    <title>Naturalizer Ops · 離線</title>
    <style>
      *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:#070b12;color:#f4f7fc;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:24px}
      main{max-width:320px;text-align:center}h1{font-size:24px;margin:0 0 10px}p{color:#8e9bb0;font-size:14px;line-height:1.6;margin:0 0 24px}
      a{display:inline-flex;padding:12px 18px;border-radius:12px;background:#67a3ff;color:#fff;text-decoration:none;font-weight:700;font-size:14px}
    </style>
  </head>
  <body>
    <main>
      <h1>目前離線</h1>
      <p>後台需要網絡連線。請檢查連線後再試。</p>
      <a href="/ops">重新載入</a>
    </main>
  </body>
</html>`;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(OFFLINE_HTML, {
            status: 503,
            headers: { "content-type": "text/html; charset=utf-8" },
          })
      )
    );
    return;
  }

  const cacheable =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/ops/icon-") ||
    url.pathname.startsWith("/ops/maskable-") ||
    url.pathname === "/ops/apple-touch-icon.png" ||
    url.pathname === "/ops/manifest.webmanifest";

  if (!cacheable) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: "Naturalizer Ops",
      body: "有新訂單或後台更新。",
    };
  }

  const title = payload.title || "Naturalizer Ops";
  const options = {
    body: payload.body || "請開啟後台查看。",
    icon: payload.icon || "/ops/icon-192.png",
    badge: payload.badge || "/ops/icon-192.png",
    tag: payload.tag || "naturalizer-ops",
    data: { url: payload.url || "/ops" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = new URL(
    event.notification.data?.url || "/ops",
    self.location.origin
  ).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        for (const client of windows) {
          if (client.url.startsWith(self.location.origin) && "focus" in client) {
            client.navigate(target).catch(() => {});
            return client.focus();
          }
        }

        return clients.openWindow(target);
      })
  );
});
