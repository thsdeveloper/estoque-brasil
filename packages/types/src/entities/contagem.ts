// tb_inventario_contagem - Contagem do Inventário
export interface InventarioContagem {
  id: number; // bigint
  idInventarioSetor: number;
  idProduto: number; // bigint
  data: string; // datetime
  lote: string | null;
  validade: string | null; // date
  quantidade: number;
  divergente: boolean;
}

export type CreateInventarioContagemInput = Omit<InventarioContagem, 'id'>;
export type UpdateInventarioContagemInput = Partial<CreateInventarioContagemInput>;

export interface InventarioContagemQueryParams {
  page?: number;
  limit?: number;
  idInventarioSetor?: number;
  idProduto?: number;
  divergente?: boolean;
}

// tb_alteracao_contagem - Alterações de Contagem
export interface AlteracaoContagem {
  id: number;
  idInventarioContagem: number; // bigint
  idInventario: number;
  qtdeAntes: number;
  qtdeDepois: number;
  alteracao: string; // datetime
}

export type CreateAlteracaoContagemInput = Omit<AlteracaoContagem, 'id'>;

// tb_inventario_recontagem - Recontagem do Inventário
export interface InventarioRecontagem {
  id: number;
  idInventario: number;
  idInventarioNumeracao: number;
  ativo: boolean;
  auditoria: boolean;
}

export type CreateInventarioRecontagemInput = Omit<InventarioRecontagem, 'id'>;
export type UpdateInventarioRecontagemInput = Partial<CreateInventarioRecontagemInput>;
