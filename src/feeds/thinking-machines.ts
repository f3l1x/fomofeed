import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const thinkingMachines: FeedSource = {
  id: "thinking-machines",
  name: "Thinking Machines Blog",
  url: "https://thinkingmachines.ai/blog/",
  category: "blogs",
  strategy: "static",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));

    // Try the site's specific selectors first
    let items = scrapeArticles($, {
      linkSelector: "a.post-item-link",
      baseUrl: "https://thinkingmachines.ai",
      titleSelectors: [".post-title", "h2", "h3"],
      dateSelectors: ["time.desktop-time", "time", ".date"],
    });

    // Fall back to generic blog links
    if (items.length === 0) {
      items = scrapeArticles($, {
        linkSelector: "li a[href^='/blog/']",
        baseUrl: "https://thinkingmachines.ai",
      });
    }

    return items;
  },
};
