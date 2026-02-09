"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
} from "lucide-react"
import type { Setor } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Badge } from "@/shared/components/ui/badge"
import { inventariosApi } from "../../api/inventarios-api"

interface DivergenciasTabProps {
  inventarioId: number
}

interface Divergencia {
  id: number
  codigoBarras?: string
  codigoInterno?: string
  descricao?: string
  setor?: string
  idSetor?: number
  nomeSetor?: string
  qtdEsperada: number
  qtdContada: number
  diferenca: number
  reconferido: boolean
  status?: string
}

interface DivergenciasResponse {
  data: Divergencia[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export function DivergenciasTab({ inventarioId }: DivergenciasTabProps) {
  const [divergencias, setDivergencias] = useState<Divergencia[]>([])
  const [setores, setSetores] = useState<Setor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(50)
  const [filterSetor, setFilterSetor] = useState<string>("todos")
  const [filterStatus, setFilterStatus] = useState<string>("todos")

  const fetchSetores = useCallback(async () => {
    try {
      const result = await inventariosApi.listSetores(inventarioId)
      setSetores(result)
    } catch {
      // Silently fail - setores filter will just be empty
    }
  }, [inventarioId])

  const fetchDivergencias = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: { idSetor?: number; status?: string; page: number; limit: number } = {
        page,
        limit,
      }
      if (filterSetor !== "todos") {
        params.idSetor = Number(filterSetor)
      }
      if (filterStatus !== "todos") {
        params.status = filterStatus
      }
      const result = await inventariosApi.listDivergencias(inventarioId, params) as DivergenciasResponse
      setDivergencias(result.data)
      setTotalPages(result.totalPages)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar divergencias")
    } finally {
      setLoading(false)
    }
  }, [inventarioId, page, limit, filterSetor, filterStatus])

  useEffect(() => {
    fetchSetores()
  }, [fetchSetores])

  useEffect(() => {
    fetchDivergencias()
  }, [fetchDivergencias])

  const handleFilterSetorChange = (value: string) => {
    setFilterSetor(value)
    setPage(1)
  }

  const handleFilterStatusChange = (value: string) => {
    setFilterStatus(value)
    setPage(1)
  }

  const getDiferencaBadge = (diferenca: number) => {
    if (diferenca < 0) {
      return (
        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
          {diferenca}
        </span>
      )
    }
    if (diferenca > 0) {
      return (
        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
          +{diferenca}
        </span>
      )
    }
    return <span className="text-muted-foreground">0</span>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Divergencias
        </CardTitle>
        <CardDescription>
          Produtos com diferenca entre quantidade esperada e contada
          {total > 0 && (
            <span className="ml-2 text-foreground font-medium">
              ({total} {total === 1 ? "divergencia" : "divergencias"})
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Setor:</span>
            <Select value={filterSetor} onValueChange={handleFilterSetorChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os setores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                {setores.map((setor) => (
                  <SelectItem key={setor.id} value={String(setor.id)}>
                    {setor.prefixo || setor.descricao || `Setor ${setor.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Select value={filterStatus} onValueChange={handleFilterStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="reconferido">Reconferidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDivergencias}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-light" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchDivergencias} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : divergencias.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-light">
              Nenhuma divergencia encontrada
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead className="text-right">Qtd Esperada</TableHead>
                  <TableHead className="text-right">Qtd Contada</TableHead>
                  <TableHead className="text-right">Diferenca</TableHead>
                  <TableHead>Reconferido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {divergencias.map((div) => (
                  <TableRow key={div.id}>
                    <TableCell className="font-mono text-sm">
                      {div.codigoBarras || div.codigoInterno || "-"}
                    </TableCell>
                    <TableCell>{div.descricao || "-"}</TableCell>
                    <TableCell>{div.nomeSetor || div.setor || "-"}</TableCell>
                    <TableCell className="text-right font-mono">
                      {div.qtdEsperada}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {div.qtdContada}
                    </TableCell>
                    <TableCell className="text-right">
                      {getDiferencaBadge(div.diferenca)}
                    </TableCell>
                    <TableCell>
                      {div.reconferido ? (
                        <Badge variant="success">Reconferido</Badge>
                      ) : (
                        <Badge variant="secondary">Pendente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {total} {total === 1 ? "registro" : "registros"}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {page} de {totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <span className="sr-only">Primeira pagina</span>
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <span className="sr-only">Pagina anterior</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <span className="sr-only">Proxima pagina</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(totalPages)}
                      disabled={page >= totalPages}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <span className="sr-only">Ultima pagina</span>
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
