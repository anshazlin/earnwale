import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  throw new Error("Refusing to seed test data in production.");
}
if (process.env.ALLOW_EARNWALE_TEST_SEED !== "YES") {
  throw new Error("Set ALLOW_EARNWALE_TEST_SEED=YES explicitly for a development/test environment.");
}

const email = String(process.env.EARNWALE_TEST_EMAIL || "").trim().toLowerCase();
const password = String(process.env.EARNWALE_TEST_PASSWORD || "");
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!email || !email.includes("test") || !password || password.length < 8) {
  throw new Error("Provide a clearly identifiable EARNWALE_TEST_EMAIL containing 'test' and a test password of at least 8 characters.");
}
if (!projectId || !clientEmail || !privateKey) throw new Error("Firebase test environment credentials are missing.");

const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const auth = getAuth(app);
const db = getFirestore(app, "earnwale");

let authUser;
try { authUser = await auth.getUserByEmail(email); }
catch (error) {
  if (error?.code !== "auth/user-not-found") throw error;
  authUser = await auth.createUser({ email, password, emailVerified: true, displayName: "Earnwale Test User" });
}

const existing = await db.collection("users").where("firebaseUid", "==", authUser.uid).limit(1).get();
const userRef = existing.empty ? db.collection("users").doc() : existing.docs[0].ref;
const referralCode = `TEST${authUser.uid.slice(0, 6).toUpperCase()}`;

await userRef.set({
  id: userRef.id,
  name: "Earnwale Test User",
  email,
  firebaseUid: authUser.uid,
  plan: "500",
  referralCode,
  referredBy: null,
  earnings: 900,
  totalEarned: 1350,
  referralCount: 3,
  hasReceivedReward: true,
  isTest: true,
  testDataLabel: "DEVELOPMENT_TEST_ONLY",
  updatedAt: FieldValue.serverTimestamp(),
  createdAt: FieldValue.serverTimestamp(),
}, { merge: true });

const batch = db.batch();
[
  { id: `test_credit_1_${authUser.uid}`, amount: 450, type: "CREDIT", description: "TEST referral reward" },
  { id: `test_credit_2_${authUser.uid}`, amount: 450, type: "CREDIT", description: "TEST referral reward" },
  { id: `test_payment_${authUser.uid}`, amount: 500, type: "PAYMENT", description: "TEST payment record — no real charge" },
].forEach((tx, index) => {
  batch.set(db.collection("transactions").doc(tx.id), {
    ...tx, userId: userRef.id, isTest: true, testDataLabel: "DEVELOPMENT_TEST_ONLY",
    createdAt: new Date(Date.now() - index * 86400000), updatedAt: new Date(),
  }, { merge: true });
});

batch.set(db.collection("withdrawals").doc(`test_withdrawal_${authUser.uid}`), {
  id: `test_withdrawal_${authUser.uid}`, userId: userRef.id, amount: 450, status: "paid",
  isTest: true, testDataLabel: "DEVELOPMENT_TEST_ONLY",
  createdAt: new Date(Date.now() - 4 * 86400000), updatedAt: new Date(),
}, { merge: true });

for (let i = 1; i <= 3; i++) {
  const ref = db.collection("users").doc(`test_referral_${authUser.uid}_${i}`);
  batch.set(ref, {
    id: ref.id, name: `Test Referral ${i}`, email: `referral-${i}-${authUser.uid.slice(0,5)}@example.test`,
    plan: i === 3 ? "500" : "300", referralCode: `TREF${i}${authUser.uid.slice(0,4).toUpperCase()}`,
    referredBy: referralCode, earnings: 0, totalEarned: 0, referralCount: 0,
    isTest: true, testDataLabel: "DEVELOPMENT_TEST_ONLY",
    createdAt: new Date(Date.now() - i * 86400000), updatedAt: new Date(),
  }, { merge: true });
}
await batch.commit();
console.log(`Seeded DEVELOPMENT/TEST customer: ${email} (Firestore user ${userRef.id}). No Razorpay payment was performed.`);
