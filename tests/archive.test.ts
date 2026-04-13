import { describe, test, expect, afterEach } from "bun:test";
import { appendToArchive } from "../src/lib/archive.ts";
import type { FeedItem, FeedSource } from "../src/lib/types.ts";
import { rm, readFile } from "node:fs/promises";
import { join } from "node:path";

const ARCHIVE_DIR = join(import.meta.dirname ?? ".", "../archive");

const testSource: FeedSource = {
  id: "test-archive",
  name: "Test Archive",
  url: "https://example.com",
  category: "blogs",
  strategy: "static",
  async generate() {
    return [];
  },
};

afterEach(async () => {
  await rm(join(ARCHIVE_DIR, "blogs", "test-archive.json"), { force: true });
});

describe("archive", () => {
  test("appends new items and returns count", async () => {
    const items: FeedItem[] = [
      { title: "Post A", link: "https://example.com/a", date: new Date("2024-06-01") },
      { title: "Post B", link: "https://example.com/b", date: new Date("2024-05-01") },
    ];

    const added = await appendToArchive(testSource, items);
    expect(added).toBe(2);

    const data = JSON.parse(await readFile(join(ARCHIVE_DIR, "blogs", "test-archive.json"), "utf-8"));
    expect(data.items).toHaveLength(2);
    expect(data.items[0].link).toBe("https://example.com/a");
    expect(data.items[0].firstSeen).toBeDefined();
  });

  test("deduplicates by URL across runs", async () => {
    const run1: FeedItem[] = [
      { title: "Post A", link: "https://example.com/a", date: new Date("2024-06-01") },
    ];
    const run2: FeedItem[] = [
      { title: "Post A updated", link: "https://example.com/a", date: new Date("2024-06-01") },
      { title: "Post B", link: "https://example.com/b", date: new Date("2024-05-01") },
    ];

    await appendToArchive(testSource, run1);
    const added = await appendToArchive(testSource, run2);

    expect(added).toBe(1); // only Post B is new

    const data = JSON.parse(await readFile(join(ARCHIVE_DIR, "blogs", "test-archive.json"), "utf-8"));
    expect(data.items).toHaveLength(2);
    // Original title preserved (append-only, not updated)
    expect(data.items.find((i: { link: string }) => i.link === "https://example.com/a").title).toBe("Post A");
  });

  test("sorts by date descending", async () => {
    const items: FeedItem[] = [
      { title: "Old", link: "https://example.com/old", date: new Date("2024-01-01") },
      { title: "New", link: "https://example.com/new", date: new Date("2024-06-01") },
      { title: "Mid", link: "https://example.com/mid", date: new Date("2024-03-01") },
    ];

    await appendToArchive(testSource, items);

    const data = JSON.parse(await readFile(join(ARCHIVE_DIR, "blogs", "test-archive.json"), "utf-8"));
    expect(data.items[0].title).toBe("New");
    expect(data.items[1].title).toBe("Mid");
    expect(data.items[2].title).toBe("Old");
  });

  test("handles empty items", async () => {
    const added = await appendToArchive(testSource, []);
    expect(added).toBe(0);
  });
});
