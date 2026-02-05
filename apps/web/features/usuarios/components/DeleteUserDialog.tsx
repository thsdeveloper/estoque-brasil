"use client"

import { useState } from "react"
import type { User } from "@estoque-brasil/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { usuariosApi } from "../api/usuarios-api"

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSuccess: () => void
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await usuariosApi.delete(user.id)
      onSuccess()
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || "Erro ao excluir usuário"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir o usuário{" "}
            <span className="font-semibold">{user?.fullName}</span> (
            {user?.email})? Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-500 hover:bg-red-600"
          >
            {loading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
