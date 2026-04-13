import type { CheerioAPI } from "./parser.ts";
import type { FeedItem } from "./types.ts";
import { extractText, parseDate } from "./parser.ts";
import { loadCache, saveCache, mergeItems } from "./cache.ts";

const TITLE_SELECTORS = ["h2", "h3", "h4", "[class*='title']"];
const DESC_SELECTORS = ["p", "[class*='description']", "[class*='excerpt']", "[class*='summary']"];
const DATE_SELECTORS = ["time", "[class*='date']", "[datetime]", "span"];

export interface ScrapeConfig {
  linkSelector: string;
  baseUrl: string;
  titleSelectors?: string[];
  descriptionSelectors?: string[];
  dateSelectors?: string[];
}

export function scrapeArticles($: CheerioAPI, config: ScrapeConfig): FeedItem[] {
  const {
    linkSelector,
    baseUrl,
    titleSelectors = TITLE_SELECTORS,
    descriptionSelectors = DESC_SELECTORS,
    dateSelectors = DATE_SELECTORS,
  } = config;

  const items: FeedItem[] = [];
  const seen = new Set<string>();

  $(linkSelector).each((_, el) => {
    const $el = $(el);

    const href = $el.attr("href") ?? "";
    if (!href) return;
    let link: string;
    try {
      link = new URL(href, baseUrl).href;
    } catch {
      return;
    }

    // Skip the listing page itself and dedup
    if (link === baseUrl || link === baseUrl + "/" || seen.has(link)) return;
    seen.add(link);

    const title = extractText($, titleSelectors, $el) || $el.text().trim();
    if (!title) return;

    const description = extractText($, descriptionSelectors, $el);
    const dateStr = extractText($, dateSelectors, $el);
    const date = parseDate(dateStr) || parseDate($el.find("time").attr("datetime") ?? "");

    items.push({
      title,
      link,
      description: description || undefined,
      date: date || undefined,
    });
  });

  return items;
}

export async function withCache(feedId: string, freshItems: FeedItem[]): Promise<FeedItem[]> {
  const cached = await loadCache(feedId);
  const merged = mergeItems(cached, freshItems);
  await saveCache(feedId, merged);
  return merged;
}
