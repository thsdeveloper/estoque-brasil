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
import { policiesApi, type ApiError } from "../../api/access-api"
import type { AccessPolicy } from "../../types"
import { getColumns } from "./columns"

export function PoliciesTable() {
  const [policies, setPolicies] = useState<AccessPolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<AccessPolicy | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchPolicies()
  }, [])

  async function fetchPolicies() {
    try {
      setLoading(true)
      const data = await policiesApi.list()
      setPolicies(data)
    } catch (err) {
      setError("Erro ao carregar políticas")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await policiesApi.delete(deleteTarget.id)
      setPolicies((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao excluir política")
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteClick = useCallback((policy: AccessPolicy) => {
    setDeleteTarget(policy)
  }, [])

  const columns = useMemo(() => getColumns({ onDelete: handleDeleteClick }), [handleDeleteClick])

  const filteredData = useMemo(() => {
    if (!search) return policies
    const term = search.toLowerCase()
    return policies.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.displayName.toLowerCase().includes(term)
    )
  }, [policies, search])

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {error}
        <div className="mt-4">
          <Button variant="outline" onClick={fetchPolicies}>Tentar novamente</Button>
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
        emptyMessage="Nenhuma política cadastrada"
        toolbar={
          <DataTableToolbar
            searchPlaceholder="Buscar por nome da política..."
            onSearchChange={setSearch}
          />
        }
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Política</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta política? Esta ação não pode ser desfeita.
              As roles que utilizam esta política perderão as permissões associadas.
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
