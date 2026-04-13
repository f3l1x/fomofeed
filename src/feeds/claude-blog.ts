import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML, extractText, extractLink, parseDate } from "../lib/parser.ts";
import { withCache } from "../lib/feed-helpers.ts";
import type { FeedSource, FeedItem } from "../lib/types.ts";

const BASE_URL = "https://claude.com";

export const claudeBlog: FeedSource = {
  id: "claude-blog",
  name: "Claude Blog",
  url: `${BASE_URL}/blog`,
  category: "news",
  company: "anthropic",
  strategy: "paginated",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    const items: FeedItem[] = [];
    const seen = new Set<string>();

    // Claude's blog uses card containers with a "Read more" link to the post.
    // Filter out category links (/blog/category/) and extract metadata from
    // the card parent, not from the link text.
    $("a[href*='/blog/']").each((_, el) => {
      const href = $(el).attr("href") ?? "";
      if (!href || href.includes("/category/") || href === "/blog" || href === "/blog/") return;

      let link: string;
      try {
        link = new URL(href, BASE_URL).href;
      } catch {
        return;
      }
      if (seen.has(link)) return;
      seen.add(link);

      // Walk up to the card container
      const card = $(el).closest("article").length
        ? $(el).closest("article")
        : $(el).parent().parent();

      const title = extractText($, ["h2", "h3", "h1", "[class*='title']"], card);
      if (!title || title === "Read more") return;

      const desc = extractText($, ["p:not(:has(time))", "[class*='description']"], card);
      const dateStr = extractText($, ["time", "[class*='date']"], card);

      items.push({
        title,
        link,
        description: desc || undefined,
        date: parseDate(dateStr) || parseDate(card.find("time").attr("datetime") ?? ""),
      });
    });

    return withCache(this.id, items);
  },
};
