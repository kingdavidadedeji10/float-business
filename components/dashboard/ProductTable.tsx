"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/helpers";

interface ProductTableProps {
  products: Product[];
  storeId: string;
  onUpdate: () => void;
}

export default function ProductTable({ products, storeId, onUpdate }: ProductTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");

    const { error } = await supabase.from("products").insert({
      store_id: storeId,
      name,
      price: parseFloat(price),
      description: description || null,
      image_url: imageUrl || null,
      quantity: parseInt(quantity, 10) || 0,
    });

    if (error) {
      setFormError(error.message);
      setSaving(false);
      return;
    }

    setName("");
    setPrice("");
    setDescription("");
    setImageUrl("");
    setQuantity("0");
    setShowForm(false);
    setSaving(false);
    onUpdate();
  }

  async function handleDelete(productId: string) {
    if (!confirm("Delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (!error) onUpdate();
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
        >
          {showForm ? "Cancel" : "+ Add Product"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">New Product</h3>
          <form onSubmit={handleAddProduct} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Product name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="Price (NGN)"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              placeholder="Quantity in stock"
              min="0"
              step="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Product"}
            </button>
            {formError && <p className="text-red-500 text-xs">{formError}</p>}
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Product</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Price</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">Stock</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      {product.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs">{product.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-3">
                    {product.quantity != null && product.quantity === 0 ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">Out of Stock</span>
                    ) : (
                      <span className="text-xs font-medium text-gray-700">{product.quantity}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-xs text-red-600 hover:text-red-800 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
