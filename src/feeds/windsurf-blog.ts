import { fetchWithBrowser } from "../lib/browser.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles, withCache } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const windsurfBlog: FeedSource = {
  id: "windsurf-blog",
  name: "Windsurf Blog",
  url: "https://windsurf.com/blog",
  category: "blogs",
  company: "windsurf",
  strategy: "browser",
  waitSelector: "a[href^='/blog/']",

  async generate() {
    const html = await fetchWithBrowser(this.url, {
      waitSelector: "a[href^='/blog/']",
    });
    const $ = parseHTML(html);
    return withCache(
      this.id,
      scrapeArticles($, {
        linkSelector: "a[href^='/blog/']",
        baseUrl: "https://windsurf.com",
        titleSelectors: ["h3", "h2", ".subheading2"],
        descriptionSelectors: ["p.body3", "p.line-clamp-3"],
        dateSelectors: ["p.caption1:not(.line-clamp-3)", "time", ".date"],
      }),
    );
  },
};
