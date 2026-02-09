import { AccessPolicy } from '../entities/AccessPolicy.js';

export interface IAccessPolicyRepository {
  create(policy: AccessPolicy): Promise<AccessPolicy>;
  findById(id: string): Promise<AccessPolicy | null>;
  findByName(name: string): Promise<AccessPolicy | null>;
  findAll(): Promise<AccessPolicy[]>;
  update(policy: AccessPolicy): Promise<AccessPolicy>;
  delete(id: string): Promise<void>;
  existsByName(name: string, excludeId?: string): Promise<boolean>;
  setPermissions(policyId: string, permissionIds: string[]): Promise<void>;
  getPermissionIds(policyId: string): Promise<string[]>;
}
