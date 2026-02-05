import { User } from '../entities/User.js';
import { PaginatedResult } from './IClientRepository.js';

export interface UserPaginationParams {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  roleId?: string;
}

export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(params: UserPaginationParams): Promise<PaginatedResult<User>>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  existsByEmail(email: string, excludeId?: string): Promise<boolean>;
  assignRole(userId: string, roleId: string, assignedBy?: string): Promise<void>;
  removeRole(userId: string, roleId: string): Promise<void>;
  getUserRoleIds(userId: string): Promise<string[]>;
  countAdmins(): Promise<number>;
}
