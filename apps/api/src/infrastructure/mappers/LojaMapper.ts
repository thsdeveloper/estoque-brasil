import { Loja } from '../../domain/entities/Loja.js';

export interface LojaDbRow {
  id: number;
  id_cliente: string; // UUID reference to clients
  nome: string;
  cnpj: string | null;
  created_at: string;
  updated_at: string;
}

export interface LojaInsertRow {
  id_cliente: string;
  nome: string;
  cnpj?: string | null;
}

export class LojaMapper {
  static toDomain(row: LojaDbRow): Loja {
    return Loja.create({
      id: row.id,
      idCliente: row.id_cliente,
      nome: row.nome,
      cnpj: row.cnpj,
    });
  }

  static toInsertRow(loja: Loja): LojaInsertRow {
    return {
      id_cliente: loja.idCliente,
      nome: loja.nome,
      cnpj: loja.cnpj,
    };
  }

  static toUpdateRow(loja: Loja): LojaInsertRow & { updated_at: string } {
    return {
      ...this.toInsertRow(loja),
      updated_at: new Date().toISOString(),
    };
  }
}
