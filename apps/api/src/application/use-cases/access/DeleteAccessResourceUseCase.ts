import { IAccessResourceRepository } from '../../../domain/repositories/IAccessResourceRepository.js';
import {
  AccessResourceNotFoundError,
  CannotDeleteSystemResourceError,
} from '../../../domain/errors/AccessErrors.js';

export class DeleteAccessResourceUseCase {
  constructor(private readonly resourceRepository: IAccessResourceRepository) {}

  async execute(id: string): Promise<void> {
    // Find existing resource
    const existingResource = await this.resourceRepository.findById(id);
    if (!existingResource) {
      throw new AccessResourceNotFoundError(id);
    }

    // Cannot delete system resources
    if (existingResource.isSystem) {
      throw new CannotDeleteSystemResourceError(existingResource.name);
    }

    await this.resourceRepository.delete(id);
  }
}
