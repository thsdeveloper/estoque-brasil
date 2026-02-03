import { Client } from '../entities/Client.js';

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  uf?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IClientRepository {
  create(client: Client): Promise<Client>;
  findById(id: string): Promise<Client | null>;
  findByNome(nome: string): Promise<Client | null>;
  findAll(params: PaginationParams): Promise<PaginatedResult<Client>>;
  update(client: Client): Promise<Client>;
  delete(id: string): Promise<void>;
  existsByNome(nome: string, excludeId?: string): Promise<boolean>;
}
