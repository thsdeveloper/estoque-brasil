"use client"

import { useState, useCallback } from "react"
import useSWR from "swr"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { auditLogsApi } from "../api/audit-logs-api"
import type { AuditLogQueryParams } from "../api/audit-logs-api"
import { AuditLogsFilters } from "./AuditLogsFilters"

export function AuditLogsTable() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<AuditLogQueryParams>({})
  const limit = 20

  const { data, error, isLoading } = useSWR(
    ["audit-logs", page, filters],
    () => auditLogsApi.list({ ...filters, page, limit }),
    { revalidateOnFocus: false }
  )

  const handleFilter = useCallback((newFilters: { acao?: string; dataInicio?: string; dataFim?: string }) => {
    setFilters(newFilters)
    setPage(1)
  }, [])

  const handleClear = useCallback(() => {
    setFilters({})
    setPage(1)
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">Erro ao carregar logs de auditoria</p>
        <p className="text-sm text-zinc-500 mt-1">{error.message || "Tente novamente"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AuditLogsFilters onFilter={handleFilter} onClear={handleClear} />

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400">Data/Hora</TableHead>
              <TableHead className="text-zinc-400">Usuario</TableHead>
              <TableHead className="text-zinc-400">Acao</TableHead>
              <TableHead className="text-zinc-400">Descricao</TableHead>
              <TableHead className="text-zinc-400">Inventario</TableHead>
              <TableHead className="text-zinc-400">Setor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-zinc-800">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data?.data.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={6} className="text-center text-zinc-500 py-8">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((log) => (
                <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="text-sm text-zinc-300 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-300">
                    {log.nomeUsuario || log.idUsuario.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-zinc-800 px-2 py-1 text-xs font-medium text-brand-orange ring-1 ring-inset ring-zinc-700">
                      {log.acao}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-400 max-w-xs truncate">
                    {log.descricao || "-"}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-400">
                    {log.idInventario ?? "-"}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-400">
                    {log.idSetor ?? "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-zinc-500">
            {data.total} registro{data.total !== 1 ? "s" : ""} - Pagina {data.page} de {data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
