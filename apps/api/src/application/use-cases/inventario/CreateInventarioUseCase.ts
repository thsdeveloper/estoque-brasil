import { Inventario } from '../../../domain/entities/Inventario.js';
import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository.js';
import { InventarioAlreadyActiveError } from '../../../domain/errors/InventarioErrors.js';
import { CreateInventarioDTO, InventarioResponseDTO, toInventarioResponseDTO } from '../../dtos/inventario/InventarioDTO.js';

export class CreateInventarioUseCase {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(data: CreateInventarioDTO): Promise<InventarioResponseDTO> {
    // Verifica se já existe um inventário ativo para a loja
    const existsAtivo = await this.inventarioRepository.existsAtivo(data.idLoja);

    if (existsAtivo) {
      throw new InventarioAlreadyActiveError(data.idLoja);
    }

    const inventario = Inventario.create({
      idLoja: data.idLoja,
      idEmpresa: data.idEmpresa,
      idTemplate: data.idTemplate,
      idTemplateExportacao: data.idTemplateExportacao,
      minimoContagem: data.minimoContagem,
      dataInicio: new Date(data.dataInicio),
      dataTermino: data.dataTermino ? new Date(data.dataTermino) : null,
      lote: data.lote,
      validade: data.validade,
      ativo: data.ativo ?? true,
    });

    const savedInventario = await this.inventarioRepository.create(inventario);

    return toInventarioResponseDTO(savedInventario);
  }
}
