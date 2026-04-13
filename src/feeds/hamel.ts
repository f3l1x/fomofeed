import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML, extractText, extractLink } from "../lib/parser.ts";
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

      // Quarto exposes a Unix-ms timestamp on the row; the visible date uses
      // an ambiguous M/D/YY format that Date() parses into the 1900s.
      const sortAttr = $el.attr("data-listing-date-sort");
      const ts = sortAttr ? Number(sortAttr) : NaN;
      const date = Number.isFinite(ts) ? new Date(ts) : undefined;

      items.push({ title, link, date });
    });

    return items;
  },
};
