const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const DEFAULT_TIMEOUT = 30_000;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1_000;

const domainLastFetch = new Map<string, number>();
const MIN_DELAY_MS = 1_000;

async function rateLimitDelay(url: string): Promise<void> {
  const domain = new URL(url).hostname;
  const last = domainLastFetch.get(domain);
  if (last) {
    const elapsed = Date.now() - last;
    if (elapsed < MIN_DELAY_MS) {
      await new Promise((r) => setTimeout(r, MIN_DELAY_MS - elapsed));
    }
  }
  domainLastFetch.set(domain, Date.now());
}

export async function fetchPage(
  url: string,
  options: { timeout?: number; headers?: Record<string, string> } = {},
): Promise<string> {
  await rateLimitDelay(url);

  const { timeout = DEFAULT_TIMEOUT, headers = {} } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const backoff = INITIAL_BACKOFF * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, backoff));
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          ...headers,
        },
        signal: controller.signal,
        redirect: "follow",
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < MAX_RETRIES - 1) {
        console.warn(
          `Fetch attempt ${attempt + 1} failed for ${url}: ${lastError.message}`,
        );
      }
    }
  }

  throw new Error(
    `Failed to fetch ${url} after ${MAX_RETRIES} attempts: ${lastError?.message}`,
  );
}
