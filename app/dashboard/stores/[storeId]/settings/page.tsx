"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Store } from "@/types/store";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function SettingsPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [subaccountCode, setSubaccountCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadStore() {
      const { data } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .single();

      if (data) {
        setStore(data);
        setSubaccountCode(data.subaccount_code || "");
      }
      setLoading(false);
    }

    loadStore();
  }, [storeId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("stores")
      .update({ subaccount_code: subaccountCode })
      .eq("id", storeId);

    if (error) {
      setMessage("Error saving settings.");
    } else {
      setMessage("Settings saved successfully!");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-4">
          <Link href="/dashboard" className="text-indigo-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{store?.name} - Settings</h1>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paystack Subaccount Code
              </label>
              <input
                type="text"
                value={subaccountCode}
                onChange={(e) => setSubaccountCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ACCT_xxxxxxxxxxxx"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Paystack subaccount code to receive split payments.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store URL</label>
              <p className="text-sm text-indigo-600">
                /store/{store?.slug}
              </p>
            </div>
            {message && (
              <p className={`text-sm ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
