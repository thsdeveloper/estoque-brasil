import { AccessPolicy } from '../../../domain/entities/AccessPolicy.js';
import { IAccessPolicyRepository } from '../../../domain/repositories/IAccessPolicyRepository.js';
import { AccessPolicyNotFoundError, InvalidAccessPolicyError } from '../../../domain/errors/AccessErrors.js';
import { UpdateAccessPolicyDTO, updateAccessPolicySchema } from '../../dtos/access/AccessDTO.js';

export class UpdateAccessPolicyUseCase {
  constructor(private readonly policyRepository: IAccessPolicyRepository) {}

  async execute(id: string, input: UpdateAccessPolicyDTO): Promise<AccessPolicy> {
    // Validate input
    const validationResult = updateAccessPolicySchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidAccessPolicyError(validationResult.error.errors[0].message);
    }

    // Find existing policy
    const existingPolicy = await this.policyRepository.findById(id);
    if (!existingPolicy) {
      throw new AccessPolicyNotFoundError(id);
    }

    // Update policy properties
    const { displayName, description, icon } = validationResult.data;

    existingPolicy.update({
      displayName,
      description,
      icon,
    });

    return this.policyRepository.update(existingPolicy);
  }
}
