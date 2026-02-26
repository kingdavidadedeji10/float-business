"use client";

import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/helpers";
import Image from "next/image";

interface OrderSummaryProps {
  product: Product;
  quantity: number;
  deliveryFee: number;
  selectedVariant: Record<string, string>;
}

export default function OrderSummary({
  product,
  quantity,
  deliveryFee,
  selectedVariant,
}: OrderSummaryProps) {
  const subtotal = product.price * quantity;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
      <h3 className="font-semibold text-gray-900">Order Summary</h3>

      <div className="flex gap-3">
        <div className="w-16 h-16 bg-gray-200 rounded-lg relative flex-shrink-0">
          {product.image_url ? (
            <Image src={product.image_url} alt={product.name} fill className="object-cover rounded-lg" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
          {Object.entries(selectedVariant).length > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">
              {Object.entries(selectedVariant)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">Qty: {quantity}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">{formatCurrency(subtotal)}</p>
      </div>

      <div className="border-t border-gray-200 pt-3 space-y-1.5">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery fee</span>
          <span>{deliveryFee > 0 ? formatCurrency(deliveryFee) : "Free"}</span>
        </div>
        <div className="flex justify-between text-sm font-semibold text-gray-900 pt-1 border-t border-gray-200">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}
