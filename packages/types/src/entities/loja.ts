// tb_loja - Loja
export interface Loja {
  id: number;
  idCliente: string; // UUID reference to clients table
  nome: string;
  cnpj: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  uf: string | null;
  municipio: string | null;
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
  idEmpresa?: number;
}
