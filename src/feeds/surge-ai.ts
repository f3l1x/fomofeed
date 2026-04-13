import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles, withCache } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const surgeAi: FeedSource = {
  id: "surge-ai",
  name: "Surge AI Blog",
  url: "https://www.surgehq.ai/blog",
  category: "blogs",
  strategy: "paginated",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    const items = scrapeArticles($, {
      linkSelector: "a[href*='/blog/']",
      baseUrl: "https://www.surgehq.ai",
    });
    return withCache(this.id, items);
  },
};
