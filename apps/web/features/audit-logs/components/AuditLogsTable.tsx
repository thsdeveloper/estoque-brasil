"use client"

import { useState, useCallback, useMemo } from "react"
import useSWR from "swr"
import { DataTable } from "@/shared/components/ui/data-table"
import { auditLogsApi } from "../api/audit-logs-api"
import type { AuditLogQueryParams } from "../api/audit-logs-api"
import { AuditLogsFilters } from "./AuditLogsFilters"
import { getColumns } from "./columns"

export function AuditLogsTable() {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [filters, setFilters] = useState<AuditLogQueryParams>({})

  const { data, error, isLoading } = useSWR(
    ["audit-logs", pageIndex, pageSize, filters],
    () => auditLogsApi.list({ ...filters, page: pageIndex + 1, limit: pageSize }),
    { revalidateOnFocus: false }
  )

  const handleFilter = useCallback((newFilters: { acao?: string; dataInicio?: string; dataFim?: string }) => {
    setFilters(newFilters)
    setPageIndex(0)
  }, [])

  const handleClear = useCallback(() => {
    setFilters({})
    setPageIndex(0)
  }, [])

  const handlePaginationChange = useCallback((newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }, [])

  const columns = useMemo(() => getColumns(), [])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Erro ao carregar logs de auditoria</p>
        <p className="text-sm text-muted-foreground mt-1">{error.message || "Tente novamente"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AuditLogsFilters onFilter={handleFilter} onClear={handleClear} />

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
      />
    </div>
  )
}
