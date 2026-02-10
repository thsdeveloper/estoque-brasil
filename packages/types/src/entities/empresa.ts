// tb_empresa - Empresa
export interface Empresa {
  id: number;
  descricao: string | null;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  codigoUf: string | null;
  codigoMunicipio: string | null;
  ativo: boolean;
}

export type CreateEmpresaInput = Omit<Empresa, 'id'>;
export type UpdateEmpresaInput = Partial<CreateEmpresaInput>;

export interface EmpresaQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  ativo?: boolean;
}
