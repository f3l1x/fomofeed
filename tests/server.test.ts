import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";

const PROJECT_ROOT = resolve(import.meta.dirname ?? ".", "..");
const FEEDS_DIR = join(PROJECT_ROOT, "feeds");
const TEST_PORT = 49152 + Math.floor(Math.random() * 1000);

let serverProcess: { kill(): void } | null = null;

beforeAll(async () => {
  await mkdir(FEEDS_DIR, { recursive: true });
  await writeFile(
    join(FEEDS_DIR, "test-feed.xml"),
    '<?xml version="1.0"?><rss version="2.0"><channel><title>Test</title></channel></rss>',
  );

  const proc = Bun.spawn(
    ["bun", "run", join(PROJECT_ROOT, "src/cli.ts"), "serve", `--port=${TEST_PORT}`],
    { stdout: "pipe", stderr: "pipe" },
  );
  serverProcess = proc;

  for (let i = 0; i < 30; i++) {
    try {
      await fetch(`http://localhost:${TEST_PORT}/health`);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
});

afterAll(async () => {
  serverProcess?.kill();
  await rm(join(FEEDS_DIR, "test-feed.xml"), { force: true });
});

describe("server", () => {
  test("GET / returns dynamically generated index", async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("FomoFeed");
    expect(html).toContain("blogs/ollama-blog.xml");
  });

  test("GET /health returns ok", async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ status: "ok" });
  });

  test("GET /feeds/test-feed.xml returns RSS", async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/feeds/test-feed.xml`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("application/rss+xml");
    const text = await res.text();
    expect(text).toContain('<rss version="2.0"');
  });

  test("GET /feeds/nonexistent.xml returns 404", async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/feeds/nonexistent.xml`);
    expect(res.status).toBe(404);
  });

  test("path traversal is blocked", async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/feeds/..%2F..%2Fetc%2Fpasswd.xml`);
    expect(res.status).toBe(404);
  });

  test("unknown routes return 404", async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/unknown`);
    expect(res.status).toBe(404);
  });

  test("security headers are present", async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/health`);
    expect(res.headers.get("x-frame-options")).toBe("DENY");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("content-security-policy")).toBeTruthy();
  });

  test("Cache-Control headers are set", async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/`);
    expect(res.headers.get("cache-control")).toContain("max-age=");
  });
});
