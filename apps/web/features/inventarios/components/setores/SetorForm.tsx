"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import type { Setor } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { inventariosApi, type ApiError } from "../../api/inventarios-api"
import { setorFormSchema, type SetorFormData } from "../../types"

interface SetorFormProps {
  inventarioId: number
  setor?: Setor
  onSuccess: () => void
  onCancel: () => void
}

export function SetorForm({
  inventarioId,
  setor,
  onSuccess,
  onCancel,
}: SetorFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SetorFormData>({
    resolver: zodResolver(setorFormSchema),
    defaultValues: {
      idInventario: inventarioId,
      prefixo: setor?.prefixo || "",
      inicio: setor?.inicio ?? 1,
      termino: setor?.termino ?? 100,
      descricao: setor?.descricao || "",
    },
  })

  const onSubmit = async (data: SetorFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (setor) {
        await inventariosApi.updateSetor(setor.id, data)
      } else {
        await inventariosApi.createSetor(data)
      }
      onSuccess()
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        apiError.errors.forEach((e) => {
          form.setError(e.field as keyof SetorFormData, {
            message: e.message,
          })
        })
      } else {
        setError(apiError.message || "Erro ao salvar setor")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="prefixo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prefixo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: A, B, C"
                    maxLength={10}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  Identificador do setor (maximo 10 caracteres)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descricao</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Setor de bebidas"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numeracao Inicio</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Numero inicial da numeracao</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termino"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numeracao Termino</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Numero final da numeracao</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {setor ? "Salvar" : "Criar Setor"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
