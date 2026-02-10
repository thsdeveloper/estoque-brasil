import { z } from 'zod';

export const registerSchema = z.object({
  cpf: z.string()
    .min(11, 'CPF invalido')
    .max(14, 'CPF invalido'),
  fullName: z.string()
    .min(1, 'Nome completo é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  password: z.string()
    .min(8, 'Minimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Deve conter letras')
    .regex(/[0-9]/, 'Deve conter numeros'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas nao conferem',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  cpf: z.string()
    .min(11, 'CPF invalido')
    .max(14, 'CPF invalido'),
  password: z.string().min(1, 'Senha obrigatoria'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalido'),
});

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Minimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Deve conter letras')
    .regex(/[0-9]/, 'Deve conter numeros'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas nao conferem',
  path: ['confirmPassword'],
});

export const updatePasswordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Minimo 8 caracteres')
    .regex(/[A-Za-z]/, 'Deve conter letras')
    .regex(/[0-9]/, 'Deve conter numeros'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Senhas nao conferem',
  path: ['confirmPassword'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
