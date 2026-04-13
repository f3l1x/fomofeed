import { fetchWithBrowser } from "../lib/browser.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles, withCache } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const xaiNews: FeedSource = {
  id: "xai-news",
  name: "X.AI News",
  url: "https://x.ai/news",
  category: "news",
  company: "xai",
  strategy: "browser",

  async generate() {
    const html = await fetchWithBrowser(this.url, { waitSelector: "a[href*='/news/']" });
    const $ = parseHTML(html);
    const items = scrapeArticles($, {
      linkSelector: "a[href*='/news/']",
      baseUrl: "https://x.ai",
    });
    return withCache(this.id, items);
  },
};
