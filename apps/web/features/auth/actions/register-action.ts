'use server';

import { serverApiPost } from '@/lib/api/server';
import { registerSchema } from '../types';

interface RegisterResponse {
  message: string;
  cpf: string;
}

export async function register(formData: FormData) {
  const validatedFields = registerSchema.safeParse({
    cpf: formData.get('cpf'),
    fullName: formData.get('fullName'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { cpf, fullName, password } = validatedFields.data;

  const { data, error } = await serverApiPost<RegisterResponse>('/auth/register', {
    cpf,
    fullName,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, cpf: data?.cpf };
}
