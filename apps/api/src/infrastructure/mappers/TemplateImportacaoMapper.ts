import { TemplateImportacao, TipoTemplate, TipoSaldo } from '../../domain/entities/TemplateImportacao.js';

export interface TemplateImportacaoDbRow {
  id: number;
  descricao: string;
  delimitador: string;
  tipo: TipoTemplate;
  tipo_saldo: TipoSaldo;
  created_at: string;
  updated_at: string;
}

export interface TemplateImportacaoInsertRow {
  descricao: string;
  delimitador?: string;
  tipo?: TipoTemplate;
  tipo_saldo?: TipoSaldo;
}

export class TemplateImportacaoMapper {
  static toDomain(row: TemplateImportacaoDbRow): TemplateImportacao {
    return TemplateImportacao.create({
      id: row.id,
      descricao: row.descricao,
      delimitador: row.delimitador,
      tipo: row.tipo,
      tipoSaldo: row.tipo_saldo,
    });
  }

  static toInsertRow(template: TemplateImportacao): TemplateImportacaoInsertRow {
    return {
      descricao: template.descricao,
      delimitador: template.delimitador,
      tipo: template.tipo,
      tipo_saldo: template.tipoSaldo,
    };
  }

  static toUpdateRow(template: TemplateImportacao): TemplateImportacaoInsertRow & { updated_at: string } {
    return {
      ...this.toInsertRow(template),
      updated_at: new Date().toISOString(),
    };
  }
}
