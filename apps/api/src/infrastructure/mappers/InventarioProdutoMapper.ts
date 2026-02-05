import { InventarioProduto } from '../../domain/entities/InventarioProduto.js';

export interface InventarioProdutoDbRow {
  id: number;
  id_inventario: number;
  codigo_barras: string | null;
  codigo_interno: string | null;
  descricao: string;
  lote: string | null;
  validade: string | null;
  saldo: number;
  custo: number;
  divergente: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventarioProdutoInsertRow {
  id_inventario: number;
  codigo_barras?: string | null;
  codigo_interno?: string | null;
  descricao: string;
  lote?: string | null;
  validade?: string | null;
  saldo?: number;
  custo?: number;
  divergente?: boolean;
}

export class InventarioProdutoMapper {
  static toDomain(row: InventarioProdutoDbRow): InventarioProduto {
    return InventarioProduto.create({
      id: row.id,
      idInventario: row.id_inventario,
      codigoBarras: row.codigo_barras,
      codigoInterno: row.codigo_interno,
      descricao: row.descricao,
      lote: row.lote,
      validade: row.validade ? new Date(row.validade) : null,
      saldo: row.saldo,
      custo: row.custo,
      divergente: row.divergente,
    });
  }

  static toInsertRow(produto: InventarioProduto): InventarioProdutoInsertRow {
    return {
      id_inventario: produto.idInventario,
      codigo_barras: produto.codigoBarras,
      codigo_interno: produto.codigoInterno,
      descricao: produto.descricao,
      lote: produto.lote,
      validade: produto.validade?.toISOString().split('T')[0] ?? null,
      saldo: produto.saldo,
      custo: produto.custo,
      divergente: produto.divergente,
    };
  }

  static toUpdateRow(produto: InventarioProduto): InventarioProdutoInsertRow & { updated_at: string } {
    return {
      ...this.toInsertRow(produto),
      updated_at: new Date().toISOString(),
    };
  }
}
