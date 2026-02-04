// tb_historico_exportacao - Histórico de Exportação
export interface HistoricoExportacao {
  id: number;
  idInventario: number;
  idTemplateExportacao: number;
  usrCodigo: number;
  idCliente: number;
  data: string; // datetime
}

export type CreateHistoricoExportacaoInput = Omit<HistoricoExportacao, 'id'>;

export interface HistoricoExportacaoQueryParams {
  page?: number;
  limit?: number;
  idInventario?: number;
  idCliente?: number;
  usrCodigo?: number;
  dataInicio?: string;
  dataFim?: string;
}
