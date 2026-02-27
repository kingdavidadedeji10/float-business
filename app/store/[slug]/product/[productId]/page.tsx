"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/helpers";
import { Product } from "@/types/product";
import { Store } from "@/types/store";
import QuantitySelector from "@/components/checkout/QuantitySelector";
import VariantSelector from "@/components/checkout/VariantSelector";
import DeliveryToggle from "@/components/checkout/DeliveryToggle";
import CustomerForm from "@/components/checkout/CustomerForm";
import OrderSummary from "@/components/checkout/OrderSummary";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const productId = params.productId as string;

  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

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

      const { data: productData } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .eq("store_id", storeData.id)
        .single();

      if (!productData) {
        router.push(`/store/${slug}`);
        return;
      }
      setProduct(productData as Product);
      setLoading(false);
    }
    load();
  }, [slug, productId, router]);

  const fetchDeliveryQuote = useCallback(async (address: string) => {
    if (!product || !store || !address.trim()) return;
    setLoadingQuote(true);
    try {
      const res = await fetch("/api/delivery/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sizeCategory: product.size_category || "medium",
          weight: product.weight || 1,
          pickupAddress: store.pickup_address || store.name,
          deliveryAddress: address,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDeliveryFee(data.fee);
      }
    } finally {
      setLoadingQuote(false);
    }
  }, [product, store]);

  const MIN_ADDRESS_LENGTH = 10;

  useEffect(() => {
    if (deliveryMethod === "pickup") {
      setDeliveryFee(0);
    } else if (deliveryMethod === "delivery" && customerAddress.trim().length > MIN_ADDRESS_LENGTH) {
      const timer = setTimeout(() => fetchDeliveryQuote(customerAddress), 800);
      return () => clearTimeout(timer);
    }
  }, [deliveryMethod, customerAddress, fetchDeliveryQuote]);

  function handleVariantChange(variantName: string, option: string) {
    setSelectedVariants((prev) => ({ ...prev, [variantName]: option }));
  }

  function handleCustomerFieldChange(field: string, value: string) {
    if (field === "name") setCustomerName(value);
    else if (field === "phone") setCustomerPhone(value);
    else if (field === "email") setCustomerEmail(value);
    else if (field === "address") setCustomerAddress(value);
  }

  async function handlePay() {
    setError("");
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    if (deliveryMethod === "delivery" && !customerAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          storeId: store?.id,
          quantity,
          variantSelections: selectedVariants,
          deliveryMethod,
          deliveryFee: deliveryFee ?? 0,
          customerName,
          customerPhone,
          customerEmail,
          customerAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      // Redirect to Paystack payment page
      window.location.href = data.authorization_url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsAppShare() {
    const text = encodeURIComponent(
      `Check out ${product?.name} for ${formatCurrency(product?.price ?? 0)} — ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading product…
      </div>
    );
  }

  if (!product || !store) return null;

  const computedDeliveryFee = deliveryMethod === "pickup" ? 0 : deliveryFee ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <Link href={`/store/${slug}`} className="text-indigo-600 text-sm hover:underline">
          ← {store.name}
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Product image & info */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {product.image_url ? (
            <div className="relative h-64 w-full">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          <div className="p-4">
            <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
            {product.description && (
              <p className="text-gray-500 text-sm mt-1">{product.description}</p>
            )}
            <p className="text-indigo-600 text-2xl font-bold mt-2">
              {formatCurrency(product.price)}
            </p>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-gray-700"
          >
            {copied ? "✓ Copied!" : "🔗 Copy Link"}
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition text-gray-700"
          >
            📲 Share on WhatsApp
          </button>
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <p className="text-sm font-medium text-gray-700">Quantity</p>
          <QuantitySelector
            quantity={quantity}
            onIncrease={() => setQuantity((q) => q + 1)}
            onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          />
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <VariantSelector
              variants={product.variants}
              selected={selectedVariants}
              onChange={handleVariantChange}
            />
          </div>
        )}

        {/* Delivery method */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <DeliveryToggle
            deliveryMethod={deliveryMethod}
            onChange={(method) => {
              setDeliveryMethod(method);
              if (method === "pickup") setDeliveryFee(0);
            }}
            deliveryFee={deliveryFee}
            loadingQuote={loadingQuote}
          />
        </div>

        {/* Customer details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-3">Your Details</p>
          <CustomerForm
            name={customerName}
            phone={customerPhone}
            email={customerEmail}
            address={customerAddress}
            showAddress={deliveryMethod === "delivery"}
            onChange={handleCustomerFieldChange}
          />
        </div>

        {/* Order summary */}
        <OrderSummary
          productName={product.name}
          quantity={quantity}
          unitPrice={product.price}
          deliveryFee={computedDeliveryFee}
        />

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          onClick={handlePay}
          disabled={submitting}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {submitting ? "Processing…" : `Pay ${formatCurrency(product.price * quantity + computedDeliveryFee)}`}
        </button>
      </main>
    </div>
  );
}
