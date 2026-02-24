import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { formatCurrency } from "@/lib/helpers";
import Image from "next/image";

interface ThemeProps {
  store: Store;
  products: Product[];
}

export default function Theme1({ store, products }: ThemeProps) {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-indigo-600 text-white py-8 px-4 text-center">
        <h1 className="text-3xl font-bold">{store.name}</h1>
        <p className="mt-2 opacity-80">Welcome to our store</p>
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
                  <button className="w-full mt-2 bg-indigo-600 text-white text-xs py-1.5 rounded-lg hover:bg-indigo-700 transition">
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
