import { z } from 'zod';

// Resource
export const createAccessResourceSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-z_]+$/, 'Nome deve conter apenas letras minúsculas e underscores'),
  displayName: z
    .string()
    .min(2, 'Nome de exibição deve ter pelo menos 2 caracteres')
    .max(100, 'Nome de exibição deve ter no máximo 100 caracteres'),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
});

export const updateAccessResourceSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Nome de exibição deve ter pelo menos 2 caracteres')
    .max(100, 'Nome de exibição deve ter no máximo 100 caracteres')
    .optional(),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// Action
export const createAccessActionSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-z_]+$/, 'Nome deve conter apenas letras minúsculas e underscores'),
  displayName: z
    .string()
    .min(2, 'Nome de exibição deve ter pelo menos 2 caracteres')
    .max(100, 'Nome de exibição deve ter no máximo 100 caracteres'),
  description: z.string().max(500).nullable().optional(),
});

export const updateAccessActionSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Nome de exibição deve ter pelo menos 2 caracteres')
    .max(100, 'Nome de exibição deve ter no máximo 100 caracteres')
    .optional(),
  description: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// Policy
export const createAccessPolicySchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-z_]+$/, 'Nome deve conter apenas letras minúsculas e underscores'),
  displayName: z
    .string()
    .min(2, 'Nome de exibição deve ter pelo menos 2 caracteres')
    .max(100, 'Nome de exibição deve ter no máximo 100 caracteres'),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
});

export const updateAccessPolicySchema = z.object({
  displayName: z
    .string()
    .min(2, 'Nome de exibição deve ter pelo menos 2 caracteres')
    .max(100, 'Nome de exibição deve ter no máximo 100 caracteres')
    .optional(),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
});

// Permission assignment
export const setPolicyPermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});

export const setRolePoliciesSchema = z.object({
  policyIds: z.array(z.string().uuid()),
});

// Export types
export type CreateAccessResourceDTO = z.infer<typeof createAccessResourceSchema>;
export type UpdateAccessResourceDTO = z.infer<typeof updateAccessResourceSchema>;
export type CreateAccessActionDTO = z.infer<typeof createAccessActionSchema>;
export type UpdateAccessActionDTO = z.infer<typeof updateAccessActionSchema>;
export type CreateAccessPolicyDTO = z.infer<typeof createAccessPolicySchema>;
export type UpdateAccessPolicyDTO = z.infer<typeof updateAccessPolicySchema>;
export type SetPolicyPermissionsDTO = z.infer<typeof setPolicyPermissionsSchema>;
export type SetRolePoliciesDTO = z.infer<typeof setRolePoliciesSchema>;
