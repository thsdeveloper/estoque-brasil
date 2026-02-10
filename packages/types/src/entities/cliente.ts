// tb_cliente - Cliente
export interface Cliente {
  id: number;
  cnpj: string | null;
  razaoSocial: string | null;
  nomeFantasia: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  bairro: string | null;
  codigoUf: string | null;
  codigoMunicipio: string | null;
  idEmpresa: number;

}

export type CreateClienteInput = Omit<Cliente, 'id'>;
export type UpdateClienteInput = Partial<CreateClienteInput>;

export interface ClienteQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  idEmpresa?: number;
  codigoUf?: string;
}
