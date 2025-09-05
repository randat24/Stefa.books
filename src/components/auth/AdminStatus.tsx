'use client';

import { useAuth } from '@/contexts/AuthContext';
import { canAccessAdminPanel, getUserRole } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export function AdminStatus() {
  const { user, profile } = useAuth();

  if (!user || !canAccessAdminPanel(user, profile)) {
    return null;
  }

  const userRole = getUserRole(user, profile);

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="secondary" className="flex items-center space-x-1">
        <Shield className="h-3 w-3" />
        <span className="text-xs font-medium">
          {userRole === 'admin' ? 'Адмін' : 'Модератор'}
        </span>
      </Badge>
      
      <Link href="/admin">
        <Button 
          variant="outline" 
          size="md"
          className="bg-black text-white hover:bg-gray-800 border-black"
        >
          Адмін-панель
        </Button>
      </Link>
    </div>
  );
}
