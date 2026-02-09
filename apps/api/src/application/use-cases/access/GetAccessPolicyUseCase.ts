import { AccessPolicy } from '../../../domain/entities/AccessPolicy.js';
import { IAccessPolicyRepository } from '../../../domain/repositories/IAccessPolicyRepository.js';
import { AccessPolicyNotFoundError } from '../../../domain/errors/AccessErrors.js';

export class GetAccessPolicyUseCase {
  constructor(private readonly policyRepository: IAccessPolicyRepository) {}

  async execute(id: string): Promise<AccessPolicy> {
    const policy = await this.policyRepository.findById(id);

    if (!policy) {
      throw new AccessPolicyNotFoundError(id);
    }

    return policy;
  }
}
