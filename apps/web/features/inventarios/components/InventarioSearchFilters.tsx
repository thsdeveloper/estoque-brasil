"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Package, CheckCircle2, Archive } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface InventarioSearchFiltersProps {
  currentFilter?: string
}

const filters = [
  {
    value: "",
    label: "Todos",
    icon: Package,
    description: "Todos os inventarios"
  },
  {
    value: "true",
    label: "Ativos",
    icon: CheckCircle2,
    description: "Em andamento"
  },
  {
    value: "false",
    label: "Finalizados",
    icon: Archive,
    description: "Concluidos"
  },
]

export function InventarioSearchFilters({ currentFilter = "" }: InventarioSearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilterChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      // Reset to page 1 when filters change
      params.delete("page")

      if (value) {
        params.set("ativo", value)
      } else {
        params.delete("ativo")
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
      {filters.map((filter) => {
        const isActive = currentFilter === filter.value ||
          (filter.value === "" && !currentFilter)
        const Icon = filter.icon

        return (
          <button
            key={filter.value}
            onClick={() => handleFilterChange(filter.value)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-1",
              isActive
                ? "bg-background text-foreground shadow-sm border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className={cn(
              "h-4 w-4 transition-colors",
              isActive ? "text-brand-orange" : "text-muted-foreground"
            )} />
            <span>{filter.label}</span>
          </button>
        )
      })}
    </div>
  )
}
