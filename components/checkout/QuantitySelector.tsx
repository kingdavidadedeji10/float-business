"use client";

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  max?: number;
}

export default function QuantitySelector({ quantity, onIncrease, onDecrease, max }: QuantitySelectorProps) {
  const atMax = max != null && quantity >= max;
  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDecrease}
          disabled={quantity <= 1}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          −
        </button>
        <span className="text-lg font-semibold w-6 text-center">{quantity}</span>
        <button
          onClick={onIncrease}
          disabled={atMax}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          +
        </button>
      </div>
      {atMax && max != null && (
        <p className="text-xs text-amber-600 mt-1">Only {max} available</p>
      )}
    </div>
  );
}
