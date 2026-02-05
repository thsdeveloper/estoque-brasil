"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Loader2, Trash2, Pencil } from "lucide-react"
import type { Setor } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
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
import { inventariosApi } from "../../api/inventarios-api"
import { SetorForm } from "./SetorForm"

interface SetoresTabProps {
  inventarioId: number
}

export function SetoresTab({ inventarioId }: SetoresTabProps) {
  const [setores, setSetores] = useState<Setor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null)
  const [deletingSetor, setDeletingSetor] = useState<Setor | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchSetores = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await inventariosApi.listSetores(inventarioId)
      setSetores(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar setores")
    } finally {
      setLoading(false)
    }
  }, [inventarioId])

  useEffect(() => {
    fetchSetores()
  }, [fetchSetores])

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingSetor(null)
    fetchSetores()
  }

  const handleEdit = (setor: Setor) => {
    setEditingSetor(setor)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deletingSetor) return

    setDeleteLoading(true)
    try {
      await inventariosApi.deleteSetor(deletingSetor.id)
      setDeletingSetor(null)
      fetchSetores()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir setor")
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSetor(null)
  }

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{editingSetor ? "Editar Setor" : "Novo Setor"}</CardTitle>
          <CardDescription>
            {editingSetor
              ? "Altere os dados do setor"
              : "Preencha os dados para criar um novo setor"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetorForm
            inventarioId={inventarioId}
            setor={editingSetor || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Setores do Inventario</CardTitle>
          <CardDescription>
            Gerencie os setores para organizacao da contagem
          </CardDescription>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Setor
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-light" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchSetores} variant="outline">
              Tentar novamente
            </Button>
          </div>
        ) : setores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-light mb-4">
              Nenhum setor cadastrado neste inventario
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar primeiro setor
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prefixo</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Termino</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {setores.map((setor) => (
                <TableRow key={setor.id}>
                  <TableCell className="font-medium">
                    {setor.prefixo || "-"}
                  </TableCell>
                  <TableCell>{setor.inicio}</TableCell>
                  <TableCell>{setor.termino}</TableCell>
                  <TableCell>{setor.descricao || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(setor)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => setDeletingSetor(setor)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog
        open={!!deletingSetor}
        onOpenChange={(open) => !open && setDeletingSetor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir setor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o setor{" "}
              <span className="font-semibold">
                {deletingSetor?.prefixo || deletingSetor?.descricao || `#${deletingSetor?.id}`}
              </span>
              ? Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
