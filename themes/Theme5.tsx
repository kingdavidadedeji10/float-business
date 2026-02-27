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

export default function Theme5({ store, products }: ThemeProps) {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <header className="py-12 px-4 text-center relative">
        <div className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
          <h1 className="text-5xl font-extrabold">{store.name}</h1>
        </div>
        <p className="text-slate-500 mt-3">Curated selections, just for you</p>
        <div className="w-16 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 mx-auto mt-4 rounded-full" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700">
          <CartIcon count={cartCount} onClick={() => setCartOpen(true)} />
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6 pb-12">
        {products.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className={`bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition group${product.quantity != null && product.quantity === 0 ? " opacity-70" : ""}`}>
                <div className="bg-slate-50 h-52 relative overflow-hidden">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 opacity-30" />
                    </div>
                  )}
                  {product.quantity != null && product.quantity === 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Out of Stock</div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-lg">{product.name}</h3>
                  {product.description && (
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className={`font-bold text-lg${product.quantity != null && product.quantity === 0 ? " text-red-500 line-through" : " text-violet-600"}`}>{formatCurrency(product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.quantity != null && product.quantity === 0}
                      className={`text-sm font-semibold px-4 py-2 rounded-xl transition${product.quantity != null && product.quantity === 0 ? " bg-gray-300 text-gray-500 cursor-not-allowed" : " bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90"}`}
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
