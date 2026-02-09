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
import { policiesApi, type ApiError } from "../../api/access-api"
import {
  createPolicyFormSchema,
  updatePolicyFormSchema,
  type CreatePolicyFormData,
  type UpdatePolicyFormData,
  type AccessPolicy,
} from "../../types"

interface PolicyFormProps {
  policy?: AccessPolicy
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

export function PolicyForm({ policy, mode }: PolicyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCreate = mode === "create"
  const schema = isCreate ? createPolicyFormSchema : updatePolicyFormSchema

  const form = useForm<CreatePolicyFormData | UpdatePolicyFormData>({
    resolver: zodResolver(schema),
    defaultValues: isCreate
      ? { name: "", displayName: "", description: "", icon: "" }
      : {
          displayName: policy?.displayName || "",
          description: policy?.description || "",
          icon: policy?.icon || "",
        },
  })

  const displayName = form.watch("displayName")

  useEffect(() => {
    if (isCreate && displayName) {
      const identifier = generateIdentifier(displayName)
      form.setValue("name", identifier)
    }
  }, [displayName, isCreate, form])

  const onSubmit = async (data: CreatePolicyFormData | UpdatePolicyFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (isCreate) {
        const newPolicy = await policiesApi.create(data as CreatePolicyFormData)
        router.push(`/admin/acesso/politicas/${newPolicy.id}/edit`)
      } else if (policy) {
        await policiesApi.update(policy.id, data as UpdatePolicyFormData)
        router.push(`/admin/acesso/politicas/${policy.id}`)
      }
      router.refresh()
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        apiError.errors.forEach((e) => {
          form.setError(e.field as keyof CreatePolicyFormData, {
            message: e.message,
          })
        })
      } else {
        setError(apiError.message || "Erro ao salvar política")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isCreate ? "Nova Política" : "Editar Política"}</CardTitle>
        <CardDescription>
          {isCreate
            ? "Após criar a política, você poderá definir suas permissões na tela de edição."
            : "Atualize os dados da política."}
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
                      placeholder="ex: Acesso Completo Inventário"
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
                      placeholder="Descreva o objetivo desta política..."
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
                      placeholder="ex: shield, lock, key"
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
                {isCreate ? "Criar Política" : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
