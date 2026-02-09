import { AccessResource } from '../../../domain/entities/AccessResource.js';
import { IAccessResourceRepository } from '../../../domain/repositories/IAccessResourceRepository.js';
import { AccessResourceNotFoundError, InvalidAccessResourceError } from '../../../domain/errors/AccessErrors.js';
import { UpdateAccessResourceDTO, updateAccessResourceSchema } from '../../dtos/access/AccessDTO.js';

export class UpdateAccessResourceUseCase {
  constructor(private readonly resourceRepository: IAccessResourceRepository) {}

  async execute(id: string, input: UpdateAccessResourceDTO): Promise<AccessResource> {
    // Validate input
    const validationResult = updateAccessResourceSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidAccessResourceError(validationResult.error.errors[0].message);
    }

    // Find existing resource
    const existingResource = await this.resourceRepository.findById(id);
    if (!existingResource) {
      throw new AccessResourceNotFoundError(id);
    }

    // Update resource properties
    const { displayName, description, icon, sortOrder } = validationResult.data;

    existingResource.update({
      displayName,
      description,
      icon,
      sortOrder,
    });

    return this.resourceRepository.update(existingResource);
  }
}
