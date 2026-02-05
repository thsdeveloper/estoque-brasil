"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { DataTable } from "@/shared/components/ui/data-table"
import { usePermissions } from "@/features/usuarios/hooks/usePermissions"
import { rolesApi } from "../api/roles-api"
import { DeleteRoleDialog } from "./DeleteRoleDialog"
import { getColumns } from "./columns"
import type { Role } from "../types"

export function RolesTable() {
  const [data, setData] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const { canUpdate, canDelete } = usePermissions()

  const fetchRoles = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await rolesApi.list(true)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar perfis")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  const handleDeleteClick = useCallback((role: Role) => {
    setRoleToDelete(role)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteSuccess = useCallback(() => {
    setDeleteDialogOpen(false)
    setRoleToDelete(null)
    fetchRoles()
  }, [fetchRoles])

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: handleDeleteClick,
        canUpdate: canUpdate("usuarios"),
        canDelete: canDelete("usuarios"),
      }),
    [handleDeleteClick, canUpdate, canDelete]
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        {error}
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        showColumnVisibility={false}
      />

      <DeleteRoleDialog
        role={roleToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
