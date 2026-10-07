import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "./_components/dashboard-shell";
import { firebaseAdminAuth } from "@/lib/firebase-admin";
import { SESSION_COOKIE } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!session) redirect("/login");
  try {
    const decoded = await firebaseAdminAuth.verifySessionCookie(session, true);
    if (!decoded.email_verified) redirect("/login?verify=1");
  } catch { redirect("/login"); }
  return <DashboardShell>{children}</DashboardShell>;
}
