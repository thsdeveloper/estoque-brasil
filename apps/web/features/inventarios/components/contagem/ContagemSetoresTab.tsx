"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, LayoutGrid } from "lucide-react"
import type { Setor, SetorContagemStats } from "@estoque-brasil/types"
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
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { inventariosApi } from "../../api/inventarios-api"

interface ContagemSetoresTabProps {
  inventarioId: number
}

function formatDateTime(iso: string | null): string {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getStatusBadge(status: Setor["status"]) {
  switch (status) {
    case "finalizado":
      return <Badge variant="success">Finalizado</Badge>
    case "em_contagem":
      return <Badge variant="warning">Em contagem</Badge>
    case "pendente":
    default:
      return <Badge variant="secondary">Pendente</Badge>
  }
}

export function ContagemSetoresTab({ inventarioId }: ContagemSetoresTabProps) {
  const [setores, setSetores] = useState<Setor[]>([])
  const [statsMap, setStatsMap] = useState<Map<number, SetorContagemStats>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [setoresResult, statsResult] = await Promise.all([
        inventariosApi.listSetores(inventarioId),
        inventariosApi.getSetorStats(inventarioId),
      ])
      setSetores(setoresResult)
      const map = new Map<number, SetorContagemStats>()
      for (const stat of statsResult) {
        map.set(stat.id, stat)
      }
      setStatsMap(map)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar setores")
    } finally {
      setLoading(false)
    }
  }, [inventarioId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5" />
          Status das Contagens por Setor
        </CardTitle>
        <CardDescription>
          Acompanhamento do progresso de contagem em cada setor
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-light" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : setores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-light">
              Nenhum setor cadastrado neste inventario
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setor</TableHead>
                <TableHead>Prefixo</TableHead>
                <TableHead>Numeracao</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Qtd. Contada</TableHead>
                <TableHead>Ultima Contagem</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {setores.map((setor) => {
                const stats = statsMap.get(setor.id)
                const total = setor.termino - setor.inicio + 1
                const contados = stats?.total_contagens ?? 0
                const progress = total > 0 ? Math.min(Math.round((contados / total) * 100), 100) : 0

                return (
                  <TableRow key={setor.id}>
                    <TableCell className="font-medium">
                      {setor.descricao || `Setor ${setor.id}`}
                    </TableCell>
                    <TableCell>{setor.prefixo || "-"}</TableCell>
                    <TableCell>
                      {setor.inicio} - {setor.termino}
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="flex-1" />
                        <span className="text-sm text-gray-light w-12">
                          {progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{contados}</TableCell>
                    <TableCell>{stats?.total_quantidade ?? 0}</TableCell>
                    <TableCell>
                      {formatDateTime(stats?.ultima_contagem ?? null)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(setor.status)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
