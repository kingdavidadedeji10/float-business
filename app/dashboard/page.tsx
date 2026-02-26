"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Store } from "@/types/store";
import StoreCard from "@/components/dashboard/StoreCard";
import BalanceCard from "@/components/dashboard/BalanceCard";
import PaymentSetupModal from "@/components/dashboard/PaymentSetupModal";
import Link from "next/link";

export default function DashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingPayouts, setPendingPayouts] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [paymentModalStore, setPaymentModalStore] = useState<Store | null>(null);

  const hasPaymentSetup = stores.some((s) => s.payment_status === "active");
  const storesWithoutPayment = stores.filter((s) => !s.payment_status || s.payment_status === "pending");

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: storeData } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      const loadedStores: Store[] = storeData || [];
      setStores(loadedStores);

      if (loadedStores.length > 0) {
        const storeIds = loadedStores.map((s) => s.id);
        const { data: orderData } = await supabase
          .from("orders")
          .select("amount, payment_status")
          .in("store_id", storeIds);

        if (orderData) {
          const { earnings, pending, count } = orderData.reduce(
            (acc, o) => {
              if (o.payment_status === "paid") {
                acc.earnings += o.amount || 0;
                acc.count += 1;
              } else {
                acc.pending += o.amount || 0;
              }
              return acc;
            },
            { earnings: 0, pending: 0, count: 0 }
          );
          setTotalEarnings(earnings);
          setPendingPayouts(pending);
          setOrderCount(count);
        }
      }

      setLoading(false);
    }

    loadData();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function handlePaymentSaved() {
    if (!paymentModalStore) return;
    setStores((prev) =>
      prev.map((s) => s.id === paymentModalStore.id ? { ...s, payment_status: "submitted" } : s)
    );
    setPaymentModalStore(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-700">Float Business</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900 transition"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Stores</h2>
          <Link
            href="/dashboard/stores/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
          >
            + New Store
          </Link>
        </div>

        <BalanceCard
          totalEarnings={totalEarnings}
          orderCount={orderCount}
          pendingPayouts={pendingPayouts}
          hasPaymentSetup={hasPaymentSetup}
        />

        {!loading && stores.length > 0 && storesWithoutPayment.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-yellow-800">
                ⚠️ Add bank details to receive payments
              </p>
              <p className="text-xs text-yellow-700 mt-0.5">
                {storesWithoutPayment.length === 1
                  ? `"${storesWithoutPayment[0].name}" doesn't have bank details added yet.`
                  : `${storesWithoutPayment.length} stores don't have bank details yet.`}
              </p>
            </div>
            <button
              onClick={() => setPaymentModalStore(storesWithoutPayment[0])}
              className="shrink-0 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-700 transition"
            >
              Add Bank Details
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You haven&apos;t created any stores yet.</p>
            <Link
              href="/dashboard/stores/create"
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Create Your First Store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>

      {paymentModalStore && (
        <PaymentSetupModal
          storeId={paymentModalStore.id}
          storeName={paymentModalStore.name}
          onClose={() => setPaymentModalStore(null)}
          onSaved={handlePaymentSaved}
        />
      )}
    </div>
  );
}
