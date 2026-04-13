import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

export type CheerioAPI = ReturnType<typeof cheerio.load>;

export function parseHTML(html: string): CheerioAPI {
  return cheerio.load(html);
}

export function extractText(
  $: CheerioAPI,
  selectors: string | string[],
  context?: cheerio.Cheerio<AnyNode>,
): string {
  const selectorList = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of selectorList) {
    const el = context ? context.find(sel) : $(sel);
    const text = el.first().text().trim();
    if (text) return text;
  }
  return "";
}

export function extractAttr(
  $: CheerioAPI,
  selector: string,
  attr: string,
  context?: cheerio.Cheerio<AnyNode>,
): string {
  const el = context ? context.find(selector) : $(selector);
  return el.first().attr(attr)?.trim() ?? "";
}

export function extractLink(
  $: CheerioAPI,
  selector: string,
  baseUrl: string,
  context?: cheerio.Cheerio<AnyNode>,
): string {
  const href = extractAttr($, selector, "href", context);
  if (!href) return "";
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return "";
  }
}

export function parseDate(dateStr: string): Date | undefined {
  if (!dateStr) return undefined;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return undefined;
  return parsed;
}

export function resolveUrl(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}
