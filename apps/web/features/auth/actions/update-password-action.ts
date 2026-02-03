'use server';

import { serverApiPut, getAccessToken } from '@/lib/api/server';
import { updatePasswordSchema } from '../types';

interface UpdatePasswordResponse {
  message: string;
}

export async function updatePassword(formData: FormData) {
  const validatedFields = updatePasswordSchema.safeParse({
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { newPassword } = validatedFields.data;

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { error: 'Sessão expirada. Faça login novamente.' };
  }

  const { error } = await serverApiPut<UpdatePasswordResponse>(
    '/auth/password',
    { newPassword },
    { token: accessToken }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
