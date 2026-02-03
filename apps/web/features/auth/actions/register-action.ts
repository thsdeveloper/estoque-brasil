'use server';

import { serverApiPost } from '@/lib/api/server';
import { registerSchema } from '../types';

interface RegisterResponse {
  message: string;
  email: string;
}

export async function register(formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  const { data, error } = await serverApiPost<RegisterResponse>('/auth/register', {
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, email: data?.email };
}
