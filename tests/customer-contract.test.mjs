import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("customer money rules remain server-authoritative", async () => {
  const withdraw = await read("src/app/api/withdraw/request/route.ts");
  assert.match(withdraw, /const MIN_WITHDRAWAL = 250;/);
  assert.match(withdraw, /const MAX_WITHDRAWAL = 4500;/);
  assert.match(withdraw, /requireAuth\(req\)/);
});

test("dashboard and account lists are bounded", async () => {
  const dashboard = await read("src/app/api/dashboard/route.ts");
  const wallet = await read("src/app/api/wallet/route.ts");
  const withdrawals = await read("src/app/api/withdraw/route.ts");
  assert.match(dashboard, /take: 6/);
  assert.match(wallet, /PAGE_SIZE = 10/);
  assert.match(wallet, /hasMore/);
  assert.match(withdrawals, /PAGE_SIZE = 10/);
  assert.match(withdrawals, /hasMore/);
});

test("test seed is production guarded and contains no fixed password", async () => {
  const seed = await read("scripts/seed-test-user.mjs");
  assert.match(seed, /VERCEL_ENV === "production"/);
  assert.match(seed, /ALLOW_EARNWALE_TEST_SEED/);
  assert.match(seed, /EARNWALE_TEST_PASSWORD/);
  assert.doesNotMatch(seed, /password\s*=\s*["'][^"']+["']/);
});

test("payment implementation remains present and server verified", async () => {
  const verify = await read("src/app/api/payment/verify/route.ts");
  assert.match(verify, /timingSafeEqual/);
  assert.match(verify, /razorpay\.orders\.fetch/);
  assert.match(verify, /razorpay\.payments\.fetch/);
});
