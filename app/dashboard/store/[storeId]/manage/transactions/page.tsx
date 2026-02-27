"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/helpers";
import Link from "next/link";
import StoreHeader from "@/components/dashboard/StoreHeader";
import { Store } from "@/types/store";

interface Transaction {
  id: string;
  customer_name: string;
  customer_email: string | null;
  total: number;
  status: string;
  paystack_reference: string | null;
  created_at: string;
}

export default function TransactionsPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      const [{ data: storeData }, { data: storesData }, { data: ordersData }] = await Promise.all([
        supabase.from("stores").select("*").eq("id", storeId).single(),
        user ? supabase.from("stores").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
        supabase
          .from("orders")
          .select("id, customer_name, customer_email, total, status, paystack_reference, created_at")
          .eq("store_id", storeId)
          .eq("status", "paid")
          .order("created_at", { ascending: false }),
      ]);

      if (storeData) setStore(storeData as Store);
      setAllStores(storesData || []);
      setTransactions(ordersData || []);
      setLoading(false);
    }
    loadData();
  }, [storeId, refreshKey]);

  function handleRefresh() {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 800);
  }

  const filtered = transactions.filter((t) => {
    const date = new Date(t.created_at);
    if (filterFrom && date < new Date(filterFrom)) return false;
    if (filterTo && date > new Date(filterTo + "T23:59:59")) return false;
    return true;
  });

  const tabs = [
    { label: "Overview", href: `/dashboard/store/${storeId}/manage` },
    { label: "Orders", href: `/dashboard/store/${storeId}/manage/orders` },
    { label: "Products", href: `/dashboard/store/${storeId}/manage/products` },
    { label: "Customers", href: `/dashboard/store/${storeId}/manage/customers` },
    { label: "Transactions", href: `/dashboard/store/${storeId}/manage/transactions`, active: true },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: store?.name ?? "Store", href: `/dashboard/store/${storeId}/manage` },
          { label: "Transactions" },
        ]}
        storeId={storeId}
        storeSlug={store?.slug}
        allStores={allStores}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="bg-white border-b border-gray-200 px-4 overflow-x-auto">
        <div className="flex gap-1 max-w-5xl mx-auto">
          {tabs.map((tab) => (
            <Link key={tab.label} href={tab.href} className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${tab.active ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
          <div className="flex items-center gap-2 text-sm">
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
              placeholder="From"
            />
            <span className="text-gray-400">–</span>
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
              placeholder="To"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No transactions found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Reference</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <p>{t.customer_name}</p>
                      {t.customer_email && <p className="text-xs text-gray-500">{t.customer_email}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-700">{formatCurrency(t.total)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{t.paystack_reference || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total ({filtered.length} transactions)</span>
            <span className="font-bold text-gray-900">{formatCurrency(filtered.reduce((s, t) => s + t.total, 0))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
