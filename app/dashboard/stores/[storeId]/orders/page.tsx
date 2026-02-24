"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types/order";
import OrderList from "@/components/dashboard/OrderList";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrdersPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("");

  useEffect(() => {
    async function loadData() {
      const { data: store } = await supabase
        .from("stores")
        .select("name")
        .eq("id", storeId)
        .single();

      if (store) setStoreName(store.name);

      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      setOrders(data || []);
      setLoading(false);
    }

    loadData();
  }, [storeId]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <Link href="/dashboard" className="text-indigo-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{storeName} - Orders</h1>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/stores/${storeId}/products`}
              className="text-sm text-gray-600 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Products
            </Link>
            <Link
              href={`/dashboard/stores/${storeId}/settings`}
              className="text-sm text-gray-600 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              Settings
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading orders...</div>
        ) : (
          <OrderList orders={orders} />
        )}
      </div>
    </div>
  );
}
