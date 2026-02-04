"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Search, ClipboardList } from "lucide-react"
import type { InventarioContagem } from "@estoque-brasil/types"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { inventariosApi, type PaginatedResponse } from "../../api/inventarios-api"

interface ContagemTabProps {
  inventarioId: number
}

export function ContagemTab({ inventarioId }: ContagemTabProps) {
  const [contagens, setContagens] = useState<PaginatedResponse<InventarioContagem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 20

  const fetchContagens = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await inventariosApi.listContagens({
        page,
        limit: pageSize,
      })
      setContagens(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar contagens")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchContagens()
  }, [fetchContagens])

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Registros de Contagem
        </CardTitle>
        <CardDescription>
          Detalhes de todas as contagens realizadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-light" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchContagens} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : !contagens || contagens.data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-light">
              Nenhuma contagem registrada neste inventario
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Setor</TableHead>
                    <TableHead>ID Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Validade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contagens.data.map((contagem) => (
                    <TableRow key={contagem.id}>
                      <TableCell>{contagem.idInventarioSetor}</TableCell>
                      <TableCell>{contagem.idProduto}</TableCell>
                      <TableCell className="font-medium">
                        {contagem.quantidade}
                      </TableCell>
                      <TableCell>{contagem.lote || "-"}</TableCell>
                      <TableCell>{contagem.validade || "-"}</TableCell>
                      <TableCell>{formatDate(contagem.data)}</TableCell>
                      <TableCell>
                        {contagem.divergente ? (
                          <Badge variant="destructive">Divergente</Badge>
                        ) : (
                          <Badge variant="success">OK</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-light">
                Mostrando {(page - 1) * pageSize + 1} a{" "}
                {Math.min(page * pageSize, contagens.total)} de {contagens.total}{" "}
                registros
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= contagens.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Proximo
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
