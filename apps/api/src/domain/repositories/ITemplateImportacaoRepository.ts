import { TemplateImportacao, TipoTemplate } from '../entities/TemplateImportacao.js';
import { PaginatedResult } from './IClientRepository.js';

export interface TemplateImportacaoPaginationParams {
  page: number;
  limit: number;
  search?: string;
  tipo?: TipoTemplate;
}

export interface ITemplateImportacaoRepository {
  create(template: TemplateImportacao): Promise<TemplateImportacao>;
  findById(id: number): Promise<TemplateImportacao | null>;
  findByDescricao(descricao: string): Promise<TemplateImportacao | null>;
  findAll(params: TemplateImportacaoPaginationParams): Promise<PaginatedResult<TemplateImportacao>>;
  update(template: TemplateImportacao): Promise<TemplateImportacao>;
  delete(id: number): Promise<void>;
}
