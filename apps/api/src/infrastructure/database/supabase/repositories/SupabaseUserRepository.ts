import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '../../../../domain/entities/User.js';
import {
  IUserRepository,
  UserPaginationParams,
  PaginatedResult,
} from '../../../../domain/repositories/IUserRepository.js';
import {
  UserMapper,
  UserProfileDbRow,
  UserWithRolesDbRow,
} from '../../../mappers/UserMapper.js';

const USER_PROFILES_TABLE = 'user_profiles';
const USER_ROLES_TABLE = 'user_roles';

const USER_WITH_ROLES_SELECT = `
  *,
  user_roles!user_roles_user_id_fkey (
    role:roles (
      *,
      role_permissions (
        permission:permissions (*)
      )
    )
  )
`;

export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async create(user: User): Promise<User> {
    const insertData = UserMapper.toInsertRow(user);

    const { data, error } = await this.supabase
      .from(USER_PROFILES_TABLE)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return UserMapper.toDomain(data as UserProfileDbRow, []);
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(USER_PROFILES_TABLE)
      .select(USER_WITH_ROLES_SELECT)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data ? UserMapper.toDomainWithRoles(data as UserWithRolesDbRow) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(USER_PROFILES_TABLE)
      .select(USER_WITH_ROLES_SELECT)
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find user by email: ${error.message}`);
    }

    return data ? UserMapper.toDomainWithRoles(data as UserWithRolesDbRow) : null;
  }

  async findAll(params: UserPaginationParams): Promise<PaginatedResult<User>> {
    const { page, limit, search, isActive, roleId } = params;
    const offset = (page - 1) * limit;

    // Build count query with filters
    let countQuery = this.supabase
      .from(USER_PROFILES_TABLE)
      .select('*', { count: 'exact', head: true });

    if (search) {
      countQuery = countQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (isActive !== undefined) {
      countQuery = countQuery.eq('is_active', isActive);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw new Error(`Failed to count users: ${countError.message}`);
    }

    const total = count ?? 0;

    // Build data query with filters
    let dataQuery = this.supabase
      .from(USER_PROFILES_TABLE)
      .select(USER_WITH_ROLES_SELECT);

    if (search) {
      dataQuery = dataQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (isActive !== undefined) {
      dataQuery = dataQuery.eq('is_active', isActive);
    }

    const { data, error } = await dataQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    let users = (data as UserWithRolesDbRow[]).map(UserMapper.toDomainWithRoles);

    // Filter by role if specified (post-filter due to nested structure)
    if (roleId) {
      users = users.filter((user) =>
        user.roles.some((role) => role.id === roleId)
      );
    }

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async update(user: User): Promise<User> {
    if (!user.id) {
      throw new Error('User ID is required for update');
    }

    const updateData = UserMapper.toUpdateRow(user);

    const { data, error } = await this.supabase
      .from(USER_PROFILES_TABLE)
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return UserMapper.toDomain(data as UserProfileDbRow, user.roles);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from(USER_PROFILES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from(USER_PROFILES_TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('email', email);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Failed to check user existence: ${error.message}`);
    }

    return (count ?? 0) > 0;
  }

  async assignRole(userId: string, roleId: string, assignedBy?: string): Promise<void> {
    const { error } = await this.supabase.from(USER_ROLES_TABLE).insert({
      user_id: userId,
      role_id: roleId,
      assigned_by: assignedBy ?? null,
    });

    if (error) {
      // Ignore duplicate key error
      if (error.code !== '23505') {
        throw new Error(`Failed to assign role: ${error.message}`);
      }
    }
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const { error } = await this.supabase
      .from(USER_ROLES_TABLE)
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) {
      throw new Error(`Failed to remove role: ${error.message}`);
    }
  }

  async getUserRoleIds(userId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from(USER_ROLES_TABLE)
      .select('role_id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user roles: ${error.message}`);
    }

    return data.map((row) => row.role_id);
  }

  async countAdmins(): Promise<number> {
    const { data, error } = await this.supabase
      .from(USER_ROLES_TABLE)
      .select(`
        user_id,
        role:roles!inner(name)
      `)
      .eq('roles.name', 'admin');

    if (error) {
      throw new Error(`Failed to count admins: ${error.message}`);
    }

    // Count unique users with admin role
    const uniqueUserIds = new Set(data.map((row) => row.user_id));
    return uniqueUserIds.size;
  }
}
