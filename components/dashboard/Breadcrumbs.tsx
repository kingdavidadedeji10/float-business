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
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1 text-sm flex-wrap list-none">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <span className="text-gray-400 select-none" aria-hidden="true">&gt;</span>}
            {item.href && index < items.length - 1 ? (
              <Link href={item.href} className="text-indigo-600 hover:underline">
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
