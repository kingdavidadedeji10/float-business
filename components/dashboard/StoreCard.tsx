"use client";

import { useState, useEffect } from "react";
import { Store } from "@/types/store";
import Link from "next/link";
import { ConnectBankModal } from "@/components/dashboard/ConnectBankModal";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/helpers";

interface StoreCardProps {
  store: Store;
  onBankConnected?: (storeId: string, accountName: string, subaccountCode: string) => void;
}

export default function StoreCard({ store, onBankConnected }: StoreCardProps) {
  const isPaymentConnected = !!store.subaccount_code;
  const [modalOpen, setModalOpen] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("orders")
      .select("total")
      .eq("store_id", store.id)
      .eq("status", "paid")
      .then(({ data }) => {
        const total = (data || []).reduce((sum, o) => sum + (o.total || 0), 0);
        setBalance(total);
      });
  }, [store.id]);

  function handleSuccess(accountName: string, subaccountCode: string) {
    setModalOpen(false);
    if (onBankConnected) onBankConnected(store.id, accountName, subaccountCode);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{store.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">/store/{store.slug}</p>
        </div>
        <Link
          href={`/dashboard/stores/${store.id}/settings`}
          className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
          title="Store settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>

      {/* Balance */}
      <div className="mb-3">
        <p className="text-xs text-gray-500 mb-0.5">Total Earnings</p>
        <p className="text-2xl font-bold text-gray-900">
          {balance === null ? "—" : formatCurrency(balance)}
        </p>
      </div>

      <div className="mb-3">
        {isPaymentConnected ? (
          <div>
            <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
              ✓ Bank Connected
            </span>
            {store.account_name && (
              <p className="text-xs text-gray-500 mt-1">{store.account_name} · {store.bank_name}</p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-yellow-200 transition"
            title="Connect your bank to receive payments"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block"></span>
            Connect Bank
          </button>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        <Link
          href={`/dashboard/store/${store.id}/manage`}
          className="flex-1 text-center text-sm bg-indigo-600 text-white py-1.5 rounded-lg hover:bg-indigo-700 transition"
        >
          Manage
        </Link>
        <Link
          href={`/store/${store.slug}`}
          target="_blank"
          className="text-sm border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
        >
          View
        </Link>
      </div>

      <ConnectBankModal
        storeId={store.id}
        storeName={store.name}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
