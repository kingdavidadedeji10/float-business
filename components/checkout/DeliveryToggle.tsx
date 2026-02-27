"use client";

import { formatCurrency } from "@/lib/helpers";

interface DeliveryToggleProps {
  deliveryMethod: "pickup" | "delivery";
  onChange: (method: "pickup" | "delivery") => void;
  deliveryFee: number | null;
  loadingQuote: boolean;
}

export default function DeliveryToggle({
  deliveryMethod,
  onChange,
  deliveryFee,
  loadingQuote,
}: DeliveryToggleProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">Delivery Method</p>
      <div className="flex gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="deliveryMethod"
            value="pickup"
            checked={deliveryMethod === "pickup"}
            onChange={() => onChange("pickup")}
            className="accent-indigo-600"
          />
          <span className="text-sm text-gray-700">Pickup</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="deliveryMethod"
            value="delivery"
            checked={deliveryMethod === "delivery"}
            onChange={() => onChange("delivery")}
            className="accent-indigo-600"
          />
          <span className="text-sm text-gray-700">Delivery</span>
        </label>
      </div>
      {deliveryMethod === "delivery" && (
        <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
          {loadingQuote ? (
            <span className="text-gray-400">Calculating delivery fee…</span>
          ) : deliveryFee !== null ? (
            <span>
              Delivery fee: <span className="font-semibold text-gray-900">{formatCurrency(deliveryFee)}</span>
            </span>
          ) : (
            <span className="text-gray-400">Enter your address to see delivery fee</span>
          )}
        </div>
      )}
    </div>
  );
}
