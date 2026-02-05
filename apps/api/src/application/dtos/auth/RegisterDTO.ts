import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Deve conter letras')
    .regex(/[0-9]/, 'Deve conter números'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;

export interface RegisterResponseDTO {
  message: string;
  email: string;
}
