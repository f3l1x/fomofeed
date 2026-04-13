export type FeedCategory = "changelogs" | "news" | "blogs";

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  category: FeedCategory;
  company?: string;
  strategy: "static" | "paginated" | "browser" | "github-release";
  // Optional selector the `debug` CLI uses when fetching via browser, so the
  // dumped HTML reflects what generate() actually sees.
  waitSelector?: string;
  generate(): Promise<FeedItem[]>;
}

export interface FeedItem {
  title: string;
  link: string;
  description?: string;
  date?: Date;
  categories?: string[];
}

export interface CacheData {
  feedId: string;
  items: CachedItem[];
  lastUpdated: string;
}

export interface CachedItem {
  title: string;
  link: string;
  description?: string;
  date?: string;
  categories?: string[];
}

export interface ArchivedItem {
  title: string;
  link: string;
  description?: string;
  date?: string;
  categories?: string[];
  firstSeen: string;
}

export interface ArchiveData {
  feedId: string;
  items: ArchivedItem[];
}
