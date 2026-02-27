"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
      <ol className="flex items-center gap-2 text-sm flex-wrap list-none">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {index > 0 && <span className="text-gray-300 select-none" aria-hidden="true">/</span>}
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="text-gray-500 hover:underline hover:text-gray-700 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-gray-900" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
