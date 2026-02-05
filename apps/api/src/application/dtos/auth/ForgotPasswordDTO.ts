import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordResponseDTO {
  message: string;
}
