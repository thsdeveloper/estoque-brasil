"use client"

import { useCallback, useState } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Button } from "@/shared/components/ui/button"

export function InventarioSearchFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [ativo, setAtivo] = useState(searchParams.get("ativo") || "")

  const updateFilters = useCallback(
    (filters: { ativo?: string }) => {
      const params = new URLSearchParams(searchParams.toString())

      // Reset to page 1 when filters change
      params.delete("page")

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
    updateFilters({ ativo: newAtivo })
  }

  const handleClearFilters = () => {
    setAtivo("")
    router.push(pathname)
  }

  const hasFilters = ativo

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select value={ativo || "all"} onValueChange={handleAtivoChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filtrar por status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="true">Ativos</SelectItem>
          <SelectItem value="false">Finalizados</SelectItem>
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
