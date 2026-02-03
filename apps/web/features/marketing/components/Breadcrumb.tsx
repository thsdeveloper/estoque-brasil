"use client";

import Link from "next/link";
import { HiHome, HiChevronRight } from "react-icons/hi";
import BreadcrumbSchema from "./schemas/BreadcrumbSchema";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const baseUrl = "https://estoquebrasill.com.br";

  const schemaItems = [
    { name: "Início", url: baseUrl },
    ...items.map((item) => ({
      name: item.label,
      url: `${baseUrl}${item.href}`,
    })),
  ];

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav
        aria-label="Breadcrumb"
        className="bg-gray-100 py-3 border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link
                href="/"
                className="flex items-center gap-1 text-gray-600 hover:text-[#f84704] transition-colors"
              >
                <HiHome className="w-4 h-4" />
                <span>Início</span>
              </Link>
            </li>
            {items.map((item, index) => (
              <li key={item.href} className="flex items-center gap-2">
                <HiChevronRight className="w-4 h-4 text-gray-400" />
                {index === items.length - 1 ? (
                  <span className="text-[#343434] font-medium">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-600 hover:text-[#f84704] transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}
