'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  CreditCard,
  Settings,
  BookOpen,
  Bell,
  LogOut
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import UserDashboard from '@/components/user/UserDashboard';
import SubscriptionManager from '@/components/user/SubscriptionManager';
import RentalHistory from '@/components/user/RentalHistory';

type TabType = 'dashboard' | 'subscription' | 'rentals' | 'settings' | 'notifications';

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/session');
      const result = await response.json();
      
      if (result.success && result.user) {
        setUser(result.user);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-surface to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-text-muted">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Огляд',
      icon: User,
      description: 'Головна інформація'
    },
    {
      id: 'subscription' as TabType,
      label: 'Підписка',
      icon: CreditCard,
      description: 'Управління підпискою'
    },
    {
      id: 'rentals' as TabType,
      label: 'Оренди',
      icon: BookOpen,
      description: 'Історія та активні оренди'
    },
    {
      id: 'notifications' as TabType,
      label: 'Сповіщення',
      icon: Bell,
      description: 'Налаштування сповіщень'
    },
    {
      id: 'settings' as TabType,
      label: 'Налаштування',
      icon: Settings,
      description: 'Особисті налаштування'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-white">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-line bg-white/90 backdrop-blur-sm">
        <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text">Особистий кабінет</h1>
              <p className="text-text-muted mt-1">
                Привіт, {user.user_metadata?.first_name || user.email}! 👋
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => router.push('/catalog')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Каталог
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Вийти
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6 lg:px-6 xl:px-8 2xl:px-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-accent/10 text-accent border-r-2 border-accent'
                            : 'text-text-muted hover:bg-surface hover:text-text'
                        }`}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{tab.label}</p>
                          <p className="text-xs text-text-muted">{tab.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>

            {/* User Info Card */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-semibold text-text">
                    {user.user_metadata?.first_name || 'Користувач'}
                  </h3>
                  <p className="text-sm text-text-muted mb-2">{user.email}</p>
                  <Badge variant="outline" className="text-xs">
                    {user.user_metadata?.subscription_type || 'Без підписки'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'dashboard' && <UserDashboard />}
            {activeTab === 'subscription' && <SubscriptionManager />}
            {activeTab === 'rentals' && <RentalHistory />}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Налаштування сповіщень
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Email сповіщення</h3>
                        <p className="text-sm text-text-muted">Отримувати сповіщення на email</p>
                      </div>
                      <Button variant="outline" size="sm">Увімкнено</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Нагадування про повернення</h3>
                        <p className="text-sm text-text-muted">Нагадування за 2 дні до повернення</p>
                      </div>
                      <Button variant="outline" size="sm">Увімкнено</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Новинки та пропозиції</h3>
                        <p className="text-sm text-text-muted">Сповіщення про нові книги та акції</p>
                      </div>
                      <Button variant="outline" size="sm">Увімкнено</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Особисті налаштування
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Особисті дані</h3>
                        <p className="text-sm text-text-muted">Ім&apos;я, email, телефон</p>
                      </div>
                      <Button variant="outline" size="sm">Редагувати</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Безпека</h3>
                        <p className="text-sm text-text-muted">Пароль, двофакторна автентифікація</p>
                      </div>
                      <Button variant="outline" size="sm">Налаштувати</Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Допомога</h3>
                        <p className="text-sm text-text-muted">FAQ, контакти, підтримка</p>
                      </div>
                      <Button variant="outline" size="sm">Перейти</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}