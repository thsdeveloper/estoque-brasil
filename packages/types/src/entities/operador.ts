// inventarios_operadores - Operador do Inventário
export interface InventarioOperador {
  idInventario: number;
  userId: string;        // UUID do auth.users
  multiplo: boolean;
  auditoria: boolean;
  createdAt?: string;
  // Campos populados via join (para exibição)
  fullName?: string;
  email?: string;
}

export type CreateInventarioOperadorInput = {
  userId: string;
  multiplo?: boolean;
  auditoria?: boolean;
};

export type UpdateInventarioOperadorInput = Partial<Omit<CreateInventarioOperadorInput, 'userId'>>;

export type BatchAddOperadoresInput = {
  operadores: CreateInventarioOperadorInput[];
};

export type BatchAddOperadoresResult = {
  added: number;
};

export type BatchRemoveOperadoresInput = {
  userIds: string[];
};

export type BatchRemoveOperadoresResult = {
  removed: number;
};

export interface OperadorQueryParams {
  idInventario: number;
  userId?: string;
  page?: number;
  limit?: number;
  search?: string;
}
