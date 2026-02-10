import { z } from 'zod';

export const registerSchema = z.object({
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  fullName: z
    .string()
    .min(1, 'Nome completo é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Deve conter letras')
    .regex(/[0-9]/, 'Deve conter números'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

export interface RegisterResponseDTO {
  message: string;
  cpf: string;
}
