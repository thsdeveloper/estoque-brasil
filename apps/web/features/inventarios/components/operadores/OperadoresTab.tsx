"use client"

import { useState, useMemo, useCallback, useRef } from "react"
import { Plus, Search, RefreshCw, AlertCircle, Users, Trash2 } from "lucide-react"
import type { InventarioOperador } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { DataTable } from "@/shared/components/ui/data-table"
import { useOperadores } from "../../hooks/useOperadores"
import { inventariosApi } from "../../api/inventarios-api"
import { getColumns } from "./operadores-columns"
import { AddOperadorDialog } from "./AddOperadorDialog"

interface OperadoresTabProps {
  inventarioId: number
}

export function OperadoresTab({ inventarioId }: OperadoresTabProps) {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [removingOperador, setRemovingOperador] = useState<InventarioOperador | null>(null)
  const [removeLoading, setRemoveLoading] = useState(false)
  const [selectedRows, setSelectedRows] = useState<InventarioOperador[]>([])
  const [showBatchRemoveDialog, setShowBatchRemoveDialog] = useState(false)

  const {
    data,
    totalPages,
    isLoading,
    isError,
    error,
    mutate,
  } = useOperadores({
    idInventario: inventarioId,
    page: page + 1,
    limit: pageSize,
    search: debouncedSearch || undefined,
  })

  // rerender-functional-setstate: stable callback, no deps on state
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(0)
    }, 300)
  }, [])

  const handlePaginationChange = useCallback(
    (newPageIndex: number, newPageSize: number) => {
      if (newPageSize !== pageSize) {
        setPageSize(newPageSize)
        setPage(0)
      } else {
        setPage(newPageIndex)
      }
    },
    [pageSize]
  )

  const handleRemoveSingle = useCallback((op: InventarioOperador) => {
    setRemovingOperador(op)
  }, [])

  const columns = useMemo(() => getColumns({ onRemove: handleRemoveSingle }), [handleRemoveSingle])

  const handleAddSuccess = useCallback(() => {
    setShowAddDialog(false)
    mutate()
  }, [mutate])

  const confirmRemoveSingle = async () => {
    if (!removingOperador) return
    setRemoveLoading(true)
    try {
      await inventariosApi.removeOperador(inventarioId, removingOperador.userId)
      setRemovingOperador(null)
      mutate()
    } catch {
      // error will show on next render via SWR
    } finally {
      setRemoveLoading(false)
    }
  }

  const confirmBatchRemove = async () => {
    if (selectedRows.length === 0) return
    setRemoveLoading(true)
    try {
      await inventariosApi.removeOperadoresBatch(inventarioId, {
        userIds: selectedRows.map((op) => op.userId),
      })
      setSelectedRows([])
      setShowBatchRemoveDialog(false)
      mutate()
    } catch {
      // error will show on next render via SWR
    } finally {
      setRemoveLoading(false)
    }
  }

  // Collect existing operador IDs for the AddDialog filter
  const existingOperadorIds = useMemo(() => data.map((op) => op.userId), [data])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Operadores do Inventario
          </CardTitle>
          <CardDescription>
            Gerencie os operadores atribuidos a este inventario
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowBatchRemoveDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remover {selectedRows.length} selecionado{selectedRows.length !== 1 ? "s" : ""}
            </Button>
          )}
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Operador
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        {isError ? (
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
        ) : !isLoading && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg border border-dashed border-border bg-muted/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-medium text-foreground mb-1">
              {debouncedSearch ? "Nenhum resultado" : "Nenhum operador"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
              {debouncedSearch
                ? "Nenhum operador encontrado com a busca"
                : "Nenhum operador atribuido a este inventario"}
            </p>
            {!debouncedSearch && (
              <Button
                onClick={() => setShowAddDialog(true)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Adicionar primeiro operador
              </Button>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data}
            pageCount={totalPages}
            pageIndex={page}
            pageSize={pageSize}
            onPaginationChange={handlePaginationChange}
            onRowSelectionChange={setSelectedRows}
            loading={isLoading}
            showColumnVisibility={false}
            pageSizeOptions={[10, 20, 50, 100]}
            emptyMessage={
              debouncedSearch
                ? "Nenhum operador encontrado com a busca"
                : "Nenhum operador atribuido a este inventario"
            }
          />
        )}
      </CardContent>

      <AddOperadorDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        inventarioId={inventarioId}
        existingOperadorIds={existingOperadorIds}
        onSuccess={handleAddSuccess}
      />

      {/* Dialog remocao individual */}
      <AlertDialog
        open={!!removingOperador}
        onOpenChange={(open) => !open && setRemovingOperador(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover operador</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <span className="font-semibold">
                {removingOperador?.fullName || removingOperador?.email || removingOperador?.userId}
              </span>{" "}
              deste inventario?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveSingle}
              disabled={removeLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {removeLoading ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog remocao em lote */}
      <AlertDialog
        open={showBatchRemoveDialog}
        onOpenChange={(open) => !open && setShowBatchRemoveDialog(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover operadores</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <span className="font-semibold">
                {selectedRows.length} operador{selectedRows.length !== 1 ? "es" : ""}
              </span>{" "}
              deste inventario?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBatchRemove}
              disabled={removeLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {removeLoading ? "Removendo..." : `Remover ${selectedRows.length}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
