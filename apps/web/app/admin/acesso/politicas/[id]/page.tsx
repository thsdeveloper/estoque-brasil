"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2, Pencil, ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { PolicyPermissionsMatrix } from "@/features/access/components/policies/PolicyPermissionsMatrix"
import { policiesApi } from "@/features/access/api/access-api"
import type { AccessPolicy } from "@/features/access/types"

export default function PolicyDetailPage() {
  const params = useParams()
  const router = useRouter()
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
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error || "Política não encontrada"}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{policy.displayName}</h2>
              {policy.isSystemPolicy && <Badge variant="secondary">Sistema</Badge>}
            </div>
            <p className="text-muted-foreground font-mono text-sm">{policy.name}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/acesso/politicas/${policy.id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </Button>
      </div>

      {policy.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{policy.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Permissões</CardTitle>
          <CardDescription>
            Permissões atribuídas a esta política ({policy.permissions?.length ?? 0} permissões)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PolicyPermissionsMatrix policy={policy} readonly />
        </CardContent>
      </Card>
    </div>
  )
}
