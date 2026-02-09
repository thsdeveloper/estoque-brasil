import { AccessResource } from '../../../domain/entities/AccessResource.js';
import { IAccessResourceRepository } from '../../../domain/repositories/IAccessResourceRepository.js';

export class ListAccessResourcesUseCase {
  constructor(private readonly resourceRepository: IAccessResourceRepository) {}

  async execute(): Promise<AccessResource[]> {
    return this.resourceRepository.findAll();
  }
}
