"use client";

import { formatCurrency } from "@/lib/helpers";

interface OrderSummaryProps {
  productName: string;
  quantity: number;
  unitPrice: number;
  deliveryFee: number;
}

export default function OrderSummary({
  productName,
  quantity,
  unitPrice,
  deliveryFee,
}: OrderSummaryProps) {
  const subtotal = unitPrice * quantity;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
      <div className="flex justify-between text-gray-700">
        <span>
          {productName} × {quantity}
        </span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      {deliveryFee > 0 && (
        <div className="flex justify-between text-gray-700">
          <span>Delivery fee</span>
          <span>{formatCurrency(deliveryFee)}</span>
        </div>
      )}
      <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
