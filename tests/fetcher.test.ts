import { describe, test, expect } from "bun:test";
import { fetchPage } from "../src/lib/fetcher.ts";

describe("fetcher", () => {
  test("fetches a real page successfully", async () => {
    const html = await fetchPage("https://example.com");
    expect(html).toContain("Example Domain");
    expect(html).toContain("<html");
  });

  test("throws on non-existent domain", async () => {
    await expect(
      fetchPage("https://this-domain-does-not-exist-12345.com"),
    ).rejects.toThrow("Failed to fetch");
  }, 30_000);
});
