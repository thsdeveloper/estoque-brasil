import { IRoleRepository } from '../../../domain/repositories/IRoleRepository.js';
import { RoleNotFoundError } from '../../../domain/errors/UserErrors.js';
import { InvalidAccessPolicyError } from '../../../domain/errors/AccessErrors.js';
import { SetRolePoliciesDTO, setRolePoliciesSchema } from '../../dtos/access/AccessDTO.js';

export class SetRolePoliciesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(roleId: string, input: SetRolePoliciesDTO): Promise<void> {
    // Validate input
    const validationResult = setRolePoliciesSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidAccessPolicyError(validationResult.error.errors[0].message);
    }

    // Find existing role
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new RoleNotFoundError(roleId);
    }

    const { policyIds } = validationResult.data;

    await this.roleRepository.setPolicies(roleId, policyIds);
  }
}
