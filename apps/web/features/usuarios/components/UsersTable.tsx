"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { User, PaginatedUsers } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { DataTable } from "@/shared/components/ui/data-table"
import { usuariosApi } from "../api/usuarios-api"
import { DeleteUserDialog } from "./DeleteUserDialog"
import { getColumns } from "./columns"
import { usePermissions } from "../hooks/usePermissions"

interface UsersTableProps {
  page: number
  search?: string
  isActive?: boolean
  roleId?: string
}

export function UsersTable({ page, search, isActive, roleId }: UsersTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  const [data, setData] = useState<PaginatedUsers | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [pageSize, setPageSize] = useState(10)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await usuariosApi.list({
        page,
        limit: pageSize,
        search: search || undefined,
        isActive,
        roleId,
      })
      setData(result)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Erro ao carregar usuários"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, isActive, roleId])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false)
    setUserToDelete(null)
    fetchUsers()
  }

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: handleDeleteClick,
        canEdit: canUpdate("usuarios"),
        canDelete: canDelete("usuarios"),
      }),
    [canUpdate, canDelete]
  )

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchUsers} variant="outline">
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
            ? "Nenhum usuário encontrado com os filtros aplicados"
            : "Nenhum usuário cadastrado"}
        </p>
        {!search && canCreate("usuarios") && (
          <Button asChild>
            <Link href="/admin/cadastros/usuarios/create">
              Cadastrar primeiro usuário
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
            ? "Nenhum usuário encontrado com os filtros aplicados"
            : "Nenhum usuário cadastrado"
        }
      />

      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={userToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
