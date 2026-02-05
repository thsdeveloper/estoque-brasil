import { z } from 'zod';

export const createUserSchema = z.object({
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(72, 'Senha deve ter no máximo 72 caracteres'),
  fullName: z
    .string({ required_error: 'Nome completo é obrigatório' })
    .min(1, 'Nome completo é obrigatório')
    .max(255, 'Nome completo deve ter no máximo 255 caracteres'),
  phone: z
    .string()
    .max(20, 'Telefone deve ter no máximo 20 caracteres')
    .nullish(),
  avatarUrl: z
    .string()
    .url('URL do avatar inválida')
    .nullish(),
  isActive: z.boolean().default(true),
  roleIds: z
    .array(z.string().uuid('ID de role inválido'))
    .min(1, 'Pelo menos uma role é obrigatória'),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
