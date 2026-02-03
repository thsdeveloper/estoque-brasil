"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import type { Client } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { clientsApi, type PaginatedResponse } from "../api/clients-api"
import { DeleteClientDialog } from "./DeleteClientDialog"
import { ClientsTableSkeleton } from "./ClientsTableSkeleton"

interface ClientsTableProps {
  page: number
  search?: string
  uf?: string
}

export function ClientsTable({ page, search, uf }: ClientsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [data, setData] = useState<PaginatedResponse<Client> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await clientsApi.list({
        page,
        limit: 10,
        search: search || undefined,
        uf: uf || undefined,
      })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar clientes")
    } finally {
      setLoading(false)
    }
  }, [page, search, uf])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", String(newPage))
    router.push(`${pathname}?${params.toString()}`)
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

  const formatPercentage = (value: number | null) => {
    if (value === null || value === undefined) return "-"
    return `${value.toFixed(2)}%`
  }

  if (loading) {
    return <ClientsTableSkeleton />
  }

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

  if (!data || data.data.length === 0) {
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
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Nome</TableHead>
              <TableHead>UF</TableHead>
              <TableHead>Município</TableHead>
              <TableHead className="text-right">% Divergência</TableHead>
              <TableHead className="text-right">Link BI</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.nome}</TableCell>
                <TableCell>
                  {client.uf ? (
                    <Badge variant="secondary">{client.uf}</Badge>
                  ) : (
                    <span className="text-gray-light">-</span>
                  )}
                </TableCell>
                <TableCell>{client.municipio || "-"}</TableCell>
                <TableCell className="text-right">
                  {client.percentualDivergencia !== null ? (
                    <Badge
                      variant={
                        client.percentualDivergencia > 5
                          ? "destructive"
                          : client.percentualDivergencia > 2
                          ? "warning"
                          : "success"
                      }
                    >
                      {formatPercentage(client.percentualDivergencia)}
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {client.linkBi ? (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={client.linkBi} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <span className="sr-only">Abrir menu</span>
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/clients/${client.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/clients/${client.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={() => handleDeleteClick(client)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <p className="text-sm text-gray-light">
            Mostrando {(data.page - 1) * data.limit + 1} a{" "}
            {Math.min(data.page * data.limit, data.total)} de {data.total} resultados
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-gray-light">
              Página {data.page} de {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page >= data.totalPages}
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <DeleteClientDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        client={clientToDelete}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}
