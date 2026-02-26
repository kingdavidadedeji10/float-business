"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Store } from "@/types/store";
import Link from "next/link";
import { useParams } from "next/navigation";
import BankDetailsForm from "@/components/dashboard/BankDetailsForm";

export default function SettingsPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

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

  function handleBankDetailsSaved() {
    setStore((prev) =>
      prev ? { ...prev, payment_status: "submitted" } : prev
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const paymentStatus = store?.payment_status || "pending";

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

          {/* Payment Setup Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-800">Payment Setup</h2>
              {paymentStatus === "active" && (
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
                  Payments Active
                </span>
              )}
              {paymentStatus === "submitted" && (
                <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
                  Pending Verification
                </span>
              )}
              {paymentStatus === "pending" && (
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span>
                  Not Set Up
                </span>
              )}
            </div>

            {paymentStatus === "active" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800 mb-1">✓ Payments Active</p>
                <p className="text-xs text-green-700">Your account is set up to receive payments.</p>
              </div>
            )}

            {paymentStatus === "submitted" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-800 mb-2">✓ Bank details submitted — Awaiting verification</p>
                <p className="text-xs text-yellow-700">
                  Bank: <span className="font-medium">{store?.bank_name}</span>
                </p>
                <p className="text-xs text-yellow-700">
                  Account: ****{store?.account_number?.slice(-4)}
                </p>
                <p className="text-xs text-yellow-700">
                  Name: <span className="font-medium">{store?.account_name}</span>
                </p>
              </div>
            )}

            {paymentStatus === "pending" && (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Add your bank details to receive payments from customers.
                </p>
                <BankDetailsForm storeId={storeId} onSaved={handleBankDetailsSaved} />
              </div>
            )}
          </div>

          {/* Store URL Section */}
          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Store URL</label>
            <p className="text-sm text-indigo-600">
              /store/{store?.slug}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

