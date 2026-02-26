interface BalanceCardProps {
  totalEarnings: number;
  orderCount: number;
  pendingPayouts: number;
  hasPaymentSetup: boolean;
}

export default function BalanceCard({ totalEarnings, orderCount, pendingPayouts, hasPaymentSetup }: BalanceCardProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white">
        <p className="text-sm font-medium opacity-80">Total Earnings</p>
        <p className="text-3xl font-bold mt-1">
          {hasPaymentSetup ? `₦${totalEarnings.toLocaleString()}` : "—"}
        </p>
        <p className="text-xs opacity-70 mt-2">
          {hasPaymentSetup ? `${orderCount} completed order${orderCount !== 1 ? "s" : ""}` : "Connect Paystack to see your balance"}
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <p className="text-sm font-medium text-gray-500">Pending Payouts</p>
        <p className="text-3xl font-bold mt-1 text-gray-900">
          {hasPaymentSetup ? `₦${pendingPayouts.toLocaleString()}` : "—"}
        </p>
        <p className="text-xs text-gray-400 mt-2">Orders not yet paid out</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
        <p className="text-sm font-medium text-gray-500">Payment Status</p>
        {hasPaymentSetup ? (
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
            <span className="text-green-700 font-semibold text-sm">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
            <span className="text-yellow-700 font-semibold text-sm">Not Connected</span>
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2">
          {hasPaymentSetup ? "Paystack subaccount linked" : "Set up Paystack to receive payments"}
        </p>
      </div>
    </div>
  );
}
