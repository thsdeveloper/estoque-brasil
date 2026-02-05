'use server';

import { serverApiPost } from '@/lib/api/server';
import { forgotPasswordSchema } from '../types';

interface ForgotPasswordResponse {
  message: string;
}

export async function forgotPassword(formData: FormData) {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { email } = validatedFields.data;

  const { error } = await serverApiPost<ForgotPasswordResponse>('/auth/forgot-password', {
    email,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
