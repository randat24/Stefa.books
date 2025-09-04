import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { UserRow } from '@/lib/types/admin';

interface UseUsersReturn {
  users: UserRow[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    subscriptionType?: string;
  }) => Promise<void>;
  createUser: (userData: Partial<UserRow>) => Promise<boolean>;
  updateUser: (userId: string, userData: Partial<UserRow>) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const { toast } = useToast();

  const fetchUsers = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    subscriptionType?: string;
  } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.status) searchParams.append('status', params.status);
      if (params.subscriptionType) searchParams.append('subscriptionType', params.subscriptionType);
      
      const baseUrl = '/api/admin/users';
      const queryString = searchParams.toString();
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data.users);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.error || 'Failed to fetch users');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      toast({
        title: "Помилка",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: Partial<UserRow>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Успіх",
          description: "Користувача успішно створено",
        });
        return true;
      } else {
        throw new Error(result.error || 'Failed to create user');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMessage);
      toast({
        title: "Помилка",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: Partial<UserRow>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Успіх",
          description: "Користувача успішно оновлено",
        });
        return true;
      } else {
        throw new Error(result.error || 'Failed to update user');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      setError(errorMessage);
      toast({
        title: "Помилка",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Успіх",
          description: "Користувача успішно видалено",
        });
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
      toast({
        title: "Помилка",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  };
}