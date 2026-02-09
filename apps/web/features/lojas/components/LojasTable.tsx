"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { Loja } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { DataTable } from "@/shared/components/ui/data-table"
import { usePermissions } from "@/features/usuarios/hooks/usePermissions"
import { lojasApi, type PaginatedResponse } from "../api/lojas-api"
import { DeleteLojaDialog } from "./DeleteLojaDialog"
import { getColumns } from "./columns"

interface LojasTableProps {
  clientId: string
  page: number
  search?: string
}

export function LojasTable({ clientId, page, search }: LojasTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { canUpdate, canDelete } = usePermissions()
  const canEditLoja = canUpdate("lojas")
  const canDeleteLoja = canDelete("lojas")

  const [data, setData] = useState<PaginatedResponse<Loja> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [lojaToDelete, setLojaToDelete] = useState<Loja | null>(null)
  const [pageSize, setPageSize] = useState(10)

  const fetchLojas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await lojasApi.list({
        page,
        limit: pageSize,
        search: search || undefined,
        idCliente: clientId,
      })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar lojas")
    } finally {
      setLoading(false)
    }
  }, [clientId, page, pageSize, search])

  useEffect(() => {
    fetchLojas()
  }, [fetchLojas])

  const handlePaginationChange = (
    newPageIndex: number,
    newPageSize: number
  ) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPageIndex + 1))
    router.push(`${pathname}?${params.toString()}`)

    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
  }

  const handleDeleteClick = (loja: Loja) => {
    setLojaToDelete(loja)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false)
    setLojaToDelete(null)
    fetchLojas()
  }

  const columns = useMemo(
    () => getColumns({ clientId, onDelete: handleDeleteClick, canEdit: canEditLoja, canDelete: canDeleteLoja }),
    [clientId, canEditLoja, canDeleteLoja]
  )

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchLojas} variant="outline">
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!loading && (!data || data.data.length === 0)) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-light mb-4">
          {search
            ? "Nenhuma loja encontrada com os filtros aplicados"
            : "Nenhuma loja cadastrada para este cliente"}
        </p>
        {!search && (
          <Button asChild>
            <Link href={`/admin/clients/${clientId}/lojas/new`}>
              Cadastrar primeira loja
            </Link>
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pageCount={data?.totalPages ?? 0}
        pageIndex={page - 1}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={loading}
        showColumnVisibility={true}
        emptyMessage={
          search
            ? "Nenhuma loja encontrada com os filtros aplicados"
            : "Nenhuma loja cadastrada"
        }
      />

      <DeleteLojaDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        loja={lojaToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
