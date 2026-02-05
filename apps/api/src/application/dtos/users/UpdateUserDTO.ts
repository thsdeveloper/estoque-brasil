import { z } from 'zod';

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Nome completo é obrigatório')
    .max(255, 'Nome completo deve ter no máximo 255 caracteres')
    .optional(),
  phone: z
    .string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .nullish(),
  avatarUrl: z
    .string()
    .url('URL do avatar inválida')
    .nullish(),
  isActive: z.boolean().optional(),
  roleIds: z
    .array(z.string().uuid('ID de role inválido'))
    .min(1, 'Pelo menos uma role é obrigatória')
    .optional(),
});

export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
