"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PendingStore {
  id: string;
  name: string;
  slug: string;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
  payment_status: string | null;
  owner_id: string;
  created_at: string;
  owner_email?: string;
}

export default function AdminPage() {
  const [stores, setStores] = useState<PendingStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subaccountInputs, setSubaccountInputs] = useState<Record<string, string>>({});
  const [approving, setApproving] = useState<Record<string, boolean>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadPendingStores() {
      const { data: storeData, error: queryError } = await supabase
        .from("stores")
        .select("id, name, slug, bank_name, account_number, account_name, payment_status, owner_id, created_at")
        .eq("payment_status", "submitted")
        .order("created_at", { ascending: true });

      if (queryError) {
        setError("Failed to load stores. Please refresh the page.");
        setLoading(false);
        return;
      }

      setStores(storeData || []);
      setLoading(false);
    }

    loadPendingStores();
  }, []);

  async function handleApprove(storeId: string) {
    const subaccountCode = subaccountInputs[storeId]?.trim();
    if (!subaccountCode) {
      setMessages((prev) => ({ ...prev, [storeId]: "Please enter a subaccount code." }));
      return;
    }

    setApproving((prev) => ({ ...prev, [storeId]: true }));
    setMessages((prev) => ({ ...prev, [storeId]: "" }));

    const { error } = await supabase
      .from("stores")
      .update({ subaccount_code: subaccountCode, payment_status: "active" })
      .eq("id", storeId);

    if (error) {
      setMessages((prev) => ({ ...prev, [storeId]: "Error approving store. Please try again." }));
    } else {
      setStores((prev) => prev.filter((s) => s.id !== storeId));
      setMessages((prev) => ({ ...prev, [storeId]: "" }));
    }

    setApproving((prev) => ({ ...prev, [storeId]: false }));
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-sm text-gray-500 mt-1">Stores awaiting payment setup verification</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
          <p className="text-green-600 font-semibold text-lg mb-1">✓ All caught up!</p>
          <p className="text-gray-500 text-sm">No stores are currently awaiting payment verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{store.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">/store/{store.slug}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Owner ID: {store.owner_id}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
                  Awaiting Approval
                </span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bank Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Bank</p>
                    <p className="font-medium text-gray-900">{store.bank_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Account Number</p>
                    <p className="font-medium text-gray-900">{store.account_number || "—"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Account Name</p>
                    <p className="font-medium text-gray-900">{store.account_name || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Paystack Subaccount Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subaccountInputs[store.id] || ""}
                    onChange={(e) =>
                      setSubaccountInputs((prev) => ({ ...prev, [store.id]: e.target.value }))
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="ACCT_xxxxxxxxxxxx"
                  />
                  <button
                    onClick={() => handleApprove(store.id)}
                    disabled={approving[store.id]}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    {approving[store.id] ? "Approving..." : "Approve & Link"}
                  </button>
                </div>
                {messages[store.id] && (
                  <p className={`text-xs ${messages[store.id].includes("Error") ? "text-red-500" : "text-green-600"}`}>
                    {messages[store.id]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
