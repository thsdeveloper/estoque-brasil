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
import { resourcesApi, type ApiError } from "../../api/access-api"
import {
  createResourceFormSchema,
  updateResourceFormSchema,
  type CreateResourceFormData,
  type UpdateResourceFormData,
  type AccessResource,
} from "../../types"

interface ResourceFormProps {
  resource?: AccessResource
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

export function ResourceForm({ resource, mode }: ResourceFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCreate = mode === "create"
  const schema = isCreate ? createResourceFormSchema : updateResourceFormSchema

  const form = useForm<CreateResourceFormData | UpdateResourceFormData>({
    resolver: zodResolver(schema),
    defaultValues: isCreate
      ? { name: "", displayName: "", description: "", icon: "", sortOrder: 0 }
      : {
          displayName: resource?.displayName || "",
          description: resource?.description || "",
          icon: resource?.icon || "",
          sortOrder: resource?.sortOrder ?? 0,
        },
  })

  const displayName = form.watch("displayName")

  useEffect(() => {
    if (isCreate && displayName) {
      const identifier = generateIdentifier(displayName)
      form.setValue("name", identifier)
    }
  }, [displayName, isCreate, form])

  const onSubmit = async (data: CreateResourceFormData | UpdateResourceFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (isCreate) {
        await resourcesApi.create(data as CreateResourceFormData)
      } else if (resource) {
        await resourcesApi.update(resource.id, data as UpdateResourceFormData)
      }
      router.push("/admin/acesso/recursos")
      router.refresh()
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        apiError.errors.forEach((e) => {
          form.setError(e.field as keyof CreateResourceFormData, {
            message: e.message,
          })
        })
      } else {
        setError(apiError.message || "Erro ao salvar recurso")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isCreate ? "Novo Recurso" : "Editar Recurso"}</CardTitle>
        <CardDescription>
          {isCreate
            ? "Ao criar um recurso, permissões serão geradas automaticamente para todas as ações existentes."
            : "Atualize os dados do recurso."}
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
                      placeholder="ex: Relatórios Financeiros"
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
                      placeholder="Descreva este recurso..."
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

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: users, file-text, settings"
                      {...field}
                      value={field.value ?? ""}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription>
                    Nome do ícone Lucide (opcional).
                  </FormDescription>
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
                {isCreate ? "Criar Recurso" : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
