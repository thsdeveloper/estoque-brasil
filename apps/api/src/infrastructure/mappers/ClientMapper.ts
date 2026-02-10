import { Client } from '../../domain/entities/Client.js';

export interface ClientDbRow {
  id: string;
  nome: string;
  cnpj: string | null;
  fantasia: string | null;
  email: string | null;
  telefone: string | null;
  situacao: string | null;
  id_empresa: number | null;

  qtde_divergente_plus: number | null;
  qtde_divergente_minus: number | null;
  valor_divergente_plus: number | null;
  valor_divergente_minus: number | null;
  percentual_divergencia: number | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  uf: string | null;
  municipio: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientInsertRow {
  nome: string;
  cnpj?: string | null;
  fantasia?: string | null;
  email?: string | null;
  telefone?: string | null;
  situacao?: string | null;
  id_empresa?: number | null;

  qtde_divergente_plus?: number | null;
  qtde_divergente_minus?: number | null;
  valor_divergente_plus?: number | null;
  valor_divergente_minus?: number | null;
  percentual_divergencia?: number | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  uf?: string | null;
  municipio?: string | null;
}

export class ClientMapper {
  static toDomain(row: ClientDbRow): Client {
    return Client.create({
      id: row.id,
      nome: row.nome,
      cnpj: row.cnpj,
      fantasia: row.fantasia,
      email: row.email,
      telefone: row.telefone,
      situacao: row.situacao,
      idEmpresa: row.id_empresa,

      qtdeDivergentePlus: row.qtde_divergente_plus,
      qtdeDivergenteMinus: row.qtde_divergente_minus,
      valorDivergentePlus: row.valor_divergente_plus,
      valorDivergenteMinus: row.valor_divergente_minus,
      percentualDivergencia: row.percentual_divergencia,
      cep: row.cep,
      endereco: row.endereco,
      numero: row.numero,
      bairro: row.bairro,
      uf: row.uf,
      municipio: row.municipio,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  static toInsertRow(client: Client): ClientInsertRow {
    return {
      nome: client.nome,
      cnpj: client.cnpj,
      fantasia: client.fantasia,
      email: client.email,
      telefone: client.telefone,
      situacao: client.situacao,
      id_empresa: client.idEmpresa,

      qtde_divergente_plus: client.qtdeDivergentePlus,
      qtde_divergente_minus: client.qtdeDivergenteMinus,
      valor_divergente_plus: client.valorDivergentePlus,
      valor_divergente_minus: client.valorDivergenteMinus,
      percentual_divergencia: client.percentualDivergencia,
      cep: client.cep,
      endereco: client.endereco,
      numero: client.numero,
      bairro: client.bairro,
      uf: client.uf,
      municipio: client.municipio,
    };
  }

  static toUpdateRow(client: Client): Partial<ClientInsertRow> & { updated_at: string } {
    return {
      nome: client.nome,
      cnpj: client.cnpj,
      fantasia: client.fantasia,
      email: client.email,
      telefone: client.telefone,
      situacao: client.situacao,
      id_empresa: client.idEmpresa,

      qtde_divergente_plus: client.qtdeDivergentePlus,
      qtde_divergente_minus: client.qtdeDivergenteMinus,
      valor_divergente_plus: client.valorDivergentePlus,
      valor_divergente_minus: client.valorDivergenteMinus,
      percentual_divergencia: client.percentualDivergencia,
      cep: client.cep,
      endereco: client.endereco,
      numero: client.numero,
      bairro: client.bairro,
      uf: client.uf,
      municipio: client.municipio,
      updated_at: new Date().toISOString(),
    };
  }
}
