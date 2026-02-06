"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Package, Plus, RefreshCw, AlertCircle } from "lucide-react"
import type { Inventario } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { DataTable } from "@/shared/components/ui/data-table"
import { useInventarios } from "../hooks/useInventarios"
import { DeleteInventarioDialog } from "./DeleteInventarioDialog"
import { getColumns } from "./columns"

interface InventariosTableProps {
  page: number
  idLoja?: number
  idEmpresa?: number
  ativo?: boolean
  search?: string
}

export function InventariosTable({
  page,
  idLoja,
  idEmpresa,
  ativo,
  search,
}: InventariosTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pageSize, setPageSize] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [inventarioToDelete, setInventarioToDelete] = useState<Inventario | null>(null)

  // SWR hook for data fetching (client-swr-dedup)
  const {
    data,
    totalPages,
    isLoading,
    isError,
    error,
    mutate,
  } = useInventarios({
    page,
    limit: pageSize,
    idLoja,
    idEmpresa,
    ativo,
    search,
  })

  // Stable callback using useCallback (rerender-functional-setstate)
  const handleDeleteClick = useCallback((inventario: Inventario) => {
    setInventarioToDelete(inventario)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteSuccess = useCallback(() => {
    setDeleteDialogOpen(false)
    setInventarioToDelete(null)
    mutate() // Revalidate SWR cache
  }, [mutate])

  const handleRowClick = useCallback(
    (inventario: Inventario) => {
      router.push(`/admin/inventarios/${inventario.id}`)
    },
    [router]
  )

  const handlePaginationChange = useCallback(
    (newPageIndex: number, newPageSize: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(newPageIndex + 1))
      router.push(`${pathname}?${params.toString()}`)

      if (newPageSize !== pageSize) {
        setPageSize(newPageSize)
      }
    },
    [searchParams, router, pathname, pageSize]
  )

  // Memoize columns with proper dependencies (rerender-memo)
  const columns = useMemo(
    () => getColumns({ onDelete: handleDeleteClick }),
    [handleDeleteClick]
  )

  const hasFilters = idLoja || idEmpresa || ativo !== undefined

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">
          Erro ao carregar dados
        </h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
          {error}
        </p>
        <Button
          onClick={() => mutate()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  // Empty state (only show when not loading)
  if (!isLoading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border bg-muted/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">
          {hasFilters ? "Nenhum resultado" : "Nenhum inventario"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
          {hasFilters
            ? "Nenhum inventario encontrado com os filtros aplicados. Tente ajustar os filtros."
            : "Comece criando seu primeiro inventario para gerenciar o estoque."}
        </p>
        {!hasFilters && (
          <Button asChild size="sm" className="gap-2">
            <Link href="/admin/inventarios/new">
              <Plus className="h-4 w-4" />
              Criar inventario
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
        data={data}
        pageCount={totalPages}
        pageIndex={page - 1}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        onRowClick={handleRowClick}
        loading={isLoading}
        showColumnVisibility={true}
        emptyMessage={
          hasFilters
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
