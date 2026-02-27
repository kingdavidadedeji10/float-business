"use client";

import { CartItem as CartItemType, updateQuantity, removeFromCart, clearCart } from "@/lib/cart";
import { formatCurrency } from "@/lib/helpers";
import CartItem from "./CartItem";
import Link from "next/link";

interface CartDrawerProps {
  storeId: string;
  storeSlug: string;
  items: CartItemType[];
  onClose: () => void;
  onCartChange: () => void;
}

export default function CartDrawer({
  storeId,
  storeSlug,
  items,
  onClose,
  onCartChange,
}: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleIncrease(productId: string, currentQty: number) {
    updateQuantity(storeId, productId, currentQty + 1);
    onCartChange();
  }

  function handleDecrease(productId: string, currentQty: number) {
    updateQuantity(storeId, productId, currentQty - 1);
    onCartChange();
  }

  function handleRemove(productId: string) {
    removeFromCart(storeId, productId);
    onCartChange();
  }

  function handleClear() {
    clearCart(storeId);
    onCartChange();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Cart ({items.reduce((c, i) => c + i.quantity, 0)})
          </h2>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={handleClear}
                className="text-xs text-gray-500 hover:text-red-500 transition"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 transition text-gray-600"
              aria-label="Close cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-16 h-16 text-gray-200 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-500 text-sm">Your cart is empty</p>
              <p className="text-gray-400 text-xs mt-1">Add items to get started</p>
            </div>
          ) : (
            <div className="py-2">
              {items.map((item) => (
                <CartItem
                  key={`${item.productId}-${JSON.stringify(item.variants)}`}
                  item={item}
                  onIncrease={() => handleIncrease(item.productId, item.quantity)}
                  onDecrease={() => handleDecrease(item.productId, item.quantity)}
                  onRemove={() => handleRemove(item.productId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="font-bold text-gray-900">{formatCurrency(total)}</span>
            </div>
            <p className="text-xs text-gray-400">Delivery fees calculated at checkout</p>
            <Link
              href={`/store/${storeSlug}/cart`}
              onClick={onClose}
              className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
