import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML, extractText, parseDate } from "../lib/parser.ts";
import type { FeedSource, FeedItem } from "../lib/types.ts";

function scrapeWindsurfChangelog(url: string, html: string): FeedItem[] {
  const $ = parseHTML(html);
  const items: FeedItem[] = [];

  $('[aria-label="changelog-layout"]').each((_, el) => {
    const $el = $(el);
    const version = extractText($, [".bg-sk-dusk-tint", "[class*='dusk-tint']"], $el);
    const heading = extractText($, ["h1.subheading2", "h2.body2", "h1", "h2"], $el);
    if (!heading && !version) return;

    const title = version ? `${version} — ${heading || "Update"}` : heading || "Update";
    const anchorId = $el.find("h1 a, h2 a").first().attr("href") || "";

    items.push({
      title,
      link: anchorId ? `${url}${anchorId}` : url,
      description: extractText($, ["p.body3", "article p", ".prose p"], $el) || undefined,
      date: parseDate(extractText($, [".caption1", "time"], $el)),
    });
  });

  return items;
}

export const windsurfChangelog: FeedSource = {
  id: "windsurf-changelog",
  name: "Windsurf Editor Changelog",
  url: "https://windsurf.com/changelog",
  category: "changelogs",
  company: "windsurf",
  strategy: "static",

  async generate() {
    return scrapeWindsurfChangelog(this.url, await fetchPage(this.url));
  },
};

export const windsurfNextChangelog: FeedSource = {
  id: "windsurf-next-changelog",
  name: "Windsurf Next Changelog",
  url: "https://windsurf.com/changelog/windsurf-next",
  category: "changelogs",
  company: "windsurf",
  strategy: "static",

  async generate() {
    return scrapeWindsurfChangelog(this.url, await fetchPage(this.url));
  },
};
