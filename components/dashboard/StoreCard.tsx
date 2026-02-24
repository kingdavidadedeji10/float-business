import { Store } from "@/types/store";
import Link from "next/link";

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{store.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">/store/{store.slug}</p>
        </div>
        <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
          {store.theme_id}
        </span>
      </div>
      <div className="flex gap-2 mt-4">
        <Link
          href={`/dashboard/stores/${store.id}/products`}
          className="flex-1 text-center text-sm bg-indigo-600 text-white py-1.5 rounded-lg hover:bg-indigo-700 transition"
        >
          Products
        </Link>
        <Link
          href={`/dashboard/stores/${store.id}/orders`}
          className="flex-1 text-center text-sm border border-gray-300 text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          Orders
        </Link>
        <Link
          href={`/store/${store.slug}`}
          target="_blank"
          className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          View
        </Link>
      </div>
    </div>
  );
}
