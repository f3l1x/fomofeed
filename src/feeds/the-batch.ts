import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML, extractText, extractLink, parseDate } from "../lib/parser.ts";
import type { FeedSource, FeedItem } from "../lib/types.ts";

const BASE_URL = "https://www.deeplearning.ai";

// Tag links use "apr-10-2026" style slugs which Date() can't parse directly.
// Convert to "Apr 10 2026" so parseDate() handles them.
function normalizeTagDate(s: string): string {
  const m = s.match(/^([a-z]{3})-(\d{1,2})-(\d{4})$/i);
  if (!m) return s;
  return `${m[1]} ${m[2]} ${m[3]}`;
}

export const theBatch: FeedSource = {
  id: "the-batch",
  name: "The Batch - DeepLearning.AI",
  url: `${BASE_URL}/the-batch/`,
  category: "blogs",
  strategy: "static",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    const items: FeedItem[] = [];
    const seen = new Set<string>();

    // Each article contains an h2 title and links to the issue
    $("article").each((_, el) => {
      const $el = $(el);

      const title = $el.find("h2").first().text().trim();
      if (!title) return;

      // Find the actual issue/article link (skip /tag/ links)
      let link = "";
      $el.find("a[href*='/the-batch/']").each((_, a) => {
        const href = $(a).attr("href") ?? "";
        if (href.includes("/tag/")) return;
        if (!link) {
          try {
            link = new URL(href, BASE_URL).href;
          } catch {
            // skip
          }
        }
      });

      if (!link || link === `${BASE_URL}/the-batch/` || seen.has(link)) return;
      seen.add(link);

      const tagText = $el.find("a[href*='/tag/']").first().text().trim();
      const dateStr = normalizeTagDate(tagText)
        || extractText($, ["time", ".date"], $el);

      items.push({
        title,
        link,
        date: parseDate(dateStr),
      });
    });

    return items;
  },
};
