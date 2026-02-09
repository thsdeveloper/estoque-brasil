// tb_inventario - Inventário
export interface Inventario {
  id: number;
  idLoja: number;
  idEmpresa: number;
  idTemplate: number | null;
  idTemplateExportacao: number | null;
  minimoContagem: number;
  dataInicio: string; // datetime
  dataTermino: string | null; // datetime
  lote: boolean;
  validade: boolean;
  ativo: boolean;
  // Enriched fields (populated in list queries)
  nomeLoja?: string | null;
  cnpjLoja?: string | null;
  nomeCliente?: string | null;
  temContagens?: boolean;
}

export type CreateInventarioInput = Omit<Inventario, 'id'>;
export type UpdateInventarioInput = Partial<CreateInventarioInput>;

export interface InventarioQueryParams {
  page?: number;
  limit?: number;
  idLoja?: number;
  idEmpresa?: number;
  ativo?: boolean;
  dataInicio?: string;
  dataTermino?: string;
  search?: string;
}

// tb_setor - Setor do Inventário
export type SetorStatus = 'pendente' | 'em_contagem' | 'finalizado';

export interface Setor {
  id: number;
  idInventario: number;
  prefixo: string | null;
  inicio: number;
  termino: number;
  descricao: string | null;
  abertoEm: string | null;
  status: SetorStatus;
  idUsuarioContagem: string | null;
}

export type CreateSetorInput = Omit<Setor, 'id' | 'status' | 'idUsuarioContagem'>;
export type UpdateSetorInput = Partial<CreateSetorInput>;

// Stats de contagem por setor (via RPC get_contagem_sector_stats)
export interface SetorContagemStats {
  id: number;
  total_contagens: number;
  total_quantidade: number;
  ultima_contagem: string | null;
}

// tb_inventario_numeracao - Numeração do Inventário
export interface InventarioNumeracao {
  id: number;
  idInventario: number;
  idSetor: number | null;
  descricao: string | null;
  numeracao: number;
  abertoDivergente: boolean;
}

export type CreateInventarioNumeracaoInput = Omit<InventarioNumeracao, 'id'>;
export type UpdateInventarioNumeracaoInput = Partial<CreateInventarioNumeracaoInput>;

// tb_inventario_setor - Setor do Inventário (atribuição)
export type InventarioSetorStatus = 'P' | 'A' | 'F'; // Pendente, Andamento, Finalizado

export interface InventarioSetor {
  id: number;
  idInventario: number;
  idInventarioNumeracao: number;
  usrCodigo: number;
  data: string; // datetime
  ativo: boolean;
  status: InventarioSetorStatus;
  contagem: number;
}

export type CreateInventarioSetorInput = Omit<InventarioSetor, 'id'>;
export type UpdateInventarioSetorInput = Partial<CreateInventarioSetorInput>;
