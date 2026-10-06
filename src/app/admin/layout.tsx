import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "./_components/admin-shell";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!session) redirect("/login");
  try {
    const decoded = await firebaseAdminAuth.verifySessionCookie(session, true);
    const adminEmail = String(process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
    if (!decoded.email_verified || !adminEmail || String(decoded.email ?? "").toLowerCase() !== adminEmail) redirect("/dashboard");
  } catch { redirect("/login"); }
  return <AdminShell>{children}</AdminShell>;
}
