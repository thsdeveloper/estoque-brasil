// tb_inventario_produto - Produto do Inventário
export interface InventarioProduto {
  id: number; // bigint
  idInventario: number;
  codigoBarras: string | null;
  codigoInterno: string | null;
  descricao: string;
  lote: string | null;
  validade: string | null; // date
  saldo: number;
  custo: number;
  divergente: boolean;
}

export type CreateInventarioProdutoInput = Omit<InventarioProduto, 'id'>;
export type UpdateInventarioProdutoInput = Partial<CreateInventarioProdutoInput>;

export interface InventarioProdutoQueryParams {
  page?: number;
  limit?: number;
  idInventario: number;
  search?: string;
  divergente?: boolean;
  codigoBarras?: string;
  codigoInterno?: string;
}
