import RSS from "rss";
import type { FeedItem, FeedSource } from "./types.ts";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { FEEDS_DIR } from "./constants.ts";
import { baseUrl } from "./config.ts";
import { stripHtml } from "./parser.ts";

function cleanDescription(s: string | undefined): string | null {
  const clean = stripHtml(s);
  return clean || null;
}

// Fixed epoch so pubDates derived from a URL hash are truly stable across runs.
// Do NOT change this without a migration plan — shifting it rewrites every
// undated item's pubDate, which makes readers re-surface old posts as new.
const STABLE_EPOCH = Date.UTC(2020, 0, 1);

function stableDate(url: string): Date {
  // Deterministic date from URL hash — gives undated posts a stable pubDate
  // so RSS readers don't re-surface them on every generation run.
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }
  // 525600 minutes = 1 year; spread hashes across a 1-year window from epoch.
  return new Date(STABLE_EPOCH + (Math.abs(hash) % 525600) * 60_000);
}

function latestItemDate(items: FeedItem[]): Date | undefined {
  let latest: Date | undefined;
  for (const item of items) {
    const d = item.date ?? stableDate(item.link);
    if (!latest || d.getTime() > latest.getTime()) latest = d;
  }
  return latest;
}

export function generateRSS(source: FeedSource, items: FeedItem[]): string {
  const feed = new RSS({
    title: source.name,
    description: `RSS feed for ${source.name}`,
    feed_url: `${baseUrl()}/feeds/${source.category}/${source.id}.xml`,
    site_url: source.url,
    language: "en",
    pubDate: latestItemDate(items),
    ttl: 60,
  });

  for (const item of items) {
    feed.item({
      title: item.title,
      url: item.link,
      description: item.description ?? "",
      date: item.date ?? stableDate(item.link),
      guid: item.link,
      categories: item.categories ?? [],
    });
  }

  return feed.xml({ indent: true });
}

export async function writeFeed(source: FeedSource, items: FeedItem[]): Promise<string> {
  const xml = generateRSS(source, items);
  const categoryDir = join(FEEDS_DIR, source.category);
  await mkdir(categoryDir, { recursive: true });
  const filePath = join(categoryDir, `${source.id}.xml`);
  await writeFile(filePath, xml, "utf-8");
  return filePath;
}

export async function writeAggregatedFeed(
  category: string,
  label: string,
  sources: FeedSource[],
  itemsByFeed: Map<string, FeedItem[]>,
): Promise<string> {
  const allItems: FeedItem[] = [];
  for (const source of sources) {
    const items = itemsByFeed.get(source.id);
    if (items) allItems.push(...items);
  }

  // Sort by date descending, undated items last
  allItems.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.getTime() - a.date.getTime();
  });

  const feed = new RSS({
    title: `FomoFeed — ${label}`,
    description: `Aggregated ${label.toLowerCase()} feed from FomoFeed`,
    feed_url: `${baseUrl()}/feeds/${category}.xml`,
    site_url: `${baseUrl()}/feeds/${category}/`,
    language: "en",
    pubDate: latestItemDate(allItems),
    ttl: 60,
  });

  for (const item of allItems) {
    feed.item({
      title: item.title,
      url: item.link,
      description: item.description ?? "",
      date: item.date ?? stableDate(item.link),
      guid: item.link,
      categories: item.categories ?? [],
    });
  }

  await mkdir(FEEDS_DIR, { recursive: true });
  const filePath = join(FEEDS_DIR, `${category}.xml`);
  await writeFile(filePath, feed.xml({ indent: true }), "utf-8");
  return filePath;
}

export async function writeJsonIndex(
  sources: FeedSource[],
  itemsByFeed: Map<string, FeedItem[]>,
): Promise<string> {
  const feeds = sources.map((source) => {
    const items = (itemsByFeed.get(source.id) ?? []).map((item) => ({
      title: stripHtml(item.title),
      link: item.link,
      description: cleanDescription(item.description),
      date: item.date?.toISOString() ?? null,
    }));
    return {
      id: source.id,
      name: source.name,
      url: source.url,
      category: source.category,
      company: source.company ?? null,
      items,
    };
  });

  const data = { generated: new Date().toISOString(), feeds };
  await mkdir(FEEDS_DIR, { recursive: true });
  const filePath = join(FEEDS_DIR, "data.json");
  await writeFile(filePath, JSON.stringify(data), "utf-8");
  return filePath;
}

export async function writeCompanyFeed(
  company: string,
  sources: FeedSource[],
  itemsByFeed: Map<string, FeedItem[]>,
): Promise<string> {
  const allItems: FeedItem[] = [];
  for (const source of sources) {
    const items = itemsByFeed.get(source.id);
    if (items) allItems.push(...items);
  }

  allItems.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.getTime() - a.date.getTime();
  });

  const label = company.charAt(0).toUpperCase() + company.slice(1);
  const feed = new RSS({
    title: `FomoFeed — ${label}`,
    description: `All ${label} feeds from FomoFeed`,
    feed_url: `${baseUrl()}/feeds/company/${company}.xml`,
    site_url: `${baseUrl()}/feeds/company/`,
    language: "en",
    pubDate: latestItemDate(allItems),
    ttl: 60,
  });

  for (const item of allItems) {
    feed.item({
      title: item.title,
      url: item.link,
      description: item.description ?? "",
      date: item.date ?? stableDate(item.link),
      guid: item.link,
      categories: item.categories ?? [],
    });
  }

  const companyDir = join(FEEDS_DIR, "company");
  await mkdir(companyDir, { recursive: true });
  const filePath = join(companyDir, `${company}.xml`);
  await writeFile(filePath, feed.xml({ indent: true }), "utf-8");
  return filePath;
}
