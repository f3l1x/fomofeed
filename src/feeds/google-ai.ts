import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML, extractText, extractLink, parseDate } from "../lib/parser.ts";
import { withCache } from "../lib/feed-helpers.ts";
import type { FeedSource, FeedItem } from "../lib/types.ts";

const BASE_URL = "https://developers.googleblog.com";

export const googleAi: FeedSource = {
  id: "google-ai",
  name: "Google AI Blog",
  url: `${BASE_URL}/search/?technology_categories=AI`,
  category: "news",
  company: "google",
  strategy: "paginated",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    const items: FeedItem[] = [];
    const seen = new Set<string>();

    $("li.search-result").each((_, el) => {
      const $el = $(el);
      const link = extractLink($, "a", BASE_URL, $el);
      if (!link || link === BASE_URL || seen.has(link)) return;
      seen.add(link);

      // Card text: "DATE / CATEGORY\n  Title\n  Description"
      const title = extractText($, [".search-result__title", "h3", "h2", "h4"], $el);
      if (!title) return;

      const desc = extractText($, [".search-result__summary", "[class*='snippet']"], $el);
      const dateStr = $el.text().match(/((?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s+\d{1,2},\s+\d{4})/i)?.[1] ?? "";

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
