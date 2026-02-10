"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import type { User, Role, CreateUserInput, UpdateUserInput } from "@estoque-brasil/types"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Switch } from "@/shared/components/ui/switch"
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
import { usuariosApi, type ApiError } from "../api/usuarios-api"
import {
  createUserFormSchema,
  updateUserFormSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from "../types"

interface UserFormProps {
  user?: User
  mode: "create" | "edit"
}

export function UserForm({ user, mode }: UserFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)

  // Fetch available roles
  useEffect(() => {
    async function fetchRoles() {
      try {
        const rolesData = await usuariosApi.listRoles()
        setRoles(rolesData)
      } catch (err) {
        console.error("Error fetching roles:", err)
      } finally {
        setLoadingRoles(false)
      }
    }
    fetchRoles()
  }, [])

  const schema = mode === "create" ? createUserFormSchema : updateUserFormSchema

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  const form = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues:
      mode === "create"
        ? {
            cpf: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            phone: "",
            isActive: true,
            roleIds: [],
          }
        : {
            fullName: user?.fullName || "",
            phone: user?.phone || "",
            isActive: user?.isActive ?? true,
            roleIds: user?.roles.map((r) => r.id) || [],
          },
  })

  const onSubmit = async (data: CreateUserFormData | UpdateUserFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (mode === "create") {
        const createData = data as CreateUserFormData
        const input: CreateUserInput = {
          cpf: createData.cpf.replace(/\D/g, ""),
          password: createData.password,
          fullName: createData.fullName,
          phone: createData.phone || null,
          isActive: createData.isActive,
          roleIds: createData.roleIds,
        }
        await usuariosApi.create(input)
      } else if (user) {
        const updateData = data as UpdateUserFormData
        const input: UpdateUserInput = {
          fullName: updateData.fullName,
          phone: updateData.phone || null,
          isActive: updateData.isActive,
          roleIds: updateData.roleIds,
        }
        await usuariosApi.update(user.id, input)
      }
      router.push("/admin/cadastros/usuarios")
      router.refresh()
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        apiError.errors.forEach((e) => {
          form.setError(e.field as keyof CreateUserFormData, {
            message: e.message,
          })
        })
      } else {
        setError(apiError.message || "Erro ao salvar usuário")
      }
    } finally {
      setLoading(false)
    }
  }

  // Phone mask helper
  const formatPhone = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 11)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Informações do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
            <CardDescription>
              {mode === "create"
                ? "Preencha os dados do novo usuário"
                : "Atualize os dados do usuário"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {mode === "create" && (
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>CPF *</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        maxLength={14}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(formatCpf(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {mode === "edit" && user && (
              <div className="sm:col-span-2">
                <FormLabel>CPF</FormLabel>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.cpf ? formatCpf(user.cpf) : "-"}
                </p>
                <FormDescription>O CPF não pode ser alterado</FormDescription>
              </div>
            )}

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome completo do usuário"
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="11999999999"
                      maxLength={11}
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Apenas números (DDD + número)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status</FormLabel>
                    <FormDescription>
                      Usuários inativos não podem acessar o sistema
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Senha (apenas para criação) */}
        {mode === "create" && (
          <Card>
            <CardHeader>
              <CardTitle>Senha</CardTitle>
              <CardDescription>
                Defina a senha de acesso do usuário
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Repita a senha"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Roles */}
        <Card>
          <CardHeader>
            <CardTitle>Permissões</CardTitle>
            <CardDescription>
              Selecione as roles do usuário (pelo menos uma é obrigatória)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRoles ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Carregando roles...
                </span>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="roleIds"
                render={() => (
                  <FormItem>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {roles.map((role) => (
                        <FormField
                          key={role.id}
                          control={form.control}
                          name="roleIds"
                          render={({ field }) => {
                            const values = field.value as string[] || []
                            return (
                              <FormItem
                                key={role.id}
                                className="flex flex-row items-center justify-between rounded-lg border p-4"
                              >
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base font-medium cursor-pointer">
                                    {role.displayName}
                                  </FormLabel>
                                  {role.description && (
                                    <FormDescription>
                                      {role.description}
                                    </FormDescription>
                                  )}
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={values.includes(role.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        field.onChange([...values, role.id])
                                      } else {
                                        field.onChange(
                                          values.filter((id) => id !== role.id)
                                        )
                                      }
                                    }}
                                  />
                                </FormControl>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
          <Button type="submit" disabled={loading || loadingRoles}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Criar Usuário" : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
