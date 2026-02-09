import { Role } from '../../../domain/entities/Role.js';
import { IRoleRepository } from '../../../domain/repositories/IRoleRepository.js';
import { RoleNotFoundError, InvalidRoleError } from '../../../domain/errors/UserErrors.js';
import { UpdateRoleDTO, updateRoleSchema } from '../../dtos/roles/RoleDTO.js';

export class UpdateRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string, input: UpdateRoleDTO): Promise<Role> {
    // Validate input
    const validationResult = updateRoleSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidRoleError(validationResult.error.errors[0].message);
    }

    // Find existing role
    const existingRole = await this.roleRepository.findById(id);
    if (!existingRole) {
      throw new RoleNotFoundError(id);
    }

    // Update role properties
    const { displayName, description } = validationResult.data;

    const updatedRole = Role.create({
      id: existingRole.id,
      name: existingRole.name,
      displayName: displayName ?? existingRole.displayName,
      description: description !== undefined ? description : existingRole.description,
      isSystemRole: existingRole.isSystemRole,
      policies: existingRole.policies,
      createdAt: existingRole.createdAt,
    });

    return this.roleRepository.update(updatedRole);
  }
}
