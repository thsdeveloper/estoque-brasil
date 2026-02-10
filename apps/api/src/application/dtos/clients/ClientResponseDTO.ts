import { Client } from '../../../domain/entities/Client.js';

export interface ClientResponseDTO {
  id: string;
  nome: string;
  cnpj: string | null;
  fantasia: string | null;
  email: string | null;
  telefone: string | null;
  situacao: string | null;
  idEmpresa: number | null;

  qtdeDivergentePlus: number | null;
  qtdeDivergenteMinus: number | null;
  valorDivergentePlus: number | null;
  valorDivergenteMinus: number | null;
  percentualDivergencia: number | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  uf: string | null;
  municipio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedClientResponseDTO {
  data: ClientResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function toClientResponseDTO(client: Client): ClientResponseDTO {
  return {
    id: client.id!,
    nome: client.nome,
    cnpj: client.cnpj,
    fantasia: client.fantasia,
    email: client.email,
    telefone: client.telefone,
    situacao: client.situacao,
    idEmpresa: client.idEmpresa,

    qtdeDivergentePlus: client.qtdeDivergentePlus,
    qtdeDivergenteMinus: client.qtdeDivergenteMinus,
    valorDivergentePlus: client.valorDivergentePlus,
    valorDivergenteMinus: client.valorDivergenteMinus,
    percentualDivergencia: client.percentualDivergencia,
    cep: client.cep,
    endereco: client.endereco,
    numero: client.numero,
    bairro: client.bairro,
    uf: client.uf,
    municipio: client.municipio,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  };
}
