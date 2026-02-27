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

const colors = ["bg-pink-500", "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500"];

export default function Theme4({ store, products }: ThemeProps) {
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
    <div className="min-h-screen bg-yellow-50">
      <header className="bg-pink-600 text-white py-8 px-4 text-center relative">
        <h1 className="text-4xl font-black">{store.name}</h1>
        <p className="text-pink-200 mt-1 font-medium">Shop the best products!</p>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white">
          <CartIcon count={cartCount} onClick={() => setCartOpen(true)} />
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {products.map((product, index) => (
              <div key={product.id} className={`bg-white rounded-2xl overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition${product.quantity != null && product.quantity === 0 ? " opacity-70" : ""}`}>
                <div className={`${colors[index % colors.length]} h-40 relative`}>
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm opacity-50">
                      {product.name[0]}
                    </div>
                  )}
                  {product.quantity != null && product.quantity === 0 && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">Out of Stock</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-black text-gray-900">{product.name}</h3>
                  <p className={`font-bold mt-1${product.quantity != null && product.quantity === 0 ? " text-red-500 line-through" : " text-pink-600"}`}>{formatCurrency(product.price)}</p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.quantity != null && product.quantity === 0}
                    className={`block w-full mt-2 text-sm font-bold py-1.5 rounded-lg transition text-center${product.quantity != null && product.quantity === 0 ? " bg-gray-300 text-gray-500 cursor-not-allowed" : " bg-black text-white hover:bg-gray-800"}`}
                  >
                    {product.quantity != null && product.quantity === 0 ? "Out of Stock" : addedId === product.id ? "✓ Added!" : "Add to Cart"}
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
