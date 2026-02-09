import { Permission } from '../../../domain/entities/Permission.js';
import { IPermissionRepository } from '../../../domain/repositories/IRoleRepository.js';
import { IAccessResourceRepository } from '../../../domain/repositories/IAccessResourceRepository.js';

export interface PermissionsByResource {
  resource: string;
  resourceDisplayName: string;
  permissions: Permission[];
}

const RESOURCE_DISPLAY_NAMES: Record<string, string> = {
  usuarios: 'Usuários',
  inventarios: 'Inventários',
  clients: 'Clientes',
  empresas: 'Empresas',
  lojas: 'Lojas',
  contagens: 'Contagens',
  setores: 'Setores',
  produtos: 'Produtos',
  templates: 'Templates',
};

export class ListPermissionsUseCase {
  constructor(
    private readonly permissionRepository: IPermissionRepository,
    private readonly resourceRepository?: IAccessResourceRepository,
  ) {}

  async execute(): Promise<Permission[]> {
    return this.permissionRepository.findAll();
  }

  async executeGroupedByResource(): Promise<PermissionsByResource[]> {
    const permissions = await this.permissionRepository.findAll();

    // Build display names dynamically if resource repository available
    let displayNames: Record<string, string> = RESOURCE_DISPLAY_NAMES;
    if (this.resourceRepository) {
      const resources = await this.resourceRepository.findAll();
      displayNames = {};
      for (const r of resources) {
        displayNames[r.name] = r.displayName;
      }
    }

    // Group by resource
    const grouped = permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
      const resource = permission.resource;
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    }, {});

    // Convert to array and sort
    return Object.entries(grouped)
      .map(([resource, perms]) => ({
        resource,
        resourceDisplayName: displayNames[resource] || resource,
        permissions: perms.sort((a, b) => {
          const actionOrder = ['read', 'create', 'update', 'delete'];
          return actionOrder.indexOf(a.action) - actionOrder.indexOf(b.action);
        }),
      }))
      .sort((a, b) => a.resourceDisplayName.localeCompare(b.resourceDisplayName));
  }
}
