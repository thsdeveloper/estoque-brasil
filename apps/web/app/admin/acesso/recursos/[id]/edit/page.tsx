"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ResourceForm } from "@/features/access/components/resources/ResourceForm"
import { resourcesApi } from "@/features/access/api/access-api"
import type { AccessResource } from "@/features/access/types"

export default function EditRecursoPage() {
  const params = useParams()
  const id = params.id as string
  const [resource, setResource] = useState<AccessResource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResource() {
      try {
        // Use list and find since we don't have a get by ID endpoint
        const resources = await resourcesApi.list()
        const found = resources.find((r) => r.id === id)
        if (found) {
          setResource(found)
        } else {
          setError("Recurso não encontrado")
        }
      } catch (err) {
        setError("Erro ao carregar recurso")
      } finally {
        setLoading(false)
      }
    }
    fetchResource()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !resource) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error || "Recurso não encontrado"}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ResourceForm resource={resource} mode="edit" />
    </div>
  )
}
