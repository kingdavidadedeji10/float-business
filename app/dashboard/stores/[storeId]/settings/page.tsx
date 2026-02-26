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
  const [showInstructions, setShowInstructions] = useState(false);

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
      setStore((prev) => prev ? { ...prev, subaccount_code: subaccountCode } : prev);
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

  const isPaymentConnected = !!store?.subaccount_code;

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
          <form onSubmit={handleSave} className="space-y-6">

            {/* Payment Settings Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-800">Payment Settings</h2>
                {isPaymentConnected ? (
                  <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
                    Not Connected
                  </span>
                )}
              </div>

              {!isPaymentConnected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-yellow-800">
                    Connect your Paystack subaccount to receive payments from customers.
                  </p>
                </div>
              )}

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

              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 mt-2 font-medium"
              >
                <span>{showInstructions ? "▾" : "▸"}</span>
                How to get a subaccount code
              </button>

              {showInstructions && (
                <ol className="text-xs text-gray-600 space-y-1.5 mt-2 pl-4 list-decimal bg-gray-50 rounded-lg p-3">
                  <li>Go to your <a href="https://dashboard.paystack.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Paystack Dashboard</a></li>
                  <li>Navigate to <strong>Subaccounts</strong> in the left menu</li>
                  <li>Click <strong>Create Subaccount</strong> and fill in your bank details</li>
                  <li>Copy the subaccount code (starts with <code className="bg-gray-100 px-1 rounded">ACCT_</code>)</li>
                  <li>Paste it in the field above and save</li>
                </ol>
              )}
            </div>

            {/* Store URL Section */}
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
