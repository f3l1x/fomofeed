import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML, extractText, extractLink, parseDate } from "../lib/parser.ts";
import { withCache } from "../lib/feed-helpers.ts";
import type { FeedSource, FeedItem } from "../lib/types.ts";

const BASE_URL = "https://dagster.io";

export const dagsterBlog: FeedSource = {
  id: "dagster-blog",
  name: "Dagster Blog",
  url: `${BASE_URL}/blog`,
  category: "blogs",
  strategy: "paginated",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    const items: FeedItem[] = [];
    const seen = new Set<string>();

    // Featured post: h2.heading-style-h5 in the top section
    const featuredTitle = $("h2.heading-style-h5").first().text().trim();
    const featuredLink = extractLink($, "a[href*='/blog/']:not([href='/blog'])", BASE_URL);
    if (featuredTitle && featuredLink && !seen.has(featuredLink)) {
      seen.add(featuredLink);
      const dateStr = $(".text-color-neutral-500").first().text().trim();
      const desc = $(".text-color-neutral-700").first().text().trim();
      items.push({
        title: featuredTitle,
        link: featuredLink,
        description: desc || undefined,
        date: parseDate(dateStr),
      });
    }

    // Regular cards: each has h3.blog_card_title
    $("h3.blog_card_title").each((_, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      if (!title) return;

      // Walk up to the card container to find the link and metadata
      const card = $el.closest(".blog_card").length
        ? $el.closest(".blog_card")
        : $el.parent();

      const link = extractLink($, "a[href*='/blog/']", BASE_URL, card);
      if (!link || seen.has(link)) return;
      seen.add(link);

      const dateStr = extractText($, [".text-color-neutral-500", "p:first-child"], card);
      const desc = extractText($, [".text-color-neutral-700"], card);
      const category = card.find(".hide").text().trim();

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
