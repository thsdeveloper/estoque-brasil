'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthCard } from './AuthCard';
import { AuthLinks } from './AuthLinks';
import { PasswordInput } from './PasswordInput';
import { loginSchema, type LoginInput } from '../types';
import { apiPost } from '@/lib/api/client';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: {
    id: string;
    email: string;
  };
}

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = '/admin' }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const verified = searchParams.get('verified') === 'true';
  const registered = searchParams.get('registered') === 'true';
  const reset = searchParams.get('reset') === 'true';
  const tokenError = searchParams.get('error') === 'invalid_token';

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      cpf: '',
      password: '',
    },
  });

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setLoading(true);

    const cpfDigits = data.cpf.replace(/\D/g, '');

    // 1. Call API to authenticate
    const { data: loginData, error: apiError } = await apiPost<LoginResponse>('/auth/login', {
      cpf: cpfDigits,
      password: data.password,
    });

    if (apiError || !loginData) {
      setError(apiError?.message || 'Erro ao fazer login');
      setLoading(false);
      return;
    }

    // 2. Set the session in Supabase client so middleware works
    const supabase = createClient();
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: loginData.accessToken,
      refresh_token: loginData.refreshToken,
    });

    if (sessionError) {
      setError('Erro ao iniciar a sessão');
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  return (
    <AuthCard
      description="Entre com seu CPF e senha para acessar o painel administrativo."
      footer={<AuthLinks type="login" />}
    >
      {verified && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded-md">
          Conta verificada com sucesso! Faça login para continuar.
        </div>
      )}
      {registered && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded-md">
          Conta criada com sucesso! Faça login para continuar.
        </div>
      )}
      {reset && (
        <div className="mb-4 p-3 text-sm text-green-700 bg-green-50 rounded-md">
          Senha alterada com sucesso! Faça login com sua nova senha.
        </div>
      )}
      {tokenError && (
        <div className="mb-4 p-3 text-sm text-red-500 bg-red-50 rounded-md">
          Link inválido ou expirado. Solicite um novo link.
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    maxLength={14}
                    disabled={loading}
                    {...field}
                    onChange={(e) => field.onChange(formatCpf(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Sua senha"
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
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
