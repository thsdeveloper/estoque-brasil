"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"
import { ESTADOS_BRASIL } from "@estoque-brasil/shared"

interface SearchFiltersProps {
  placeholder?: string
}

export function SearchFilters({ placeholder = "Buscar por nome..." }: SearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [uf, setUf] = useState(searchParams.get("uf") || "")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search, uf })
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const updateFilters = useCallback(
    (filters: { search?: string; uf?: string }) => {
      const params = new URLSearchParams(searchParams.toString())

      // Reset to page 1 when filters change
      params.delete("page")

      if (filters.search) {
        params.set("search", filters.search)
      } else {
        params.delete("search")
      }

      if (filters.uf) {
        params.set("uf", filters.uf)
      } else {
        params.delete("uf")
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const handleUfChange = (value: string) => {
    const newUf = value === "all" ? "" : value
    setUf(newUf)
    updateFilters({ search, uf: newUf })
  }

  const handleClearFilters = () => {
    setSearch("")
    setUf("")
    router.push(pathname)
  }

  const hasFilters = search || uf

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-light" />
        <Input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={uf || "all"} onValueChange={handleUfChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por UF" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os estados</SelectItem>
          {ESTADOS_BRASIL.map((estado) => (
            <SelectItem key={estado.value} value={estado.value}>
              {estado.value} - {estado.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="self-center"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  )
}
