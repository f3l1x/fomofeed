import { parseDate } from "./parser.ts";
import type { FeedItem } from "./types.ts";

const PER_PAGE = 100;

interface GitHubRelease {
  name: string | null;
  tag_name: string;
  html_url: string;
  published_at: string | null;
  body: string | null;
}

/**
 * Fetch up to 100 releases from the GitHub REST API.
 */
export async function fetchGitHubReleases(
  owner: string,
  repo: string,
): Promise<FeedItem[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${PER_PAGE}`;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "FomoFeed/1.0",
  };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }

  const releases = (await res.json()) as GitHubRelease[];

  return releases.map((r) => ({
    title: r.name || r.tag_name,
    link: r.html_url,
    description: r.body?.slice(0, 2000) || undefined,
    date: parseDate(r.published_at ?? "") || undefined,
  }));
}
