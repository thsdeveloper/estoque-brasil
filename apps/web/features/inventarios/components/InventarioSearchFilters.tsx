"use client"

import { useCallback, useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Package, CheckCircle2, Archive, Search } from "lucide-react"
import { cn } from "@/shared/lib/utils"
import { Input } from "@/shared/components/ui/input"

interface InventarioSearchFiltersProps {
  currentFilter?: string
  currentSearch?: string
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

export function InventarioSearchFilters({ currentFilter = "", currentSearch = "" }: InventarioSearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentSearch)

  // Sync local state with URL param
  useEffect(() => {
    setSearchValue(currentSearch)
  }, [currentSearch])

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

      // Clear search when switching tabs
      params.delete("search")
      setSearchValue("")

      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const handleSearchSubmit = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("page")

      if (value.trim()) {
        params.set("search", value.trim())
      } else {
        params.delete("search")
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearchSubmit(searchValue)
      }
    },
    [handleSearchSubmit, searchValue]
  )

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por cliente..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          onBlur={() => handleSearchSubmit(searchValue)}
          className="pl-9 h-9"
        />
      </div>
    </div>
  )
}
