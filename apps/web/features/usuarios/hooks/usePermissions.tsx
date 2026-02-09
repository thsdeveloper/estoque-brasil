"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react"
import { usuariosApi } from "../api/usuarios-api"
import type { UserPermissions } from "../types"

interface PermissionsContextValue {
  permissions: UserPermissions | null
  loading: boolean
  error: string | null
  roles: string[]
  hasPermission: (resource: string, action: string) => boolean
  hasRole: (name: string) => boolean
  canRead: (resource: string) => boolean
  canCreate: (resource: string) => boolean
  canUpdate: (resource: string) => boolean
  canDelete: (resource: string) => boolean
  refresh: () => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null)

interface PermissionsProviderProps {
  children: ReactNode
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await usuariosApi.getMyPermissions()
      setPermissions(data)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar permissões"
      setError(errorMessage)
      // Don't set permissions to null on error to preserve previous state
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const roles = permissions?.roles ?? []

  const hasPermission = useCallback(
    (resource: string, action: string): boolean => {
      if (!permissions) return false
      return permissions.permissions.some(
        (p) => p.resource === resource && p.action === action
      )
    },
    [permissions]
  )

  const hasRole = useCallback(
    (name: string): boolean => {
      return roles.includes(name)
    },
    [roles]
  )

  const canRead = useCallback(
    (resource: string): boolean => hasPermission(resource, "read"),
    [hasPermission]
  )

  const canCreate = useCallback(
    (resource: string): boolean => hasPermission(resource, "create"),
    [hasPermission]
  )

  const canUpdate = useCallback(
    (resource: string): boolean => hasPermission(resource, "update"),
    [hasPermission]
  )

  const canDelete = useCallback(
    (resource: string): boolean => hasPermission(resource, "delete"),
    [hasPermission]
  )

  const value: PermissionsContextValue = {
    permissions,
    loading,
    error,
    roles,
    hasPermission,
    hasRole,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    refresh: fetchPermissions,
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions(): PermissionsContextValue {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionsProvider")
  }
  return context
}

// Convenience hook for checking a specific permission
export function useHasPermission(
  resource: string,
  action: string
): boolean {
  const { hasPermission, loading } = usePermissions()
  // Return false while loading to prevent flash of unauthorized content
  if (loading) return false
  return hasPermission(resource, action)
}
