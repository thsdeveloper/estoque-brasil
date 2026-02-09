import { AccessResource } from '../entities/AccessResource.js';

export interface IAccessResourceRepository {
  create(resource: AccessResource): Promise<AccessResource>;
  findById(id: string): Promise<AccessResource | null>;
  findByName(name: string): Promise<AccessResource | null>;
  findAll(): Promise<AccessResource[]>;
  update(resource: AccessResource): Promise<AccessResource>;
  delete(id: string): Promise<void>;
  existsByName(name: string, excludeId?: string): Promise<boolean>;
}
