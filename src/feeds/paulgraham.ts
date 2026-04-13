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

    $("a[href]").each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href") ?? "";
      if (!href.endsWith(".html") || href === "index.html" || href.startsWith("http")) return;
      if ($el.find("img").length && !$el.text().trim()) return;

      const title = $el.text().trim();
      if (!title) return;

      items.push({
        title,
        link: new URL(href, "https://www.paulgraham.com").href,
      });
    });

    return items;
  },
};
