import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const read = p => readFile(new URL(`../${p}`,import.meta.url),"utf8");

test("Pro requires its release flag while Starter can open automatically in Razorpay Test Mode",async()=>{
  const source=await read("src/lib/course-enrollment.ts");
  assert.match(source,/EARNWALE_STARTER_ENROLLMENT_ENABLED === "true"/);
  assert.match(source,/EARNWALE_PRO_ENROLLMENT_ENABLED === "true"/);
  assert.match(source,/isOneRupeeTestCheckout\(\)/);
  assert.match(source,/enrollmentFlagEnabled\(plan\) && await verifiedCourseAssetsReady\(plan\)/);
  const order=await read("src/app/api/payment/create-order/route.ts");
  assert.match(order,/if \(!enrollmentFlagEnabled\(selectedPlan\)\)/);
  assert.match(order,/if \(!\(await verifiedCourseAssetsReady\(selectedPlan\)\)\)/);
  assert.match(order,/status: 503/);
  const amounts=await read("src/lib/payment-amounts.ts");
  assert.match(amounts,/"500": 50000/);
  assert.match(amounts,/"300": 30000/);
});

test("the Pro purchase gate verifies all 19 resources, including the 8 Starter resources",async()=>{
  const readiness=await read("src/lib/course-enrollment.ts");
  assert.match(readiness,/\.\.\.COURSE_MODULES\.map\(module => `module-\$\{module\.id\}`\)/);
  assert.match(readiness,/\.\.\.PRO_MODULES\.map\(module => `pro-module-\$\{module\.id\}`\)/);
  assert.match(readiness,/\.\.\.PRO_RESOURCES\.map\(resource => `pro-\$\{resource\.id\}`\)/);
  assert.match(readiness,/\[\.\.\.STARTER_REQUIRED_IDS, \.\.\.PRO_REQUIRED_IDS\]/);
  assert.match(readiness,/prisma\.courseAsset\.findUnique/);
  assert.match(readiness,/\.private\.blob\.vercel-storage\.com/);
  assert.match(readiness,/await head\(asset\.url\)/);
  assert.match(readiness,/stored\.size > 0/);
  assert.match(readiness,/catch \{\s*return false;/);
});

test("public availability exposes booleans only and signup always honors server state",async()=>{
  const api=await read("src/app/api/academy/enrollment-status/route.ts");
  assert.match(api,/enrollmentAvailable\("300"\)/);
  assert.match(api,/enrollmentAvailable\("500"\)/);
  assert.match(api,/NextResponse\.json\(\{ starter, pro \}/);
  assert.doesNotMatch(api,/url:\s*asset|pathname/);
  const signup=await read("src/app/signup/SignupContent.tsx");
  assert.match(signup,/\/api\/academy\/enrollment-status/);
  assert.match(signup,/availability\.pro/);
  assert.match(signup,/availability\.starter/);
  assert.match(signup,/selectedAvailable/);
  assert.match(signup,/searchParams\.get\("plan"\)/);
  const homepage=await read("src/app/page.tsx");
  assert.match(homepage,/href="\/signup\?plan=500"/);
  assert.match(homepage,/enrollment\?\.pro/);
});
