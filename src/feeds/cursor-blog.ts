import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML, parseDate } from "../lib/parser.ts";
import { withCache } from "../lib/feed-helpers.ts";
import type { FeedSource, FeedItem } from "../lib/types.ts";

const BASE_URL = "https://cursor.com";

export const cursorBlog: FeedSource = {
  id: "cursor-blog",
  name: "Cursor Blog",
  url: `${BASE_URL}/blog`,
  category: "blogs",
  company: "cursor",
  strategy: "paginated",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    const items: FeedItem[] = [];
    const seen = new Set<string>();

    $("a[href^='/blog/']").each((_, el) => {
      const href = $(el).attr("href") ?? "";
      if (!href || href === "/blog" || href === "/blog/" || href.includes("/topic/")) return;

      const link = new URL(href, BASE_URL).href;
      if (seen.has(link)) return;
      seen.add(link);

      const $el = $(el);
      // Cursor cards have structured children: <time>, <span> (category),
      // <p> (title), <p> (description), <span> (author)
      const title = $el.find("p").first().text().trim();
      if (!title) return;

      const desc = $el.find("p").eq(1).text().trim();
      const dateStr = $el.find("time").first().text().trim();
      const category = $el.find("span").first().text().trim();

      items.push({
        title,
        link,
        description: desc || undefined,
        date: parseDate(dateStr),
        categories: category ? [category] : undefined,
      });
    });

    return withCache(this.id, items);
  },
};
