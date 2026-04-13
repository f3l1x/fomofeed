import type { FeedCategory, FeedSource } from "../lib/types.ts";

import { ollamaBlog } from "./ollama-blog.ts";
import { paulgraham } from "./paulgraham.ts";
import { chanderRamesh } from "./chander-ramesh.ts";
import { thinkingMachines } from "./thinking-machines.ts";
import { hamel } from "./hamel.ts";
import { windsurfBlog } from "./windsurf-blog.ts";
import { windsurfChangelog, windsurfNextChangelog } from "./windsurf-changelog.ts";
import { theBatch } from "./the-batch.ts";
import { claudeBlog } from "./claude-blog.ts";
import { cursorBlog } from "./cursor-blog.ts";
import { dagsterBlog } from "./dagster-blog.ts";
import { surgeAi } from "./surge-ai.ts";
import { googleAi } from "./google-ai.ts";
import { anthropicNews } from "./anthropic-news.ts";
import { anthropicEngineering } from "./anthropic-engineering.ts";
import { anthropicResearch } from "./anthropic-research.ts";
import { anthropicRed } from "./anthropic-red.ts";
import {
  claudeCodeReleases,
  openCodeReleases,
  clineReleases,
  aiderReleases,
  continueReleases,
  tabbyReleases,
  ollamaReleases,
  openaiCodexReleases,
} from "./github-releases.ts";

export {
  ollamaBlog,
  paulgraham,
  chanderRamesh,
  thinkingMachines,
  hamel,
  windsurfBlog,
  windsurfChangelog,
  windsurfNextChangelog,
  theBatch,
  claudeBlog,
  cursorBlog,
  dagsterBlog,
  surgeAi,
  googleAi,
  anthropicNews,
  anthropicEngineering,
  anthropicResearch,
  anthropicRed,
  claudeCodeReleases,
  openCodeReleases,
  clineReleases,
  aiderReleases,
  continueReleases,
  tabbyReleases,
  ollamaReleases,
  openaiCodexReleases,
};

export const ALL_CATEGORIES: FeedCategory[] = ["news", "blogs", "changelogs"];

export const CATEGORY_LABELS: Record<FeedCategory, string> = {
  news: "News",
  blogs: "Blogs",
  changelogs: "Changelogs",
};

export function feedsByCategory(category: FeedCategory): FeedSource[] {
  return allFeeds.filter((f) => f.category === category);
}

export function feedsByCompany(company: string): FeedSource[] {
  return allFeeds.filter((f) => f.company === company);
}

export function allCompanies(): string[] {
  const companies = new Set<string>();
  for (const feed of allFeeds) {
    if (feed.company) companies.add(feed.company);
  }
  return [...companies].sort();
}

export const allFeeds: FeedSource[] = [
  ollamaBlog,
  paulgraham,
  chanderRamesh,
  thinkingMachines,
  hamel,
  windsurfBlog,
  windsurfChangelog,
  windsurfNextChangelog,
  theBatch,
  claudeBlog,
  cursorBlog,
  dagsterBlog,
  surgeAi,
  googleAi,
  anthropicNews,
  anthropicEngineering,
  anthropicResearch,
  anthropicRed,
  claudeCodeReleases,
  openCodeReleases,
  clineReleases,
  aiderReleases,
  continueReleases,
  tabbyReleases,
  ollamaReleases,
  openaiCodexReleases,
];
