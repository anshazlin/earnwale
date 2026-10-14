import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const read=file=>readFile(new URL(`../${file}`,import.meta.url),"utf8");

test("Pro plan is separate from Starter, includes six lessons and five learner PDFs",async()=>{
  const course=await read("src/lib/pro-course.ts");
  assert.match(course,/\.trim\(\) === "500"/);
  const ids=[...course.matchAll(/\{id:(\d+),title:/g)];
  assert.equal(ids.length,6);
  assert.deepEqual(ids.map(match=>Number(match[1])),[1,2,3,4,5,6]);
  assert.equal((course.match(/filename:"Earnwale-Pro-/g)||[]).length,5);
  assert.match(course,/PRO_QUIZ_BANK_SIZE=36/);
});

test("Pro quiz rotates 8 questions using a restricted 36-item server answer bank",async()=>{
  const bank=await read("src/lib/pro-questions.ts");
  assert.equal((bank.match(/\{id:\d+,module:\d+,question:/g)||[]).length,36);
  for(let module=1;module<=6;module++)assert.equal((bank.match(new RegExp(`module:${module},question:`,"g"))||[]).length,6);
  const quiz=await read("src/app/api/pro/quiz/route.ts");
  assert.match(quiz,/const QUIZ_SIZE = 8/);
  assert.match(quiz,/const PASSING_SCORE = 7/);
  assert.match(quiz,/hasProAccess\(user\.plan\)/);
  assert.match(quiz,/purpose: "exam"/);
  assert.match(quiz,/createHmac\("sha256"/);
  assert.match(quiz,/timingSafeEqual/);
  assert.match(quiz,/!previousIds\.has\(question\.id\)/);
  assert.match(quiz,/acrossModules/);
  assert.match(quiz,/verification|verifyTicket/i);
  assert.match(quiz,/courseId: "trading-pro-v1"/);
  assert.match(quiz,/prisma\.courseAttempt\.create/);
  assert.match(quiz,/prisma\.courseAttempt\.findUnique/);
  assert.match(quiz,/history/);
  assert.doesNotMatch(quiz,/20-question assessment|Submit exactly 20 answers/);
  const getHandler = quiz.split("export async function POST")[0];
  assert.doesNotMatch(getHandler,/correctChoice:|explanation:|answer:/);
});

test("Pro learner shows one quiz question at a time with Back/Next and saved results",async()=>{
  const page=await read("src/app/dashboard/pro/page.tsx");
  assert.match(page,/const question=exam\?\.questions\[step\]/);
  assert.match(page,/Next →/);
  assert.match(page,/← Back/);
  assert.match(page,/Finish & see result/);
  assert.match(page,/Refresh eight questions/);
  assert.match(page,/token:exam\.token/);
  assert.match(page,/\/api\/pro\/quiz\?history=1/);
  assert.match(page,/\/api\/pro\/media/);
  assert.match(page,/href="\/dashboard"/);
  assert.match(page,/preload="none"/);
});

test("Pro media endpoints require Pro/admin access and use private storage",async()=>{
  const media=await read("src/app/api/pro/media/route.ts");
  const preview=await read("src/app/api/admin/pro-preview/route.ts");
  const uploads=await read("src/app/api/admin/pro-assets/route.ts");
  assert.match(media,/requireAuth\(req\)/);
  assert.match(media,/hasProAccess/);
  assert.match(media,/get\(source,\{access:"private"/);
  assert.match(media,/\.private\.blob\.vercel-storage\.com/);
  assert.match(preview,/requireAdmin\(request\)/);
  assert.match(preview,/get\(asset\.url, \{ access: "private"/);
  assert.match(uploads,/requireAdmin/);
  assert.match(uploads,/handleUpload/);
  assert.match(uploads,/head\(data\.url\)/);
  assert.match(uploads,/blob\.size > 0/);
  assert.match(uploads,/trading-pro-v1/);
  assert.equal((uploads.match(/"pro-module-\d":/g)||[]).length,6);
  for(const res of ["handbook","workbook","journal","cases","practice"]){
    assert.match(uploads,new RegExp('"pro-'+res+'":'));
  }
  assert.doesNotMatch(uploads,/RESTRICTED/);
  const admin=await read("src/app/admin/pro-assets/page.tsx");
  assert.match(admin,/access:"private"/);
  assert.match(admin,/\/api\/admin\/pro-preview/);
});

test("Pro is open for enrollment, charging ₹500 after private media checks",async()=>{
  const homepage=await read("src/app/page.tsx");
  const signup=await read("src/app/signup/SignupContent.tsx");
  const payment=await read("src/app/api/payment/create-order/route.ts");
  assert.match(homepage,/six additional Pro video lessons/);
  assert.match(homepage,/Enroll in Pro — ₹500/);
  assert.match(signup,/availability\.pro/);
  assert.match(payment,/enrollmentFlagEnabled/);
  assert.match(payment,/verifiedCourseAssetsReady/);
  const gate = await read("src/lib/course-enrollment.ts");
  assert.match(gate,/return plan === "300" \|\| plan === "500"/);
  assert.match(gate,/PRO_REQUIRED_IDS/);
  assert.match(gate,/head\(asset\.url\)/);
  const starterQuiz=await read("src/app/api/trading/quiz/route.ts");
  assert.match(starterQuiz,/courseId: "trading-starter-v1"/);
});
