"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/helpers";
import Link from "next/link";
import Image from "next/image";
import StoreHeader from "@/components/dashboard/StoreHeader";
import { Store } from "@/types/store";
import { Product } from "@/types/product";

export default function ManageProductsPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();

      const [{ data: storeData }, { data: storesData }, { data: productsData }] = await Promise.all([
        supabase.from("stores").select("*").eq("id", storeId).single(),
        user ? supabase.from("stores").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }) : Promise.resolve({ data: [] }),
        supabase.from("products").select("*").eq("store_id", storeId).order("created_at", { ascending: false }),
      ]);

      if (storeData) setStore(storeData as Store);
      setAllStores(storesData || []);
      setProducts(productsData || []);
      setLoading(false);
    }
    loadData();
  }, [storeId, refreshKey]);

  async function handleDelete(productId: string) {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  function handleCopyLink(product: Product) {
    const url = `${window.location.origin}/store/${store?.slug}/product/${product.id}`;
    navigator.clipboard.writeText(url);
    setCopied(product.id);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleRefresh() {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 800);
  }

  const tabs = [
    { label: "Overview", href: `/dashboard/store/${storeId}/manage` },
    { label: "Orders", href: `/dashboard/store/${storeId}/manage/orders` },
    { label: "Products", href: `/dashboard/store/${storeId}/manage/products`, active: true },
    { label: "Customers", href: `/dashboard/store/${storeId}/manage/customers` },
    { label: "Transactions", href: `/dashboard/store/${storeId}/manage/transactions` },
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StoreHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: store?.name ?? "Store", href: `/dashboard/store/${storeId}/manage` },
          { label: "Products" },
        ]}
        storeId={storeId}
        storeSlug={store?.slug}
        allStores={allStores}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        showAddProduct
      />

      <div className="bg-white border-b border-gray-200 px-4 overflow-x-auto">
        <div className="flex gap-1 max-w-5xl mx-auto">
          {tabs.map((tab) => (
            <Link key={tab.label} href={tab.href} className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${tab.active ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Products ({products.length})</h2>

        {products.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
            <p className="text-gray-500 text-sm">No products yet.</p>
            <Link href={`/dashboard/stores/${storeId}/products`} className="mt-2 inline-block text-indigo-600 hover:underline text-sm">Add your first product</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex gap-0">
                <div className="w-24 h-24 bg-gray-100 shrink-0 relative">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 p-3 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-indigo-600 font-semibold text-sm mt-0.5">{formatCurrency(product.price)}</p>
                  {product.quantity != null && product.quantity === 0 ? (
                    <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Out of Stock</span>
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">Stock: {product.quantity}</p>
                  )}
                  {/* Shareable link */}
                  <div className="flex items-center gap-1 mt-2">
                    <input
                      readOnly
                      value={`${typeof window !== "undefined" ? window.location.origin : ""}/store/${store?.slug}/product/${product.id}`}
                      className="flex-1 text-xs text-gray-500 border border-gray-200 rounded px-2 py-1 bg-gray-50 truncate"
                    />
                    <button
                      onClick={() => handleCopyLink(product)}
                      className="shrink-0 text-xs text-indigo-600 border border-indigo-200 rounded px-2 py-1 hover:bg-indigo-50 transition"
                    >
                      {copied === product.id ? "✓" : "Copy"}
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Link
                      href={`/dashboard/stores/${storeId}/products`}
                      className="text-xs text-gray-600 hover:text-indigo-600 transition"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
