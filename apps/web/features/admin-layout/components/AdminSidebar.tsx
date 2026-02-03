"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, BarChart3, Settings } from "lucide-react"
import { cn } from "@/shared/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Clientes", href: "/admin/clients", icon: Users },
  { name: "Relatórios", href: "/admin/reports", icon: BarChart3 },
  { name: "Configurações", href: "/admin/settings", icon: Settings },
]

interface AdminSidebarProps {
  onNavigate?: () => void
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-border px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-orange flex items-center justify-center">
            <span className="text-white font-bold text-sm">EB</span>
          </div>
          <span className="font-semibold text-foreground">Estoque Brasil</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      isActive(item.href)
                        ? "bg-brand-orange text-white"
                        : "text-gray-light hover:text-foreground hover:bg-neutral",
                      "group flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 transition-colors"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive(item.href)
                          ? "text-white"
                          : "text-gray-light group-hover:text-foreground",
                        "h-5 w-5 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
          <li className="mt-auto">
            <Link
              href="/"
              className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-medium leading-6 text-gray-light hover:bg-neutral hover:text-foreground"
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                />
              </svg>
              Voltar ao Site
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}
