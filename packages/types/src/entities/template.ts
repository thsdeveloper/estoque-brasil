// tb_template_importacao - Template de Importação
export type TipoTemplate = 'CSV' | 'TXT' | 'XLS';
export type TipoSaldo = 'Q' | 'V' | 'A'; // Quantidade, Valor, Ambos

export interface TemplateImportacao {
  id: number;
  descricao: string;
  delimitador: string;
  tipo: TipoTemplate;
  tipoSaldo: TipoSaldo;
}

export type CreateTemplateImportacaoInput = Omit<TemplateImportacao, 'id'>;
export type UpdateTemplateImportacaoInput = Partial<CreateTemplateImportacaoInput>;

// tb_template_exportacao - Template de Exportação
export interface TemplateExportacao {
  id: number;
  descricao: string;
  delimitador: string;
  tipo: TipoTemplate;
}

export type CreateTemplateExportacaoInput = Omit<TemplateExportacao, 'id'>;
export type UpdateTemplateExportacaoInput = Partial<CreateTemplateExportacaoInput>;

// tb_campo - Campo do Template
export type TipoCampo = 'T' | 'N' | 'D'; // Texto, Numérico, Data

export interface Campo {
  id: number;
  campo: string;
  tipo: TipoCampo;
  contagem: boolean;
  bancoDados: boolean;
}

export type CreateCampoInput = Omit<Campo, 'id'>;
export type UpdateCampoInput = Partial<CreateCampoInput>;

// tb_template_campo - Mapeamento de Campo do Template de Importação
export interface TemplateCampo {
  id: number;
  idTemplate: number;
  idCampo: number;
  inicio: number;
  termino: number;
  ordem: number;
}

export type CreateTemplateCampoInput = Omit<TemplateCampo, 'id'>;
export type UpdateTemplateCampoInput = Partial<CreateTemplateCampoInput>;

// tb_template_campo_exportacao - Mapeamento de Campo do Template de Exportação
export interface TemplateCampoExportacao {
  id: number;
  idTemplate: number;
  idCampo: number;
  inicio: number;
  termino: number;
  ordem: number;
}

export type CreateTemplateCampoExportacaoInput = Omit<TemplateCampoExportacao, 'id'>;
export type UpdateTemplateCampoExportacaoInput = Partial<CreateTemplateCampoExportacaoInput>;

export interface TemplateQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  tipo?: TipoTemplate;
}
