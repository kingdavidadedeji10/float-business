"use client";

import { ProductVariant } from "@/types/product";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selected: Record<string, string>;
  onChange: (selected: Record<string, string>) => void;
}

export default function VariantSelector({ variants, selected, onChange }: VariantSelectorProps) {
  function handleSelect(variantName: string, option: string) {
    onChange({ ...selected, [variantName]: option });
  }

  return (
    <div className="space-y-3">
      {variants.map((variant) => (
        <div key={variant.name}>
          <p className="text-sm font-medium text-gray-700 mb-1">{variant.name}</p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSelect(variant.name, option)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                  selected[variant.name] === option
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
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
