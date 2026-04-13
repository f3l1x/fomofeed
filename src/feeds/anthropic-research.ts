import { fetchWithBrowser } from "../lib/browser.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles, withCache } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const anthropicResearch: FeedSource = {
  id: "anthropic-research",
  name: "Anthropic Research",
  url: "https://www.anthropic.com/research",
  category: "news",
  company: "anthropic",
  strategy: "browser",

  async generate() {
    const html = await fetchWithBrowser(this.url, { waitSelector: "a[href*='/research/']" });
    const $ = parseHTML(html);
    const items = scrapeArticles($, {
      linkSelector: "a[href*='/research/']",
      baseUrl: "https://www.anthropic.com",
    });
    return withCache(this.id, items);
  },
};
