"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Upload, Download, Search } from "lucide-react"
import type { InventarioProduto } from "@estoque-brasil/types"
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

interface ProdutosTabProps {
  inventarioId: number
}

export function ProdutosTab({ inventarioId }: ProdutosTabProps) {
  const [produtos, setProdutos] = useState<PaginatedResponse<InventarioProduto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 20

  const fetchProdutos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await inventariosApi.listProdutos({
        idInventario: inventarioId,
        page,
        limit: pageSize,
        search: search || undefined,
      })
      setProdutos(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }, [inventarioId, page, search])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProdutos()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchProdutos])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Produtos do Inventario</CardTitle>
          <CardDescription>
            Produtos importados para contagem
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-light" />
          <Input
            type="text"
            placeholder="Buscar por codigo ou descricao..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-light" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchProdutos} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : !produtos || produtos.data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-light mb-4">
              {search
                ? "Nenhum produto encontrado com a busca"
                : "Nenhum produto importado neste inventario"}
            </p>
            {!search && (
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Importar produtos
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cod. Barras</TableHead>
                    <TableHead>Cod. Interno</TableHead>
                    <TableHead>Descricao</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.data.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-mono text-sm">
                        {produto.codigoBarras || "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {produto.codigoInterno || "-"}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {produto.descricao}
                      </TableCell>
                      <TableCell className="text-right">
                        {produto.saldo}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(produto.custo)}
                      </TableCell>
                      <TableCell>{produto.lote || "-"}</TableCell>
                      <TableCell>
                        {produto.divergente ? (
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
                {Math.min(page * pageSize, produtos.total)} de {produtos.total}{" "}
                produtos
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
                  disabled={page >= produtos.totalPages}
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
