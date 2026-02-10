"use client"

import { useState, useCallback, useMemo } from "react"
import useSWR from "swr"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { DataTable } from "@/shared/components/ui/data-table"
import { DataTableToolbar } from "@/shared/components/ui/data-table-toolbar"
import { auditLogsApi } from "../api/audit-logs-api"
import type { AuditLogQueryParams } from "../api/audit-logs-api"
import { getColumns } from "./columns"

export function AuditLogsTable() {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [acao, setAcao] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  const filters: AuditLogQueryParams = useMemo(() => ({
    acao: acao || undefined,
    dataInicio: dataInicio ? new Date(dataInicio).toISOString() : undefined,
    dataFim: dataFim ? new Date(dataFim).toISOString() : undefined,
  }), [acao, dataInicio, dataFim])

  const { data, error, isLoading } = useSWR(
    ["audit-logs", pageIndex, pageSize, filters],
    () => auditLogsApi.list({ ...filters, page: pageIndex + 1, limit: pageSize }),
    { revalidateOnFocus: false }
  )

  const handleSearchChange = useCallback((value: string) => {
    setAcao(value)
    setPageIndex(0)
  }, [])

  const handleClearFilters = useCallback(() => {
    setAcao("")
    setDataInicio("")
    setDataFim("")
    setPageIndex(0)
  }, [])

  const handlePaginationChange = useCallback((newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }, [])

  const columns = useMemo(() => getColumns(), [])

  const hasActiveFilters = !!(acao || dataInicio || dataFim)

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Erro ao carregar logs de auditoria</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message || "Tente novamente"}</p>
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data?.data ?? []}
      pageCount={data?.totalPages ?? 0}
      pageIndex={pageIndex}
      pageSize={pageSize}
      onPaginationChange={handlePaginationChange}
      loading={isLoading}
      emptyMessage="Nenhum registro encontrado."
      showColumnVisibility={true}
      pageSizeOptions={[10, 20, 30, 50]}
      toolbar={
        <DataTableToolbar
          searchPlaceholder="Filtrar por ação (ex: ABERTURA_SETOR)..."
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        >
          <div className="flex items-center gap-2">
            <Label htmlFor="dataInicio" className="text-sm text-muted-foreground whitespace-nowrap">
              De
            </Label>
            <Input
              id="dataInicio"
              type="datetime-local"
              value={dataInicio}
              onChange={(e) => { setDataInicio(e.target.value); setPageIndex(0) }}
              className="w-48 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="dataFim" className="text-sm text-muted-foreground whitespace-nowrap">
              Até
            </Label>
            <Input
              id="dataFim"
              type="datetime-local"
              value={dataFim}
              onChange={(e) => { setDataFim(e.target.value); setPageIndex(0) }}
              className="w-48 h-9"
            />
          </div>
        </DataTableToolbar>
      }
    />
  )
}
