import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML, parseDate } from "../lib/parser.ts";
import { withCache } from "../lib/feed-helpers.ts";
import type { FeedSource, FeedItem } from "../lib/types.ts";

const BASE_URL = "https://www.surgehq.ai";

export const surgeAi: FeedSource = {
  id: "surge-ai",
  name: "Surge AI Blog",
  url: `${BASE_URL}/blog`,
  category: "blogs",
  strategy: "paginated",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    const items: FeedItem[] = [];
    const seen = new Set<string>();

    // Webflow CMS: each card is `.blog-hero-cms-item` with an overlay
    // `a.blog-hero-cms-item-link` (empty) and sibling divs for text.
    $(".blog-hero-cms-item").each((_, el) => {
      const $el = $(el);
      const href = $el.find("a.blog-hero-cms-item-link").first().attr("href") ?? "";
      if (!href) return;

      let link: string;
      try {
        link = new URL(href, BASE_URL).href;
      } catch {
        return;
      }
      if (seen.has(link)) return;
      seen.add(link);

      const title = $el.find(".blog-hero-cms-item-title").first().text().trim();
      if (!title) return;

      const desc = $el.find(".blog-hero-cms-item-desc").first().text().trim();
      const dateStr = $el.find(".blog-hero-cms-item-date").first().text().trim();

      items.push({
        title,
        link,
        description: desc || undefined,
        date: parseDate(dateStr),
      });
    });

    return withCache(this.id, items);
  },
};
