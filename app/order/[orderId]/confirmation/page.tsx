"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatCurrency } from "@/lib/helpers";
import { Order } from "@/types/order";
import { Delivery } from "@/types/delivery";
import Link from "next/link";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Order not found");
        const data = await res.json();
        setOrder(data.order);
        setDelivery(data.delivery);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load order";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error || "Order not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Success header */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h1 className="text-xl font-bold text-green-800">Order Confirmed!</h1>
          <p className="text-green-600 text-sm mt-1">Your payment was successful</p>
        </div>

        {/* Order details */}
        <div className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono text-xs text-gray-700 truncate max-w-[180px]">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount Paid</span>
              <span className="font-semibold text-gray-900">{formatCurrency(order.amount)}</span>
            </div>
            {order.buyer_name && (
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="text-gray-700">{order.buyer_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Email</span>
              <span className="text-gray-700">{order.buyer_email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery</span>
              <span className="capitalize text-gray-700">{order.delivery_type || "pickup"}</span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        {delivery && (
          <div className="bg-white rounded-xl p-4 space-y-3">
            <h2 className="font-semibold text-gray-900">Delivery Info</h2>
            <div className="space-y-2 text-sm">
              {delivery.tracking_code && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking Code</span>
                  <span className="font-mono text-indigo-600">{delivery.tracking_code}</span>
                </div>
              )}
              {delivery.courier_name && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Courier</span>
                  <span className="text-gray-700">{delivery.courier_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="capitalize text-gray-700">{delivery.status}</span>
              </div>
              {delivery.estimated_delivery_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Estimated Delivery</span>
                  <span className="text-gray-700">
                    {new Date(delivery.estimated_delivery_date).toLocaleDateString("en-NG")}
                  </span>
                </div>
              )}
            </div>

            {delivery.tracking_code && (
              <Link
                href={`/order/${order.id}/track`}
                className="block w-full text-center bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition mt-2"
              >
                Track Order
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
