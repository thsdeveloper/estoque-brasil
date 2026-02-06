import { Inventario } from '../entities/Inventario.js';
import { PaginatedResult } from './IClientRepository.js';

export interface InventarioPaginationParams {
  page: number;
  limit: number;
  idLoja?: number;
  idEmpresa?: number;
  ativo?: boolean;
  dataInicio?: Date;
  dataTermino?: Date;
  search?: string;
}

export interface IInventarioRepository {
  create(inventario: Inventario): Promise<Inventario>;
  findById(id: number): Promise<Inventario | null>;
  findByLoja(idLoja: number): Promise<Inventario[]>;
  findByEmpresa(idEmpresa: number): Promise<Inventario[]>;
  findAtivo(idLoja: number): Promise<Inventario | null>;
  findAll(params: InventarioPaginationParams): Promise<PaginatedResult<Inventario>>;
  update(inventario: Inventario): Promise<Inventario>;
  delete(id: number): Promise<void>;
  existsAtivo(idLoja: number, excludeId?: number): Promise<boolean>;
  hasContagens(inventarioId: number): Promise<boolean>;
  getInventariosComContagens(ids: number[]): Promise<Set<number>>;
}
