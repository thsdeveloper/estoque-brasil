import { Setor } from '../../domain/entities/Setor.js';

export interface SetorDbRow {
  id: number;
  id_inventario: number;
  prefixo: string | null;
  inicio: number;
  termino: number;
  descricao: string | null;
  aberto_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface SetorInsertRow {
  id_inventario: number;
  prefixo?: string | null;
  inicio: number;
  termino: number;
  descricao?: string | null;
}

export class SetorMapper {
  static toDomain(row: SetorDbRow): Setor {
    return Setor.create({
      id: row.id,
      idInventario: row.id_inventario,
      prefixo: row.prefixo,
      inicio: row.inicio,
      termino: row.termino,
      descricao: row.descricao,
      abertoEm: row.aberto_em ? new Date(row.aberto_em) : null,
    });
  }

  static toInsertRow(setor: Setor): SetorInsertRow {
    return {
      id_inventario: setor.idInventario,
      prefixo: setor.prefixo,
      inicio: setor.inicio,
      termino: setor.termino,
      descricao: setor.descricao,
    };
  }

  static toUpdateRow(setor: Setor): SetorInsertRow & { aberto_em: string | null; updated_at: string } {
    return {
      ...this.toInsertRow(setor),
      aberto_em: setor.abertoEm?.toISOString() ?? null,
      updated_at: new Date().toISOString(),
    };
  }
}
