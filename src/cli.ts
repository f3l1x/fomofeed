import { allFeeds, ALL_CATEGORIES, CATEGORY_LABELS, feedsByCategory, allCompanies, feedsByCompany } from "./feeds/index.ts";
import { writeFeed, writeAggregatedFeed, writeCompanyFeed, writeJsonIndex } from "./lib/rss.ts";
import { appendToArchive } from "./lib/archive.ts";
import { loadCache } from "./lib/cache.ts";
import { closeBrowser } from "./lib/browser.ts";
import { CACHE_DIR } from "./lib/constants.ts";
import type { FeedItem, FeedSource } from "./lib/types.ts";
import { rm } from "node:fs/promises";

function parseArgs(argv: string[]): { command: string; flags: Record<string, string> } {
  const args = argv.slice(2);
  const command = args[0] ?? "";
  const flags: Record<string, string> = {};

  for (const arg of args.slice(1)) {
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq !== -1) {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      } else {
        flags[arg.slice(2)] = "true";
      }
    }
  }

  return { command, flags };
}

async function generate(feedId?: string, full?: boolean): Promise<void> {
  let feeds: FeedSource[];

  if (feedId) {
    const found = allFeeds.find((f) => f.id === feedId);
    if (!found) {
      console.error(`Unknown feed "${feedId}". Run 'list' to see available feeds.`);
      process.exit(1);
    }
    feeds = [found];
  } else {
    feeds = allFeeds;
  }

  if (full) {
    console.log("Clearing cache...");
    await rm(CACHE_DIR, { recursive: true, force: true });
  }

  const CONCURRENCY = 3;
  console.log(`Generating ${feeds.length} feed(s) (concurrency: ${CONCURRENCY})...\n`);
  let ok = 0;
  let fail = 0;
  const itemsByFeed = new Map<string, FeedItem[]>();

  let next = 0;
  async function worker() {
    while (next < feeds.length) {
      const feed = feeds[next++]!;
      const label = `[${feed.category}/${feed.strategy}] ${feed.name}`;
      console.log(`  ⏳ ${label}...`);
      const t = Date.now();
      try {
        const items = await feed.generate();
        const path = await writeFeed(feed, items);
        const archived = await appendToArchive(feed, items);
        itemsByFeed.set(feed.id, items);
        const archiveNote = archived > 0 ? `, +${archived} archived` : "";
        console.log(`  ✅ ${label} — ${items.length} items (${Date.now() - t}ms) -> ${path}${archiveNote}`);
        ok++;
      } catch (err) {
        console.log(`  ❌ ${label} — FAILED (${Date.now() - t}ms)`);
        console.error(`    ${err instanceof Error ? err.message : String(err)}`);
        fail++;
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  // Generate aggregated category feeds
  console.log("\nGenerating aggregated feeds...\n");
  for (const category of ALL_CATEGORIES) {
    const categoryFeeds = feedsByCategory(category);
    // Only aggregate if we generated at least one feed in this category
    const hasItems = categoryFeeds.some((f) => itemsByFeed.has(f.id));
    if (!hasItems) continue;

    const t = Date.now();
    const label = CATEGORY_LABELS[category];
    process.stdout.write(`  [aggregated] ${label}... `);
    const path = await writeAggregatedFeed(category, label, categoryFeeds, itemsByFeed);
    const total = categoryFeeds.reduce((n, f) => n + (itemsByFeed.get(f.id)?.length ?? 0), 0);
    console.log(`${total} items (${Date.now() - t}ms) -> ${path}`);
  }

  // Generate aggregated company feeds
  console.log("\nGenerating company feeds...\n");
  for (const company of allCompanies()) {
    const companyFeeds = feedsByCompany(company);
    const hasItems = companyFeeds.some((f) => itemsByFeed.has(f.id));
    if (!hasItems) continue;

    const t = Date.now();
    process.stdout.write(`  [company] ${company}... `);
    const path = await writeCompanyFeed(company, companyFeeds, itemsByFeed);
    const total = companyFeeds.reduce((n, f) => n + (itemsByFeed.get(f.id)?.length ?? 0), 0);
    console.log(`${total} items (${Date.now() - t}ms) -> ${path}`);
  }

  // Generate JSON index for web app. For feeds not generated in this run,
  // fall back to cached items so the index reflects the full catalog.
  for (const feed of allFeeds) {
    if (itemsByFeed.has(feed.id)) continue;
    const cached = await loadCache(feed.id);
    if (cached.length > 0) itemsByFeed.set(feed.id, cached);
  }
  const jsonPath = await writeJsonIndex(allFeeds, itemsByFeed);
  console.log(`\nJSON index -> ${jsonPath}`);

  await closeBrowser();

  console.log(`\nDone: ${ok} ok, ${fail} failed.`);
  if (fail > 0) process.exit(1);
}

function list(): void {
  const col = {
    id: Math.max(4, ...allFeeds.map((f) => f.id.length)) + 2,
    name: Math.max(4, ...allFeeds.map((f) => f.name.length)) + 2,
    category: Math.max(8, ...allFeeds.map((f) => f.category.length)) + 2,
  };
  console.log(`\n${allFeeds.length} feeds:\n`);
  console.log(`${"ID".padEnd(col.id)}${"Name".padEnd(col.name)}${"Category".padEnd(col.category)}${"Strategy".padEnd(12)}URL`);
  console.log("-".repeat(100));
  for (const f of allFeeds) {
    console.log(`${f.id.padEnd(col.id)}${f.name.padEnd(col.name)}${f.category.padEnd(col.category)}${f.strategy.padEnd(12)}${f.url}`);
  }
  console.log();
}

async function debug(feedId: string): Promise<void> {
  const feed = allFeeds.find((f) => f.id === feedId);
  if (!feed) {
    console.error(`Unknown feed "${feedId}". Run 'list' to see available feeds.`);
    process.exit(1);
  }

  console.error(`Fetching raw HTML for "${feed.name}" (${feed.strategy}) from ${feed.url}...\n`);

  let html: string;
  if (feed.strategy === "browser") {
    const { fetchWithBrowser } = await import("./lib/browser.ts");
    html = await fetchWithBrowser(feed.url, { waitSelector: feed.waitSelector });
    await closeBrowser();
  } else {
    const { fetchPage } = await import("./lib/fetcher.ts");
    html = await fetchPage(feed.url);
  }

  console.log(html);
}

const USAGE = `
FomoFeed - RSS feed generator

Commands:
  generate [--feed=ID] [--full]   Generate feeds (--full clears cache first)
  list                            List all feeds
  debug --feed=ID                 Dump raw HTML for a feed (for debugging)
`.trim();

async function main(): Promise<void> {
  const { command, flags } = parseArgs(process.argv);

  switch (command) {
    case "generate":
      await generate(flags["feed"], flags["full"] === "true");
      break;
    case "list":
      list();
      break;
    case "debug":
      if (!flags["feed"]) {
        console.error("Usage: debug --feed=ID");
        process.exit(1);
      }
      await debug(flags["feed"]);
      break;
    default:
      console.log(USAGE);
      if (command && command !== "help" && !command.startsWith("-")) process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
