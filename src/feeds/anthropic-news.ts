import { fetchWithBrowser } from "../lib/browser.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles, withCache } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const anthropicNews: FeedSource = {
  id: "anthropic-news",
  name: "Anthropic News",
  url: "https://www.anthropic.com/news",
  category: "news",
  company: "anthropic",
  strategy: "browser",
  waitSelector: "a[href*='/news/']",

  async generate() {
    const html = await fetchWithBrowser(this.url, { waitSelector: "a[href*='/news/']" });
    const $ = parseHTML(html);
    const items = scrapeArticles($, {
      linkSelector: "a[href*='/news/']",
      baseUrl: "https://www.anthropic.com",
    });
    return withCache(this.id, items);
  },
};
