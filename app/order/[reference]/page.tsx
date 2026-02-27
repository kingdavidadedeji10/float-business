"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/helpers";
import { Order, Delivery } from "@/types/order";

interface OrderData {
  order: Order;
  delivery: Delivery | null;
  product: { name: string; image_url: string | null; price: number } | null;
  store: { name: string; slug: string } | null;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const reference = params.reference as string;
  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/orders/${reference}`);
        if (!res.ok) {
          setError("Order not found.");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading order…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error || "Order not found."}</p>
        <Link href="/" className="text-indigo-600 hover:underline">
          Go Home
        </Link>
      </div>
    );
  }

  const { order, delivery, product, store } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-lg mx-auto p-4 sm:p-6 space-y-6">
        {/* Success banner */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h1 className="text-xl font-bold text-green-800">Payment Successful!</h1>
          <p className="text-green-700 text-sm mt-1">
            Your order has been placed successfully.
          </p>
          <p className="text-xs text-green-600 mt-2 font-mono">Ref: {reference}</p>
        </div>

        {/* Product info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Order Details
          </h2>
          <div className="flex gap-3 items-start">
            {product?.image_url ? (
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={product.image_url}
                  alt={product.name || "Product"}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{product?.name || "Product"}</p>
              {order.variant_selections &&
                Object.entries(order.variant_selections).map(([k, v]) => (
                  <p key={k} className="text-xs text-gray-500">
                    {k}: {v}
                  </p>
                ))}
              <p className="text-sm text-gray-600 mt-1">
                Qty: {order.quantity} × {formatCurrency(order.unit_price)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.delivery_fee > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery fee</span>
                <span>{formatCurrency(order.delivery_fee)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-1">
              <span>Total paid</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        {order.delivery_method === "delivery" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Delivery Information
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <span className="font-medium">Address: </span>
                {order.customer_address}
              </div>
              {delivery ? (
                <>
                  <div>
                    <span className="font-medium">Courier: </span>
                    {delivery.courier}
                  </div>
                  <div>
                    <span className="font-medium">Estimated delivery: </span>
                    {delivery.estimated_delivery}
                  </div>
                  {delivery.tracking_id && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 mt-2">
                      <p className="text-xs text-indigo-600 font-medium">Tracking ID</p>
                      <p className="font-mono text-indigo-800 font-bold">{delivery.tracking_id}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-xs">
                  Delivery details will be updated shortly.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pickup info */}
        {order.delivery_method === "pickup" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Pickup
            </h2>
            <p className="text-sm text-gray-700">
              Your order is ready for pickup. Contact the store for pickup details.
            </p>
          </div>
        )}

        {/* Customer info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Contact Details
          </h2>
          <div className="space-y-1 text-sm text-gray-700">
            <p>
              <span className="font-medium">Name: </span>
              {order.customer_name}
            </p>
            <p>
              <span className="font-medium">Phone: </span>
              {order.customer_phone}
            </p>
            {order.customer_email && (
              <p>
                <span className="font-medium">Email: </span>
                {order.customer_email}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {store && (
            <Link
              href={`/store/${store.slug}`}
              className="w-full text-center bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Continue Shopping
            </Link>
          )}
          {delivery?.tracking_id && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(delivery.tracking_id!);
                alert("Tracking ID copied!");
              }}
              className="w-full text-center border border-indigo-600 text-indigo-600 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition"
            >
              Copy Tracking ID
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
