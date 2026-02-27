"use client";

import { useState, useEffect, useRef } from "react";
import { Store } from "@/types/store";
import { useRouter } from "next/navigation";

interface StoreSwitcherProps {
  currentStoreId: string;
  stores: Store[];
}

export default function StoreSwitcher({ currentStoreId, stores }: StoreSwitcherProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const currentStore = stores.find((s) => s.id === currentStoreId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSwitch(storeId: string) {
    setOpen(false);
    router.push(`/dashboard/store/${storeId}/manage`);
  }

  if (stores.length <= 1) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
          {currentStore?.name[0]?.toUpperCase()}
        </div>
        <span className="font-semibold text-gray-900 text-sm">{currentStore?.name}</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
      >
        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
          {currentStore?.name[0]?.toUpperCase()}
        </div>
        <span className="font-semibold text-gray-900 text-sm">{currentStore?.name}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          <p className="text-xs text-gray-400 px-3 pt-2 pb-1">Switch store</p>
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => handleSwitch(store.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition text-left ${
                store.id === currentStoreId ? "bg-indigo-50" : ""
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                {store.name[0]?.toUpperCase()}
              </div>
              <span className="flex-1 truncate text-gray-800">{store.name}</span>
              {store.id === currentStoreId && (
                <span className="text-indigo-600 text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
