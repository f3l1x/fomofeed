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

    // Google dev blog uses .search-result cards.
    // Skip the first one (it's the filter control panel).
    $("[class*='search-result']").each((i, el) => {
      if (i === 0) return; // skip filter panel

      const $el = $(el);
      const link = extractLink($, "a", BASE_URL, $el);
      if (!link || link === BASE_URL || seen.has(link)) return;
      seen.add(link);

      // Card text: "DATE / CATEGORY\n  Title\n  Description"
      const title = extractText($, ["h3", "h2", "h4", "[class*='title']"], $el);
      if (!title) return;

      const desc = extractText($, ["p", "[class*='description']", "[class*='snippet']"], $el);
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
