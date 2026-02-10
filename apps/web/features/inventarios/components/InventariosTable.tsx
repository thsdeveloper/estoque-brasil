"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Package, RefreshCw, AlertCircle, CheckCircle2, Archive } from "lucide-react"
import type { Inventario } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { DataTable } from "@/shared/components/ui/data-table"
import { DataTableToolbar } from "@/shared/components/ui/data-table-toolbar"
import { cn } from "@/shared/lib/utils"
import { usePermissions } from "@/features/usuarios/hooks/usePermissions"
import { useInventarios } from "../hooks/useInventarios"
import { DeleteInventarioDialog } from "./DeleteInventarioDialog"
import { getColumns } from "./columns"

const statusFilters = [
  { value: "", label: "Todos", icon: Package },
  { value: "true", label: "Ativos", icon: CheckCircle2 },
  { value: "false", label: "Finalizados", icon: Archive },
]

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
  const { hasRole, canUpdate, canDelete } = usePermissions()
  const isLiderColeta = hasRole("lider_coleta")
  const canEditInventario = canUpdate("inventarios")
  const canDeleteInventario = canDelete("inventarios")

  const [pageSize, setPageSize] = useState(10)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [inventarioToDelete, setInventarioToDelete] = useState<Inventario | null>(null)

  // SWR hook for data fetching
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

  const handleDeleteClick = useCallback((inventario: Inventario) => {
    setInventarioToDelete(inventario)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteSuccess = useCallback(() => {
    setDeleteDialogOpen(false)
    setInventarioToDelete(null)
    mutate()
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

  const handleStatusFilterChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("page")
      if (value) {
        params.set("ativo", value)
      } else {
        params.delete("ativo")
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const columns = useMemo(
    () => getColumns({ onDelete: handleDeleteClick, isLiderColeta, canEdit: canEditInventario, canDelete: canDeleteInventario }),
    [handleDeleteClick, isLiderColeta, canEditInventario, canDeleteInventario]
  )

  const hasFilters = idLoja || idEmpresa || ativo !== undefined
  const currentAtivoFilter = ativo === true ? "true" : ativo === false ? "false" : ""

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
        toolbar={
          <DataTableToolbar searchPlaceholder="Buscar por cliente...">
            <div className="inline-flex items-center gap-1 p-1 bg-muted/50 rounded-lg border border-border/50">
              {statusFilters.map((filter) => {
                const isActive = currentAtivoFilter === filter.value
                const Icon = filter.icon
                return (
                  <button
                    key={filter.value}
                    onClick={() => handleStatusFilterChange(filter.value)}
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:ring-offset-1",
                      isActive
                        ? "bg-background text-foreground shadow-sm border border-border/80"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4 transition-colors",
                      isActive ? "text-brand-orange" : "text-muted-foreground"
                    )} />
                    <span>{filter.label}</span>
                  </button>
                )
              })}
            </div>
          </DataTableToolbar>
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
