"use client"

import { UserCheck } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface ContagemOperadorTabProps {
  inventarioId: number
}

export function ContagemOperadorTab({ inventarioId }: ContagemOperadorTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Contagem por Operador
        </CardTitle>
        <CardDescription>
          Resumo das contagens realizadas por cada operador
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-light mb-4">
            O resumo de contagens por operador sera implementado em breve.
          </p>
          <p className="text-sm text-gray-light">
            Inventario ID: {inventarioId}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
