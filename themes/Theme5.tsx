import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { formatCurrency } from "@/lib/helpers";
import Image from "next/image";

interface ThemeProps {
  store: Store;
  products: Product[];
}

export default function Theme5({ store, products }: ThemeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <header className="py-12 px-4 text-center">
        <div className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
          <h1 className="text-5xl font-extrabold">{store.name}</h1>
        </div>
        <p className="text-slate-500 mt-3">Curated selections, just for you</p>
        <div className="w-16 h-1 bg-gradient-to-r from-violet-600 to-indigo-600 mx-auto mt-4 rounded-full" />
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6 pb-12">
        {products.length === 0 ? (
          <p className="text-center text-slate-400 py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition group">
                <div className="bg-slate-50 h-52 relative overflow-hidden">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 opacity-30" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-slate-900 text-lg">{product.name}</h3>
                  {product.description && (
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-violet-600 font-bold text-lg">{formatCurrency(product.price)}</span>
                    <button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90 transition">
                      Purchase
                    </button>
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
