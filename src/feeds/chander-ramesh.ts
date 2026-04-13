import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const chanderRamesh: FeedSource = {
  id: "chander-ramesh",
  name: "Chander Ramesh Writing",
  url: "https://chanderramesh.com/writing",
  category: "blogs",
  strategy: "static",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    return scrapeArticles($, {
      linkSelector: "a[href^='/writing/']",
      baseUrl: "https://chanderramesh.com",
      titleSelectors: ["h3", "h2", ".font-semibold"],
      descriptionSelectors: ["p.leading-relaxed", "p:not(.text-sm)"],
      dateSelectors: ["p.text-sm", "time", ".date"],
    });
  },
};
