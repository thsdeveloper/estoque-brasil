"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
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
import { resourcesApi, type ApiError } from "../../api/access-api"
import type { AccessResource } from "../../types"
import { getColumns } from "./columns"

export function ResourcesTable() {
  const router = useRouter()
  const [resources, setResources] = useState<AccessResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<AccessResource | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchResources()
  }, [])

  async function fetchResources() {
    try {
      setLoading(true)
      const data = await resourcesApi.list()
      setResources(data)
    } catch (err) {
      setError("Erro ao carregar recursos")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await resourcesApi.delete(deleteTarget.id)
      setResources((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao excluir recurso")
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteClick = useCallback((resource: AccessResource) => {
    setDeleteTarget(resource)
  }, [])

  const columns = useMemo(() => getColumns({ onDelete: handleDeleteClick }), [handleDeleteClick])

  const filteredData = useMemo(() => {
    if (!search) return resources
    const term = search.toLowerCase()
    return resources.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.displayName.toLowerCase().includes(term)
    )
  }, [resources, search])

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {error}
        <div className="mt-4">
          <Button variant="outline" onClick={fetchResources}>Tentar novamente</Button>
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
        emptyMessage="Nenhum recurso cadastrado"
        toolbar={
          <DataTableToolbar
            searchPlaceholder="Buscar por nome do recurso..."
            onSearchChange={setSearch}
          />
        }
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Recurso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este recurso? Esta ação não pode ser desfeita.
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
