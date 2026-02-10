import { Loja } from '../../domain/entities/Loja.js';

export interface LojaDbRow {
  id: number;
  id_cliente: string; // UUID reference to clients
  nome: string;
  cnpj: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  uf: string | null;
  municipio: string | null;
  created_at: string;
  updated_at: string;
}

export interface LojaInsertRow {
  id_cliente: string;
  nome: string;
  cnpj?: string | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  uf?: string | null;
  municipio?: string | null;
}

export class LojaMapper {
  static toDomain(row: LojaDbRow): Loja {
    return Loja.create({
      id: row.id,
      idCliente: row.id_cliente,
      nome: row.nome,
      cnpj: row.cnpj,
      cep: row.cep,
      endereco: row.endereco,
      numero: row.numero,
      bairro: row.bairro,
      uf: row.uf,
      municipio: row.municipio,
    });
  }

  static toInsertRow(loja: Loja): LojaInsertRow {
    return {
      id_cliente: loja.idCliente,
      nome: loja.nome,
      cnpj: loja.cnpj,
      cep: loja.cep,
      endereco: loja.endereco,
      numero: loja.numero,
      bairro: loja.bairro,
      uf: loja.uf,
      municipio: loja.municipio,
    };
  }

  static toUpdateRow(loja: Loja): LojaInsertRow & { updated_at: string } {
    return {
      ...this.toInsertRow(loja),
      updated_at: new Date().toISOString(),
    };
  }
}
