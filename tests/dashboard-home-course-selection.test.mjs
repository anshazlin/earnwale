import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("logged-in Home offers Starter and Pro in that order, opening their own complete course screens", async () => {
  const home = await read("src/app/dashboard/page.tsx");
  assert.match(home, /"use client"/);
  assert.match(home, /import StarterCourse from "\.\/my-courses\/page"/);
  assert.match(home, /import ProCourse from "\.\/pro\/page"/);
  assert.match(home, /type Course = "starter" \| "pro"/);
  assert.match(home, /selected === "starter"/);
  assert.match(home, /selected === "pro"/);
  assert.match(home, /<StarterCourse\s*\/>/);
  assert.match(home, /<ProCourse\s*\/>/);
  assert.match(home, /Choose your trading course/);
  assert.match(home, /Starter · ₹300/);
  assert.match(home, /Pro · ₹500/);
  assert.match(home, /sm:grid-cols-2/);
  assert.match(home, /aria-pressed=\{selected === "starter"\}/);
  assert.match(home, /aria-pressed=\{selected === "pro"\}/);
});

test("Pro and Starter viewing obey account entitlements, without changing paid API guards", async () => {
  const home = await read("src/app/dashboard/page.tsx");
  assert.match(home, /plan === "300" \|\| plan === "500"/);
  assert.match(home, /const hasPro = plan === "500"/);
  assert.match(home, /hasStarter\s*\? <StarterCourse/);
  assert.match(home, /hasPro\s*\? <ProCourse/);
  assert.match(home, /fetch\("\/api\/auth\/me"/);
  assert.match(home, /Pro membership required/);
  const pro = await read("src/app/api/pro/media/route.ts");
  const quiz = await read("src/app/api/pro/quiz/route.ts");
  assert.match(pro, /hasProAccess\(user\.plan\)/);
  assert.match(quiz, /hasProAccess\(user\.plan\)/);
});

test("mobile and desktop navigation both revert to Home Wallet Dashboard only", async () => {
  const shell = await read("src/app/dashboard/_components/dashboard-shell.tsx");
  const block = shell.split("const NAV_ITEMS:")[1].split("];")[0];
  assert.equal((block.match(/name: "/g) ?? []).length, 3);
  assert.deepEqual([...block.matchAll(/name: "([^"]+)"/g)].map(match => match[1]), [
    "Home", "Wallet", "Dashboard"
  ]);
  assert.doesNotMatch(block, /Pro Course|\/dashboard\/pro/);
  assert.match(shell, /grid-cols-3 gap-1/);
  assert.match(shell, /pathname\.startsWith\("\/dashboard\/pro"\)/);
});

test("all six videos, downloads and quizzes remain in their original course screens", async () => {
  const starter = await read("src/app/dashboard/my-courses/page.tsx");
  const pro = await read("src/app/dashboard/pro/page.tsx");
  assert.match(starter, /COURSE_MODULES\.map/);
  assert.match(starter, /\/api\/trading\/media/);
  assert.match(starter, /\/api\/trading\/quiz/);
  assert.match(pro, /PRO_MODULES\.map/);
  assert.match(pro, /PRO_RESOURCES\.map/);
  assert.match(pro, /\/api\/pro\/media/);
  assert.match(pro, /\/api\/pro\/quiz/);
  assert.match(pro, /href="\/dashboard"/);
});
