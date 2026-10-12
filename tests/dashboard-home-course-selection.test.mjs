import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("logged-in Home keeps Starter and Pro separate and enforces entitlement-aware links", async () => {
  const home = await read("src/app/dashboard/page.tsx");
  assert.match(home, /import Link from "next\/link"/);
  assert.match(home, /"\/dashboard\/my-courses"/);
  assert.match(home, /"\/dashboard\/pro"/);
  assert.match(home, /"\/signup\?plan=300"/);
  assert.match(home, /"\/signup\?plan=500"/);
  assert.match(home, /const hasStarter = plan === "300" \|\| plan === "500"/);
  assert.match(home, /const hasPro = plan === "500"/);
  assert.match(home, /Affiliate Program membership does not unlock paid learning content/);
  assert.match(home, /Starter · ₹300/);
  assert.match(home, /Pro · ₹500/);
  assert.match(home, /Open course/);
  assert.match(home, /View enrollment/);
  assert.match(home, /sm:grid-cols-2/);
  assert.ok(home.indexOf("Starter · ₹300") < home.indexOf("Pro · ₹500"));
  assert.doesNotMatch(home, /<StarterCourse\s*\/>|<ProCourse\s*\/>/);
  assert.doesNotMatch(home, /import StarterCourse|import ProCourse/);
  assert.doesNotMatch(home, /setSelected|aria-pressed|<video|<fieldset/);
});

test("Starter and Pro each have their own playable lesson PDFs quizzes and a back link", async () => {
  const starter = await read("src/app/dashboard/my-courses/page.tsx");
  const pro = await read("src/app/dashboard/pro/page.tsx");
  assert.match(starter, /href="\/dashboard"/);
  assert.match(starter, /Back to my courses/);
  assert.match(starter, /COURSE_MODULES\.map/);
  assert.match(starter, /\/api\/trading\/media/);
  assert.match(starter, /\/api\/trading\/quiz/);
  assert.match(starter, /preload="none"/);
  assert.match(pro, /href="\/dashboard"/);
  assert.match(pro, /Back to my courses/);
  assert.match(pro, /PRO_MODULES\.map/);
  assert.match(pro, /PRO_RESOURCES\.map/);
  assert.match(pro, /\/api\/pro\/media/);
  assert.match(pro, /\/api\/pro\/quiz/);
  assert.match(pro, /preload="none"/);
});

test("media and quizzes still enforce the correct paid-plan permissions server-side", async () => {
  const starterMedia = await read("src/app/api/trading/media/route.ts");
  const proMedia = await read("src/app/api/pro/media/route.ts");
  const proQuiz = await read("src/app/api/pro/quiz/route.ts");
  assert.match(starterMedia, /hasTradingAccess\(user\.plan\)/);
  assert.match(proMedia, /hasProAccess\(user\.plan\)/);
  assert.match(proQuiz, /hasProAccess\(user\.plan\)/);
  const layout = await read("src/app/dashboard/layout.tsx");
  assert.match(layout, /verifySessionCookie/);
});

test("mobile and desktop navigation remain exactly Home Wallet Dashboard", async () => {
  const shell = await read("src/app/dashboard/_components/dashboard-shell.tsx");
  const block = shell.split("const NAV_ITEMS:")[1].split("];")[0];
  assert.equal((block.match(/name: "/g) ?? []).length, 3);
  assert.deepEqual([...block.matchAll(/name: "([^"]+)"/g)].map(match => match[1]), [
    "Home", "Wallet", "Dashboard",
  ]);
  assert.doesNotMatch(block, /Pro Course|\/dashboard\/pro/);
  assert.match(shell, /grid-cols-3 gap-1/);
  assert.match(shell, /pathname\.startsWith\("\/dashboard\/pro"\)/);
  assert.match(shell, /pathname\.startsWith\("\/dashboard\/my-courses"\)/);
});
