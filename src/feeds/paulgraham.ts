import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML } from "../lib/parser.ts";
import type { FeedSource, FeedItem } from "../lib/types.ts";

export const paulgraham: FeedSource = {
  id: "paulgraham",
  name: "Paul Graham Essays",
  url: "https://www.paulgraham.com/articles.html",
  category: "blogs",
  strategy: "static",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    const items: FeedItem[] = [];

    const seen = new Set<string>();
    const EXCLUDE = new Set(["index.html", "rss.html"]);

    $("a[href]").each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href") ?? "";
      if (!href.endsWith(".html") || EXCLUDE.has(href) || href.startsWith("http")) return;
      if ($el.find("img").length && !$el.text().trim()) return;

      const title = $el.text().trim();
      if (!title) return;

      const link = new URL(href, "https://www.paulgraham.com").href;
      if (seen.has(link)) return;
      seen.add(link);

      items.push({ title, link });
    });

    return items;
  },
};
