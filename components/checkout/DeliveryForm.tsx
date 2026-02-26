"use client";

import { useState } from "react";
import { Address } from "@/types/delivery";
import { formatCurrency } from "@/lib/helpers";

interface Quote {
  courier_name: string;
  delivery_method: string;
  price: number;
  estimated_days: number;
}

interface DeliveryFormProps {
  originAddress: Address | null;
  weight: number | null;
  sizeCategory: string | null;
  onQuoteSelected: (fee: number, address: Address) => void;
}

export default function DeliveryForm({
  originAddress,
  weight,
  sizeCategory,
  onQuoteSelected,
}: DeliveryFormProps) {
  const [address, setAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    country: "Nigeria",
  });
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  async function handleCalculate() {
    if (!address.street || !address.city || !address.state) {
      setError("Please fill in all address fields");
      return;
    }

    if (!originAddress) {
      setError("Store pickup address not configured");
      return;
    }

    setLoading(true);
    setError("");
    setQuotes([]);
    setSelectedQuote(null);

    try {
      const res = await fetch("/api/sendbox/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_address: originAddress,
          destination_address: address,
          weight: weight ?? 1,
          size_category: sizeCategory ?? "small",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get quotes");

      if (data.quotes && data.quotes.length > 0) {
        setQuotes(data.quotes);
      } else {
        setError("No delivery options available for this route");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to calculate delivery";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectQuote(quote: Quote) {
    setSelectedQuote(quote);
    onQuoteSelected(quote.price, address);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3">
        <input
          type="text"
          placeholder="Street address"
          value={address.street}
          onChange={(e) => setAddress({ ...address, street: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="City"
            value={address.city}
            onChange={(e) => setAddress({ ...address, city: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            placeholder="State"
            value={address.state}
            onChange={(e) => setAddress({ ...address, state: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleCalculate}
        disabled={loading}
        className="w-full bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
      >
        {loading ? "Calculating..." : "Calculate Delivery Cost"}
      </button>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {quotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Choose a delivery option:</p>
          {quotes.map((quote, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectQuote(quote)}
              className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition ${
                selectedQuote?.courier_name === quote.courier_name
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-200 hover:border-indigo-300"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{quote.courier_name}</p>
                <p className="text-xs text-gray-500">{quote.estimated_days} day(s) estimated</p>
              </div>
              <p className="text-sm font-semibold text-indigo-600">{formatCurrency(quote.price)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
