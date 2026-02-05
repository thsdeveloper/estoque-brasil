"use client"

import { Users } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface OperadoresTabProps {
  inventarioId: number
}

export function OperadoresTab({ inventarioId }: OperadoresTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Operadores
        </CardTitle>
        <CardDescription>
          Atribuicao de operadores aos setores do inventario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-light mb-4">
            A atribuicao de operadores aos setores sera implementada em breve.
          </p>
          <p className="text-sm text-gray-light">
            Inventario ID: {inventarioId}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
