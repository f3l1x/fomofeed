import { describe, test, expect } from "bun:test";
import { generateRSS } from "../src/lib/rss.ts";
import type { FeedSource, FeedItem } from "../src/lib/types.ts";

const mockSource: FeedSource = {
  id: "test-feed",
  name: "Test Feed",
  url: "https://example.com/blog",
  category: "blogs",
  strategy: "static",
  generate: async () => [],
};

const mockItems: FeedItem[] = [
  {
    title: "First Post",
    link: "https://example.com/blog/first",
    description: "The first post",
    date: new Date("2024-06-01T12:00:00Z"),
    categories: ["tech", "news"],
  },
  {
    title: "Second Post",
    link: "https://example.com/blog/second",
    description: "The second post",
    date: new Date("2024-06-02T12:00:00Z"),
  },
  {
    title: "No Date Post",
    link: "https://example.com/blog/no-date",
  },
];

describe("RSS generation", () => {
  test("generates valid RSS 2.0 XML", () => {
    const xml = generateRSS(mockSource, mockItems);
    expect(xml).toContain("<?xml");
    expect(xml).toContain("<rss");
    expect(xml).toContain('version="2.0"');
    expect(xml).toContain("<channel>");
  });

  test("includes feed metadata", () => {
    const xml = generateRSS(mockSource, mockItems);
    expect(xml).toContain("<title><![CDATA[Test Feed]]></title>");
    expect(xml).toContain("https://example.com/blog");
    expect(xml).toContain("<![CDATA[en]]></language>");
    expect(xml).toContain("<ttl>60</ttl>");
  });

  test("includes all items", () => {
    const xml = generateRSS(mockSource, mockItems);
    expect(xml).toContain("First Post");
    expect(xml).toContain("Second Post");
    expect(xml).toContain("No Date Post");
    // Count <item> tags
    const itemCount = (xml.match(/<item>/g) ?? []).length;
    expect(itemCount).toBe(3);
  });

  test("includes item links as guid", () => {
    const xml = generateRSS(mockSource, mockItems);
    expect(xml).toContain("https://example.com/blog/first");
    expect(xml).toContain("https://example.com/blog/second");
  });

  test("includes categories", () => {
    const xml = generateRSS(mockSource, mockItems);
    expect(xml).toContain("<category><![CDATA[tech]]></category>");
    expect(xml).toContain("<category><![CDATA[news]]></category>");
  });

  test("handles items with no date (stable fallback)", () => {
    const xml = generateRSS(mockSource, [
      { title: "No Date", link: "https://example.com/no-date" },
    ]);
    expect(xml).toContain("<pubDate>");
    expect(xml).toContain("No Date");
  });

  test("produces deterministic dates for same URL", () => {
    const items: FeedItem[] = [
      { title: "A", link: "https://example.com/stable" },
    ];
    const xml1 = generateRSS(mockSource, items);
    const xml2 = generateRSS(mockSource, items);
    // Extract pubDate from items (not channel)
    const dates1 = xml1.match(/<pubDate>([^<]+)<\/pubDate>/g) ?? [];
    const dates2 = xml2.match(/<pubDate>([^<]+)<\/pubDate>/g) ?? [];
    // The item pubDate (last one) should be the same
    expect(dates1[dates1.length - 1]).toBe(dates2[dates2.length - 1]);
  });

  test("wraps content in CDATA to prevent XML injection", () => {
    const items: FeedItem[] = [
      {
        title: "Test <script>alert('xss')</script>",
        link: "https://example.com/xss",
        description: '<img onerror="alert(1)" src="x">',
      },
    ];
    const xml = generateRSS(mockSource, items);
    // RSS library wraps content in CDATA sections
    expect(xml).toContain("<![CDATA[Test <script>");
    expect(xml).toContain("<![CDATA[<img onerror");
  });

  test("handles empty items array", () => {
    const xml = generateRSS(mockSource, []);
    expect(xml).toContain("<channel>");
    const itemCount = (xml.match(/<item>/g) ?? []).length;
    expect(itemCount).toBe(0);
  });
});
