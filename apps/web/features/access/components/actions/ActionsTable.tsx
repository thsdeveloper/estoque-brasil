"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { DataTable } from "@/shared/components/ui/data-table"
import { DataTableToolbar } from "@/shared/components/ui/data-table-toolbar"
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
import { actionsApi, type ApiError } from "../../api/access-api"
import type { AccessAction } from "../../types"
import { getColumns } from "./columns"

export function ActionsTable() {
  const [actions, setActions] = useState<AccessAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<AccessAction | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchActions()
  }, [])

  async function fetchActions() {
    try {
      setLoading(true)
      const data = await actionsApi.list()
      setActions(data)
    } catch (err) {
      setError("Erro ao carregar ações")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await actionsApi.delete(deleteTarget.id)
      setActions((prev) => prev.filter((a) => a.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao excluir ação")
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteClick = useCallback((action: AccessAction) => {
    setDeleteTarget(action)
  }, [])

  const columns = useMemo(() => getColumns({ onDelete: handleDeleteClick }), [handleDeleteClick])

  const filteredData = useMemo(() => {
    if (!search) return actions
    const term = search.toLowerCase()
    return actions.filter(
      (a) =>
        a.name.toLowerCase().includes(term) ||
        a.displayName.toLowerCase().includes(term)
    )
  }, [actions, search])

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {error}
        <div className="mt-4">
          <Button variant="outline" onClick={fetchActions}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        loading={loading}
        showColumnVisibility={false}
        emptyMessage="Nenhuma ação cadastrada"
        toolbar={
          <DataTableToolbar
            searchPlaceholder="Buscar por nome da ação..."
            onSearchChange={setSearch}
          />
        }
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Ação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta ação? Esta ação não pode ser desfeita.
              Todas as permissões associadas também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
