"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const ACCOUNT_NUMBER_LENGTH = 10;

const NIGERIAN_BANKS = [
  "Access Bank",
  "Citibank",
  "Ecobank",
  "Fidelity Bank",
  "First Bank of Nigeria",
  "First City Monument Bank (FCMB)",
  "Guaranty Trust Bank (GTBank)",
  "Heritage Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Stanbic IBTC Bank",
  "Standard Chartered Bank",
  "Sterling Bank",
  "Union Bank",
  "United Bank for Africa (UBA)",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
  "Kuda Bank",
  "Opay",
  "Palmpay",
];

interface BankDetailsFormProps {
  storeId: string;
  onSaved: () => void;
}

export default function BankDetailsForm({ storeId, onSaved }: BankDetailsFormProps) {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (!bankName) {
      setMessage("Please select a bank.");
      setIsError(true);
      return;
    }
    if (!new RegExp(`^\\d{${ACCOUNT_NUMBER_LENGTH}}$`).test(accountNumber)) {
      setMessage(`Account number must be exactly ${ACCOUNT_NUMBER_LENGTH} digits.`);
      setIsError(true);
      return;
    }
    if (!accountName.trim()) {
      setMessage("Please enter the account name.");
      setIsError(true);
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("stores")
      .update({
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName.trim(),
        payment_status: "submitted",
      })
      .eq("id", storeId);

    setSaving(false);

    if (error) {
      setMessage("Error saving bank details. Please try again.");
      setIsError(true);
    } else {
      onSaved();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bank Name
        </label>
        <select
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
        >
          <option value="">Select your bank</option>
          {NIGERIAN_BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account Number
        </label>
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, ACCOUNT_NUMBER_LENGTH))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="10-digit account number"
          maxLength={ACCOUNT_NUMBER_LENGTH}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Account Name
        </label>
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Name on your bank account"
        />
      </div>

      {message && (
        <p className={`text-sm ${isError ? "text-red-500" : "text-green-600"}`}>
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {saving ? "Submitting..." : "Submit Bank Details"}
      </button>
    </form>
  );
}
