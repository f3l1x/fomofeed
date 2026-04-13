import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { ARCHIVE_DIR } from "./constants.ts";
import type { FeedItem, FeedSource, ArchiveData, ArchivedItem } from "./types.ts";

function toArchived(item: FeedItem, now: string): ArchivedItem {
  return {
    title: item.title,
    link: item.link,
    description: item.description,
    date: item.date?.toISOString(),
    categories: item.categories,
    firstSeen: now,
  };
}

async function loadArchive(feedId: string, category: string): Promise<ArchiveData> {
  try {
    const data = await readFile(join(ARCHIVE_DIR, category, `${feedId}.json`), "utf-8");
    return JSON.parse(data);
  } catch {
    return { feedId, items: [] };
  }
}

async function saveArchive(archive: ArchiveData, category: string): Promise<string> {
  const dir = join(ARCHIVE_DIR, category);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${archive.feedId}.json`);
  await writeFile(filePath, JSON.stringify(archive, null, 2), "utf-8");
  return filePath;
}

export async function appendToArchive(source: FeedSource, items: FeedItem[]): Promise<number> {
  const archive = await loadArchive(source.id, source.category);
  const existing = new Set(archive.items.map((i) => i.link));
  const now = new Date().toISOString();

  let added = 0;
  for (const item of items) {
    if (!existing.has(item.link)) {
      archive.items.push(toArchived(item, now));
      existing.add(item.link);
      added++;
    }
  }

  // Sort by date descending, undated last
  archive.items.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  await saveArchive(archive, source.category);
  return added;
}
