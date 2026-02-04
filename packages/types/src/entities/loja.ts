// tb_loja - Loja
export interface Loja {
  id: number;
  idCliente: string; // UUID reference to clients table
  nome: string;
  cnpj: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateLojaInput = Omit<Loja, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLojaInput = Partial<CreateLojaInput>;

export interface LojaQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  idCliente?: string;
}
