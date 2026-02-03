import { z } from 'zod';

export const createClientSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  linkBi: z.string().url('Link BI deve ser uma URL válida').nullish(),
  qtdeDivergentePlus: z.number().nullish(),
  qtdeDivergenteMinus: z.number().nullish(),
  valorDivergentePlus: z.number().nullish(),
  valorDivergenteMinus: z.number().nullish(),
  percentualDivergencia: z
    .number()
    .min(0, 'Percentual deve ser maior ou igual a 0')
    .max(100, 'Percentual deve ser menor ou igual a 100')
    .nullish(),
  cep: z
    .string()
    .regex(/^\d{8}$/, 'CEP deve conter exatamente 8 dígitos')
    .nullish(),
  endereco: z.string().max(255, 'Endereço deve ter no máximo 255 caracteres').nullish(),
  numero: z.string().max(20, 'Número deve ter no máximo 20 caracteres').nullish(),
  bairro: z.string().max(100, 'Bairro deve ter no máximo 100 caracteres').nullish(),
  uf: z
    .string()
    .length(2, 'UF deve ter exatamente 2 caracteres')
    .toUpperCase()
    .nullish(),
  municipio: z.string().max(100, 'Município deve ter no máximo 100 caracteres').nullish(),
});

export type CreateClientDTO = z.infer<typeof createClientSchema>;
