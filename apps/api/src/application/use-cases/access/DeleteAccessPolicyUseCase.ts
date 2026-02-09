import { IAccessPolicyRepository } from '../../../domain/repositories/IAccessPolicyRepository.js';
import {
  AccessPolicyNotFoundError,
  CannotDeleteSystemPolicyError,
} from '../../../domain/errors/AccessErrors.js';

export class DeleteAccessPolicyUseCase {
  constructor(private readonly policyRepository: IAccessPolicyRepository) {}

  async execute(id: string): Promise<void> {
    // Find existing policy
    const existingPolicy = await this.policyRepository.findById(id);
    if (!existingPolicy) {
      throw new AccessPolicyNotFoundError(id);
    }

    // Cannot delete system policies
    if (existingPolicy.isSystemPolicy) {
      throw new CannotDeleteSystemPolicyError(existingPolicy.name);
    }

    await this.policyRepository.delete(id);
  }
}
