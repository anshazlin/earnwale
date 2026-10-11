import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("corrected six-module Starter offer matches uploaded lesson duration", async () => {
  const catalogue = await read("src/lib/trading-course.ts");
  const modules = [...catalogue.matchAll(/\{ id: (\d+), title: "([^"]+)", duration: "(\d+:\d+)", seconds: (\d+)/g)];
  assert.equal(modules.length, 6);
  assert.deepEqual(modules.map(m => Number(m[1])), [1, 2, 3, 4, 5, 6]);
  for (const m of modules) {
    const [minutes, seconds] = m[3].split(":").map(Number);
    assert.equal(minutes * 60 + seconds, Number(m[4]));
  }
  assert.equal(modules.reduce((sum, m) => sum + Number(m[4]), 0), 2684);
  assert.match(modules[5][2], /Trading Psychology/i);
});

test("commerce advertises real Starter content and blocks unfinished Pro", async () => {
  const homepage = await read("src/app/page.tsx");
  const signup = await read("src/app/signup/SignupContent.tsx");
  const order = await read("src/app/api/payment/create-order/route.ts");
  for (const page of [homepage, signup]) {
    assert.doesNotMatch(page, /Scholar's Protocol|Capital Compounder|Instant access to ebook/i);
    assert.match(page, /Trading Academy/i);
    assert.match(page, /Coming Soon|coming soon/i);
  }
  assert.match(order, /plan === "500"/);
  assert.match(order, /EARNWALE_STARTER_ENROLLMENT_ENABLED !== "true"/);
});

test("student never receives the assessment key before submission", async () => {
  const quiz = await read("src/app/api/trading/quiz/route.ts");
  assert.match(quiz, /async function authorisedUser/);
  assert.match(quiz, /QUESTIONS\.map\(\(\{ id, question, options \}\)/);
  assert.match(quiz, /passingScore: 16/);
  assert.match(quiz, /submitted\.has\(item\.id\)/);
  assert.match(quiz, /prisma\.courseAttempt\.create/);
  assert.match(quiz, /history/);
  const db = await read("src/lib/prisma.ts");
  assert.match(db, /"courseAttempts"/);
  assert.match(db, /courseAttempt: model\("courseAttempts"\)/);
});

test("media is enrollment-protected and does not auto-preload six videos", async () => {
  const endpoint = await read("src/app/api/trading/media/route.ts");
  assert.match(endpoint, /requireAuth\(req\)/);
  assert.match(endpoint, /hasTradingAccess/);
  assert.match(endpoint, /content-range/);
  assert.match(endpoint, /Cache-Control/);
  const dashboard = await read("src/app/dashboard/my-courses/page.tsx");
  assert.match(dashboard, /preload="none"/);
  assert.match(dashboard, /history=1/);
  assert.match(dashboard, /Start assessment/);
});

test("retired ebook endpoint cannot serve old PDFs", async () => {
  const endpoint = await read("src/app/api/download/route.ts");
  assert.match(endpoint, /410/);
  assert.doesNotMatch(endpoint, /readFileSync/);
});
