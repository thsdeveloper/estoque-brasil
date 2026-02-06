import { z } from 'zod';
import { Setor } from '../../../domain/entities/Setor.js';

// Schema de validação para criação de setor
export const createSetorSchema = z.object({
  idInventario: z
    .number({ required_error: 'ID do inventário é obrigatório' })
    .int('ID do inventário deve ser um número inteiro')
    .positive('ID do inventário deve ser positivo'),
  prefixo: z
    .string()
    .max(10, 'Prefixo deve ter no máximo 10 caracteres')
    .nullish(),
  inicio: z
    .number({ required_error: 'Início é obrigatório' })
    .int('Início deve ser um número inteiro')
    .min(0, 'Início deve ser não-negativo'),
  termino: z
    .number({ required_error: 'Término é obrigatório' })
    .int('Término deve ser um número inteiro')
    .min(0, 'Término deve ser não-negativo'),
  descricao: z.string().max(255, 'Descrição deve ter no máximo 255 caracteres').nullish(),
}).refine(
  (data) => data.termino >= data.inicio,
  { message: 'Término não pode ser menor que o início', path: ['termino'] }
);

// Schema de validação para atualização de setor
export const updateSetorSchema = z.object({
  idInventario: z
    .number()
    .int('ID do inventário deve ser um número inteiro')
    .positive('ID do inventário deve ser positivo')
    .optional(),
  prefixo: z
    .string()
    .max(10, 'Prefixo deve ter no máximo 10 caracteres')
    .nullish(),
  inicio: z
    .number()
    .int('Início deve ser um número inteiro')
    .min(0, 'Início deve ser não-negativo')
    .optional(),
  termino: z
    .number()
    .int('Término deve ser um número inteiro')
    .min(0, 'Término deve ser não-negativo')
    .optional(),
  descricao: z.string().max(255, 'Descrição deve ter no máximo 255 caracteres').nullish(),
});

export type CreateSetorDTO = z.infer<typeof createSetorSchema>;
export type UpdateSetorDTO = z.infer<typeof updateSetorSchema>;

export interface SetorResponseDTO {
  id: number;
  idInventario: number;
  prefixo: string | null;
  inicio: number;
  termino: number;
  descricao: string | null;
  abertoEm: string | null;
}

export function toSetorResponseDTO(setor: Setor): SetorResponseDTO {
  return {
    id: setor.id!,
    idInventario: setor.idInventario,
    prefixo: setor.prefixo,
    inicio: setor.inicio,
    termino: setor.termino,
    descricao: setor.descricao,
    abertoEm: setor.abertoEm?.toISOString() ?? null,
  };
}
