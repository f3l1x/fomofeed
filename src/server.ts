import { join, resolve, normalize, extname } from "node:path";
import { allFeeds, ALL_CATEGORIES, CATEGORY_LABELS, feedsByCategory } from "./feeds/index.ts";
import { FEEDS_DIR } from "./lib/constants.ts";
import type { FeedCategory, FeedSource } from "./lib/types.ts";

const PUBLIC_DIR = resolve(import.meta.dirname ?? ".", "../public");

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
};

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".xml": "application/rss+xml; charset=utf-8",
};

function withHeaders(response: Response): Response {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

function notFound(): Response {
  return withHeaders(new Response("Not Found", { status: 404, headers: { "Content-Type": "text/plain" } }));
}

function renderRssIndex(): string {
  const rssIcon = `<svg class="rss-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/></svg>`;

  const sections = ALL_CATEGORIES
    .map((category) => {
      const feeds = feedsByCategory(category);
      if (feeds.length === 0) return "";
      const label = CATEGORY_LABELS[category];
      const items = feeds
        .map(
          (f) => `          <li class="feed-item">
            <div class="feed-info">
              <span class="feed-name">${escapeHtml(f.name)}</span>
              <span class="feed-url">${escapeHtml(f.url)}</span>
            </div>
            <div class="feed-actions">
              <a href="/feeds/${f.category}/${f.id}.xml" class="btn btn-subscribe">${rssIcon} Subscribe</a>
              <a href="${escapeHtml(f.url)}" class="btn btn-source" target="_blank" rel="noopener">Source</a>
            </div>
          </li>`,
        )
        .join("\n");
      return `      <section class="feed-group">
        <h2>${label} (${feeds.length}) <a href="/feeds/${category}.xml" class="btn btn-aggregated">${rssIcon} All ${label}</a></h2>
        <ul class="feed-list">
${items}
        </ul>
      </section>`;
    })
    .filter(Boolean)
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FomoFeed — RSS Directory</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background: #0f0f0f; color: #e0e0e0; line-height: 1.6; min-height: 100vh; }
    .container { max-width: 860px; margin: 0 auto; padding: 3rem 1.5rem; }
    header { text-align: center; margin-bottom: 3rem; }
    h1 { font-size: 2.25rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem; letter-spacing: -0.02em; }
    header p { color: #888; font-size: 1.05rem; }
    .feed-group { margin-bottom: 2.5rem; }
    .feed-group h2 { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid #222; }
    .feed-list { list-style: none; }
    .feed-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-radius: 8px; transition: background 0.15s ease; }
    .feed-item:hover { background: #1a1a1a; }
    .feed-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; flex: 1; }
    .feed-name { font-weight: 500; color: #f0f0f0; font-size: 0.95rem; }
    .feed-url { color: #555; font-size: 0.78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .feed-actions { display: flex; gap: 0.5rem; flex-shrink: 0; margin-left: 1rem; }
    .btn { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 500; text-decoration: none; border-radius: 6px; transition: all 0.15s ease; white-space: nowrap; }
    .btn-subscribe { background: #1e3a2f; color: #4ade80; border: 1px solid #2d5a45; }
    .btn-subscribe:hover { background: #254d3b; border-color: #3a7a5a; }
    .btn-source { background: #1a1a2e; color: #818cf8; border: 1px solid #2a2a4e; }
    .btn-source:hover { background: #22224a; border-color: #3a3a6e; }
    .btn-aggregated { background: #2a1a1a; color: #f0a050; border: 1px solid #4a2a1a; font-size: 0.72rem; margin-left: 0.5rem; vertical-align: middle; }
    .btn-aggregated:hover { background: #3a2a1a; border-color: #6a3a2a; text-decoration: none; }
    .rss-icon { width: 12px; height: 12px; }
    footer { text-align: center; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #1a1a1a; color: #444; font-size: 0.82rem; }
    footer a { color: #666; text-decoration: none; }
    footer a:hover { color: #888; }
    @media (max-width: 600px) { .container { padding: 2rem 1rem; } h1 { font-size: 1.75rem; } .feed-item { flex-direction: column; align-items: flex-start; gap: 0.5rem; } .feed-actions { margin-left: 0; } }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>FomoFeed</h1>
      <p>RSS feeds for sites that don't have them</p>
    </header>
    <main>
${sections}
    </main>
    <footer>
      <p>FomoFeed &mdash; ${allFeeds.length} feeds, updated hourly.</p>
    </footer>
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

let rssIndexCache: string | null = null;

async function serveStaticFile(filePath: string, cacheControl = "public, max-age=3600"): Promise<Response | null> {
  const resolved = resolve(filePath);
  const file = Bun.file(resolved);
  if (!(await file.exists())) return null;

  const ext = extname(resolved);
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  return withHeaders(new Response(file, {
    headers: { "Content-Type": contentType, "Cache-Control": cacheControl },
  }));
}

export function startServer(port: number): void {
  Bun.serve({
    port,

    async fetch(req: Request): Promise<Response> {
      const pathname = new URL(req.url).pathname;

      // RSS directory page
      if (pathname === "/rss" || pathname === "/rss/") {
        rssIndexCache ??= renderRssIndex();
        return withHeaders(new Response(rssIndexCache, {
          headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300" },
        }));
      }

      // Health check
      if (pathname === "/health") {
        return withHeaders(new Response(JSON.stringify({ status: "ok" }), {
          headers: { "Content-Type": "application/json" },
        }));
      }

      // Feed data JSON
      if (pathname === "/feeds/data.json") {
        const resp = await serveStaticFile(join(FEEDS_DIR, "data.json"), "public, max-age=300");
        if (resp) {
          resp.headers.set("Access-Control-Allow-Origin", "*");
          return resp;
        }
        return notFound();
      }

      // XML feeds
      if (pathname.startsWith("/feeds/") && pathname.endsWith(".xml")) {
        const relative = pathname.slice("/feeds/".length);
        if (relative.includes("..") || relative.includes("\\") || relative.includes("\0")) {
          return notFound();
        }

        const parts = relative.split("/");
        if (parts.length > 2) return notFound();

        const resolvedPath = resolve(FEEDS_DIR, relative);
        if (!resolvedPath.startsWith(normalize(FEEDS_DIR) + "/")) return notFound();

        const resp = await serveStaticFile(resolvedPath, "public, max-age=3600");
        return resp ?? notFound();
      }

      // Astro static files from public/
      // Try exact path first, then index.html for SPA-like routing
      if (pathname !== "/") {
        const safePath = pathname.replace(/\.\./g, "");
        const resp = await serveStaticFile(join(PUBLIC_DIR, safePath), "public, max-age=3600");
        if (resp) return resp;
      }

      // Serve index.html for / and any unmatched route (SPA fallback)
      const indexResp = await serveStaticFile(join(PUBLIC_DIR, "index.html"), "public, max-age=300");
      if (indexResp) return indexResp;

      return notFound();
    },
  });

  console.log(`FomoFeed server listening on http://localhost:${port}`);
}
