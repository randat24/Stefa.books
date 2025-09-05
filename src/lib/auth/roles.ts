import type { User } from '@supabase/supabase-js';
import type { UserProfile } from '@/lib/types/user';

export type UserRole = 'user' | 'admin' | 'moderator';

/**
 * Check if user has admin role
 */
export function isAdmin(user: User | null, profile?: UserProfile | null): boolean {
  if (!user) return false;
  
  // Check email-based admin access
  if (user.email === 'admin@stefa-books.com.ua') {
    return true;
  }
  
  // Check metadata-based admin access
  if (user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin') {
    return true;
  }
  
  // Check profile-based admin access
  if (profile?.role === 'admin') {
    return true;
  }
  
  return false;
}

/**
 * Check if user has moderator role
 */
export function isModerator(user: User | null, profile?: UserProfile | null): boolean {
  if (!user) return false;
  
  // Moderators are also admins
  if (isAdmin(user, profile)) return true;
  
  // Check metadata-based moderator access
  if (user.user_metadata?.role === 'moderator' || user.app_metadata?.role === 'moderator') {
    return true;
  }
  
  // Check profile-based moderator access
  if (profile?.role === 'moderator') {
    return true;
  }
  
  return false;
}

/**
 * Get user role
 */
export function getUserRole(user: User | null, profile?: UserProfile | null): UserRole {
  if (!user) return 'user';
  
  // Check profile role first
  if (profile?.role && ['user', 'admin', 'moderator'].includes(profile.role)) {
    return profile.role as UserRole;
  }
  
  // Check metadata roles
  if (user.user_metadata?.role && ['user', 'admin', 'moderator'].includes(user.user_metadata.role)) {
    return user.user_metadata.role as UserRole;
  }
  
  if (user.app_metadata?.role && ['user', 'admin', 'moderator'].includes(user.app_metadata.role)) {
    return user.app_metadata.role as UserRole;
  }
  
  // Check email-based admin
  if (user.email === 'admin@stefa-books.com.ua') {
    return 'admin';
  }
  
  return 'user';
}

/**
 * Check if user has permission for admin actions
 */
export function hasAdminPermission(user: User | null, profile?: UserProfile | null): boolean {
  return isAdmin(user, profile);
}

/**
 * Check if user has permission for moderator actions
 */
export function hasModeratorPermission(user: User | null, profile?: UserProfile | null): boolean {
  return isModerator(user, profile);
}

/**
 * Check if user can access admin panel
 */
export function canAccessAdminPanel(user: User | null, profile?: UserProfile | null): boolean {
  return isAdmin(user, profile);
}
