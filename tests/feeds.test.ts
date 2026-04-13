import { describe, test, expect } from "bun:test";
import { allFeeds } from "../src/feeds/index.ts";

describe("feed registry", () => {
  test("has 29 feeds registered", () => {
    expect(allFeeds).toHaveLength(29);
  });

  test("all feeds have required fields", () => {
    for (const feed of allFeeds) {
      expect(feed.id).toBeTruthy();
      expect(feed.name).toBeTruthy();
      expect(feed.url).toBeTruthy();
      expect(["static", "paginated", "browser", "github-release"]).toContain(feed.strategy);
      expect(["news", "blogs", "changelogs", "releases"]).toContain(feed.category);
      expect(typeof feed.generate).toBe("function");
    }
  });

  test("all feed IDs are unique", () => {
    const ids = allFeeds.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("all feed URLs are valid", () => {
    for (const feed of allFeeds) {
      expect(() => new URL(feed.url)).not.toThrow();
    }
  });

  test("has all four strategy types", () => {
    const strategies = new Set(allFeeds.map((f) => f.strategy));
    expect(strategies.has("static")).toBe(true);
    expect(strategies.has("paginated")).toBe(true);
    expect(strategies.has("browser")).toBe(true);
    expect(strategies.has("github-release")).toBe(true);
  });

  test("has all four category types", () => {
    const categories = new Set(allFeeds.map((f) => f.category));
    expect(categories.has("news")).toBe(true);
    expect(categories.has("blogs")).toBe(true);
    expect(categories.has("changelogs")).toBe(true);
  });

  test("feed IDs match expected slug format", () => {
    for (const feed of allFeeds) {
      expect(feed.id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
