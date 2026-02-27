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

export default function Theme3({ store, products }: ThemeProps) {
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
    <div className="min-h-screen bg-stone-50">
      <header className="py-10 px-4 text-center border-b border-stone-200 relative">
        <h1 className="text-4xl font-light tracking-widest text-stone-800 uppercase">{store.name}</h1>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-700">
          <CartIcon count={cartCount} onClick={() => setCartOpen(true)} />
        </div>
      </header>
      <main className="max-w-4xl mx-auto p-4 sm:p-8">
        {products.length === 0 ? (
          <p className="text-center text-stone-400 py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mt-8">
            {products.map((product) => (
              <div key={product.id} className="group">
                <div className="bg-stone-100 aspect-square relative overflow-hidden">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-sm">No image</div>
                  )}
                </div>
                <div className="mt-3">
                  <h3 className="text-stone-800 font-medium text-sm uppercase tracking-wide">{product.name}</h3>
                  <p className="text-stone-500 text-sm mt-1">{formatCurrency(product.price)}</p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="mt-2 text-xs underline text-stone-600 hover:text-stone-900 transition"
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
