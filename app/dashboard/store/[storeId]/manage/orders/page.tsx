"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/helpers";
import Link from "next/link";
import StoreSwitcher from "@/components/dashboard/StoreSwitcher";
import { Store } from "@/types/store";
import { Order } from "@/types/order";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "paid"];

export default function ManageOrdersPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      const [{ data: storeData }, { data: storesData }, { data: ordersData }] = await Promise.all([
        supabase.from("stores").select("*").eq("id", storeId).single(),
        user ? supabase.from("stores").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
        supabase.from("orders").select("*").eq("store_id", storeId).order("created_at", { ascending: false }),
      ]);

      if (storeData) setStore(storeData as Store);
      setAllStores(storesData || []);
      setOrders(ordersData || []);
      setLoading(false);
    }
    loadData();
  }, [storeId]);

  async function handleStatusChange(orderId: string, status: string) {
    setUpdatingId(orderId);
    await supabase.from("orders").update({ status }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    setUpdatingId(null);
  }

  const tabs = [
    { label: "Overview", href: `/dashboard/store/${storeId}/manage` },
    { label: "Orders", href: `/dashboard/store/${storeId}/manage/orders`, active: true },
    { label: "Products", href: `/dashboard/store/${storeId}/manage/products` },
    { label: "Customers", href: `/dashboard/store/${storeId}/manage/customers` },
    { label: "Transactions", href: `/dashboard/store/${storeId}/manage/transactions` },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-indigo-600 text-sm hover:underline">← Dashboard</Link>
          <StoreSwitcher currentStoreId={storeId} stores={allStores} />
        </div>
        <div className="flex gap-2">
          <Link href={`/store/${store?.slug}`} target="_blank" className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">View Store</Link>
          <Link href={`/dashboard/stores/${storeId}/settings`} className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">Settings</Link>
        </div>
      </nav>

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
        <h2 className="text-xl font-bold text-gray-900">Orders ({orders.length})</h2>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">No orders yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Customer</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Total</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                        {order.customer_email && <p className="text-xs text-gray-400">{order.customer_email}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          order.status === "paid" || order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "processing"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
