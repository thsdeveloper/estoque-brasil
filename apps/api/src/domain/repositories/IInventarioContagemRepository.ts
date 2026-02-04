import { InventarioContagem } from '../entities/InventarioContagem.js';
import { PaginatedResult } from './IClientRepository.js';

export interface InventarioContagemPaginationParams {
  page: number;
  limit: number;
  idInventarioSetor?: number;
  idProduto?: number;
  divergente?: boolean;
}

export interface IInventarioContagemRepository {
  create(contagem: InventarioContagem): Promise<InventarioContagem>;
  findById(id: number): Promise<InventarioContagem | null>;
  findBySetor(idInventarioSetor: number): Promise<InventarioContagem[]>;
  findByProduto(idProduto: number): Promise<InventarioContagem[]>;
  findDivergentes(idInventarioSetor: number): Promise<InventarioContagem[]>;
  findAll(params: InventarioContagemPaginationParams): Promise<PaginatedResult<InventarioContagem>>;
  update(contagem: InventarioContagem): Promise<InventarioContagem>;
  delete(id: number): Promise<void>;
  deleteBySetor(idInventarioSetor: number): Promise<void>;
  sumQuantidadeByProduto(idProduto: number): Promise<number>;
}
