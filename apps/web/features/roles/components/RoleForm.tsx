"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Checkbox } from "@/shared/components/ui/checkbox"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { rolesApi, type ApiError } from "../api/roles-api"
import {
  createRoleFormSchema,
  updateRoleFormSchema,
  type CreateRoleFormData,
  type UpdateRoleFormData,
  type Role,
  type PermissionsByResource,
  ACTION_DISPLAY_NAMES,
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

  // Permissions state (only for create mode)
  const [permissionsGrouped, setPermissionsGrouped] = useState<PermissionsByResource[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set())
  const [loadingPermissions, setLoadingPermissions] = useState(mode === "create")

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

  // Load permissions for create mode
  useEffect(() => {
    if (isCreate) {
      async function fetchPermissions() {
        try {
          const grouped = await rolesApi.listPermissionsGrouped()
          setPermissionsGrouped(grouped)
        } catch (err) {
          console.error("Erro ao carregar permissões:", err)
        } finally {
          setLoadingPermissions(false)
        }
      }
      fetchPermissions()
    }
  }, [isCreate])

  const handleTogglePermission = useCallback((permissionId: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev)
      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }
      return next
    })
  }, [])

  const handleToggleResource = useCallback(
    (permissionIds: string[], checked: boolean) => {
      setSelectedPermissionIds((prev) => {
        const next = new Set(prev)
        permissionIds.forEach((id) => {
          if (checked) {
            next.add(id)
          } else {
            next.delete(id)
          }
        })
        return next
      })
    },
    []
  )

  const onSubmit = async (data: CreateRoleFormData | UpdateRoleFormData) => {
    setLoading(true)
    setError(null)

    try {
      if (isCreate) {
        // Create role first
        const newRole = await rolesApi.create(data as CreateRoleFormData)

        // Then update permissions if any selected
        if (selectedPermissionIds.size > 0) {
          await rolesApi.updatePermissions(newRole.id, {
            permissionIds: Array.from(selectedPermissionIds),
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

  const isResourceFullySelected = useCallback(
    (permissionIds: string[]) => {
      return permissionIds.every((id) => selectedPermissionIds.has(id))
    },
    [selectedPermissionIds]
  )

  const isResourcePartiallySelected = useCallback(
    (permissionIds: string[]) => {
      const selectedCount = permissionIds.filter((id) =>
        selectedPermissionIds.has(id)
      ).length
      return selectedCount > 0 && selectedCount < permissionIds.length
    },
    [selectedPermissionIds]
  )

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

      {/* Permissions Matrix - Only for Create mode */}
      {isCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Permissões</CardTitle>
            <CardDescription>
              Selecione as permissões que este perfil terá acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPermissions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Recurso</TableHead>
                        {["read", "create", "update", "delete"].map((action) => (
                          <TableHead key={action} className="text-center w-[100px]">
                            {ACTION_DISPLAY_NAMES[action]}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {permissionsGrouped.map((group) => {
                        const permissionIds = group.permissions.map((p) => p.id)
                        const fullySelected = isResourceFullySelected(permissionIds)
                        const partiallySelected = isResourcePartiallySelected(permissionIds)

                        return (
                          <TableRow key={group.resource}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={fullySelected}
                                  ref={(el) => {
                                    if (el) {
                                      (el as HTMLButtonElement).dataset.state =
                                        partiallySelected ? "indeterminate" : fullySelected ? "checked" : "unchecked"
                                    }
                                  }}
                                  onCheckedChange={(checked) =>
                                    handleToggleResource(permissionIds, checked === true)
                                  }
                                />
                                {group.resourceDisplayName}
                              </div>
                            </TableCell>
                            {["read", "create", "update", "delete"].map((action) => {
                              const permission = group.permissions.find(
                                (p) => p.action === action
                              )
                              if (!permission) {
                                return (
                                  <TableCell key={action} className="text-center">
                                    <span className="text-muted-foreground">-</span>
                                  </TableCell>
                                )
                              }
                              const isSelected = selectedPermissionIds.has(permission.id)
                              return (
                                <TableCell key={action} className="text-center">
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() =>
                                      handleTogglePermission(permission.id)
                                    }
                                  />
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedPermissionIds.size} permissões selecionadas
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submit buttons for Create mode - at the bottom after permissions */}
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
