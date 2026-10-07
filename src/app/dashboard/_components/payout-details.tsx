"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileData = {
  name?: string;
  email?: string;
  upiId?: string | null;
  payoutVerified?: boolean;
  verifiedUpiId?: string | null;
  payoutVerifiedAt?: string | null;
  payoutChangeAvailableAt?: string | null;
};

function normalizeUpi(value?: string | null) {
  return String(value ?? "").trim().toLowerCase();
}

function dateTime(value?: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PayoutDetails() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [upiId, setUpiId] = useState("");
  const [confirmUpiId, setConfirmUpiId] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showChange, setShowChange] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.status === 401 || res.status === 403) {
        router.replace("/login");
        return;
      }
      if (!res.ok) throw new Error("Unable to load payout details");
      const data = (await res.json()) as ProfileData;
      setProfile(data);
      const value = normalizeUpi(data?.upiId);
      setUpiId(value);
      setConfirmUpiId(value);
    } catch {
      setMessage({ type: "error", text: "Unable to load payout details." });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const verified = useMemo(() => {
    const current = normalizeUpi(profile?.upiId);
    const locked = normalizeUpi(profile?.verifiedUpiId);
    return Boolean(profile?.payoutVerified && current && locked && current === locked);
  }, [profile]);

  const holdActive = useMemo(() => {
    const until = profile?.payoutChangeAvailableAt;
    return Boolean(until && new Date(until).getTime() > Date.now());
  }, [profile]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    const normalized = normalizeUpi(upiId);
    if (!normalized || normalized !== normalizeUpi(confirmUpiId)) {
      setMessage({ type: "error", text: "UPI IDs must match." });
      return;
    }
    if (!/^[a-z0-9._-]{2,256}@[a-z0-9.-]{2,64}$/i.test(normalized)) {
      setMessage({ type: "error", text: "Enter a valid UPI ID format." });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          upiId: normalized,
          bankName: null,
          accountNumber: null,
          ifscCode: null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Unable to save payout details");

      setProfile((current) => ({
        ...(current ?? {}),
        upiId: normalized,
        payoutVerified: false,
        verifiedUpiId: null,
        payoutVerifiedAt: null,
      }));
      setUpiId(normalized);
      setConfirmUpiId(normalized);
      setMessage({
        type: "success",
        text: "Payout account saved. It will be verified after your first successful manual payout.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error?.message || "Unable to save payout details.",
      });
    } finally {
      setSaving(false);
    }
  };

  const unlockChange = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile?.email || !currentPassword || resetting) return;

    setResetting(true);
    setMessage(null);

    try {
      const { signInWithEmailAndPassword, signOut } = await import("firebase/auth");
      const { firebaseAuth } = await import("@/lib/firebase-client");

      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        profile.email,
        currentPassword,
      );
      const idToken = await credential.user.getIdToken(true);

      const res = await fetch("/api/profile/payout/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken }),
      });

      await signOut(firebaseAuth).catch(() => undefined);

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Unable to change payout account");

      setProfile((current) => ({
        ...(current ?? {}),
        upiId: null,
        payoutVerified: false,
        verifiedUpiId: null,
        payoutVerifiedAt: null,
        payoutChangeAvailableAt: data?.holdUntil ?? null,
      }));
      setUpiId("");
      setConfirmUpiId("");
      setCurrentPassword("");
      setShowChange(false);
      setMessage({
        type: "success",
        text: "Payout account unlocked. Add the new UPI ID below. Withdrawals are paused for 24 hours for security.",
      });
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error?.code === "auth/invalid-credential"
            ? "Current password is incorrect."
            : error?.message || "Unable to confirm your password.",
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Payout account</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Your withdrawal destination is bound to your account after the first successful payout.
          </p>
        </div>
        {!loading && (
          <span
            className={
              verified
                ? "rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-800"
                : profile?.upiId
                  ? "rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-900"
                  : "rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600"
            }
          >
            {verified ? "Verified ✓" : profile?.upiId ? "Pending verification" : "Not set"}
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-5 h-28 animate-pulse rounded-2xl bg-slate-100" />
      ) : verified ? (
        <div className="mt-5">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Verified payout UPI
            </p>
            <p className="mt-2 break-all font-mono text-base font-semibold text-emerald-950">
              {profile?.verifiedUpiId}
            </p>
            {profile?.payoutVerifiedAt && (
              <p className="mt-2 text-[11px] text-emerald-700">
                Bound after successful payout on {dateTime(profile.payoutVerifiedAt)}
              </p>
            )}
          </div>

          {!showChange ? (
            <button
              type="button"
              onClick={() => {
                setShowChange(true);
                setMessage(null);
              }}
              className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Change payout account
            </button>
          ) : (
            <form
              onSubmit={unlockChange}
              className="mt-4 space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-amber-950">
                  Confirm current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Your account password"
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-400"
                />
              </div>
              <p className="text-[11px] leading-5 text-amber-800">
                Changing a verified payout account removes its verified status and pauses withdrawals for 24 hours. The new UPI must be verified again through a successful payout.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChange(false);
                    setCurrentPassword("");
                  }}
                  className="rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-xs font-semibold text-amber-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetting || !currentPassword}
                  className="rounded-xl bg-amber-400 px-3 py-2.5 text-xs font-semibold text-slate-950 disabled:opacity-50"
                >
                  {resetting ? "Confirming…" : "Unlock change"}
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={save} className="mt-5 space-y-3">
          {holdActive && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
              Security hold active. You can save the new UPI now, but withdrawals will be available after{" "}
              <span className="font-semibold">{dateTime(profile?.payoutChangeAvailableAt)}</span>.
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">UPI ID</label>
            <input
              value={upiId}
              onChange={(event) => setUpiId(event.target.value)}
              placeholder="name@bank"
              autoComplete="off"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Confirm UPI ID</label>
            <input
              value={confirmUpiId}
              onChange={(event) => setConfirmUpiId(event.target.value)}
              placeholder="name@bank"
              autoComplete="off"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-60"
          >
            {saving ? "Saving…" : profile?.upiId ? "Update payout UPI" : "Set payout UPI"}
          </button>

          <p className="text-[11px] leading-5 text-slate-500">
            Use a UPI ID in your own name. On the first payout, Earnwale manually checks the beneficiary name. After a successful payout, this UPI becomes verified and locked to your account.
          </p>
        </form>
      )}

      {message && (
        <p
          className={
            message.type === "success"
              ? "mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700"
              : "mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700"
          }
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
