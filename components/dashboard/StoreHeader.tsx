"use client";

import Link from "next/link";
import Breadcrumbs, { BreadcrumbItem } from "./Breadcrumbs";
import StoreSwitcher from "./StoreSwitcher";
import { Store } from "@/types/store";

interface StoreHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  storeId: string;
  storeSlug?: string;
  allStores: Store[];
  onRefresh: () => void;
  isRefreshing: boolean;
  showAddProduct?: boolean;
}

export default function StoreHeader({
  breadcrumbs,
  storeId,
  storeSlug,
  allStores,
  onRefresh,
  isRefreshing,
  showAddProduct,
}: StoreHeaderProps) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3 min-w-0">
        <Breadcrumbs items={breadcrumbs} />
        {allStores.length > 1 && (
          <StoreSwitcher currentStoreId={storeId} stores={allStores} />
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {showAddProduct && (
          <Link
            href={`/dashboard/stores/${storeId}/products`}
            className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition"
          >
            + Add Product
          </Link>
        )}
        {storeSlug && (
          <Link
            href={`/store/${storeSlug}`}
            target="_blank"
            className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
          >
            View Store
          </Link>
        )}
        <Link
          href={`/dashboard/stores/${storeId}/settings`}
          className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          Settings
        </Link>
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh"
          className="text-sm border border-gray-300 text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 flex items-center"
        >
          <span className={isRefreshing ? "animate-spin inline-block" : ""}>↻</span>
        </button>
      </div>
    </nav>
  );
}
