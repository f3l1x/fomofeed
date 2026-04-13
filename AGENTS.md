# FomoFeed

RSS feed generator for blogs and news sites that don't provide native RSS.

## Makefile

```sh
make install          # bun install
make generate         # generate all feeds
make generate FEED=id # generate single feed
make generate-full    # generate with --full
make test             # run tests
make typecheck        # type check
make lint             # eslint
make fmt              # prettier
make ci               # install + generate + test
make clean            # rm feeds/ cache/
```

## Architecture

```
src/
  cli.ts             # CLI entry (generate / list / debug)
  lib/
    types.ts         # FeedSource + FeedItem interfaces
    constants.ts     # Shared paths (FEEDS_DIR, CACHE_DIR, ARCHIVE_DIR)
    fetcher.ts       # HTTP fetch with retries + rate limiting
    parser.ts        # Cheerio HTML parsing helpers
    rss.ts           # RSS 2.0 XML generation (uses `rss` package)
    cache.ts         # JSON file cache (per-feed, dedup by URL)
    archive.ts       # Append-only archive (persistent history)
    browser.ts       # Browser automation via Playwright
    feed-helpers.ts  # scrapeArticles() and withCache()
  feeds/
    index.ts         # Registry — exports allFeeds array
    *.ts             # One file per feed source
```

## Adding a new feed

1. Create `src/feeds/my-feed.ts` implementing `FeedSource`:

```ts
import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const myFeed: FeedSource = {
  id: "my-feed",
  name: "My Feed",
  url: "https://example.com/blog",
  category: "blogs",
  strategy: "static",
  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    return scrapeArticles($, {
      linkSelector: "a[href*='/blog/']",
      baseUrl: "https://example.com",
    });
  },
};
```

2. Register it in `src/feeds/index.ts`.

Variants: wrap with `withCache()` for paginated/browser feeds; use `fetchWithBrowser()` for JS-rendered pages.

## Key conventions

- **Runtime:** Bun only.
- **Categories:** `"news" | "blogs" | "changelogs" | "releases"`.
- **URL scheme:** `/feeds/{category}/{id}.xml` (individual), `/feeds/{category}.xml` (aggregated).
- **Archive:** append-only, deduped by URL, never cleared.
- **Deps:** cheerio, rss, playwright.
- **Always use `make` targets** — never call `bun run`, `bun test`, or `bun x` directly.
