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
import { resourcesApi, actionsApi, policiesApi, type ApiError } from "../../api/access-api"
import type { AccessResource, AccessAction, AccessPolicy, Permission } from "../../types"
import { rolesApi } from "@/features/roles/api/roles-api"

interface PolicyPermissionsMatrixProps {
  policy: AccessPolicy
  onUpdate?: (policy: AccessPolicy) => void
  readonly?: boolean
}

export function PolicyPermissionsMatrix({
  policy,
  onUpdate,
  readonly = false,
}: PolicyPermissionsMatrixProps) {
  const [resources, setResources] = useState<AccessResource[]>([])
  const [actions, setActions] = useState<AccessAction[]>([])
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [resourcesData, actionsData, permissionsData] = await Promise.all([
          resourcesApi.list(),
          actionsApi.list(),
          rolesApi.listPermissions(),
        ])
        setResources(resourcesData)
        setActions(actionsData)
        setAllPermissions(permissionsData)
      } catch (err) {
        setError("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Initialize selected permissions from policy
  useEffect(() => {
    if (policy.permissions) {
      setSelectedPermissionIds(new Set(policy.permissions.map((p) => p.id)))
    }
  }, [policy.permissions])

  const findPermission = useCallback(
    (resourceName: string, actionName: string): Permission | undefined => {
      return allPermissions.find(
        (p) => p.resource === resourceName && p.action === actionName
      )
    },
    [allPermissions]
  )

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
    (resourceName: string, checked: boolean) => {
      setSelectedPermissionIds((prev) => {
        const next = new Set(prev)
        actions.forEach((action) => {
          const permission = findPermission(resourceName, action.name)
          if (permission) {
            if (checked) {
              next.add(permission.id)
            } else {
              next.delete(permission.id)
            }
          }
        })
        return next
      })
      setHasChanges(true)
    },
    [actions, findPermission]
  )

  const handleToggleAction = useCallback(
    (actionName: string, checked: boolean) => {
      setSelectedPermissionIds((prev) => {
        const next = new Set(prev)
        resources.forEach((resource) => {
          const permission = findPermission(resource.name, actionName)
          if (permission) {
            if (checked) {
              next.add(permission.id)
            } else {
              next.delete(permission.id)
            }
          }
        })
        return next
      })
      setHasChanges(true)
    },
    [resources, findPermission]
  )

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedPermissionIds(new Set(allPermissions.map((p) => p.id)))
      } else {
        setSelectedPermissionIds(new Set())
      }
      setHasChanges(true)
    },
    [allPermissions]
  )

  const isResourceFullySelected = useCallback(
    (resourceName: string) => {
      return actions.every((action) => {
        const permission = findPermission(resourceName, action.name)
        return permission ? selectedPermissionIds.has(permission.id) : true
      })
    },
    [actions, findPermission, selectedPermissionIds]
  )

  const isResourcePartiallySelected = useCallback(
    (resourceName: string) => {
      const permissionsForResource = actions
        .map((action) => findPermission(resourceName, action.name))
        .filter(Boolean) as Permission[]
      const selectedCount = permissionsForResource.filter((p) =>
        selectedPermissionIds.has(p.id)
      ).length
      return selectedCount > 0 && selectedCount < permissionsForResource.length
    },
    [actions, findPermission, selectedPermissionIds]
  )

  const isActionFullySelected = useCallback(
    (actionName: string) => {
      return resources.every((resource) => {
        const permission = findPermission(resource.name, actionName)
        return permission ? selectedPermissionIds.has(permission.id) : true
      })
    },
    [resources, findPermission, selectedPermissionIds]
  )

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      await policiesApi.setPermissions(policy.id, {
        permissionIds: Array.from(selectedPermissionIds),
      })
      setHasChanges(false)
      // Reload policy to get updated permissions
      const updatedPolicy = await policiesApi.get(policy.id)
      onUpdate?.(updatedPolicy)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Erro ao salvar permissões")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = useCallback(() => {
    if (policy.permissions) {
      setSelectedPermissionIds(new Set(policy.permissions.map((p) => p.id)))
    }
    setHasChanges(false)
  }, [policy.permissions])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const allSelected = allPermissions.length > 0 && allPermissions.every((p) => selectedPermissionIds.has(p.id))

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-background z-10">
                <div className="flex items-center gap-2">
                  {!readonly && (
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => handleSelectAll(checked === true)}
                    />
                  )}
                  Recurso
                </div>
              </TableHead>
              {actions.map((action) => (
                <TableHead key={action.id} className="text-center w-[100px]">
                  <div className="flex flex-col items-center gap-1">
                    {!readonly && (
                      <Checkbox
                        checked={isActionFullySelected(action.name)}
                        onCheckedChange={(checked) =>
                          handleToggleAction(action.name, checked === true)
                        }
                      />
                    )}
                    <span className="text-xs">{action.displayName}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => {
              const fullySelected = isResourceFullySelected(resource.name)
              const partiallySelected = isResourcePartiallySelected(resource.name)

              return (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-2">
                      {!readonly && (
                        <Checkbox
                          checked={fullySelected}
                          ref={(el) => {
                            if (el) {
                              ;(el as HTMLButtonElement).dataset.state =
                                partiallySelected
                                  ? "indeterminate"
                                  : fullySelected
                                    ? "checked"
                                    : "unchecked"
                            }
                          }}
                          onCheckedChange={(checked) =>
                            handleToggleResource(resource.name, checked === true)
                          }
                        />
                      )}
                      {resource.displayName}
                    </div>
                  </TableCell>
                  {actions.map((action) => {
                    const permission = findPermission(resource.name, action.name)
                    if (!permission) {
                      return (
                        <TableCell key={action.id} className="text-center">
                          <X className="h-4 w-4 text-muted-foreground mx-auto" />
                        </TableCell>
                      )
                    }
                    const isSelected = selectedPermissionIds.has(permission.id)
                    return (
                      <TableCell key={action.id} className="text-center">
                        {readonly ? (
                          isSelected ? (
                            <Check className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleTogglePermission(permission.id)}
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
