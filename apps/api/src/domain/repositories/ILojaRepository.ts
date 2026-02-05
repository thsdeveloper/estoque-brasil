import { Loja } from '../entities/Loja.js';
import { PaginatedResult } from './IClientRepository.js';

export interface LojaPaginationParams {
  page: number;
  limit: number;
  search?: string;
  idCliente?: string; // UUID reference to clients
}

export interface ILojaRepository {
  create(loja: Loja): Promise<Loja>;
  findById(id: number): Promise<Loja | null>;
  findByCnpj(cnpj: string): Promise<Loja | null>;
  findByCliente(idCliente: string): Promise<Loja[]>;
  findAll(params: LojaPaginationParams): Promise<PaginatedResult<Loja>>;
  update(loja: Loja): Promise<Loja>;
  delete(id: number): Promise<void>;
  existsByCnpj(cnpj: string, excludeId?: number): Promise<boolean>;
}
