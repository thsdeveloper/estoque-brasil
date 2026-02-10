import { z } from 'zod';

export const createClientSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  cnpj: z
    .string({ required_error: 'CNPJ é obrigatório' })
    .regex(/^\d{14}$/, 'CNPJ deve conter exatamente 14 dígitos'),
  fantasia: z.string().max(255, 'Nome fantasia deve ter no máximo 255 caracteres').nullish(),
  email: z.string().max(255, 'Email deve ter no máximo 255 caracteres').nullish(),
  telefone: z.string().max(30, 'Telefone deve ter no máximo 30 caracteres').nullish(),
  situacao: z.string().max(50, 'Situação deve ter no máximo 50 caracteres').nullish(),
  idEmpresa: z.number().int().nullish(),

  qtdeDivergentePlus: z.number({ required_error: 'Qtde divergente (+) é obrigatório' }),
  qtdeDivergenteMinus: z.number({ required_error: 'Qtde divergente (-) é obrigatório' }),
  valorDivergentePlus: z.number({ required_error: 'Valor divergente (+) é obrigatório' }),
  valorDivergenteMinus: z.number({ required_error: 'Valor divergente (-) é obrigatório' }),
  percentualDivergencia: z
    .number({ required_error: 'Percentual de divergência é obrigatório' })
    .min(0, 'Percentual deve ser maior ou igual a 0')
    .max(100, 'Percentual deve ser menor ou igual a 100'),
  cep: z
    .string({ required_error: 'CEP é obrigatório' })
    .regex(/^\d{8}$/, 'CEP deve conter exatamente 8 dígitos'),
  endereco: z.string({ required_error: 'Endereço é obrigatório' }).min(1, 'Endereço é obrigatório').max(255, 'Endereço deve ter no máximo 255 caracteres'),
  numero: z.string({ required_error: 'Número é obrigatório' }).min(1, 'Número é obrigatório').max(20, 'Número deve ter no máximo 20 caracteres'),
  bairro: z.string({ required_error: 'Bairro é obrigatório' }).min(1, 'Bairro é obrigatório').max(100, 'Bairro deve ter no máximo 100 caracteres'),
  uf: z
    .string({ required_error: 'UF é obrigatório' })
    .length(2, 'UF deve ter exatamente 2 caracteres')
    .toUpperCase(),
  municipio: z.string({ required_error: 'Município é obrigatório' }).min(1, 'Município é obrigatório').max(100, 'Município deve ter no máximo 100 caracteres'),
});

export type CreateClientDTO = z.infer<typeof createClientSchema>;
