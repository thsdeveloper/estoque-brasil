import { AccessPolicy } from '../../../domain/entities/AccessPolicy.js';
import { IAccessPolicyRepository } from '../../../domain/repositories/IAccessPolicyRepository.js';
import { InvalidAccessPolicyError, AccessPolicyAlreadyExistsError } from '../../../domain/errors/AccessErrors.js';
import { CreateAccessPolicyDTO, createAccessPolicySchema } from '../../dtos/access/AccessDTO.js';

export class CreateAccessPolicyUseCase {
  constructor(private readonly policyRepository: IAccessPolicyRepository) {}

  async execute(input: CreateAccessPolicyDTO): Promise<AccessPolicy> {
    // Validate input
    const validationResult = createAccessPolicySchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidAccessPolicyError(validationResult.error.errors[0].message);
    }

    const { name, displayName, description, icon } = validationResult.data;

    // Check if policy name already exists
    const existingPolicy = await this.policyRepository.existsByName(name);
    if (existingPolicy) {
      throw new AccessPolicyAlreadyExistsError(name);
    }

    // Create policy
    const policy = AccessPolicy.create({
      name,
      displayName,
      description: description ?? null,
      icon: icon ?? null,
      isSystemPolicy: false,
      permissions: [],
    });

    return this.policyRepository.create(policy);
  }
}
