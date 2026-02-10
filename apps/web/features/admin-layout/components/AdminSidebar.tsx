"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useMemo } from "react"
import {
  LayoutDashboard,
  ClipboardList,
  Activity,
  AlertTriangle,
  FileText,
  FolderOpen,
  Users,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Shield,
  ScrollText,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { usePermissions } from "@/features/usuarios/hooks/usePermissions"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"

interface NavChild {
  name: string
  href: string
  permission?: { resource: string; action: string }
}

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  children?: NavChild[]
  permission?: { resource: string; action: string }
  isNew?: boolean
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    name: "Inventário de Estoque",
    href: "/admin/inventarios",
    icon: ClipboardList,
    permission: { resource: "inventarios", action: "read" },
  },
  {
    name: "Monitor de Progresso",
    href: "/admin/inventarios/monitor",
    icon: Activity,
    permission: { resource: "inventarios", action: "read" },
  },
  {
    name: "Divergências",
    icon: AlertTriangle,
    isNew: true,
    children: [
      { name: "Habilitar Divergências", href: "/admin/divergencias/habilitar" },
      { name: "Reconferidos", href: "/admin/divergencias/reconferidos" },
      { name: "Relatórios", href: "/admin/divergencias/relatorios" },
    ],
  },
  {
    name: "Relatórios",
    icon: FileText,
    children: [
      { name: "Exportar", href: "/admin/relatorios/exportar" },
      { name: "Gerar relatórios", href: "/admin/relatorios/gerar" },
    ],
  },
  {
    name: "Cadastros",
    icon: FolderOpen,
    children: [
      {
        name: "Clientes e Lojas",
        href: "/admin/clients",
        permission: { resource: "clients", action: "read" },
      },
      {
        name: "Empresa",
        href: "/admin/empresas",
        permission: { resource: "empresas", action: "read" },
      },
      { name: "Retries Permitidos", href: "/admin/cadastros/retries" },
      {
        name: "Usuários",
        href: "/admin/cadastros/usuarios",
        permission: { resource: "usuarios", action: "read" },
      },
      {
        name: "Perfis e Permissões",
        href: "/admin/cadastros/roles",
        permission: { resource: "usuarios", action: "read" },
      },
    ],
  },
  {
    name: "Controle de Acesso",
    icon: Shield,
    permission: { resource: "usuarios", action: "read" },
    children: [
      {
        name: "Recursos",
        href: "/admin/acesso/recursos",
        permission: { resource: "usuarios", action: "read" },
      },
      {
        name: "Ações",
        href: "/admin/acesso/acoes",
        permission: { resource: "usuarios", action: "read" },
      },
      {
        name: "Políticas",
        href: "/admin/acesso/politicas",
        permission: { resource: "usuarios", action: "read" },
      },
    ],
  },
  {
    name: "Log de Auditoria",
    href: "/admin/audit-logs",
    icon: ScrollText,
    permission: { resource: "audit_logs", action: "read" },
  },
  {
    name: "Cliente",
    icon: Users,
    children: [
      { name: "Resultado Power BI", href: "/admin/cliente/power-bi" },
      { name: "Gerar relatórios", href: "/admin/cliente/relatorios" },
      { name: "Exportar", href: "/admin/cliente/exportar" },
    ],
  },
  { name: "Sincronizar Dados", href: "/admin/sincronizar", icon: RefreshCw },
]

interface AdminSidebarProps {
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function AdminSidebar({ onNavigate, collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])
  const { hasPermission, loading: permissionsLoading } = usePermissions()

  // Filter navigation items based on permissions
  const filteredNavigation = useMemo(() => {
    if (permissionsLoading) {
      return navigation
    }

    return navigation
      .map((item) => {
        if (item.permission) {
          const hasAccess = hasPermission(item.permission.resource, item.permission.action)
          if (!hasAccess) return null
        }

        if (item.children) {
          const filteredChildren = item.children.filter((child) => {
            if (!child.permission) return true
            return hasPermission(child.permission.resource, child.permission.action)
          })

          if (filteredChildren.length === 0) return null

          return { ...item, children: filteredChildren }
        }

        return item
      })
      .filter(Boolean) as NavItem[]
  }, [hasPermission, permissionsLoading])

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
    }
    if (pathname === href) {
      return true
    }
    const hasMoreSpecificMatch = filteredNavigation.some(
      (item) => item.href && item.href !== href && item.href.startsWith(href) && pathname.startsWith(item.href)
    )
    if (hasMoreSpecificMatch) {
      return false
    }
    return pathname.startsWith(href)
  }

  const isChildActive = (children?: { name: string; href: string }[]) => {
    if (!children) return false
    return children.some((child) => pathname.startsWith(child.href))
  }

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  const isMenuOpen = (name: string, children?: { name: string; href: string }[]) => {
    return openMenus.includes(name) || isChildActive(children)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        "flex grow flex-col gap-y-5 overflow-y-auto bg-zinc-900 pb-4 transition-all duration-300",
        collapsed ? "px-2" : "px-4"
      )}>
        {/* Header */}
        <div className={cn(
          "flex h-16 shrink-0 items-center border-b border-zinc-800",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-orange flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">EB</span>
            </div>
            {!collapsed && (
              <span className="font-semibold text-white whitespace-nowrap">Estoque Brasil</span>
            )}
          </Link>
          {!collapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Recolher menu"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="mx-auto p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Expandir menu"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {filteredNavigation.map((item) => (
              <li key={item.name}>
                {item.children ? (
                  // Menu with children
                  collapsed ? (
                    // Collapsed: show icon with tooltip
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => toggleMenu(item.name)}
                          className={cn(
                            "w-full group flex items-center justify-center rounded-md p-2 transition-colors",
                            isChildActive(item.children)
                              ? "bg-zinc-800 text-white"
                              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                          {item.isNew && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="flex flex-col gap-1">
                        <span className="font-medium">{item.name}</span>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onNavigate}
                            className={cn(
                              "text-xs px-2 py-1 rounded hover:bg-zinc-700",
                              isActive(child.href) ? "text-brand-orange" : "text-zinc-300"
                            )}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    // Expanded: show full menu
                    <div>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={cn(
                          "w-full group flex items-center justify-between gap-x-3 rounded-md px-3 py-2 text-sm font-medium leading-6 transition-colors",
                          isChildActive(item.children)
                            ? "bg-zinc-800 text-white"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        )}
                      >
                        <span className="flex items-center gap-x-3">
                          <item.icon
                            className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                            aria-hidden="true"
                          />
                          {item.name}
                          {item.isNew && (
                            <span className="rounded bg-green-500 px-1 py-px text-[9px] font-medium uppercase leading-none text-white">
                              New
                            </span>
                          )}
                        </span>
                        {isMenuOpen(item.name, item.children) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                      {isMenuOpen(item.name, item.children) && (
                        <ul className="mt-1 space-y-1 pl-8">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                onClick={onNavigate}
                                className={cn(
                                  "block rounded-md px-3 py-2 text-sm leading-6 transition-colors",
                                  isActive(child.href)
                                    ? "bg-brand-orange text-white"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                )}
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )
                ) : (
                  // Single item (no children)
                  collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href!}
                          onClick={onNavigate}
                          className={cn(
                            "group flex items-center justify-center rounded-md p-2 transition-colors",
                            isActive(item.href!)
                              ? "bg-brand-orange text-white"
                              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      href={item.href!}
                      onClick={onNavigate}
                      className={cn(
                        isActive(item.href!)
                          ? "bg-brand-orange text-white"
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800",
                        "group flex gap-x-3 rounded-md px-3 py-2 text-sm font-medium leading-6 transition-colors"
                      )}
                    >
                      <item.icon
                        className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  )
                )}
              </li>
            ))}

            {/* Footer */}
            <li className="mt-auto pt-4 border-t border-zinc-800">
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/"
                      className="group flex items-center justify-center rounded-md p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">Voltar ao Site</TooltipContent>
                </Tooltip>
              ) : (
                <>
                  <Link
                    href="/"
                    className="group flex gap-x-3 rounded-md px-3 py-2 text-sm font-medium leading-6 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  >
                    <svg
                      className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-translate-x-1"
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
                  <div className="mt-3 px-3 py-2 text-center">
                    <span className="text-xs text-zinc-600">v1.2.0</span>
                  </div>
                </>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </TooltipProvider>
  )
}
