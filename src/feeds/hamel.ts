import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML, extractText, extractLink, parseDate } from "../lib/parser.ts";
import type { FeedSource, FeedItem } from "../lib/types.ts";

const BASE_URL = "https://hamel.dev";

export const hamel: FeedSource = {
  id: "hamel",
  name: "Hamel Husain's Blog",
  url: BASE_URL,
  category: "blogs",
  strategy: "static",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    const items: FeedItem[] = [];

    // Quarto listing table
    $("#listing-blog-listings tbody tr").each((_, el) => {
      const $el = $(el);
      const title = extractText($, [".listing-title", "td a"], $el);
      const link = extractLink($, ".listing-title, td a", BASE_URL, $el);
      if (!title || !link) return;

      items.push({
        title,
        link,
        date: parseDate(extractText($, [".listing-date", "td:first-child"], $el)),
      });
    });

    return items;
  },
};
