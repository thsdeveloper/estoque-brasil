import { AccessAction } from '../../../domain/entities/AccessAction.js';
import { IAccessActionRepository } from '../../../domain/repositories/IAccessActionRepository.js';

export class ListAccessActionsUseCase {
  constructor(private readonly actionRepository: IAccessActionRepository) {}

  async execute(): Promise<AccessAction[]> {
    return this.actionRepository.findAll();
  }
}
