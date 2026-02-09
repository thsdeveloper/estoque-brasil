import { AccessResource } from '../../../domain/entities/AccessResource.js';
import { IAccessResourceRepository } from '../../../domain/repositories/IAccessResourceRepository.js';
import { InvalidAccessResourceError, AccessResourceAlreadyExistsError } from '../../../domain/errors/AccessErrors.js';
import { CreateAccessResourceDTO, createAccessResourceSchema } from '../../dtos/access/AccessDTO.js';

export class CreateAccessResourceUseCase {
  constructor(private readonly resourceRepository: IAccessResourceRepository) {}

  async execute(input: CreateAccessResourceDTO): Promise<AccessResource> {
    // Validate input
    const validationResult = createAccessResourceSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidAccessResourceError(validationResult.error.errors[0].message);
    }

    const { name, displayName, description, icon } = validationResult.data;

    // Check if resource name already exists
    const existingResource = await this.resourceRepository.existsByName(name);
    if (existingResource) {
      throw new AccessResourceAlreadyExistsError(name);
    }

    // Create resource
    const resource = AccessResource.create({
      name,
      displayName,
      description: description ?? null,
      icon: icon ?? null,
      isSystem: false,
    });

    return this.resourceRepository.create(resource);
  }
}
