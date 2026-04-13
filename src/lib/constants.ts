import { join, resolve } from "node:path";

export const PROJECT_ROOT = resolve(import.meta.dirname ?? ".", "../..");
export const FEEDS_DIR = join(PROJECT_ROOT, "feeds");
export const CACHE_DIR = join(PROJECT_ROOT, "cache");
export const ARCHIVE_DIR = join(PROJECT_ROOT, "archive");
