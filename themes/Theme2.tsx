"use client";

import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { formatCurrency } from "@/lib/helpers";
import { addToCart, getCart, getCartCount, CartItem } from "@/lib/cart";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import CartIcon from "@/components/cart/CartIcon";
import CartDrawer from "@/components/cart/CartDrawer";

interface ThemeProps {
  store: Store;
  products: Product[];
}

export default function Theme2({ store, products }: ThemeProps) {
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  const refreshCart = useCallback(() => {
    setCartCount(getCartCount(store.id));
    setCartItems(getCart(store.id));
  }, [store.id]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  function handleAddToCart(product: Product) {
    if (product.quantity != null && product.quantity === 0) return;
    addToCart(store.id, {
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
      variants: {},
      stockQuantity: product.quantity ?? undefined,
    });
    refreshCart();
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 py-6 px-4 text-center relative">
        <h1 className="text-3xl font-bold text-yellow-400">{store.name}</h1>
        <p className="mt-2 text-gray-400 text-sm">Premium Collection</p>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white">
          <CartIcon count={cartCount} onClick={() => setCartOpen(true)} />
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {products.map((product) => (
              <div key={product.id} className={`bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-400 transition${product.quantity != null && product.quantity === 0 ? " opacity-70" : ""}`}>
                <div className="bg-gray-700 h-48 relative">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
                  )}
                  {product.quantity != null && product.quantity === 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Out of Stock</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className={`font-bold${product.quantity != null && product.quantity === 0 ? " text-red-400 line-through" : " text-yellow-400"}`}>{formatCurrency(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity != null && product.quantity === 0}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition${product.quantity != null && product.quantity === 0 ? " bg-gray-600 text-gray-400 cursor-not-allowed" : " bg-yellow-400 text-gray-900 hover:bg-yellow-300"}`}
                    >
                      {product.quantity != null && product.quantity === 0 ? "Out of Stock" : addedId === product.id ? "✓ Added!" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {cartOpen && (
        <CartDrawer
          storeId={store.id}
          storeSlug={store.slug}
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onCartChange={refreshCart}
        />
      )}
    </div>
  );
}
