import { z } from 'zod';

export const resetPasswordSchema = z.object({
  accessToken: z.string().min(1, 'Token obrigatório'),
  refreshToken: z.string().min(1, 'Refresh token obrigatório'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Deve conter letras')
    .regex(/[0-9]/, 'Deve conter números'),
});

export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordResponseDTO {
  message: string;
}
