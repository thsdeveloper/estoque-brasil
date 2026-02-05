import { getSupabaseClient, getSupabaseAdminClient, SupabaseClient } from '../database/supabase/client.js';
import { env } from '../../config/env.js';
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  EmailNotVerifiedError,
  WeakPasswordError,
  InvalidEmailError,
  PasswordResetError,
  RateLimitError,
  SessionNotFoundError,
} from '../../domain/errors/AuthErrors.js';

export interface AuthUser {
  id: string;
  email: string;
  emailConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export class SupabaseAuthService {
  private supabase: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor() {
    this.supabase = getSupabaseClient();
    this.adminClient = getSupabaseAdminClient();
  }

  async signUp(email: string, password: string): Promise<{ email: string }> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${env.SITE_URL}/auth/confirm`,
      },
    });

    if (error) {
      this.handleAuthError(error);
    }

    if (!data.user) {
      throw new Error('Erro ao criar usuário.');
    }

    return { email: data.user.email! };
  }

  async signIn(email: string, password: string): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.handleAuthError(error);
    }

    if (!data.session || !data.user) {
      throw new InvalidCredentialsError();
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at!,
      user: this.mapUser(data.user),
    };
  }

  async signOut(accessToken: string): Promise<void> {
    // Set the session to sign out using admin client
    const { error } = await this.adminClient.auth.admin.signOut(accessToken, 'global');

    // If admin signOut fails, try regular signOut
    if (error) {
      // Just ignore - the token will expire naturally
    }
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.SITE_URL}/auth/confirm`,
    });

    if (error) {
      this.handleAuthError(error);
    }
  }

  async updatePassword(accessToken: string, refreshToken: string, newPassword: string): Promise<void> {
    // Create a new client instance and set the session
    const { error: sessionError } = await this.supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      throw new SessionNotFoundError();
    }

    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      this.handleAuthError(error);
    }

    // Sign out after password reset
    await this.supabase.auth.signOut();
  }

  async updatePasswordForLoggedUser(accessToken: string, newPassword: string): Promise<void> {
    // Verify the token is valid by getting the user
    const { data: userData, error: userError } = await this.supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      throw new SessionNotFoundError();
    }

    // Update the password using admin client
    const { error } = await this.adminClient.auth.admin.updateUserById(userData.user.id, {
      password: newPassword,
    });

    if (error) {
      this.handleAuthError(error);
    }
  }

  async getCurrentUser(accessToken: string): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new SessionNotFoundError();
    }

    return this.mapUser(data.user);
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      throw new SessionNotFoundError();
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at!,
      user: this.mapUser(data.user),
    };
  }

  /**
   * Admin method to create a new user (bypasses email confirmation)
   */
  async createUser(email: string, password: string): Promise<string> {
    const { data, error } = await this.adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created users
    });

    if (error) {
      this.handleAuthError(error);
    }

    if (!data.user) {
      throw new Error('Failed to create auth user: No user returned');
    }

    return data.user.id;
  }

  /**
   * Admin method to delete a user
   */
  async deleteUser(userId: string): Promise<void> {
    const { error } = await this.adminClient.auth.admin.deleteUser(userId);

    if (error) {
      throw new Error(`Failed to delete auth user: ${error.message}`);
    }
  }

  private mapUser(user: { id: string; email?: string; email_confirmed_at?: string | null; created_at?: string; updated_at?: string }): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      emailConfirmedAt: user.email_confirmed_at || null,
      createdAt: user.created_at || new Date().toISOString(),
      updatedAt: user.updated_at || new Date().toISOString(),
    };
  }

  private handleAuthError(error: { code?: string; message: string; status?: number }): never {
    const code = error.code || '';
    const message = error.message.toLowerCase();

    // User already exists
    if (code === 'user_already_exists' || message.includes('user already registered')) {
      throw new UserAlreadyExistsError();
    }

    // Invalid credentials
    if (code === 'invalid_credentials' || message.includes('invalid login credentials')) {
      throw new InvalidCredentialsError();
    }

    // Email not confirmed
    if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
      throw new EmailNotVerifiedError();
    }

    // Weak password
    if (code === 'weak_password' || message.includes('weak password')) {
      throw new WeakPasswordError();
    }

    // Invalid email
    if (code === 'invalid_email' || message.includes('invalid email')) {
      throw new InvalidEmailError();
    }

    // Rate limit
    if (code === 'over_email_send_rate_limit' || message.includes('rate limit') || error.status === 429) {
      throw new RateLimitError();
    }

    // Session not found
    if (message.includes('session') || message.includes('refresh token')) {
      throw new SessionNotFoundError();
    }

    // Generic password reset error
    if (message.includes('password')) {
      throw new PasswordResetError(error.message);
    }

    // Fallback to generic error
    throw new Error(error.message);
  }
}
