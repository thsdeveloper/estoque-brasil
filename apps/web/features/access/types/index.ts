import { z } from "zod"
import type { AccessResource, AccessAction, AccessPolicy, Permission } from "@estoque-brasil/types"

// Re-export shared types
export type { AccessResource, AccessAction, AccessPolicy, Permission }

// ============ Resources ============

export const createResourceFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-z_]+$/, "Nome deve conter apenas letras minúsculas e underscores"),
  displayName: z
    .string()
    .min(2, "Nome de exibição deve ter pelo menos 2 caracteres")
    .max(100, "Nome de exibição deve ter no máximo 100 caracteres"),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const updateResourceFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "Nome de exibição deve ter pelo menos 2 caracteres")
    .max(100, "Nome de exibição deve ter no máximo 100 caracteres"),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export type CreateResourceFormData = z.infer<typeof createResourceFormSchema>
export type UpdateResourceFormData = z.infer<typeof updateResourceFormSchema>

// ============ Actions ============

export const createActionFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-z_]+$/, "Nome deve conter apenas letras minúsculas e underscores"),
  displayName: z
    .string()
    .min(2, "Nome de exibição deve ter pelo menos 2 caracteres")
    .max(100, "Nome de exibição deve ter no máximo 100 caracteres"),
  description: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export const updateActionFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "Nome de exibição deve ter pelo menos 2 caracteres")
    .max(100, "Nome de exibição deve ter no máximo 100 caracteres"),
  description: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
})

export type CreateActionFormData = z.infer<typeof createActionFormSchema>
export type UpdateActionFormData = z.infer<typeof updateActionFormSchema>

// ============ Policies ============

export const createPolicyFormSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres")
    .regex(/^[a-z_]+$/, "Nome deve conter apenas letras minúsculas e underscores"),
  displayName: z
    .string()
    .min(2, "Nome de exibição deve ter pelo menos 2 caracteres")
    .max(100, "Nome de exibição deve ter no máximo 100 caracteres"),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
})

export const updatePolicyFormSchema = z.object({
  displayName: z
    .string()
    .min(2, "Nome de exibição deve ter pelo menos 2 caracteres")
    .max(100, "Nome de exibição deve ter no máximo 100 caracteres"),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
})

export type CreatePolicyFormData = z.infer<typeof createPolicyFormSchema>
export type UpdatePolicyFormData = z.infer<typeof updatePolicyFormSchema>

// API Input types
export interface CreateResourceInput {
  name: string
  displayName: string
  description?: string | null
  icon?: string | null
  sortOrder?: number
}

export interface UpdateResourceInput {
  displayName?: string
  description?: string | null
  icon?: string | null
  sortOrder?: number
}

export interface CreateActionInput {
  name: string
  displayName: string
  description?: string | null
  sortOrder?: number
}

export interface UpdateActionInput {
  displayName?: string
  description?: string | null
  sortOrder?: number
}

export interface CreatePolicyInput {
  name: string
  displayName: string
  description?: string | null
  icon?: string | null
}

export interface UpdatePolicyInput {
  displayName?: string
  description?: string | null
  icon?: string | null
}

export interface SetPolicyPermissionsInput {
  permissionIds: string[]
}
