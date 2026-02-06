"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Loader2, Search } from "lucide-react"
import type { User } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Label } from "@/shared/components/ui/label"
import { usuariosApi } from "@/features/usuarios/api/usuarios-api"
import { inventariosApi } from "../../api/inventarios-api"

const OPERADOR_ROLE_ID = "395d4e09-48cd-42a3-a8c8-b919f2028bed"

interface AddOperadorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventarioId: number
  existingOperadorIds: string[]
  onSuccess: () => void
}

export function AddOperadorDialog({
  open,
  onOpenChange,
  inventarioId,
  existingOperadorIds,
  onSuccess,
}: AddOperadorDialogProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [multiplo, setMultiplo] = useState(false)
  const [auditoria, setAuditoria] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await usuariosApi.list({
          roleId: OPERADOR_ROLE_ID,
          isActive: true,
          limit: 100,
        })
        setUsers(result.data)
      } catch {
        setError("Erro ao carregar usuarios")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
    setSelectedIds(new Set())
    setMultiplo(false)
    setAuditoria(false)
    setSearch("")
  }, [open])

  const availableUsers = useMemo(() => {
    return users.filter((u) => !existingOperadorIds.includes(u.id))
  }, [users, existingOperadorIds])

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return availableUsers
    const term = search.toLowerCase()
    return availableUsers.filter(
      (u) =>
        u.fullName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    )
  }, [availableUsers, search])

  const toggleUser = useCallback((userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }, [])

  const selectAllVisible = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const u of filteredUsers) {
        next.add(u.id)
      }
      return next
    })
  }, [filteredUsers])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const allVisibleSelected = filteredUsers.length > 0 && filteredUsers.every((u) => selectedIds.has(u.id))

  const handleSubmit = async () => {
    if (selectedIds.size === 0) return

    setSubmitting(true)
    setError(null)
    try {
      await inventariosApi.addOperadoresBatch(inventarioId, {
        operadores: Array.from(selectedIds).map((userId) => ({
          userId,
          multiplo,
          auditoria,
        })),
      })
      onSuccess()
    } catch (err: any) {
      setError(err?.message || "Erro ao adicionar operadores")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar Operadores</DialogTitle>
          <DialogDescription>
            Selecione os operadores para vincular ao inventario
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-light" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {!loading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={allVisibleSelected ? clearSelection : selectAllVisible}
              className="text-xs h-7 px-2"
            >
              {allVisibleSelected ? "Limpar selecao" : "Selecionar todos"}
            </Button>
            {selectedIds.size > 0 && (
              <span className="text-xs text-muted-foreground">
                {selectedIds.size} selecionado{selectedIds.size !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        <div className="max-h-60 overflow-y-auto border rounded-md">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-gray-light" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-sm text-gray-light text-center py-6">
              {availableUsers.length === 0
                ? users.length === 0
                  ? "Nenhum operador encontrado"
                  : "Todos os operadores ja estao vinculados"
                : "Nenhum resultado para a busca"}
            </p>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => {
                const checked = selectedIds.has(user.id)
                return (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 w-full px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      checked ? "bg-muted" : ""
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{user.fullName}</p>
                      <p className="text-xs text-gray-light truncate">{user.email}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="multiplo"
                checked={multiplo}
                onCheckedChange={(checked) => setMultiplo(checked === true)}
              />
              <Label htmlFor="multiplo" className="text-sm">
                Multiplo
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="auditoria"
                checked={auditoria}
                onCheckedChange={(checked) => setAuditoria(checked === true)}
              />
              <Label htmlFor="auditoria" className="text-sm">
                Auditoria
              </Label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={selectedIds.size === 0 || submitting}
          >
            {submitting
              ? "Adicionando..."
              : selectedIds.size === 0
                ? "Adicionar"
                : `Adicionar ${selectedIds.size} operador${selectedIds.size !== 1 ? "es" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
