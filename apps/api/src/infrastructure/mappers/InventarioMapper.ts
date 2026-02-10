import { Inventario } from '../../domain/entities/Inventario.js';

export interface InventarioDbRow {
  id: number;
  id_loja: number;
  id_empresa: number;
  minimo_contagem: number;
  data_inicio: string;
  data_termino: string | null;
  lote: boolean;
  validade: boolean;
  ativo: boolean;
  lider: string | null;
  created_at: string;
  updated_at: string;
  // Enriched nested data from joins
  lojas?: {
    nome: string | null;
    cnpj: string | null;
    clients: {
      nome: string | null;
    } | null;
  } | null;
  user_profiles?: {
    full_name: string | null;
  } | null;
}

export interface InventarioInsertRow {
  id_loja: number;
  id_empresa: number;
  minimo_contagem?: number;
  data_inicio: string;
  data_termino?: string | null;
  lote?: boolean;
  validade?: boolean;
  ativo?: boolean;
  lider?: string | null;
}

export class InventarioMapper {
  static toDomain(row: InventarioDbRow): Inventario {
    return Inventario.create({
      id: row.id,
      idLoja: row.id_loja,
      idEmpresa: row.id_empresa,
      minimoContagem: row.minimo_contagem,
      dataInicio: new Date(row.data_inicio),
      dataTermino: row.data_termino ? new Date(row.data_termino) : null,
      lote: row.lote,
      validade: row.validade,
      ativo: row.ativo,
      lider: row.lider,
      nomeLoja: row.lojas?.nome ?? null,
      cnpjLoja: row.lojas?.cnpj ?? null,
      nomeCliente: row.lojas?.clients?.nome ?? null,
      liderNome: row.user_profiles?.full_name ?? null,
    });
  }

  static toInsertRow(inventario: Inventario): InventarioInsertRow {
    return {
      id_loja: inventario.idLoja,
      id_empresa: inventario.idEmpresa,
      minimo_contagem: inventario.minimoContagem,
      data_inicio: inventario.dataInicio.toISOString(),
      data_termino: inventario.dataTermino?.toISOString() ?? null,
      lote: inventario.lote,
      validade: inventario.validade,
      ativo: inventario.ativo,
      lider: inventario.lider,
    };
  }

  static toUpdateRow(inventario: Inventario): InventarioInsertRow & { updated_at: string } {
    return {
      ...this.toInsertRow(inventario),
      updated_at: new Date().toISOString(),
    };
  }
}
