"use client";

import { ProductVariant } from "@/types/product";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selected: Record<string, string>;
  onChange: (variantName: string, option: string) => void;
}

export default function VariantSelector({ variants, selected, onChange }: VariantSelectorProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-4">
      {variants.map((variant) => (
        <div key={variant.name}>
          <p className="text-sm font-medium text-gray-700 mb-2">{variant.name}</p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => (
              <button
                key={option}
                onClick={() => onChange(variant.name, option)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                  selected[variant.name] === option
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 font-medium"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
