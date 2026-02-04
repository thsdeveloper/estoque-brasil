"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { Inventario } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { DataTable } from "@/shared/components/ui/data-table"
import { inventariosApi, type PaginatedResponse } from "../api/inventarios-api"
import { DeleteInventarioDialog } from "./DeleteInventarioDialog"
import { getColumns } from "./columns"

interface InventariosTableProps {
  page: number
  idLoja?: number
  idEmpresa?: number
  ativo?: boolean
}

export function InventariosTable({ page, idLoja, idEmpresa, ativo }: InventariosTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [data, setData] = useState<PaginatedResponse<Inventario> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [inventarioToDelete, setInventarioToDelete] = useState<Inventario | null>(null)
  const [pageSize, setPageSize] = useState(10)

  const fetchInventarios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await inventariosApi.list({
        page,
        limit: pageSize,
        idLoja,
        idEmpresa,
        ativo,
      })
      setData(result)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar inventarios"
      )
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, idLoja, idEmpresa, ativo])

  useEffect(() => {
    fetchInventarios()
  }, [fetchInventarios])

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

  const handleDeleteClick = (inventario: Inventario) => {
    setInventarioToDelete(inventario)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false)
    setInventarioToDelete(null)
    fetchInventarios()
  }

  const columns = useMemo(
    () => getColumns({ onDelete: handleDeleteClick }),
    []
  )

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchInventarios} variant="outline">
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!loading && (!data || data.data.length === 0)) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-light mb-4">
          {idLoja || idEmpresa || ativo !== undefined
            ? "Nenhum inventario encontrado com os filtros aplicados"
            : "Nenhum inventario cadastrado"}
        </p>
        {!idLoja && !idEmpresa && ativo === undefined && (
          <Button asChild>
            <Link href="/admin/inventarios/new">Cadastrar primeiro inventario</Link>
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
          idLoja || idEmpresa || ativo !== undefined
            ? "Nenhum inventario encontrado com os filtros aplicados"
            : "Nenhum inventario cadastrado"
        }
      />

      <DeleteInventarioDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        inventario={inventarioToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
