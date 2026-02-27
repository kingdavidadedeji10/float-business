"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/helpers";
import Link from "next/link";
import StoreHeader from "@/components/dashboard/StoreHeader";
import { Store } from "@/types/store";

interface Customer {
  name: string;
  phone: string;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string;
}

export default function CustomersPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      const [{ data: storeData }, { data: storesData }, { data: ordersData }] = await Promise.all([
        supabase.from("stores").select("*").eq("id", storeId).single(),
        user ? supabase.from("stores").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
        supabase
          .from("orders")
          .select("customer_name, customer_phone, customer_email, total, status, created_at")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false }),
      ]);

      if (storeData) setStore(storeData as Store);
      setAllStores(storesData || []);

      // Aggregate orders by customer phone
      const customerMap = new Map<string, Customer>();
      for (const order of ordersData || []) {
        const key = order.customer_phone || order.customer_name;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            name: order.customer_name,
            phone: order.customer_phone,
            email: order.customer_email,
            totalOrders: 0,
            totalSpent: 0,
            lastOrderAt: order.created_at,
          });
        }
        const c = customerMap.get(key)!;
        c.totalOrders += 1;
        if (order.status === "paid") c.totalSpent += order.total || 0;
        if (order.created_at > c.lastOrderAt) c.lastOrderAt = order.created_at;
      }

      setCustomers(Array.from(customerMap.values()));
      setLoading(false);
    }
    loadData();
  }, [storeId, refreshKey]);

  function handleRefresh() {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 800);
  }

  const tabs = [
    { label: "Overview", href: `/dashboard/store/${storeId}/manage` },
    { label: "Orders", href: `/dashboard/store/${storeId}/manage/orders` },
    { label: "Products", href: `/dashboard/store/${storeId}/manage/products` },
    { label: "Customers", href: `/dashboard/store/${storeId}/manage/customers`, active: true },
    { label: "Transactions", href: `/dashboard/store/${storeId}/manage/transactions` },
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
          { label: "Customers" },
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
          <h2 className="text-xl font-bold text-gray-900">Customers ({customers.length})</h2>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {customers.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No customers yet.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Customer</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Orders</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Total Spent</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Last Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.phone}</p>
                      {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{c.totalOrders}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(c.totalSpent)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(c.lastOrderAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
