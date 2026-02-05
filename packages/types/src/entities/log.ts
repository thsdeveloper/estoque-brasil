// tb_log - Log do Sistema
export type TipoLog = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface Log {
  id: number;
  idInventario: number | null;
  data: string; // datetime
  mensagem: string;
  tipo: TipoLog;
  usrCodigo: number | null;
}

export type CreateLogInput = Omit<Log, 'id'>;

export interface LogQueryParams {
  page?: number;
  limit?: number;
  idInventario?: number;
  usrCodigo?: number;
  tipo?: TipoLog;
  dataInicio?: string;
  dataFim?: string;
}
