import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { formatCurrency } from "@/lib/helpers";
import Image from "next/image";
import Link from "next/link";

interface ThemeProps {
  store: Store;
  products: Product[];
}

export default function Theme2({ store, products }: ThemeProps) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-700 py-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-yellow-400">{store.name}</h1>
        <p className="mt-2 text-gray-400 text-sm">Premium Collection</p>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {products.map((product) => (
              <div key={product.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-yellow-400 transition">
                <div className="bg-gray-700 h-48 relative">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-400 text-xs mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-yellow-400 font-bold">{formatCurrency(product.price)}</span>
                    <Link
                      href={`/store/${store.slug}/product/${product.id}`}
                      className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition"
                    >
                      Buy
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
