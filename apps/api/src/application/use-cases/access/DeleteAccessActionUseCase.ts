import { IAccessActionRepository } from '../../../domain/repositories/IAccessActionRepository.js';
import {
  AccessActionNotFoundError,
  CannotDeleteSystemActionError,
} from '../../../domain/errors/AccessErrors.js';

export class DeleteAccessActionUseCase {
  constructor(private readonly actionRepository: IAccessActionRepository) {}

  async execute(id: string): Promise<void> {
    // Find existing action
    const existingAction = await this.actionRepository.findById(id);
    if (!existingAction) {
      throw new AccessActionNotFoundError(id);
    }

    // Cannot delete system actions
    if (existingAction.isSystem) {
      throw new CannotDeleteSystemActionError(existingAction.name);
    }

    await this.actionRepository.delete(id);
  }
}
