import { fetchWithBrowser } from "../lib/browser.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles, withCache } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const anthropicRed: FeedSource = {
  id: "anthropic-red",
  name: "Anthropic Red Blog",
  url: "https://red.anthropic.com",
  category: "news",
  company: "anthropic",
  strategy: "browser",
  waitSelector: "a.note",

  async generate() {
    const html = await fetchWithBrowser(this.url, {
      waitSelector: "a.note",
    });
    const $ = parseHTML(html);
    const items = scrapeArticles($, {
      linkSelector: "a.note",
      baseUrl: "https://red.anthropic.com",
      titleSelectors: ["h3"],
      descriptionSelectors: [".description"],
    });
    return withCache(this.id, items);
  },
};
