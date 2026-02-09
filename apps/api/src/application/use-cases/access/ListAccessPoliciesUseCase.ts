import { AccessPolicy } from '../../../domain/entities/AccessPolicy.js';
import { IAccessPolicyRepository } from '../../../domain/repositories/IAccessPolicyRepository.js';

export class ListAccessPoliciesUseCase {
  constructor(private readonly policyRepository: IAccessPolicyRepository) {}

  async execute(): Promise<AccessPolicy[]> {
    return this.policyRepository.findAll();
  }
}
