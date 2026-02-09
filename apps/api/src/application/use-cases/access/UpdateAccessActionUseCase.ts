import { AccessAction } from '../../../domain/entities/AccessAction.js';
import { IAccessActionRepository } from '../../../domain/repositories/IAccessActionRepository.js';
import { AccessActionNotFoundError, InvalidAccessActionError } from '../../../domain/errors/AccessErrors.js';
import { UpdateAccessActionDTO, updateAccessActionSchema } from '../../dtos/access/AccessDTO.js';

export class UpdateAccessActionUseCase {
  constructor(private readonly actionRepository: IAccessActionRepository) {}

  async execute(id: string, input: UpdateAccessActionDTO): Promise<AccessAction> {
    // Validate input
    const validationResult = updateAccessActionSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidAccessActionError(validationResult.error.errors[0].message);
    }

    // Find existing action
    const existingAction = await this.actionRepository.findById(id);
    if (!existingAction) {
      throw new AccessActionNotFoundError(id);
    }

    // Update action properties
    const { displayName, description, sortOrder } = validationResult.data;

    existingAction.update({
      displayName,
      description,
      sortOrder,
    });

    return this.actionRepository.update(existingAction);
  }
}
