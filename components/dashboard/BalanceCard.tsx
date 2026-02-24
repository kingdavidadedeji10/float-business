export default function BalanceCard() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-5 text-white mb-6">
      <p className="text-sm font-medium opacity-80">Total Earnings</p>
      <p className="text-3xl font-bold mt-1">—</p>
      <p className="text-xs opacity-70 mt-2">Connect Paystack to see your balance</p>
    </div>
  );
}
