"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import type { Loja, CreateLojaInput, UpdateLojaInput } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form"
import { lojasApi, type ApiError } from "../api/lojas-api"
import { lojaFormSchema, type LojaFormData } from "../types"

interface LojaFormProps {
  loja?: Loja
  clientId: string
  clientName: string
  mode: "create" | "edit"
}

export function LojaForm({ loja, clientId, clientName, mode }: LojaFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LojaFormData>({
    resolver: zodResolver(lojaFormSchema),
    defaultValues: {
      idCliente: loja?.idCliente || clientId,
      nome: loja?.nome || "",
      cnpj: loja?.cnpj || "",
    },
  })

  const onSubmit = async (data: LojaFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (mode === "create") {
        await lojasApi.create(data as CreateLojaInput)
      } else if (loja) {
        await lojasApi.update(loja.id, data as UpdateLojaInput)
      }
      router.push(`/admin/clients/${clientId}/lojas`)
      router.refresh()
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        apiError.errors.forEach((e) => {
          form.setError(e.field as keyof LojaFormData, {
            message: e.message,
          })
        })
      } else {
        setError(apiError.message || "Erro ao salvar loja")
      }
    } finally {
      setLoading(false)
    }
  }

  // CNPJ mask helper
  const formatCNPJ = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 14)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Informações da Loja */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Loja</CardTitle>
            <CardDescription>
              Loja do cliente: <span className="font-medium">{clientName}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nome da Loja *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome da loja"
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
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000000000000"
                      maxLength={14}
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Apenas números (14 dígitos)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hidden field for idCliente */}
            <input type="hidden" {...form.register("idCliente")} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Criar Loja" : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
