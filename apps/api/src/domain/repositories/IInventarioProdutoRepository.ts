import { InventarioProduto } from '../entities/InventarioProduto.js';
import { PaginatedResult } from './IClientRepository.js';

export interface InventarioProdutoPaginationParams {
  page: number;
  limit: number;
  idInventario: number;
  search?: string;
  divergente?: boolean;
  codigoBarras?: string;
  codigoInterno?: string;
}

export interface IInventarioProdutoRepository {
  create(produto: InventarioProduto): Promise<InventarioProduto>;
  createMany(produtos: InventarioProduto[]): Promise<InventarioProduto[]>;
  findById(id: number): Promise<InventarioProduto | null>;
  findByCodigoBarras(idInventario: number, codigoBarras: string): Promise<InventarioProduto | null>;
  findByCodigoInterno(idInventario: number, codigoInterno: string): Promise<InventarioProduto | null>;
  findByInventario(idInventario: number): Promise<InventarioProduto[]>;
  findDivergentes(idInventario: number): Promise<InventarioProduto[]>;
  findAll(params: InventarioProdutoPaginationParams): Promise<PaginatedResult<InventarioProduto>>;
  update(produto: InventarioProduto): Promise<InventarioProduto>;
  delete(id: number): Promise<void>;
  deleteByInventario(idInventario: number): Promise<void>;
  countByInventario(idInventario: number): Promise<number>;
  countDivergentesByInventario(idInventario: number): Promise<number>;
}
