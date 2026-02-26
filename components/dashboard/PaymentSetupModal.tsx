"use client";

import BankDetailsForm from "@/components/dashboard/BankDetailsForm";

interface PaymentSetupModalProps {
  storeId: string;
  storeName: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function PaymentSetupModal({ storeId, storeName, onClose, onSaved }: PaymentSetupModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Add Bank Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Enter your bank details for <span className="font-medium">{storeName}</span> to receive payments from your customers.
          </p>

          <BankDetailsForm storeId={storeId} onSaved={onSaved} />
        </div>
      </div>
    </div>
  );
}
