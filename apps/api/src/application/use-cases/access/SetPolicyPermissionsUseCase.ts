import { IAccessPolicyRepository } from '../../../domain/repositories/IAccessPolicyRepository.js';
import { AccessPolicyNotFoundError, InvalidAccessPolicyError } from '../../../domain/errors/AccessErrors.js';
import { SetPolicyPermissionsDTO, setPolicyPermissionsSchema } from '../../dtos/access/AccessDTO.js';

export class SetPolicyPermissionsUseCase {
  constructor(private readonly policyRepository: IAccessPolicyRepository) {}

  async execute(policyId: string, input: SetPolicyPermissionsDTO): Promise<void> {
    // Validate input
    const validationResult = setPolicyPermissionsSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidAccessPolicyError(validationResult.error.errors[0].message);
    }

    // Find existing policy
    const existingPolicy = await this.policyRepository.findById(policyId);
    if (!existingPolicy) {
      throw new AccessPolicyNotFoundError(policyId);
    }

    const { permissionIds } = validationResult.data;

    await this.policyRepository.setPermissions(policyId, permissionIds);
  }
}
