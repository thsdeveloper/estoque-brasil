import { z } from "zod"
import type { AccessPolicy } from "@estoque-brasil/types"

// Permission type
export interface Permission {
  id: string
  resource: string
  action: string
  description: string | null
  resourceId?: string | null
  actionId?: string | null
}

// Role type
export interface Role {
  id: string
  name: string
  displayName: string
  description: string | null
  isSystemRole: boolean
  policies?: AccessPolicy[]
  policyIds?: string[]
  createdAt?: string
  updatedAt?: string
}

// Permissions grouped by resource
export interface PermissionsByResource {
  resource: string
  resourceDisplayName: string
  permissions: Permission[]
}

// Form schemas
export const createRoleFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-z0-9_]+$/, "Nome deve conter apenas letras minúsculas, números e underscore"),
  displayName: z
    .string()
    .min(2, "Nome de exibição deve ter pelo menos 2 caracteres")
    .max(100, "Nome de exibição deve ter no máximo 100 caracteres"),
  description: z.string().max(500).nullable().optional(),
})

export const updateRoleFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "Nome de exibição deve ter pelo menos 2 caracteres")
    .max(100, "Nome de exibição deve ter no máximo 100 caracteres"),
  description: z.string().max(500).nullable().optional(),
})

export type CreateRoleFormData = z.infer<typeof createRoleFormSchema>
export type UpdateRoleFormData = z.infer<typeof updateRoleFormSchema>

// API input types
export interface CreateRoleInput {
  name: string
  displayName: string
  description?: string | null
}

export interface UpdateRoleInput {
  displayName?: string
  description?: string | null
}

export interface SetRolePoliciesInput {
  policyIds: string[]
}

// Action display names (fallback for standard actions)
export const ACTION_DISPLAY_NAMES: Record<string, string> = {
  read: "Visualizar",
  create: "Criar",
  update: "Editar",
  delete: "Excluir",
}
