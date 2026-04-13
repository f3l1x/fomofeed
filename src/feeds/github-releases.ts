import { fetchGitHubReleases } from "../lib/github.ts";
import { withCache } from "../lib/feed-helpers.ts";
import type { FeedSource } from "../lib/types.ts";

function ghReleaseFeed(
  id: string,
  name: string,
  owner: string,
  repo: string,
  company?: string,
): FeedSource {
  return {
    id,
    name,
    url: `https://github.com/${owner}/${repo}/releases`,
    category: "changelogs",
    company,
    strategy: "github-release",
    async generate() {
      const items = await fetchGitHubReleases(owner, repo);
      return withCache(this.id, items);
    },
  };
}

export const claudeCodeReleases = ghReleaseFeed(
  "claude-code-releases",
  "Claude Code Releases",
  "anthropics",
  "claude-code",
  "anthropic",
);

export const openCodeReleases = ghReleaseFeed(
  "opencode-releases",
  "OpenCode Releases",
  "anomalyco",
  "opencode",
);

export const clineReleases = ghReleaseFeed(
  "cline-releases",
  "Cline Releases",
  "cline",
  "cline",
);

export const aiderReleases = ghReleaseFeed(
  "aider-releases",
  "Aider Releases",
  "paul-gauthier",
  "aider",
);

export const continueReleases = ghReleaseFeed(
  "continue-releases",
  "Continue Releases",
  "continuedev",
  "continue",
);

export const tabbyReleases = ghReleaseFeed(
  "tabby-releases",
  "Tabby Releases",
  "TabbyML",
  "tabby",
);

export const ollamaReleases = ghReleaseFeed(
  "ollama-releases",
  "Ollama Releases",
  "ollama",
  "ollama",
  "ollama",
);

export const openaiCodexReleases = ghReleaseFeed(
  "openai-codex-releases",
  "OpenAI Codex Releases",
  "openai",
  "codex",
  "openai",
);
