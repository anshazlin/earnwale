import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = file => readFile(new URL(`../${file}`, import.meta.url), "utf8");

test("course preview always verifies an admin session before accessing private media", async () => {
  const route = await read("src/app/api/admin/trading-preview/route.ts");
  assert.match(route, /await requireAdmin\(request\)/);
  assert.match(route, /get\(asset\.url, \{ access: "private"/);
  assert.match(route, /private\.blob\.vercel-storage\.com/);
  assert.match(route, /Content-Type/);
  assert.match(route, /content-range/);
  assert.match(route, /Cache-Control/);
  assert.doesNotMatch(route, /fetch\(asset\.url/);
});

test("admin dashboard links to upload and preview with lazy video loading", async () => {
  const sidebar = await read("src/app/admin/_components/sidebar.tsx");
  const upload = await read("src/app/admin/trading-assets/page.tsx");
  assert.match(sidebar, /href: "\/admin\/trading-assets"/);
  assert.match(upload, /api\/admin\/trading-preview\?module=/);
  assert.match(upload, /preload="none"/);
  assert.match(upload, /api\/admin\/trading-preview\?file=handbook/);
});

test("upload readiness checks verify real private blobs", async () => {
  const endpoint = await read("src/app/api/admin/trading-assets/route.ts");
  assert.match(endpoint, /await requireAdmin\(/);
  assert.match(endpoint, /await head\(data\.url\)/);
  assert.match(endpoint, /blob\.size > 0/);
  assert.match(endpoint, /\.private\.blob\.vercel-storage\.com/);
});
