'use server';

import { serverApiPost } from '@/lib/api/server';
import { resetPasswordSchema } from '../types';

interface ResetPasswordResponse {
  message: string;
}

export async function resetPassword(formData: FormData) {
  const validatedFields = resetPasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { password } = validatedFields.data;

  // Get tokens from form data (passed from the frontend after Supabase callback)
  const accessToken = formData.get('accessToken') as string;
  const refreshToken = formData.get('refreshToken') as string;

  if (!accessToken || !refreshToken) {
    return { error: 'Tokens de recuperação não encontrados. Solicite um novo link.' };
  }

  const { error } = await serverApiPost<ResetPasswordResponse>('/auth/reset-password', {
    accessToken,
    refreshToken,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
