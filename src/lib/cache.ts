import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { CACHE_DIR } from "./constants.ts";
import type { FeedItem, CacheData, CachedItem } from "./types.ts";

function toCache(item: FeedItem): CachedItem {
  return {
    title: item.title,
    link: item.link,
    description: item.description,
    date: item.date?.toISOString(),
    categories: item.categories,
  };
}

function fromCache(cached: CachedItem): FeedItem {
  return {
    title: cached.title,
    link: cached.link,
    description: cached.description,
    date: cached.date ? new Date(cached.date) : undefined,
    categories: cached.categories,
  };
}

export async function loadCache(feedId: string): Promise<FeedItem[]> {
  try {
    const data = await readFile(join(CACHE_DIR, `${feedId}.json`), "utf-8");
    const cache: CacheData = JSON.parse(data);
    return cache.items.map(fromCache);
  } catch {
    return [];
  }
}

export async function saveCache(feedId: string, items: FeedItem[]): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  const cache: CacheData = {
    feedId,
    items: items.map(toCache),
    lastUpdated: new Date().toISOString(),
  };
  await writeFile(join(CACHE_DIR, `${feedId}.json`), JSON.stringify(cache, null, 2), "utf-8");
}

export function mergeItems(existing: FeedItem[], fresh: FeedItem[]): FeedItem[] {
  const seen = new Map<string, FeedItem>();
  for (const item of existing) seen.set(item.link, item);
  for (const item of fresh) seen.set(item.link, item);

  return Array.from(seen.values()).sort((a, b) => {
    return (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0);
  });
}
