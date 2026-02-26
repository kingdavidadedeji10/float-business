"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Order } from "@/types/order";
import { Delivery } from "@/types/delivery";
import StatusTimeline from "@/components/tracking/StatusTimeline";
import Link from "next/link";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async () => {
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
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading tracking info...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-500">{error || "Order not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Link href={`/order/${orderId}/confirmation`} className="text-indigo-600 text-sm hover:underline">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Track Order</h1>
        </div>

        {/* Delivery details */}
        {delivery ? (
          <>
            <div className="bg-white rounded-xl p-4 space-y-2">
              <h2 className="font-semibold text-gray-900">Delivery Details</h2>
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
                  <span className="text-gray-500">Current Status</span>
                  <span className="capitalize font-medium text-gray-900">{delivery.status}</span>
                </div>
                {delivery.estimated_delivery_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estimated Delivery</span>
                    <span className="text-gray-700">
                      {new Date(delivery.estimated_delivery_date).toLocaleDateString("en-NG")}
                    </span>
                  </div>
                )}
                {delivery.delivered_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivered At</span>
                    <span className="text-green-600">
                      {new Date(delivery.delivered_at).toLocaleString("en-NG")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status timeline */}
            <div className="bg-white rounded-xl p-4">
              <h2 className="font-semibold text-gray-900 mb-4">Status History</h2>
              <StatusTimeline
                currentStatus={delivery.status}
                history={delivery.status_history || []}
              />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center">
            <p className="text-gray-500 text-sm">No delivery information available yet.</p>
            <p className="text-gray-400 text-xs mt-1">Delivery is being arranged for your order.</p>
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">Auto-refreshes every 30 seconds</p>
      </div>
    </div>
  );
}
