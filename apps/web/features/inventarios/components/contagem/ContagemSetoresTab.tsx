"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, LayoutGrid } from "lucide-react"
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
import { Badge } from "@/shared/components/ui/badge"
import { Progress } from "@/shared/components/ui/progress"
import { inventariosApi } from "../../api/inventarios-api"

interface ContagemSetoresTabProps {
  inventarioId: number
}

export function ContagemSetoresTab({ inventarioId }: ContagemSetoresTabProps) {
  const [setores, setSetores] = useState<Setor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSetores = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await inventariosApi.listSetores(inventarioId)
      setSetores(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar setores")
    } finally {
      setLoading(false)
    }
  }, [inventarioId])

  useEffect(() => {
    fetchSetores()
  }, [fetchSetores])

  // Calculate range for each setor
  const getSetorRange = (setor: Setor) => {
    return setor.termino - setor.inicio + 1
  }

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
            <Button onClick={fetchSetores} variant="outline">
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
                <TableHead>Total</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {setores.map((setor) => {
                const total = getSetorRange(setor)
                // Mock progress - in real implementation, this would come from API
                const progress = Math.floor(Math.random() * 100)
                const status =
                  progress === 100
                    ? "Finalizado"
                    : progress > 0
                    ? "Em andamento"
                    : "Pendente"

                return (
                  <TableRow key={setor.id}>
                    <TableCell className="font-medium">
                      {setor.descricao || `Setor ${setor.id}`}
                    </TableCell>
                    <TableCell>{setor.prefixo || "-"}</TableCell>
                    <TableCell>
                      {setor.inicio} - {setor.termino}
                    </TableCell>
                    <TableCell>{total}</TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="flex-1" />
                        <span className="text-sm text-gray-light w-12">
                          {progress}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === "Finalizado"
                            ? "success"
                            : status === "Em andamento"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {status}
                      </Badge>
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
