import { z } from 'zod';

export const loginSchema = z.object({
  cpf: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido').optional(),
  email: z.string().email('Email inválido').optional(),
  password: z.string().min(1, 'Senha obrigatória'),
}).refine((data) => data.cpf || data.email, {
  message: 'CPF ou email é obrigatório',
  path: ['cpf'],
});

export type LoginDTO = z.infer<typeof loginSchema>;

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
  };
}
