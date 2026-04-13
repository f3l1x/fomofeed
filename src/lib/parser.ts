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

function extractAttr(
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

/**
 * Strip HTML/Markdown noise from text. Handles HTML tags, HTML entities,
 * markdown code fences/inline code/links, and collapses whitespace.
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    // HTML comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // script/style blocks
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    // any HTML tag
    .replace(/<\/?[a-zA-Z][^>]*>/g, " ")
    // trailing unterminated tag (e.g., body truncated mid-attribute)
    .replace(/<\/?[a-zA-Z][^<]*$/g, " ")
    // markdown fenced code
    .replace(/```[\s\S]*?```/g, " ")
    // markdown inline code
    .replace(/`([^`]*)`/g, "$1")
    // markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // common HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    // collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}
