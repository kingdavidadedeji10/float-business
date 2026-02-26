"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface PaymentSetupModalProps {
  storeId: string;
  storeName: string;
  onClose: () => void;
  onSaved: (subaccountCode: string) => void;
}

export default function PaymentSetupModal({ storeId, storeName, onClose, onSaved }: PaymentSetupModalProps) {
  const [subaccountCode, setSubaccountCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!subaccountCode.trim()) {
      setMessage("Please enter a subaccount code.");
      return;
    }
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("stores")
      .update({ subaccount_code: subaccountCode.trim() })
      .eq("id", storeId);

    if (error) {
      setMessage(`Error saving: ${error.message || "Please try again."}`);
    } else {
      onSaved(subaccountCode.trim());
    }

    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Connect Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Connect a Paystack subaccount to <span className="font-medium">{storeName}</span> to receive payments from your customers.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800 font-medium mb-1">What is a Paystack Subaccount?</p>
            <p className="text-xs text-blue-700">
              A subaccount allows Float Business to automatically split payments — you receive your earnings directly in your bank account.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mb-4 font-medium"
          >
            <span>{showInstructions ? "▾" : "▸"}</span>
            How to get a subaccount code
          </button>

          {showInstructions && (
            <ol className="text-xs text-gray-600 space-y-1.5 mb-4 pl-4 list-decimal">
              <li>Go to your <a href="https://dashboard.paystack.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Paystack Dashboard</a></li>
              <li>Navigate to <strong>Subaccounts</strong> in the left menu</li>
              <li>Click <strong>Create Subaccount</strong> and fill in your bank details</li>
              <li>Copy the subaccount code (starts with <code className="bg-gray-100 px-1 rounded">ACCT_</code>)</li>
              <li>Paste it in the field below and save</li>
            </ol>
          )}

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paystack Subaccount Code
              </label>
              <input
                type="text"
                value={subaccountCode}
                onChange={(e) => setSubaccountCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="ACCT_xxxxxxxxxxxx"
              />
            </div>
            {message && (
              <p className={`text-sm ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}>
                {message}
              </p>
            )}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
