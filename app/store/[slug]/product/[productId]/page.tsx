"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { Address } from "@/types/delivery";
import { formatCurrency } from "@/lib/helpers";
import Image from "next/image";
import VariantSelector from "@/components/checkout/VariantSelector";
import DeliveryForm from "@/components/checkout/DeliveryForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import BuyerInfoForm from "@/components/checkout/BuyerInfoForm";

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        metadata?: Record<string, unknown>;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

export default function ProductCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const productId = params.productId as string;

  const [store, setStore] = useState<Store | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "" });
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: storeData } = await supabase
        .from("stores")
        .select("*")
        .eq("slug", slug)
        .single();

      if (!storeData) {
        router.push("/404");
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
        router.push("/404");
        return;
      }
      setProduct(productData as Product);
      setLoading(false);
    }

    load();
  }, [slug, productId, router]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  async function handlePay() {
    if (!product || !store) return;

    if (!buyer.name || !buyer.email || !buyer.phone) {
      setError("Please fill in your name, email and phone number");
      return;
    }

    if (deliveryType === "delivery" && !deliveryAddress) {
      setError("Please calculate and select a delivery option");
      return;
    }

    if (product.variants && product.variants.length > 0) {
      const missing = product.variants.find((v) => !selectedVariant[v.name]);
      if (missing) {
        setError(`Please select a ${missing.name}`);
        return;
      }
    }

    setError("");
    setPaying(true);

    try {
      const subtotal = product.price * quantity;
      const total = subtotal + deliveryFee;

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: buyer.email,
        amount: Math.round(total * 100),
        metadata: {
          store_id: store.id,
          product_id: product.id,
          buyer_name: buyer.name,
          buyer_phone: buyer.phone,
          delivery_type: deliveryType,
          delivery_address: deliveryAddress ? JSON.stringify(deliveryAddress) : undefined,
          quantity,
          selected_variant: Object.keys(selectedVariant).length > 0 ? JSON.stringify(selectedVariant) : undefined,
          subtotal,
          delivery_fee: deliveryFee,
        },
        onClose: () => setPaying(false),
        callback: (response) => {
          router.push(`/order/${response.reference}/confirmation`);
        },
      });
      handler.openIframe();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setError(msg);
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!product || !store) return null;

  const subtotal = product.price * quantity;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <p className="text-sm text-gray-500">{store.name}</p>
        <h1 className="text-lg font-bold text-gray-900 mt-0.5">Checkout</h1>
      </header>

      <main className="max-w-lg mx-auto p-4 pb-24 space-y-4">
        {/* Product Info */}
        <div className="bg-white rounded-xl p-4 flex gap-4">
          <div className="w-20 h-20 bg-gray-100 rounded-lg relative flex-shrink-0">
            {product.image_url ? (
              <Image src={product.image_url} alt={product.name} fill className="object-cover rounded-lg" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900">{product.name}</h2>
            {product.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
            )}
            <p className="text-indigo-600 font-bold mt-2">{formatCurrency(product.price)}</p>
          </div>
        </div>

        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Options</h3>
            <VariantSelector
              variants={product.variants}
              selected={selectedVariant}
              onChange={setSelectedVariant}
            />
          </div>
        )}

        {/* Quantity */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
            >
              +
            </button>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Delivery Method</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              type="button"
              onClick={() => { setDeliveryType("pickup"); setDeliveryFee(0); setDeliveryAddress(null); }}
              className={`py-2.5 rounded-lg border text-sm font-medium transition ${
                deliveryType === "pickup"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              🏪 Pickup
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType("delivery")}
              className={`py-2.5 rounded-lg border text-sm font-medium transition ${
                deliveryType === "delivery"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              🚚 Delivery
            </button>
          </div>

          {deliveryType === "delivery" && (
            <DeliveryForm
              originAddress={store.pickup_address}
              weight={product.weight}
              sizeCategory={product.size_category}
              onQuoteSelected={(fee, addr) => {
                setDeliveryFee(fee);
                setDeliveryAddress(addr);
              }}
            />
          )}

          {deliveryType === "pickup" && store.pickup_address && (
            <p className="text-sm text-gray-500">
              Pickup from: {store.pickup_address.street}, {store.pickup_address.city}, {store.pickup_address.state}
            </p>
          )}
        </div>

        {/* Order Summary */}
        <OrderSummary
          product={product}
          quantity={quantity}
          deliveryFee={deliveryFee}
          selectedVariant={selectedVariant}
        />

        {/* Buyer Info */}
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Your Details</h3>
          <BuyerInfoForm value={buyer} onChange={setBuyer} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </main>

      {/* Pay button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold text-base hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {paying ? "Processing..." : `Pay ${formatCurrency(total)}`}
        </button>
      </div>
    </div>
  );
}
