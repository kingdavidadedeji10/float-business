"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/helpers";
import { Store } from "@/types/store";
import { getCart, CartItem, updateQuantity, removeFromCart, clearCart } from "@/lib/cart";

export default function CartPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [store, setStore] = useState<Store | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const refreshCart = useCallback((storeId: string) => {
    setCartItems(getCart(storeId));
  }, []);

  useEffect(() => {
    async function load() {
      const { data: storeData } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!storeData) {
        router.push("/");
        return;
      }
      setStore(storeData as Store);
      setCartItems(getCart(storeData.id));
      setLoading(false);
    }
    load();
  }, [slug, router]);

  function handleQuantityChange(productId: string, qty: number) {
    if (!store) return;
    updateQuantity(store.id, productId, qty);
    refreshCart(store.id);
  }

  function handleRemove(productId: string) {
    if (!store) return;
    removeFromCart(store.id, productId);
    refreshCart(store.id);
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleCheckout() {
    if (!store) return;
    setError("");
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    // Validate cart items against current stock
    const productIds = cartItems.map((i) => i.productId);
    const { data: products } = await supabase
      .from("products")
      .select("id, quantity")
      .in("id", productIds);

    if (products && products.length > 0) {
      let stockError = false;
      const updatedItems = cartItems.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product && product.quantity != null && item.quantity > product.quantity) {
          stockError = true;
          return { ...item, quantity: product.quantity, stockQuantity: product.quantity };
        }
        return item;
      });

      if (stockError) {
        updatedItems
          .filter((item, idx) => item.quantity !== cartItems[idx].quantity)
          .forEach((item) => updateQuantity(store.id, item.productId, item.quantity));
        setCartItems(updatedItems);
        setError("Some items have limited stock. Quantities have been updated.");
        return;
      }
    }

    setSubmitting(true);
    try {
      // Checkout the first item (primary item) with the cart total
      const firstItem = cartItems[0];
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: firstItem.productId,
          storeId: store.id,
          quantity: firstItem.quantity,
          variantSelections: firstItem.variants,
          deliveryMethod: "pickup",
          deliveryFee: 0,
          customerName,
          customerPhone,
          customerEmail,
          customerAddress: "",
          cartItems: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            variantSelections: item.variants,
            unitPrice: item.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      clearCart(store.id);
      window.location.href = data.authorization_url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading cart…
      </div>
    );
  }

  if (!store) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href={`/store/${slug}`} className="text-indigo-600 text-sm hover:underline">
          ← Back to {store.name}
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <p className="text-gray-500 mb-4">Your cart is empty.</p>
            <Link
              href={`/store/${slug}`}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {cartItems.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex gap-4 p-4 border-b border-gray-100 last:border-0"
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {Object.entries(item.variants).length > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {Object.entries(item.variants)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </p>
                    )}
                    <p className="text-indigo-600 font-semibold mt-1">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
                      >
                        −
                      </button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={item.stockQuantity != null && item.quantity >= item.stockQuantity}
                        className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        +
                      </button>
                      {item.stockQuantity != null && item.quantity >= item.stockQuantity && (
                        <span className="text-xs text-amber-600">Max quantity</span>
                      )}
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="ml-auto text-xs text-red-500 hover:text-red-700 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Subtotal ({cartItems.reduce((c, i) => c + i.quantity, 0)} items)</span>
                <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Delivery fees calculated separately</p>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
              <p className="text-sm font-medium text-gray-700">Your Details</p>
              <input
                type="text"
                placeholder="Full name *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="tel"
                placeholder="Phone number *"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="email"
                placeholder="Email (optional)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={submitting || cartItems.length === 0}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Processing…" : `Pay ${formatCurrency(subtotal)}`}
            </button>
          </>
        )}
      </main>
    </div>
  );
}
