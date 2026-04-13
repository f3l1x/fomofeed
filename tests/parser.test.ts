import { describe, test, expect } from "bun:test";
import { parseHTML, extractText, extractLink, parseDate } from "../src/lib/parser.ts";

const sampleHTML = `
<html>
<body>
  <article class="post">
    <h2><a href="/blog/hello-world">Hello World</a></h2>
    <time datetime="2024-06-01">June 1, 2024</time>
    <p class="summary">This is a test post.</p>
  </article>
  <article class="post">
    <h2><a href="/blog/second-post">Second Post</a></h2>
    <time datetime="2024-06-15">June 15, 2024</time>
    <p class="summary">Another post.</p>
  </article>
</body>
</html>
`;

describe("parser", () => {
  test("parseHTML returns a cheerio API", () => {
    const $ = parseHTML(sampleHTML);
    expect($("article")).toHaveLength(2);
  });

  test("extractText with single selector", () => {
    const $ = parseHTML(sampleHTML);
    const text = extractText($, "h2");
    expect(text).toBe("Hello World");
  });

  test("extractText with fallback selectors", () => {
    const $ = parseHTML(sampleHTML);
    // First selector doesn't match, second does
    const text = extractText($, [".nonexistent", "h2"]);
    expect(text).toBe("Hello World");
  });

  test("extractText with context", () => {
    const $ = parseHTML(sampleHTML);
    const articles = $("article");
    const second = $(articles[1]!);
    const text = extractText($, "h2", second);
    expect(text).toBe("Second Post");
  });

  test("extractLink resolves relative URLs", () => {
    const $ = parseHTML(sampleHTML);
    const link = extractLink($, "h2 a", "https://example.com");
    expect(link).toBe("https://example.com/blog/hello-world");
  });

  test("parseDate handles valid dates", () => {
    expect(parseDate("2024-06-01")).toEqual(new Date("2024-06-01"));
    expect(parseDate("June 15, 2024")).toEqual(new Date("June 15, 2024"));
  });

  test("parseDate returns undefined for invalid dates", () => {
    expect(parseDate("")).toBeUndefined();
    expect(parseDate("not a date")).toBeUndefined();
  });
});
