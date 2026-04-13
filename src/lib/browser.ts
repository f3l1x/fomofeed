import { chromium, type Browser } from "playwright";

const DEFAULT_TIMEOUT = 60_000;

// Pin to a recent Chrome UA so sites that gate on UA (or run basic Cloudflare
// bot checks) don't serve us an interstitial.
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

let _browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!_browser || !_browser.isConnected()) {
    _browser = await chromium.launch({
      headless: true,
      args: ["--disable-blink-features=AutomationControlled"],
    });
  }
  return _browser;
}

export async function closeBrowser(): Promise<void> {
  if (_browser?.isConnected()) {
    await _browser.close();
    _browser = null;
  }
}

export async function fetchWithBrowser(
  url: string,
  options: {
    waitSelector?: string;
    clickSelector?: string;
    maxClicks?: number;
    timeout?: number;
  } = {},
): Promise<string> {
  const {
    waitSelector,
    clickSelector,
    maxClicks = 2,
    timeout = DEFAULT_TIMEOUT,
  } = options;

  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(timeout);

  try {
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout });
    } catch {
      // Retry with domcontentloaded for slow sites
      await page.goto(url, { waitUntil: "domcontentloaded", timeout });
    }

    if (waitSelector) {
      try {
        await page.waitForSelector(waitSelector, { timeout });
      } catch {
        // Continue even if wait fails
      }
    }

    if (clickSelector) {
      for (let i = 0; i < maxClicks; i++) {
        try {
          await page.click(clickSelector, { timeout: 5000 });
          await page.waitForTimeout(2000);
        } catch {
          break;
        }
      }
    }

    return await page.content();
  } finally {
    await page.close();
    await context.close();
  }
}
