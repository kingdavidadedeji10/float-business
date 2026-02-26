"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Store } from "@/types/store";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ConnectBankModal } from "@/components/dashboard/ConnectBankModal";

export default function SettingsPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function loadStore() {
      const { data } = await supabase
        .from("stores")
        .select("*")
        .eq("id", storeId)
        .single();

      if (data) {
        setStore(data);
      }
      setLoading(false);
    }

    loadStore();
  }, [storeId]);

  function handleBankConnected(accountName: string, subaccountCode: string) {
    setStore((prev) => prev ? { ...prev, account_name: accountName, subaccount_code: subaccountCode, payment_status: 'active' } : prev);
    setModalOpen(false);
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

          {/* Payment Settings Section */}
          <div className="mb-6">
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

            {isPaymentConnected ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-1">
                <p className="text-sm font-medium text-green-800">✓ Bank Account Connected</p>
                {store?.account_name && (
                  <p className="text-sm text-green-700">Account: <span className="font-medium">{store.account_name}</span></p>
                )}
                {store?.bank_name && (
                  <p className="text-sm text-green-700">Bank: <span className="font-medium">{store.bank_name}</span></p>
                )}
                {store?.account_number && (
                  <p className="text-sm text-green-700">Number: <span className="font-medium">{store.account_number}</span></p>
                )}
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="mt-2 text-xs text-indigo-600 hover:underline"
                >
                  Change bank account
                </button>
              </div>
            ) : (
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-yellow-800">
                    Connect your bank account to receive payments from customers automatically.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition"
                >
                  Connect Bank Account
                </button>
              </div>
            )}
          </div>

          {/* Store URL Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store URL</label>
            <p className="text-sm text-indigo-600">
              /store/{store?.slug}
            </p>
          </div>
        </div>
      </div>

      {store && (
        <ConnectBankModal
          storeId={store.id}
          storeName={store.name}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleBankConnected}
        />
      )}
    </div>
  );
}
