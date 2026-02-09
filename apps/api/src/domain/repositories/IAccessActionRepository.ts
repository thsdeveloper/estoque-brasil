import { AccessAction } from '../entities/AccessAction.js';

export interface IAccessActionRepository {
  create(action: AccessAction): Promise<AccessAction>;
  findById(id: string): Promise<AccessAction | null>;
  findByName(name: string): Promise<AccessAction | null>;
  findAll(): Promise<AccessAction[]>;
  update(action: AccessAction): Promise<AccessAction>;
  delete(id: string): Promise<void>;
  existsByName(name: string, excludeId?: string): Promise<boolean>;
}
