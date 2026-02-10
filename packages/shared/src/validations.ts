import { z } from 'zod';

// Contact Form Validation
export const contactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido').max(15, 'Telefone inválido'),
  message: z.string().optional(),
  source: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;

// Phone validation (Brazilian format)
export const phoneSchema = z.string().regex(
  /^(\+55)?[\s]?\(?[1-9]{2}\)?[\s]?9?[0-9]{4}[-\s]?[0-9]{4}$/,
  'Formato de telefone inválido'
);

// Email validation
export const emailSchema = z.string().email('Email inválido');

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// Client Form Validation
export const clientFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome muito longo'),
  cnpj: z.string({ required_error: 'CNPJ é obrigatório' }).min(1, 'CNPJ é obrigatório').regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos numéricos'),
  fantasia: z.string().max(255, 'Nome fantasia muito longo').optional().nullable().or(z.literal('')),
  email: z.string().max(255, 'Email muito longo').optional().nullable().or(z.literal('')),
  telefone: z.string().max(30, 'Telefone muito longo').optional().nullable().or(z.literal('')),
  situacao: z.string().max(50, 'Situação muito longa').optional().nullable().or(z.literal('')),

  qtdeDivergentePlus: z.coerce.number({ required_error: 'Qtde divergente (+) é obrigatório' }),
  qtdeDivergenteMinus: z.coerce.number({ required_error: 'Qtde divergente (-) é obrigatório' }),
  valorDivergentePlus: z.coerce.number({ required_error: 'Valor divergente (+) é obrigatório' }),
  valorDivergenteMinus: z.coerce.number({ required_error: 'Valor divergente (-) é obrigatório' }),
  percentualDivergencia: z.coerce.number({ required_error: '% divergência é obrigatório' }).min(0, 'Mínimo 0%').max(100, 'Máximo 100%'),
  cep: z.string({ required_error: 'CEP é obrigatório' }).min(1, 'CEP é obrigatório').length(8, 'CEP deve ter 8 dígitos'),
  endereco: z.string({ required_error: 'Endereço é obrigatório' }).min(1, 'Endereço é obrigatório').max(255, 'Endereço muito longo'),
  numero: z.string({ required_error: 'Número é obrigatório' }).min(1, 'Número é obrigatório').max(20, 'Número muito longo'),
  bairro: z.string({ required_error: 'Bairro é obrigatório' }).min(1, 'Bairro é obrigatório').max(100, 'Bairro muito longo'),
  uf: z.string({ required_error: 'UF é obrigatório' }).min(1, 'UF é obrigatório').length(2, 'UF deve ter 2 letras'),
  municipio: z.string({ required_error: 'Município é obrigatório' }).min(1, 'Município é obrigatório').max(100, 'Município muito longo'),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;

// Client Query Params Validation
export const clientsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  uf: z.string().length(2).optional(),
});

export type ClientsQueryParams = z.infer<typeof clientsQuerySchema>;

// Brazilian States
export const ESTADOS_BRASIL = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const;

export type UFValue = typeof ESTADOS_BRASIL[number]['value'];
