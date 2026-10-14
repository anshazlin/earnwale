"use client";

export type PurchaseStep =
  | "idle"
  | "confirming"
  | "completed"
  | "email-warning"
  | "existing-complete"
  | "payment-error";

export type VerificationEmailStatus = "sending" | "sent" | "failed";

type Props = {
  step: PurchaseStep;
  email: string;
  emailStatus: VerificationEmailStatus;
  onLogin: () => void;
  onDashboard: () => void;
};

export default function PurchaseStatusDialog({
  step, email, emailStatus, onLogin, onDashboard,
}: Props) {
  if (step === "idle") return null;

  const confirming = step === "confirming";
  const problem = step === "payment-error";
  const existing = step === "existing-complete";
  const success = step === "completed" || step === "email-warning" || existing;
  const title = confirming
    ? "Confirming your payment"
    : problem
      ? "Payment needs verification"
      : existing
        ? "Enrollment successful!"
        : "Payment successful!";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/80 p-4 sm:p-6">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="purchase-status-title"
        aria-describedby="purchase-status-details"
        className="my-auto w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${problem ? "bg-amber-100 text-amber-700" : success ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
          {confirming
            ? <span className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
            : <span className="text-3xl font-bold" aria-hidden="true">{problem ? "!" : "✓"}</span>}
        </div>

        <h2 id="purchase-status-title" className="mt-5 text-2xl font-bold text-slate-950">
          {title}
        </h2>

        {confirming ? (
          <p id="purchase-status-details" className="mt-3 text-sm leading-6 text-slate-700">
            Razorpay has returned your payment details. We are securely confirming your enrollment.
            Please wait and do not make a second payment.
          </p>
        ) : problem ? (
          <div id="purchase-status-details" className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            <p>We could not confirm your enrollment yet. If money has been deducted, <strong>do not pay again</strong>.</p>
            <p>Contact support with your Razorpay payment reference so the payment can be checked.</p>
            <a href="mailto:support@earnwale.com?subject=Earnwale%20payment%20verification"
              className="inline-flex font-semibold text-amber-700 underline underline-offset-4">Email Earnwale support</a>
          </div>
        ) : existing ? (
          <div id="purchase-status-details" className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            <p>Your payment is verified and course access is active on your existing account.</p>
            <p>Opening your dashboard now…</p>
          </div>
        ) : (
          <div id="purchase-status-details" className="mt-3 space-y-3 text-sm leading-6 text-slate-700">
            <p>Your payment is verified and your Earnwale course account has been created.</p>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
              <p className="text-base font-bold">Verify your email before logging in</p>
              {email && <p className="mt-1 break-all font-medium">{email}</p>}
              <p className="mt-2">
                Open the verification link sent to your inbox. If it is not there,
                check <strong>Spam, Junk and Promotions</strong>. Delivery can take a few minutes.
              </p>
            </div>
            {emailStatus === "sending" && (
              <p role="status" className="font-medium text-blue-800">
                Preparing your verification email… You can continue to login below.
              </p>
            )}
            {emailStatus === "sent" && (
              <p role="status" className="font-medium text-emerald-800">
                Verification email requested successfully. Opening login shortly…
              </p>
            )}
            {emailStatus === "failed" && (
              <p role="status" className="font-medium text-amber-800">
                We could not confirm that the verification email was sent.
                You can request another by signing in; also check Spam/Junk.
              </p>
            )}
          </div>
        )}

        {success && (
          <button
            type="button"
            onClick={existing ? onDashboard : onLogin}
            className="mt-6 w-full rounded-xl bg-amber-500 px-5 py-3.5 text-base font-bold text-slate-950 transition hover:bg-amber-400"
          >
            {existing ? "Open my dashboard →" : "Continue to login →"}
          </button>
        )}
        {problem && (
          <a href="/login?verify=1" className="mt-6 inline-flex w-full justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900">
            I already have an account — Login
          </a>
        )}
      </section>
    </div>
  );
}
