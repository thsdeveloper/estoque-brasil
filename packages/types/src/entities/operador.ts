// tb_inventario_operador - Operador do Inventário
export interface InventarioOperador {
  idInventario: number;
  usrCodigo: number;
  multiplo: boolean;
  auditoria: boolean;
}

export type CreateInventarioOperadorInput = InventarioOperador;
export type UpdateInventarioOperadorInput = Partial<Omit<InventarioOperador, 'idInventario' | 'usrCodigo'>>;

// tb_inventario_operador_setor - Setor do Operador
export interface InventarioOperadorSetor {
  id: number;
  idInventario: number;
  usrCodigo: number;
  idInventarioNumeracao: number;
  inclusaoPainel: boolean;
}

export type CreateInventarioOperadorSetorInput = Omit<InventarioOperadorSetor, 'id'>;
export type UpdateInventarioOperadorSetorInput = Partial<CreateInventarioOperadorSetorInput>;

export interface OperadorQueryParams {
  idInventario: number;
  usrCodigo?: number;
}
