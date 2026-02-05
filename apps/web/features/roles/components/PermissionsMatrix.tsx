"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, Check, X } from "lucide-react"
import { Checkbox } from "@/shared/components/ui/checkbox"
import { Button } from "@/shared/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table"
import { rolesApi, type ApiError } from "../api/roles-api"
import type { Role, PermissionsByResource, Permission } from "../types"
import { ACTION_DISPLAY_NAMES } from "../types"

interface PermissionsMatrixProps {
  role: Role
  onUpdate?: (role: Role) => void
  readonly?: boolean
}

export function PermissionsMatrix({
  role,
  onUpdate,
  readonly = false,
}: PermissionsMatrixProps) {
  const [permissionsGrouped, setPermissionsGrouped] = useState<PermissionsByResource[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Load permissions grouped by resource
  useEffect(() => {
    async function fetchPermissions() {
      try {
        const grouped = await rolesApi.listPermissionsGrouped()
        setPermissionsGrouped(grouped)
      } catch (err) {
        setError("Erro ao carregar permissões")
      } finally {
        setLoading(false)
      }
    }
    fetchPermissions()
  }, [])

  // Initialize selected permissions from role
  useEffect(() => {
    if (role.permissions) {
      setSelectedPermissionIds(new Set(role.permissions.map((p) => p.id)))
    }
  }, [role.permissions])

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
    setHasChanges(true)
  }, [])

  const handleToggleResource = useCallback(
    (permissions: Permission[], checked: boolean) => {
      setSelectedPermissionIds((prev) => {
        const next = new Set(prev)
        permissions.forEach((p) => {
          if (checked) {
            next.add(p.id)
          } else {
            next.delete(p.id)
          }
        })
        return next
      })
      setHasChanges(true)
    },
    []
  )

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const updatedRole = await rolesApi.updatePermissions(role.id, {
        permissionIds: Array.from(selectedPermissionIds),
      })
      setHasChanges(false)
      onUpdate?.(updatedRole)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao salvar permissões")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = useCallback(() => {
    if (role.permissions) {
      setSelectedPermissionIds(new Set(role.permissions.map((p) => p.id)))
    }
    setHasChanges(false)
  }, [role.permissions])

  const isResourceFullySelected = useCallback(
    (permissions: Permission[]) => {
      return permissions.every((p) => selectedPermissionIds.has(p.id))
    },
    [selectedPermissionIds]
  )

  const isResourcePartiallySelected = useCallback(
    (permissions: Permission[]) => {
      const selectedCount = permissions.filter((p) =>
        selectedPermissionIds.has(p.id)
      ).length
      return selectedCount > 0 && selectedCount < permissions.length
    },
    [selectedPermissionIds]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

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
              const fullySelected = isResourceFullySelected(group.permissions)
              const partiallySelected = isResourcePartiallySelected(group.permissions)

              return (
                <TableRow key={group.resource}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {!readonly && (
                        <Checkbox
                          checked={fullySelected}
                          ref={(el) => {
                            if (el) {
                              ;(el as HTMLButtonElement).dataset.state =
                                partiallySelected ? "indeterminate" : fullySelected ? "checked" : "unchecked"
                            }
                          }}
                          onCheckedChange={(checked) =>
                            handleToggleResource(group.permissions, checked === true)
                          }
                        />
                      )}
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
                          <X className="h-4 w-4 text-muted-foreground mx-auto" />
                        </TableCell>
                      )
                    }
                    const isSelected = selectedPermissionIds.has(permission.id)
                    return (
                      <TableCell key={action} className="text-center">
                        {readonly ? (
                          isSelected ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleTogglePermission(permission.id)
                            }
                          />
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {!readonly && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedPermissionIds.size} permissões selecionadas
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || saving}
            >
              Desfazer Alterações
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Permissões
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
