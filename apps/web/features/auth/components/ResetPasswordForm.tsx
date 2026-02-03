'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { AuthCard } from './AuthCard';
import { PasswordInput } from './PasswordInput';
import { resetPassword } from '../actions/reset-password-action';
import { resetPasswordSchema, type ResetPasswordInput } from '../types';

export function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get tokens from URL (passed by /auth/confirm route)
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!accessToken || !refreshToken) {
      setError('Tokens de recuperação não encontrados. Solicite um novo link.');
      return;
    }

    setError(null);
    setLoading(true);

    const formData = new FormData();
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);
    formData.append('accessToken', accessToken);
    formData.append('refreshToken', refreshToken);

    const result = await resetPassword(formData);

    if (result.error) {
      if (typeof result.error === 'string') {
        setError(result.error);
      } else {
        const firstError = Object.values(result.error).flat()[0];
        setError(firstError || 'Erro ao redefinir senha');
      }
      setLoading(false);
      return;
    }

    router.push('/login?reset=true');
  };

  // Show error if no tokens
  if (!accessToken || !refreshToken) {
    return (
      <AuthCard
        title="Link inválido"
        description="O link de recuperação é inválido ou expirou."
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-light">
            Solicite um novo link de recuperação de senha.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/forgot-password')}
          >
            Solicitar novo link
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Redefinir senha"
      description="Digite sua nova senha abaixo."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nova senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Minimo 8 caracteres"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nova senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Repita a nova senha"
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
