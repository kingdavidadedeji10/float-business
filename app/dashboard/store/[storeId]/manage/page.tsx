"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Store } from "@/types/store";
import { formatCurrency } from "@/lib/helpers";
import Link from "next/link";
import StoreSwitcher from "@/components/dashboard/StoreSwitcher";

interface Stats {
  totalEarnings: number;
  totalOrders: number;
  totalProducts: number;
  recentOrders: Array<{
    id: string;
    customer_name: string;
    total: number;
    status: string;
    created_at: string;
  }>;
}

export default function ManagePage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalEarnings: 0,
    totalOrders: 0,
    totalProducts: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: storeData }, { data: storesData }] = await Promise.all([
        supabase.from("stores").select("*").eq("id", storeId).single(),
        supabase.from("stores").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
      ]);

      if (storeData) setStore(storeData as Store);
      setAllStores(storesData || []);

      const [{ data: ordersData }, { data: productsData }] = await Promise.all([
        supabase.from("orders").select("id, customer_name, total, status, created_at").eq("store_id", storeId).order("created_at", { ascending: false }),
        supabase.from("products").select("id").eq("store_id", storeId),
      ]);

      const orders = ordersData || [];
      const paidOrders = orders.filter((o) => o.status === "paid");

      setStats({
        totalEarnings: paidOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        totalOrders: orders.length,
        totalProducts: (productsData || []).length,
        recentOrders: orders.slice(0, 5),
      });

      setLoading(false);
    }
    loadData();
  }, [storeId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading…
      </div>
    );
  }

  const tabs = [
    { label: "Overview", href: `/dashboard/store/${storeId}/manage`, active: true },
    { label: "Orders", href: `/dashboard/store/${storeId}/manage/orders` },
    { label: "Products", href: `/dashboard/store/${storeId}/manage/products` },
    { label: "Customers", href: `/dashboard/store/${storeId}/manage/customers` },
    { label: "Transactions", href: `/dashboard/store/${storeId}/manage/transactions` },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-indigo-600 text-sm hover:underline">
            ← Dashboard
          </Link>
          <StoreSwitcher currentStoreId={storeId} stores={allStores} />
        </div>
        <div className="flex gap-2">
          <Link
            href={`/store/${store?.slug}`}
            target="_blank"
            className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            View Store
          </Link>
          <Link
            href={`/dashboard/stores/${storeId}/settings`}
            className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            Settings
          </Link>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 overflow-x-auto">
        <div className="flex gap-1 max-w-5xl mx-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              href={tab.href}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                tab.active
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Earnings</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {formatCurrency(stats.totalEarnings)}
            </p>
            <p className="text-xs text-green-600 mt-1">From paid orders</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Products</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
            <Link
              href={`/dashboard/store/${storeId}/manage/products`}
              className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
            >
              Manage products →
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link
              href={`/dashboard/store/${storeId}/manage/orders`}
              className="text-xs text-indigo-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">No orders yet.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Customer</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{order.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : order.status === "delivered"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
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
