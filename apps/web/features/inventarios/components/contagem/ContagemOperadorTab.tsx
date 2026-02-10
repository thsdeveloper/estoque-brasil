"use client"

import { useMemo } from "react"
import { Loader2, UserCheck, Wifi, WifiOff } from "lucide-react"
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
import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import {
  useContagemRealtime,
  type OperatorStats,
  type SectorStats,
} from "../../hooks/useContagemRealtime"

interface ContagemOperadorTabProps {
  inventarioId: number
}

function isOperatorActive(op: OperatorStats) {
  if (!op.ultima_contagem) return false
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  return new Date(op.ultima_contagem) > fiveMinutesAgo
}

function getSectorProgress(
  op: OperatorStats,
  sectorsMap: Map<number, SectorStats>
) {
  if (!op.setor_atual_id) return null
  const sector = sectorsMap.get(op.setor_atual_id)
  if (!sector) return null
  const range = sector.termino - sector.inicio + 1
  if (range <= 0) return null
  return Math.min(
    Math.round((sector.total_contagens / range) * 100),
    100
  )
}

function formatAvgBip(seconds: number) {
  if (!seconds || seconds === 0) return "—"
  return `${seconds.toFixed(1)}s`
}

function getBipColor(seconds: number) {
  if (!seconds || seconds === 0) return "text-muted-foreground"
  if (seconds < 5) return "text-emerald-500"
  if (seconds <= 15) return "text-amber-500"
  return "text-red-500"
}

export function ContagemOperadorTab({
  inventarioId,
}: ContagemOperadorTabProps) {
  const { operators, sectors, isConnected, error } =
    useContagemRealtime(inventarioId)

  const sectorsMap = useMemo(
    () => new Map(sectors.map((s) => [s.id, s])),
    [sectors]
  )

  const hasSnapshot = sectors.length > 0 || operators.length > 0
  const isLoading = !hasSnapshot && isConnected

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Contagem por Operador
            </CardTitle>
            <CardDescription>
              Acompanhamento em tempo real dos operadores
            </CardDescription>
          </div>
          {isConnected ? (
            <Badge variant="success" className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3" />
              Conectado
            </Badge>
          ) : (
            <Badge
              variant="destructive"
              className="flex items-center gap-1.5"
            >
              <WifiOff className="h-3 w-3" />
              {error || "Desconectado"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              Carregando dados...
            </span>
          </div>
        ) : operators.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum operador registrou contagens neste inventario.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operador</TableHead>
                  <TableHead>Setor Atual</TableHead>
                  <TableHead className="w-[200px]">
                    Progresso do Setor
                  </TableHead>
                  <TableHead className="text-right">Registros</TableHead>
                  <TableHead className="text-right">
                    Tempo Medio Bip
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {operators.map((op) => {
                  const active = isOperatorActive(op)
                  const progress = getSectorProgress(op, sectorsMap)
                  const sectorName =
                    op.setor_atual_descricao ||
                    (op.setor_atual_id
                      ? sectorsMap.get(op.setor_atual_id)?.descricao || "—"
                      : "—")

                  return (
                    <TableRow key={op.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full flex-shrink-0 ${
                              active
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-muted-foreground/30"
                            }`}
                          />
                          <span className="font-medium">{op.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{sectorName}</TableCell>
                      <TableCell>
                        {progress !== null ? (
                          <div className="flex items-center gap-2">
                            <Progress value={progress} className="flex-1" />
                            <span className="text-sm text-muted-foreground w-12">
                              {progress}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {op.total_contagens}
                      </TableCell>
                      <TableCell
                        className={`text-right tabular-nums font-medium ${getBipColor(
                          op.avg_bip_seconds
                        )}`}
                      >
                        {formatAvgBip(op.avg_bip_seconds)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
