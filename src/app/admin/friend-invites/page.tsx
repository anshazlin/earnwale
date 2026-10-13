"use client";

import { useCallback, useEffect, useState } from "react";

type Invite = {
  id: string; email: string; status: string;
  reserved: boolean; expiresAt: string; amount: number;
};
type Created = { url: string; email: string; expiresAt: string };

export default function AdminFriendInvitesPage() {
  const [email, setEmail] = useState("");
  const [records, setRecords] = useState<Invite[]>([]);
  const [created, setCreated] = useState<Created | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/admin/friend-invites", {
      credentials: "include", cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Unable to load invitations");
    setRecords(payload.invites ?? []);
  }, []);

  useEffect(() => {
    let active = true;
    load().catch(error => {
      if (active) setNotice(error instanceof Error ? error.message : "Unable to load");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [load]);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setNotice(""); setCreated(null); setCopied(false);
    try {
      const response = await fetch("/api/admin/friend-invites", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to generate invitation");
      setCreated({ url: result.url, email: result.email, expiresAt: result.expiresAt });
      setEmail("");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Invitation failed");
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id: string) {
    if (!window.confirm("Revoke this unused ₹1 Pro invitation?")) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/admin/friend-invites", {
        method: "DELETE", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to revoke invite");
      await load();
      setNotice("Unused invitation revoked.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Revoke failed");
    } finally {
      setBusy(false);
    }
  }

  return <main className="mx-auto max-w-4xl space-y-5 px-4 py-7 sm:px-6">
    <header className="rounded-2xl bg-[#071B33] p-6 text-white">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">Earnwale Admin · Private Enrollment</p>
      <h1 className="mt-2 text-2xl font-bold">Friend-only ₹1 Pro invitation</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
        Make one private checkout link for one email. This gives the same Pro account access as a regular ₹500 purchase,
        including Starter and Pro lessons, downloads, assessments and dashboard access.
        Public plan prices remain unchanged and the referral commission is disabled for this invitation.
      </p>
    </header>

    <form onSubmit={create} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <label htmlFor="friend-email" className="block text-sm font-semibold text-slate-900">
          Friend's account email
        </label>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          The invite works only for this exact email. A registered friend must sign in using the same account.
        </p>
        <input id="friend-email" name="email" type="email" required autoComplete="off" value={email}
          onChange={event => setEmail(event.target.value)} placeholder="friend@example.com"
          className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none focus:border-amber-400" />
      </div>
      <button type="submit" disabled={busy || !email.trim()}
        className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50">
        {busy ? "Working…" : "Generate one-time ₹1 Pro link"}
      </button>
    </form>

    {notice && <p role="status" className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{notice}</p>}

    {created && <section className="space-y-3 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Private invitation created</h2>
      <p className="text-sm text-slate-600">For {created.email} · valid for three days or until one successful purchase.</p>
      <label htmlFor="friend-link" className="block text-sm font-semibold text-slate-900">Send this link privately</label>
      <textarea id="friend-link" readOnly rows={3} value={created.url}
        className="w-full break-all rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-800"/>
      <button type="button" onClick={()=>void navigator.clipboard.writeText(created.url).then(()=>setCopied(true)).catch(()=>setNotice("Copy not supported. Select the link above to copy."))}
        className="rounded-xl bg-[#071B33] px-5 py-3 text-sm font-semibold text-white">
        {copied ? "Copied ✓" : "Copy invitation link"}
      </button>
      <p className="text-xs leading-5 text-slate-500">The private link is shown only once. Do not publish it publicly or share any password. If lost, revoke and create another invite.</p>
    </section>}

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Recent invitations</h2>
        <button type="button" disabled={busy} onClick={()=>void load().catch(()=>setNotice("Could not refresh invitations"))}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700">Refresh</button>
      </div>
      {loading ? <p className="mt-4 text-sm text-slate-600">Loading…</p>
      : !records.length ? <p className="mt-4 text-sm text-slate-600">No invitations yet.</p>
      : <div className="mt-3 divide-y divide-slate-100">
          {records.map(invite=><div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="min-w-0">
              <p className="break-all text-sm font-semibold text-slate-900">{invite.email}</p>
              <p className="mt-1 text-xs text-slate-500">
                {invite.status==="redeemed" ? "Redeemed" : invite.reserved ? "Razorpay order started"
                : invite.status!=="pending" ? invite.status : new Date(invite.expiresAt).getTime()<Date.now()?"Expired":"Pending"}
                {" · ₹1 Pro"}
              </p>
            </div>
            {invite.status==="pending" && !invite.reserved &&
              <button type="button" disabled={busy} onClick={()=>void revoke(invite.id)}
                className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50">Revoke</button>}
          </div>)}
        </div>}
      <p className="mt-4 text-xs leading-5 text-slate-500">If an order has started, it cannot be revoked while payment could be in progress. No normal ₹450 Pro referral reward is paid for a ₹1 invitation.</p>
    </section>
  </main>;
}
