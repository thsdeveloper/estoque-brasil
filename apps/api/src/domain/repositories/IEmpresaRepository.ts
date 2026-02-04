import { Empresa } from '../entities/Empresa.js';
import { PaginationParams, PaginatedResult } from './IClientRepository.js';

export interface EmpresaPaginationParams extends Omit<PaginationParams, 'uf'> {
  ativo?: boolean;
}

export interface IEmpresaRepository {
  create(empresa: Empresa): Promise<Empresa>;
  findById(id: number): Promise<Empresa | null>;
  findByCnpj(cnpj: string): Promise<Empresa | null>;
  findAll(params: EmpresaPaginationParams): Promise<PaginatedResult<Empresa>>;
  update(empresa: Empresa): Promise<Empresa>;
  delete(id: number): Promise<void>;
  existsByCnpj(cnpj: string, excludeId?: number): Promise<boolean>;
}
