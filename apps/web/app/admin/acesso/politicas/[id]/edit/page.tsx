"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { PolicyForm } from "@/features/access/components/policies/PolicyForm"
import { PolicyPermissionsMatrix } from "@/features/access/components/policies/PolicyPermissionsMatrix"
import { policiesApi } from "@/features/access/api/access-api"
import type { AccessPolicy } from "@/features/access/types"

export default function EditPoliticaPage() {
  const params = useParams()
  const id = params.id as string
  const [policy, setPolicy] = useState<AccessPolicy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPolicy() {
      try {
        const data = await policiesApi.get(id)
        setPolicy(data)
      } catch (err) {
        setError("Erro ao carregar política")
      } finally {
        setLoading(false)
      }
    }
    fetchPolicy()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !policy) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error || "Política não encontrada"}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <PolicyForm policy={policy} mode="edit" />

      <Card>
        <CardHeader>
          <CardTitle>Permissões da Política</CardTitle>
          <CardDescription>
            Selecione as permissões que esta política deve conceder.
            As alterações são salvas individualmente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PolicyPermissionsMatrix
            policy={policy}
            onUpdate={(updatedPolicy) => setPolicy(updatedPolicy)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
