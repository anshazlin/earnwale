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

test("commerce accurately describes plans and keeps payments gated until launch approval", async () => {
  const homepage = await read("src/app/page.tsx");
  const signup = await read("src/app/signup/SignupContent.tsx");
  const order = await read("src/app/api/payment/create-order/route.ts");
  for (const page of [homepage, signup]) {
    assert.doesNotMatch(page, /Scholar's Protocol|Capital Compounder|Instant access to ebook/i);
    assert.match(page, /Trading Academy/i);
    assert.match(page, /enrollment|Enrollment/i);
  }
  assert.match(order, /enrollmentFlagEnabled/);
  assert.match(order, /verifiedCourseAssetsReady/);
});

test("quiz offers eight fresh signed questions, protects answer keys and saves each grade", async () => {
  const quiz = await read("src/app/api/trading/quiz/route.ts");
  assert.match(quiz, /const QUIZ_SIZE = 8;/);
  assert.match(quiz, /const PASSING_SCORE = 7;/);
  assert.match(quiz, /QUESTIONS\.filter\(question => !previousIds\.has\(question\.id\)\)/);
  assert.match(quiz, /selection\.map\(\(\{ id, question, options \}\)/);
  assert.match(quiz, /createHmac\("sha256"/);
  assert.match(quiz, /timingSafeEqual/);
  assert.match(quiz, /verifyTicket\(payload\.token, user\.id, "exam"\)/);
  assert.match(quiz, /ticket\.ids\.some\(id => !submitted\.has\(id\)\)/);
  assert.match(quiz, /prisma\.courseAttempt\.findUnique/);
  assert.match(quiz, /prisma\.courseAttempt\.create/);
  assert.match(quiz, /purpose: "recent"/);
  assert.match(quiz, /httpOnly: true/);
  assert.match(quiz, /history/);
  assert.doesNotMatch(quiz, /passingScore:\s*16/);
  assert.doesNotMatch(quiz, /Submit exactly 20 answers/);
  const db = await read("src/lib/prisma.ts");
  assert.match(db, /"courseAttempts"/);
  assert.match(db, /courseAttempt: model\("courseAttempts"\)/);
});

test("assessment uses one-question Next and Back flow with a fresh-set option", async () => {
  const dashboard = await read("src/app/dashboard/my-courses/page.tsx");
  assert.match(dashboard, /currentQuestion=exam\?\.questions\[step\]/);
  assert.match(dashboard, /Next →/);
  assert.match(dashboard, /← Back/);
  assert.match(dashboard, /Finish & see result/);
  assert.match(dashboard, /Refresh with 8 different questions/);
  assert.match(dashboard, /token:exam\.token/);
  assert.match(dashboard, /setStep\(0\)/);
  assert.doesNotMatch(dashboard, /exam\.questions\.map\(\(q,i\)=>\<fieldset/);
  const homepage = await read("src/app/page.tsx");
  const signup = await read("src/app/signup/SignupContent.tsx");
  assert.match(homepage, /8-question knowledge check/);
  assert.match(signup, /8-question rotating knowledge check/);
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
  assert.match(dashboard, /Start 8-question assessment/);
});

test("retired ebook endpoint cannot serve old PDFs", async () => {
  const endpoint = await read("src/app/api/download/route.ts");
  assert.match(endpoint, /410/);
  assert.doesNotMatch(endpoint, /readFileSync/);
});

test("media uploads require verified admin, are fixed to eight assets and are stored", async () => {
  const endpoint = await read("src/app/api/admin/trading-assets/route.ts");
  assert.match(endpoint, /requireAdmin/);
  assert.match(endpoint, /handleUpload/);
  assert.match(endpoint, /onBeforeGenerateToken/);
  assert.match(endpoint, /onUploadCompleted/);
  for (let id = 1; id <= 6; id++) assert.match(endpoint, new RegExp('module-' + id));
  assert.match(endpoint, /courseAsset\.create/);
  assert.match(endpoint, /courseAsset\.update/);
  const db = await read("src/lib/prisma.ts");
  assert.match(db, /courseAsset: model\("courseAssets"\)/);
  const pay = await read("src/app/api/payment/create-order/route.ts");
  assert.match(pay, /verifiedCourseAssetsReady/);
  const readiness = await read("src/lib/course-enrollment.ts");
  assert.match(readiness, /prisma\.courseAsset\.findUnique/);
  assert.match(readiness, /EARNWALE_STARTER_ENROLLMENT_ENABLED/);
});
