import { PayoutDetails } from "../_components/payout-details";
import { WithdrawSection } from "../_components/withdraw-section";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Wallet & payouts</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Wallet</h1>
        <p className="mt-1 text-sm text-slate-500">Manage payout details and withdraw your available referral earnings.</p>
      </header>

      <PayoutDetails />
      <WithdrawSection embedded />
    </div>
  );
}
