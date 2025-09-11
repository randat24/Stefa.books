import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import type { User as SupabaseUser } from '@supabase/supabase-js/dist/module/index';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: SupabaseUser;
  profile?: UserProfile | null;
  session?: any;
  error?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  role?: string | null;
  status?: string | null;
  subscription_type?: string | null;
  subscription_start?: string | null;
  subscription_end?: string | null;
  notes?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      logger.info('AuthService: Registering new user', { email: data.email });

      // Sign up the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone
          }
        }
      });

      if (authError) {
        logger.error('AuthService: Registration failed', { error: authError.message });
        return {
          success: false,
          error: authError.message
        };
      }

      // If user is created, also create a profile in the database
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: `${data.firstName} ${data.lastName}`,
            phone: data.phone,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          logger.error('AuthService: Profile creation failed', { error: profileError.message });
          // Note: We don't return an error here because the auth was successful
          // The profile can be created later or fixed by admin
        }

        logger.info('AuthService: User registered successfully', { userId: authData.user.id });
        return {
          success: true,
          user: authData.user,
          session: authData.session
        };
      }

      return {
        success: false,
        error: 'Failed to create user'
      };
    } catch (error) {
      logger.error('AuthService: Registration error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      logger.info('AuthService: User login attempt', { email: data.email });

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        logger.error('AuthService: Login failed', { error: authError.message });
        return {
          success: false,
          error: authError.message
        };
      }

      logger.info('AuthService: User logged in successfully', { userId: authData.user?.id });
      return {
        success: true,
        user: authData.user,
        session: authData.session
      };
    } catch (error) {
      logger.error('AuthService: Login error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('AuthService: User logout');

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('AuthService: Logout failed', { error: error.message });
        return {
          success: false,
          error: error.message
        };
      }

      logger.info('AuthService: User logged out successfully');
      return {
        success: true
      };
    } catch (error) {
      logger.error('AuthService: Logout error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<SupabaseUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user || null;
    } catch (error) {
      logger.error('AuthService: Get current user error', { error });
      return null;
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error('AuthService: Get user profile error', { error: error.message });
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      logger.error('AuthService: Get user profile error', { error });
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        logger.error('AuthService: Update user profile error', { error: error.message });
        return {
          success: false,
          error: error.message
        };
      }

      logger.info('AuthService: User profile updated successfully', { userId });
      return {
        success: true
      };
    } catch (error) {
      logger.error('AuthService: Update user profile error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        logger.error('AuthService: Password reset error', { error: error.message });
        return {
          success: false,
          error: error.message
        };
      }

      logger.info('AuthService: Password reset email sent', { email });
      return {
        success: true
      };
    } catch (error) {
      logger.error('AuthService: Password reset error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        logger.error('AuthService: Password update error', { error: error.message });
        return {
          success: false,
          error: error.message
        };
      }

      logger.info('AuthService: Password updated successfully');
      return {
        success: true
      };
    } catch (error) {
      logger.error('AuthService: Password update error', { error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();