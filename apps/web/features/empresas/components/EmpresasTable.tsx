"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { Empresa } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { DataTable } from "@/shared/components/ui/data-table"
import { DataTableToolbar } from "@/shared/components/ui/data-table-toolbar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { usePermissions } from "@/features/usuarios/hooks/usePermissions"
import { empresasApi, type PaginatedResponse } from "../api/empresas-api"
import { DeleteEmpresaDialog } from "./DeleteEmpresaDialog"
import { getColumns } from "./columns"

interface EmpresasTableProps {
  page: number
  search?: string
  ativo?: boolean
}

export function EmpresasTable({ page, search, ativo }: EmpresasTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { canUpdate, canDelete } = usePermissions()
  const canEditEmpresa = canUpdate("empresas")
  const canDeleteEmpresa = canDelete("empresas")

  const [data, setData] = useState<PaginatedResponse<Empresa> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null)
  const [pageSize, setPageSize] = useState(10)

  const fetchEmpresas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await empresasApi.list({
        page,
        limit: pageSize,
        search: search || undefined,
        ativo: ativo,
      })
      setData(result)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar empresas"
      )
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, ativo])

  useEffect(() => {
    fetchEmpresas()
  }, [fetchEmpresas])

  const handlePaginationChange = (
    newPageIndex: number,
    newPageSize: number
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPageIndex + 1)) // API uses 1-based pagination
    router.push(`${pathname}?${params.toString()}`)

    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
  }

  const handleAtivoChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("page")
    if (value === "all") {
      params.delete("ativo")
    } else {
      params.set("ativo", value)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleDeleteClick = (empresa: Empresa) => {
    setEmpresaToDelete(empresa)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false)
    setEmpresaToDelete(null)
    fetchEmpresas()
  }

  const columns = useMemo(
    () => getColumns({ onDelete: handleDeleteClick, canEdit: canEditEmpresa, canDelete: canDeleteEmpresa }),
    [canEditEmpresa, canDeleteEmpresa]
  )

  // Derive ativo string for the Select value
  const ativoValue = ativo === true ? "true" : ativo === false ? "false" : "all"

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchEmpresas} variant="outline">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pageCount={data?.totalPages ?? 0}
        pageIndex={page - 1} // Convert to 0-based for TanStack Table
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={loading}
        showColumnVisibility={true}
        emptyMessage={
          search || ativo !== undefined
            ? "Nenhuma empresa encontrada com os filtros aplicados"
            : "Nenhuma empresa cadastrada"
        }
        toolbar={
          <DataTableToolbar searchPlaceholder="Buscar por razao social, nome fantasia ou CNPJ...">
            <Select value={ativoValue} onValueChange={handleAtivoChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-9">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="true">Ativas</SelectItem>
                <SelectItem value="false">Inativas</SelectItem>
              </SelectContent>
            </Select>
          </DataTableToolbar>
        }
      />

      <DeleteEmpresaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        empresa={empresaToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
