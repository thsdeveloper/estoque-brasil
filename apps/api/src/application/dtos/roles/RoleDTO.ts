import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Nome deve conter apenas letras minúsculas, números e underscore'),
  displayName: z
    .string()
    .min(2, 'Nome de exibição deve ter pelo menos 2 caracteres')
    .max(100, 'Nome de exibição deve ter no máximo 100 caracteres'),
  description: z.string().max(500).nullable().optional(),
});

export const updateRoleSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Nome de exibição deve ter pelo menos 2 caracteres')
    .max(100, 'Nome de exibição deve ter no máximo 100 caracteres')
    .optional(),
  description: z.string().max(500).nullable().optional(),
});

export const updateRolePermissionsSchema = z.object({
  permissionIds: z.array(z.string().uuid()),
});

export type CreateRoleDTO = z.infer<typeof createRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>;
export type UpdateRolePermissionsDTO = z.infer<typeof updateRolePermissionsSchema>;
