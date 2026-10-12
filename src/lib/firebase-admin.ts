import {
  cert,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

let cachedAuth: Auth | null = null;

function firebaseAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase server configuration is missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.",
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getFirebaseAdminAuth(): Auth {
  if (!cachedAuth) {
    cachedAuth = getAuth(firebaseAdminApp());
  }
  return cachedAuth;
}

// Keep the existing import surface while delaying credential parsing until an
// authenticated request actually uses Firebase Admin. This lets build systems
// compile the application without granting feature previews production service
// account credentials. Runtime requests still fail closed if configuration is
// missing.
export const firebaseAdminAuth: Auth = new Proxy({} as Auth, {
  get(_target, property) {
    const auth = getFirebaseAdminAuth();
    const value = Reflect.get(auth as object, property, auth);
    return typeof value === "function" ? value.bind(auth) : value;
  },
});
