"use client"

import { useState, useEffect, useCallback } from "react"
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
import { rolesApi, type ApiError } from "../api/roles-api"
import { RolePoliciesSelector } from "./RolePoliciesSelector"
import {
  createRoleFormSchema,
  updateRoleFormSchema,
  type CreateRoleFormData,
  type UpdateRoleFormData,
  type Role,
} from "../types"

interface RoleFormProps {
  role?: Role
  mode: "create" | "edit"
}

// Function to convert display name to identifier
function generateIdentifier(displayName: string): string {
  return displayName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .replace(/\s+/g, "_") // Replace spaces with underscore
    .replace(/_+/g, "_") // Remove duplicate underscores
    .replace(/^_|_$/g, "") // Remove leading/trailing underscores
}

export function RoleForm({ role, mode }: RoleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>([])

  const isCreate = mode === "create"
  const schema = isCreate ? createRoleFormSchema : updateRoleFormSchema

  const form = useForm<CreateRoleFormData | UpdateRoleFormData>({
    resolver: zodResolver(schema),
    defaultValues: isCreate
      ? {
          name: "",
          displayName: "",
          description: "",
        }
      : {
          displayName: role?.displayName || "",
          description: role?.description || "",
        },
  })

  // Watch displayName to auto-generate identifier
  const displayName = form.watch("displayName")

  useEffect(() => {
    if (isCreate && displayName) {
      const identifier = generateIdentifier(displayName)
      form.setValue("name", identifier)
    }
  }, [displayName, isCreate, form])

  const handlePolicySelectionChange = useCallback((policyIds: string[]) => {
    setSelectedPolicyIds(policyIds)
  }, [])

  const onSubmit = async (data: CreateRoleFormData | UpdateRoleFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (isCreate) {
        const newRole = await rolesApi.create(data as CreateRoleFormData)

        // Set policies if any selected
        if (selectedPolicyIds.length > 0) {
          await rolesApi.setPolicies(newRole.id, {
            policyIds: selectedPolicyIds,
          })
        }

        router.push("/admin/cadastros/roles")
      } else if (role) {
        await rolesApi.update(role.id, data as UpdateRoleFormData)
        router.push(`/admin/cadastros/roles/${role.id}`)
      }
      router.refresh()
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        apiError.errors.forEach((e) => {
          form.setError(e.field as keyof (CreateRoleFormData | UpdateRoleFormData), {
            message: e.message,
          })
        })
      } else {
        setError(apiError.message || "Erro ao salvar perfil")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isCreate ? "Novo Perfil" : "Editar Perfil"}
          </CardTitle>
          <CardDescription>
            {isCreate
              ? "Preencha os dados para criar um novo perfil de acesso"
              : "Atualize os dados do perfil"}
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
                        placeholder="ex: Supervisor de Vendas"
                        {...field}
                        disabled={loading || role?.isSystemRole}
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
                        Gerado automaticamente a partir do nome de exibição. Usado internamente pelo sistema.
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
                        placeholder="Descreva as responsabilidades e acessos deste perfil..."
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

              {!isCreate && (
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
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Policies Selector - Only for Create mode */}
      {isCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Políticas de Acesso</CardTitle>
            <CardDescription>
              Selecione as políticas que este perfil terá. Cada política agrupa um conjunto de permissões.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RolePoliciesSelector
              onSelectionChange={handlePolicySelectionChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Submit buttons for Create mode - at the bottom after policies */}
      {isCreate && (
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={loading || !form.watch("displayName")}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Perfil
          </Button>
        </div>
      )}
    </div>
  )
}
