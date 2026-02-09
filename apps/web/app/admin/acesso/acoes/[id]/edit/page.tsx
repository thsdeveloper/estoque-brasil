"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ActionForm } from "@/features/access/components/actions/ActionForm"
import { actionsApi } from "@/features/access/api/access-api"
import type { AccessAction } from "@/features/access/types"

export default function EditAcaoPage() {
  const params = useParams()
  const id = params.id as string
  const [action, setAction] = useState<AccessAction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchAction() {
      try {
        const actions = await actionsApi.list()
        const found = actions.find((a) => a.id === id)
        if (found) {
          setAction(found)
        } else {
          setError("Ação não encontrada")
        }
      } catch (err) {
        setError("Erro ao carregar ação")
      } finally {
        setLoading(false)
      }
    }
    fetchAction()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !action) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error || "Ação não encontrada"}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <ActionForm action={action} mode="edit" />
    </div>
  )
}
