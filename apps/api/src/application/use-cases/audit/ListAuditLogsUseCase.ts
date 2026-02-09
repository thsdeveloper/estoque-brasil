import { IAuditLogRepository, AuditLogFilters } from '../../../domain/repositories/IAuditLogRepository.js';
import { PaginatedAuditLogResponseDTO, toAuditLogResponseDTO, ListAuditLogsQueryDTO } from '../../dtos/audit/AuditLogDTO.js';

export class ListAuditLogsUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(query: ListAuditLogsQueryDTO): Promise<PaginatedAuditLogResponseDTO> {
    const filters: AuditLogFilters = {};

    if (query.idInventario) filters.idInventario = query.idInventario;
    if (query.idUsuario) filters.idUsuario = query.idUsuario;
    if (query.acao) filters.acao = query.acao;
    if (query.dataInicio) filters.dataInicio = new Date(query.dataInicio);
    if (query.dataFim) filters.dataFim = new Date(query.dataFim);

    const result = await this.auditLogRepository.findAll(filters, query.page, query.limit);

    return {
      data: result.data.map(toAuditLogResponseDTO),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
