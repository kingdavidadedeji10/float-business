"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/lib/helpers";
import Link from "next/link";

const THEMES = [
  { id: "theme1", name: "Classic Grid" },
  { id: "theme2", name: "Modern Dark" },
  { id: "theme3", name: "Minimal Light" },
  { id: "theme4", name: "Bold Colorful" },
  { id: "theme5", name: "Elegant Cards" },
];

export default function CreateStorePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [themeId, setThemeId] = useState("theme1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    setSlug(generateSlug(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data, error } = await supabase.from("stores").insert({
      owner_id: user.id,
      name,
      slug,
      theme_id: themeId,
    }).select().single();

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(`/dashboard/stores/${data.id}/products`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-indigo-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a New Store</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="My Awesome Store"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store URL Slug</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <span className="bg-gray-100 px-3 py-2 text-gray-500 text-sm border-r border-gray-300">
                  /store/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="flex-1 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="my-awesome-store"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                value={themeId}
                onChange={(e) => setThemeId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {THEMES.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Store"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
