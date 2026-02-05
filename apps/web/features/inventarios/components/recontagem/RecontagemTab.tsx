"use client"

import { RefreshCcw } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

interface RecontagemTabProps {
  inventarioId: number
}

export function RecontagemTab({ inventarioId }: RecontagemTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCcw className="h-5 w-5" />
          Recontagem
        </CardTitle>
        <CardDescription>
          Gestao de recontagens do inventario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-gray-light mb-4">
            A gestao de recontagens sera implementada em breve.
          </p>
          <p className="text-sm text-gray-light">
            Inventario ID: {inventarioId}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
