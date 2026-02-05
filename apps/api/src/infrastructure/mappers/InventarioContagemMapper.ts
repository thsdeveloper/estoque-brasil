import { InventarioContagem } from '../../domain/entities/InventarioContagem.js';

export interface InventarioContagemDbRow {
  id: number;
  id_inventario_setor: number;
  id_produto: number;
  data: string;
  lote: string | null;
  validade: string | null;
  quantidade: number;
  divergente: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventarioContagemInsertRow {
  id_inventario_setor: number;
  id_produto: number;
  data: string;
  lote?: string | null;
  validade?: string | null;
  quantidade: number;
  divergente?: boolean;
}

export class InventarioContagemMapper {
  static toDomain(row: InventarioContagemDbRow): InventarioContagem {
    return InventarioContagem.create({
      id: row.id,
      idInventarioSetor: row.id_inventario_setor,
      idProduto: row.id_produto,
      data: new Date(row.data),
      lote: row.lote,
      validade: row.validade ? new Date(row.validade) : null,
      quantidade: row.quantidade,
      divergente: row.divergente,
    });
  }

  static toInsertRow(contagem: InventarioContagem): InventarioContagemInsertRow {
    return {
      id_inventario_setor: contagem.idInventarioSetor,
      id_produto: contagem.idProduto,
      data: contagem.data.toISOString(),
      lote: contagem.lote,
      validade: contagem.validade?.toISOString().split('T')[0] ?? null,
      quantidade: contagem.quantidade,
      divergente: contagem.divergente,
    };
  }

  static toUpdateRow(contagem: InventarioContagem): InventarioContagemInsertRow & { updated_at: string } {
    return {
      ...this.toInsertRow(contagem),
      updated_at: new Date().toISOString(),
    };
  }
}
