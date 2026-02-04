"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  LayoutDashboard,
  ClipboardList,
  Activity,
  AlertTriangle,
  FileText,
  FolderOpen,
  FileSpreadsheet,
  Users,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface NavItem {
  name: string
  href?: string
  icon: React.ElementType
  children?: { name: string; href: string }[]
}

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Inventário de Estoque", href: "/admin/inventarios", icon: ClipboardList },
  { name: "Monitor de Progresso", href: "/admin/inventarios/monitor", icon: Activity },
  {
    name: "Divergências",
    icon: AlertTriangle,
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
      { name: "Clientes e Lojas", href: "/admin/clients" },
      { name: "Empresa", href: "/admin/empresas" },
      { name: "Retries Permitidos", href: "/admin/cadastros/retries" },
      { name: "Usuários", href: "/admin/cadastros/usuarios" },
    ],
  },
  {
    name: "Templates",
    icon: FileSpreadsheet,
    children: [
      { name: "Campos", href: "/admin/templates/campos" },
      { name: "Template Exportação", href: "/admin/templates/exportacao" },
      { name: "Template Importação", href: "/admin/templates/importacao" },
    ],
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
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>([])

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin"
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
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-zinc-900 px-4 pb-4">
      <div className="flex h-16 shrink-0 items-center border-b border-zinc-800">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-orange flex items-center justify-center">
            <span className="text-white font-bold text-sm">EB</span>
          </div>
          <span className="font-semibold text-white">Estoque Brasil</span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              {item.children ? (
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
                      <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      {item.name}
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
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )}
            </li>
          ))}
          <li className="mt-auto pt-4 border-t border-zinc-800">
            <Link
              href="/"
              className="group flex gap-x-3 rounded-md px-3 py-2 text-sm font-medium leading-6 text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
