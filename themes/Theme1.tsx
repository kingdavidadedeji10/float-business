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

export default function Theme1({ store, products }: ThemeProps) {
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
    addToCart(store.id, {
      productId: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      quantity: 1,
      variants: {},
    });
    refreshCart();
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-indigo-600 text-white py-8 px-4 text-center relative">
        <h1 className="text-3xl font-bold">{store.name}</h1>
        <p className="mt-2 opacity-80">Welcome to our store</p>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white">
          <CartIcon count={cartCount} onClick={() => setCartOpen(true)} />
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                <div className="bg-gray-100 h-40 relative">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                  <p className="text-indigo-600 font-semibold mt-1">{formatCurrency(product.price)}</p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="block w-full mt-2 bg-indigo-600 text-white text-xs py-1.5 rounded-lg hover:bg-indigo-700 transition text-center"
                  >
                    {addedId === product.id ? "✓ Added!" : "Add to Cart"}
                  </button>
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
