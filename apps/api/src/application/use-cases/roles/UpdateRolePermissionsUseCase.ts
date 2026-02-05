import { Role } from '../../../domain/entities/Role.js';
import { IRoleRepository, IPermissionRepository } from '../../../domain/repositories/IRoleRepository.js';
import { RoleNotFoundError, InvalidRoleError } from '../../../domain/errors/UserErrors.js';
import { UpdateRolePermissionsDTO, updateRolePermissionsSchema } from '../../dtos/roles/RoleDTO.js';

export class UpdateRolePermissionsUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository
  ) {}

  async execute(roleId: string, input: UpdateRolePermissionsDTO): Promise<Role> {
    // Validate input
    const validationResult = updateRolePermissionsSchema.safeParse(input);
    if (!validationResult.success) {
      throw new InvalidRoleError(validationResult.error.errors[0].message);
    }

    // Find existing role
    const existingRole = await this.roleRepository.findById(roleId);
    if (!existingRole) {
      throw new RoleNotFoundError(roleId);
    }

    const { permissionIds } = validationResult.data;

    // Verify all permission IDs are valid
    const permissions = await this.permissionRepository.findByIds(permissionIds);
    if (permissions.length !== permissionIds.length) {
      throw new InvalidRoleError('Uma ou mais permissões não foram encontradas');
    }

    // Get current permissions
    const currentPermissionIds = await this.roleRepository.getRolePermissionIds(roleId);

    // Calculate permissions to add and remove
    const permissionsToAdd = permissionIds.filter((id) => !currentPermissionIds.includes(id));
    const permissionsToRemove = currentPermissionIds.filter((id) => !permissionIds.includes(id));

    // Add new permissions
    for (const permissionId of permissionsToAdd) {
      await this.roleRepository.assignPermission(roleId, permissionId);
    }

    // Remove old permissions
    for (const permissionId of permissionsToRemove) {
      await this.roleRepository.removePermission(roleId, permissionId);
    }

    // Return updated role
    const updatedRole = await this.roleRepository.findById(roleId);
    if (!updatedRole) {
      throw new RoleNotFoundError(roleId);
    }

    return updatedRole;
  }
}
