import { fetchWithBrowser } from "../lib/browser.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles, withCache } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const anthropicEngineering: FeedSource = {
  id: "anthropic-engineering",
  name: "Anthropic Engineering",
  url: "https://www.anthropic.com/engineering",
  category: "news",
  company: "anthropic",
  strategy: "browser",
  waitSelector: "a[href*='/engineering/']",

  async generate() {
    const html = await fetchWithBrowser(this.url, { waitSelector: "a[href*='/engineering/']" });
    const $ = parseHTML(html);
    const items = scrapeArticles($, {
      linkSelector: "a[href*='/engineering/']",
      baseUrl: "https://www.anthropic.com",
    });
    return withCache(this.id, items);
  },
};
