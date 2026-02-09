import { AccessAction } from '../../../domain/entities/AccessAction.js';
import { IAccessActionRepository } from '../../../domain/repositories/IAccessActionRepository.js';
import { InvalidAccessActionError, AccessActionAlreadyExistsError } from '../../../domain/errors/AccessErrors.js';
import { CreateAccessActionDTO, createAccessActionSchema } from '../../dtos/access/AccessDTO.js';

export class CreateAccessActionUseCase {
  constructor(private readonly actionRepository: IAccessActionRepository) {}

  async execute(input: CreateAccessActionDTO): Promise<AccessAction> {
    // Validate input
    const validationResult = createAccessActionSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidAccessActionError(validationResult.error.errors[0].message);
    }

    const { name, displayName, description } = validationResult.data;

    // Check if action name already exists
    const existingAction = await this.actionRepository.existsByName(name);
    if (existingAction) {
      throw new AccessActionAlreadyExistsError(name);
    }

    // Create action
    const action = AccessAction.create({
      name,
      displayName,
      description: description ?? null,
      isSystem: false,
    });

    return this.actionRepository.create(action);
  }
}
