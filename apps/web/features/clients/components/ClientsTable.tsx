"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import type { Client } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { DataTable } from "@/shared/components/ui/data-table"
import { usePermissions } from "@/features/usuarios/hooks/usePermissions"
import { clientsApi, type PaginatedResponse } from "../api/clients-api"
import { DeleteClientDialog } from "./DeleteClientDialog"
import { getColumns } from "./columns"

interface ClientsTableProps {
  page: number
  search?: string
  uf?: string
}

export function ClientsTable({ page, search, uf }: ClientsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { canUpdate, canDelete } = usePermissions()
  const canEditClient = canUpdate("clients")
  const canDeleteClient = canDelete("clients")

  const [data, setData] = useState<PaginatedResponse<Client> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const [pageSize, setPageSize] = useState(10)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await clientsApi.list({
        page,
        limit: pageSize,
        search: search || undefined,
        uf: uf || undefined,
      })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar clientes")
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, uf])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPageIndex + 1)) // API uses 1-based pagination
    router.push(`${pathname}?${params.toString()}`)

    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
    }
  }

  const handleDeleteClick = (client: Client) => {
    setClientToDelete(client)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false)
    setClientToDelete(null)
    fetchClients()
  }

  const columns = useMemo(
    () => getColumns({ onDelete: handleDeleteClick, canEdit: canEditClient, canDelete: canDeleteClient }),
    [canEditClient, canDeleteClient]
  )

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchClients} variant="outline">
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!loading && (!data || data.data.length === 0)) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-light mb-4">
          {search || uf
            ? "Nenhum cliente encontrado com os filtros aplicados"
            : "Nenhum cliente cadastrado"}
        </p>
        {!search && !uf && (
          <Button asChild>
            <Link href="/admin/clients/create">Cadastrar primeiro cliente</Link>
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
        pageIndex={page - 1} // Convert to 0-based for TanStack Table
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        loading={loading}
        showColumnVisibility={true}
        emptyMessage={
          search || uf
            ? "Nenhum cliente encontrado com os filtros aplicados"
            : "Nenhum cliente cadastrado"
        }
      />

      <DeleteClientDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        client={clientToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </>
  )
}
