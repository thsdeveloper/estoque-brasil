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

interface EmpresaSearchFiltersProps {
  placeholder?: string
}

export function EmpresaSearchFilters({
  placeholder = "Buscar por nome...",
}: EmpresaSearchFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [ativo, setAtivo] = useState(searchParams.get("ativo") || "")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ search, ativo })
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const updateFilters = useCallback(
    (filters: { search?: string; ativo?: string }) => {
      const params = new URLSearchParams(searchParams.toString())

      // Reset to page 1 when filters change
      params.delete("page")

      if (filters.search) {
        params.set("search", filters.search)
      } else {
        params.delete("search")
      }

      if (filters.ativo) {
        params.set("ativo", filters.ativo)
      } else {
        params.delete("ativo")
      }

      router.push(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams]
  )

  const handleAtivoChange = (value: string) => {
    const newAtivo = value === "all" ? "" : value
    setAtivo(newAtivo)
    updateFilters({ search, ativo: newAtivo })
  }

  const handleClearFilters = () => {
    setSearch("")
    setAtivo("")
    router.push(pathname)
  }

  const hasFilters = search || ativo

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

      <Select value={ativo || "all"} onValueChange={handleAtivoChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="true">Ativas</SelectItem>
          <SelectItem value="false">Inativas</SelectItem>
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
