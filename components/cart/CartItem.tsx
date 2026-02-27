"use client";

import Image from "next/image";
import { CartItem as CartItemType } from "@/lib/cart";
import { formatCurrency } from "@/lib/helpers";

interface CartItemProps {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
            No img
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        {Object.entries(item.variants).length > 0 && (
          <p className="text-xs text-gray-500 mt-0.5">
            {Object.entries(item.variants)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")}
          </p>
        )}
        <p className="text-sm font-semibold text-indigo-600 mt-1">
          {formatCurrency(item.price * item.quantity)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={onDecrease}
            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-sm"
          >
            −
          </button>
          <span className="text-sm font-medium w-5 text-center">
            {item.quantity}
          </span>
          <button
            onClick={onIncrease}
            className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition text-sm"
          >
            +
          </button>
          <button
            onClick={onRemove}
            className="ml-auto text-xs text-red-500 hover:text-red-700 transition"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
