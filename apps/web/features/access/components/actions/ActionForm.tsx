"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
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
import { actionsApi, type ApiError } from "../../api/access-api"
import {
  createActionFormSchema,
  updateActionFormSchema,
  type CreateActionFormData,
  type UpdateActionFormData,
  type AccessAction,
} from "../../types"

interface ActionFormProps {
  action?: AccessAction
  mode: "create" | "edit"
}

function generateIdentifier(displayName: string): string {
  return displayName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
}

export function ActionForm({ action, mode }: ActionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCreate = mode === "create"
  const schema = isCreate ? createActionFormSchema : updateActionFormSchema

  const form = useForm<CreateActionFormData | UpdateActionFormData>({
    resolver: zodResolver(schema),
    defaultValues: isCreate
      ? { name: "", displayName: "", description: "", sortOrder: 0 }
      : {
          displayName: action?.displayName || "",
          description: action?.description || "",
          sortOrder: action?.sortOrder ?? 0,
        },
  })

  const displayName = form.watch("displayName")

  useEffect(() => {
    if (isCreate && displayName) {
      const identifier = generateIdentifier(displayName)
      form.setValue("name", identifier)
    }
  }, [displayName, isCreate, form])

  const onSubmit = async (data: CreateActionFormData | UpdateActionFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (isCreate) {
        await actionsApi.create(data as CreateActionFormData)
      } else if (action) {
        await actionsApi.update(action.id, data as UpdateActionFormData)
      }
      router.push("/admin/acesso/acoes")
      router.refresh()
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        apiError.errors.forEach((e) => {
          form.setError(e.field as keyof CreateActionFormData, {
            message: e.message,
          })
        })
      } else {
        setError(apiError.message || "Erro ao salvar ação")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isCreate ? "Nova Ação" : "Editar Ação"}</CardTitle>
        <CardDescription>
          {isCreate
            ? "Ao criar uma ação, permissões serão geradas automaticamente para todos os recursos existentes."
            : "Atualize os dados da ação."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Exportar, Aprovar, Importar"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Nome que será exibido na interface do sistema.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCreate && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Identificador</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="gerado automaticamente..."
                        {...field}
                        disabled={true}
                        className="bg-muted font-mono"
                      />
                    </FormControl>
                    <FormDescription>
                      Gerado automaticamente. Usado internamente pelo sistema.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva esta ação..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
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
                {isCreate ? "Criar Ação" : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
