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
  waitSelector: "a[href*='/research/']:not([href*='/research/team/'])",

  async generate() {
    const selector = "a[href*='/research/']:not([href*='/research/team/'])";
    const html = await fetchWithBrowser(this.url, { waitSelector: selector });
    const $ = parseHTML(html);
    const items = scrapeArticles($, {
      linkSelector: selector,
      baseUrl: "https://www.anthropic.com",
    });
    return withCache(this.id, items);
  },
};
