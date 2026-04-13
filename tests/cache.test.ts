import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { loadCache, saveCache, mergeItems } from "../src/lib/cache.ts";
import type { FeedItem } from "../src/lib/types.ts";
import { rm, mkdir } from "node:fs/promises";
import { join } from "node:path";

const TEST_CACHE_DIR = join(import.meta.dirname ?? ".", "../cache");

describe("cache", () => {
  beforeEach(async () => {
    await mkdir(TEST_CACHE_DIR, { recursive: true });
  });

  afterEach(async () => {
    try {
      await rm(join(TEST_CACHE_DIR, "test-cache.json"), { force: true });
    } catch {
      // ignore
    }
  });

  test("loadCache returns empty array for missing cache", async () => {
    const items = await loadCache("nonexistent-feed-12345");
    expect(items).toEqual([]);
  });

  test("saveCache and loadCache round-trip", async () => {
    const items: FeedItem[] = [
      {
        title: "Test Post",
        link: "https://example.com/post-1",
        description: "A test",
        date: new Date("2024-06-01T00:00:00Z"),
        categories: ["test"],
      },
    ];

    await saveCache("test-cache", items);
    const loaded = await loadCache("test-cache");

    expect(loaded).toHaveLength(1);
    expect(loaded[0]!.title).toBe("Test Post");
    expect(loaded[0]!.link).toBe("https://example.com/post-1");
    expect(loaded[0]!.description).toBe("A test");
    expect(loaded[0]!.date).toEqual(new Date("2024-06-01T00:00:00Z"));
    expect(loaded[0]!.categories).toEqual(["test"]);
  });

  test("saveCache overwrites existing cache", async () => {
    await saveCache("test-cache", [
      { title: "Old", link: "https://example.com/old" },
    ]);
    await saveCache("test-cache", [
      { title: "New", link: "https://example.com/new" },
    ]);

    const loaded = await loadCache("test-cache");
    expect(loaded).toHaveLength(1);
    expect(loaded[0]!.title).toBe("New");
  });
});

describe("mergeItems", () => {
  test("deduplicates by URL", () => {
    const existing: FeedItem[] = [
      {
        title: "Post A",
        link: "https://example.com/a",
        date: new Date("2024-01-01"),
      },
      {
        title: "Post B",
        link: "https://example.com/b",
        date: new Date("2024-01-02"),
      },
    ];
    const fresh: FeedItem[] = [
      {
        title: "Post A Updated",
        link: "https://example.com/a",
        date: new Date("2024-01-01"),
      },
      {
        title: "Post C",
        link: "https://example.com/c",
        date: new Date("2024-01-03"),
      },
    ];

    const merged = mergeItems(existing, fresh);
    expect(merged).toHaveLength(3);
    // Fresh overwrites existing for same URL
    expect(merged.find((i) => i.link === "https://example.com/a")?.title).toBe(
      "Post A Updated",
    );
  });

  test("sorts by date descending", () => {
    const items: FeedItem[] = [
      { title: "Old", link: "https://example.com/old", date: new Date("2024-01-01") },
      { title: "New", link: "https://example.com/new", date: new Date("2024-06-01") },
      { title: "Mid", link: "https://example.com/mid", date: new Date("2024-03-01") },
    ];

    const merged = mergeItems([], items);
    expect(merged[0]!.title).toBe("New");
    expect(merged[1]!.title).toBe("Mid");
    expect(merged[2]!.title).toBe("Old");
  });

  test("handles empty inputs", () => {
    expect(mergeItems([], [])).toEqual([]);
    const items: FeedItem[] = [{ title: "A", link: "https://example.com/a" }];
    expect(mergeItems(items, [])).toHaveLength(1);
    expect(mergeItems([], items)).toHaveLength(1);
  });
});
