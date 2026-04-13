import { fetchPage } from "../lib/fetcher.ts";
import { parseDate } from "../lib/parser.ts";
import { withCache } from "../lib/feed-helpers.ts";
import type { FeedSource, FeedItem } from "../lib/types.ts";

const RAW_URL = "https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md";
const LINK_BASE = "https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md";

export const claudeCodeChangelog: FeedSource = {
  id: "claude-code-changelog",
  name: "Claude Code Changelog",
  url: LINK_BASE,
  category: "changelogs",
  company: "anthropic",
  strategy: "browser",

  async generate() {
    // Fetch raw markdown instead of parsing GitHub's HTML — more reliable
    const md = await fetchPage(RAW_URL);
    const items: FeedItem[] = [];

    // Split on ## headings (version entries like "## 2.1.101")
    const sections = md.split(/^## /m).slice(1);

    for (const section of sections) {
      const lines = section.split("\n");
      const heading = (lines[0] ?? "").trim();
      if (!heading) continue;

      // Collect first few non-empty content lines as description
      const content = lines
        .slice(1)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith("#"))
        .slice(0, 5)
        .join(" ");

      const dateMatch = heading.match(/\d{4}-\d{2}-\d{2}/);
      const slug = heading.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

      items.push({
        title: `Claude Code ${heading}`,
        link: `${LINK_BASE}#${slug}`,
        description: content || undefined,
        date: dateMatch ? parseDate(dateMatch[0]) : undefined,
      });
    }

    return withCache(this.id, items);
  },
};
