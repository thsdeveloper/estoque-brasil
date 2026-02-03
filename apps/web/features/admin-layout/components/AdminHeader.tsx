"use client"

import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { LogoutButton } from "@/features/auth"

interface AdminHeaderProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/clients": "Clientes",
  "/admin/clients/create": "Novo Cliente",
  "/admin/reports": "Relatórios",
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname()

  const getPageTitle = () => {
    // Check for exact match first
    if (pageTitles[pathname]) {
      return pageTitles[pathname]
    }

    // Check for client detail or edit pages
    if (pathname.match(/^\/admin\/clients\/[^/]+\/edit$/)) {
      return "Editar Cliente"
    }
    if (pathname.match(/^\/admin\/clients\/[^/]+$/)) {
      return "Detalhes do Cliente"
    }

    return "Admin"
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs: { name: string; href: string }[] = []

    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/")

      if (segment === "admin") {
        breadcrumbs.push({ name: "Admin", href })
      } else if (segment === "clients") {
        breadcrumbs.push({ name: "Clientes", href })
      } else if (segment === "create") {
        breadcrumbs.push({ name: "Novo", href })
      } else if (segment === "edit") {
        breadcrumbs.push({ name: "Editar", href })
      } else if (segment.match(/^[0-9a-f-]+$/i)) {
        // UUID - skip in breadcrumb display
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Abrir menu</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </Button>

      <Separator orientation="vertical" className="h-6 lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex items-center">
                  {index > 0 && (
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-gray-light mx-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                    </svg>
                  )}
                  <span
                    className={
                      index === breadcrumbs.length - 1
                        ? "text-sm font-medium text-foreground"
                        : "text-sm text-gray-light hover:text-foreground"
                    }
                  >
                    {crumb.name}
                  </span>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        <h1 className="text-lg font-semibold text-foreground hidden sm:block">
          {getPageTitle()}
        </h1>
        <LogoutButton />
      </div>
    </header>
  )
}
