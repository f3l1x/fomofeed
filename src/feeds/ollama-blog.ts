import { fetchPage } from "../lib/fetcher.ts";
import { parseHTML } from "../lib/parser.ts";
import { scrapeArticles } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

export const ollamaBlog: FeedSource = {
  id: "ollama-blog",
  name: "Ollama Blog",
  url: "https://ollama.com/blog",
  category: "blogs",
  company: "ollama",
  strategy: "static",

  async generate() {
    const $ = parseHTML(await fetchPage(this.url));
    return scrapeArticles($, {
      linkSelector: "a[href^='/blog/']",
      baseUrl: "https://ollama.com",
    });
  },
};
