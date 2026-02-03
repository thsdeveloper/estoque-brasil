import { z } from 'zod';

export const updatePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Deve conter letras')
    .regex(/[0-9]/, 'Deve conter números'),
});

export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema>;

export interface UpdatePasswordResponseDTO {
  message: string;
}
