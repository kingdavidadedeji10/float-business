import { Product } from "@/types/product";
import { Store } from "@/types/store";
import { formatCurrency } from "@/lib/helpers";
import Image from "next/image";
import Link from "next/link";

interface ThemeProps {
  store: Store;
  products: Product[];
}

const colors = ["bg-pink-500", "bg-blue-500", "bg-green-500", "bg-orange-500", "bg-purple-500"];

export default function Theme4({ store, products }: ThemeProps) {
  return (
    <div className="min-h-screen bg-yellow-50">
      <header className="bg-pink-600 text-white py-8 px-4 text-center">
        <h1 className="text-4xl font-black">{store.name}</h1>
        <p className="text-pink-200 mt-1 font-medium">Shop the best products!</p>
      </header>
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No products available yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
            {products.map((product, index) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition">
                <div className={`${colors[index % colors.length]} h-40 relative`}>
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm opacity-50">
                      {product.name[0]}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-black text-gray-900">{product.name}</h3>
                  <p className="text-pink-600 font-bold mt-1">{formatCurrency(product.price)}</p>
                  <Link
                    href={`/store/${store.slug}/product/${product.id}`}
                    className="block w-full mt-2 bg-black text-white text-sm font-bold py-1.5 rounded-lg hover:bg-gray-800 transition text-center"
                  >
                    BUY NOW
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
