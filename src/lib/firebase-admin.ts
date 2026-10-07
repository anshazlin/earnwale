import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function privateKey() {
  const value = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!value) throw new Error("FIREBASE_PRIVATE_KEY is missing");
  return value;
}

const app = getApps()[0] ?? initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey(),
  }),
});

export const firebaseAdminAuth = getAuth(app);
