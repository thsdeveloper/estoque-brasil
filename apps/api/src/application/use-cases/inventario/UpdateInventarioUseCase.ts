import { IInventarioRepository } from '../../../domain/repositories/IInventarioRepository.js';
import { InventarioNotFoundError } from '../../../domain/errors/InventarioErrors.js';
import { UpdateInventarioDTO, InventarioResponseDTO, toInventarioResponseDTO } from '../../dtos/inventario/InventarioDTO.js';

export class UpdateInventarioUseCase {
  constructor(private readonly inventarioRepository: IInventarioRepository) {}

  async execute(id: number, data: UpdateInventarioDTO): Promise<InventarioResponseDTO> {
    const inventario = await this.inventarioRepository.findById(id);

    if (!inventario) {
      throw new InventarioNotFoundError(id);
    }

    inventario.update({
      idLoja: data.idLoja,
      idEmpresa: data.idEmpresa,
      idTemplate: data.idTemplate,
      idTemplateExportacao: data.idTemplateExportacao,
      minimoContagem: data.minimoContagem,
      dataInicio: data.dataInicio ? new Date(data.dataInicio) : undefined,
      dataTermino: data.dataTermino !== undefined
        ? (data.dataTermino ? new Date(data.dataTermino) : null)
        : undefined,
      lote: data.lote,
      validade: data.validade,
      ativo: data.ativo,
    });

    const updatedInventario = await this.inventarioRepository.update(inventario);

    return toInventarioResponseDTO(updatedInventario);
  }
}
