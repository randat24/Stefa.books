'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Bell,
  Shield,
  Eye,
  EyeOff,
  Save,
  Edit,
  LogOut,
  Crown,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  plan_type: 'basic' | 'premium' | 'unlimited';
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [editing, setEditing] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    birth_date: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    rental_reminders: true,
    return_reminders: true,
    promotional_emails: false,
    newsletter: true
  });

  const loadProfile = useCallback(async () => {
    try {
      // In a real app, you would fetch from API
      // For now, we'll use the user data from auth context
      const userProfile: UserProfile = {
        id: user?.id || '',
        email: user?.email || '',
        first_name: user?.user_metadata?.first_name || '',
        last_name: user?.user_metadata?.last_name || '',
        phone: user?.user_metadata?.phone || '',
        address: user?.user_metadata?.address || '',
        city: user?.user_metadata?.city || '',
        postal_code: user?.user_metadata?.postal_code || '',
        birth_date: user?.user_metadata?.birth_date || '',
        created_at: user?.created_at || '',
        updated_at: user?.updated_at || ''
      };

      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        postal_code: userProfile.postal_code || '',
        birth_date: userProfile.birth_date || '',
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      // Load subscription data (mock for now)
      const mockSubscription: Subscription = {
        id: 'sub_123',
        plan_type: 'premium',
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        auto_renew: true
      };
      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Помилка при завантаженні профілю');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will be handled by AuthContext
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Помилка при виході з системи');
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, loadProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.first_name || !formData.last_name || !formData.email) {
        setError('Будь ласка, заповніть всі обов\'язкові поля');
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Невірний формат email');
        return;
      }

      // Validate phone format (if provided)
      if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10 }$/.test(formData.phone)) {
        setError('Невірний формат телефону');
        return;
      }

      // In a real app, you would make an API call here
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Профіль успішно оновлено');
      setEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Помилка при збереженні профілю');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validate password fields
      if (!formData.current_password || !formData.new_password || !formData.confirm_password) {
        setError('Будь ласка, заповніть всі поля для зміни паролю');
        return;
      }

      if (formData.new_password !== formData.confirm_password) {
        setError('Нові паролі не співпадають');
        return;
      }

      if (formData.new_password.length < 8) {
        setError('Новий пароль повинен містити принаймні 8 символів');
        return;
      }

      // In a real app, you would make an API call here
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess('Пароль успішно змінено');
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Помилка при зміні паролю');
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="section-sm">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-surface-2 rounded-xl flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-text-muted" />
            </div>
            <h1 className="h2 text-accent mb-2">Вхід необхідний</h1>
            <p className="text-text-muted mb-6">
              Будь ласка, увійдіть в систему, щоб переглянути свій профіль
            </p>
            <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/auth/login">Увійти</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/register">Зареєструватися</Link>
            </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-2xl h-8 w-8 border-b-2 border-brand-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-sm">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="h1 text-accent mb-2">Мій профіль</h1>
              <p className="text-text-muted">
                Керуйте своїми особистими даними та налаштуваннями
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Вийти
            </Button>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Особисті дані</TabsTrigger>
          <TabsTrigger value="subscription">Підписка</TabsTrigger>
          <TabsTrigger value="security">Безпека</TabsTrigger>
          <TabsTrigger value="notifications">Сповіщення</TabsTrigger>
          <TabsTrigger value="privacy">Приватність</TabsTrigger>
        </TabsList>

        {/* Personal Data Tab */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Особисті дані
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setEditing(!editing)}
                >
                  {editing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
                  {editing ? 'Зберегти' : 'Редагувати'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Ім&apos;я *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('first_name', e.target.value)}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Прізвище *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('last_name', e.target.value)}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('email', e.target.value)}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('phone', e.target.value)}
                    disabled={!editing}
                    placeholder="+380 (XX) XXX-XX-XX"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Адреса</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('address', e.target.value)}
                  disabled={!editing}
                  placeholder="Вулиця, будинок, квартира"
                  className="mt-1"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Місто</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('city', e.target.value)}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Поштовий індекс</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('postal_code', e.target.value)}
                    disabled={!editing}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="birth_date">Дата народження</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('birth_date', e.target.value)}
                  disabled={!editing}
                  className="mt-1"
                />
              </div>

              {editing && (
                <div className="flex gap-4">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-2xl h-4 w-4 border-b-2 border-neutral-0 mr-2" />
                        Збереження...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Зберегти зміни
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Скасувати
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5" />
                Статус підписки
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-accent rounded-lg flex items-center justify-center">
                        <Crown className="h-6 w-6 text-neutral-0" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-accent capitalize">
                          {subscription.plan_type === 'basic' && 'Базовий план'}
                          {subscription.plan_type === 'premium' && 'Преміум план'}
                          {subscription.plan_type === 'unlimited' && 'Безлімітний план'}
                        </h3>
                        <p className="text-body-sm text-text-muted">
                          Статус: <span className={`font-medium ${
                            subscription.status === 'active' ? 'text-green-600' : 
                            subscription.status === 'expired' ? 'text-red-600' : 
                            'text-yellow-600'
                          }`}>
                            {subscription.status === 'active' && 'Активна'}
                            {subscription.status === 'expired' && 'Закінчилася'}
                            {subscription.status === 'cancelled' && 'Скасована'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-body-sm text-text-muted">Дійсна до</p>
                      <p className="font-semibold text-accent">
                        {new Date(subscription.end_date).toLocaleDateString('uk-UA')}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-brand-accent" />
                        <span className="font-medium text-accent">Дата початку</span>
                      </div>
                      <p className="text-body-sm text-text-muted">
                        {new Date(subscription.start_date).toLocaleDateString('uk-UA')}
                      </p>
                    </div>
                    <div className="p-4 border border-neutral-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-brand-accent" />
                        <span className="font-medium text-accent">Дата закінчення</span>
                      </div>
                      <p className="text-body-sm text-text-muted">
                        {new Date(subscription.end_date).toLocaleDateString('uk-UA')}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Автоматичне продовження</span>
                    </div>
                    <p className="text-body-sm text-blue-700">
                      {subscription.auto_renew 
                        ? 'Підписка буде автоматично продовжена' 
                        : 'Автоматичне продовження вимкнено'
                      }
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button>
                      <Crown className="h-4 w-4 mr-2" />
                      Оновити підписку
                    </Button>
                    <Button variant="outline">
                      Скасувати підписку
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-surface-2 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="h-8 w-8 text-text-muted" />
                  </div>
                  <h3 className="font-semibold text-accent mb-2">Немає активної підписки</h3>
                  <p className="text-text-muted mb-6">
                    Отримайте доступ до всіх функцій сервісу
                  </p>
                  <Button asChild>
                    <Link href="/subscribe">Оформити підписку</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Безпека
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-neutral-900 mb-4">Зміна паролю</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="current_password">Поточний пароль</Label>
                    <div className="relative mt-1">
                      <Input
                        id="current_password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.current_password}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('current_password', e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-neutral-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-neutral-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="new_password">Новий пароль</Label>
                    <div className="relative mt-1">
                      <Input
                        id="new_password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.new_password}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('new_password', e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirm_password">Підтвердження паролю</Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirm_password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirm_password}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('confirm_password', e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <Button onClick={handleChangePassword} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-2xl h-4 w-4 border-b-2 border-neutral-0 mr-2" />
                        Зміна паролю...
                      </>
                    ) : (
                      'Змінити пароль'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Сповіщення
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-900">Email сповіщення</h4>
                    <p className="text-body-sm text-neutral-600">Отримувати сповіщення на email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.email_notifications}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleNotificationChange('email_notifications', e.target.checked)}
                    className="h-4 w-4 text-brand-accent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-900">SMS сповіщення</h4>
                    <p className="text-body-sm text-neutral-600">Отримувати сповіщення на телефон</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.sms_notifications}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleNotificationChange('sms_notifications', e.target.checked)}
                    className="h-4 w-4 text-brand-accent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-900">Нагадування про оренду</h4>
                    <p className="text-body-sm text-neutral-600">Нагадування про терміни оренди</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.rental_reminders}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleNotificationChange('rental_reminders', e.target.checked)}
                    className="h-4 w-4 text-brand-accent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-900">Нагадування про повернення</h4>
                    <p className="text-body-sm text-neutral-600">Нагадування про необхідність повернення</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.return_reminders}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleNotificationChange('return_reminders', e.target.checked)}
                    className="h-4 w-4 text-brand-accent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-900">Рекламні листи</h4>
                    <p className="text-body-sm text-neutral-600">Отримувати інформацію про нові книги та пропозиції</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.promotional_emails}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleNotificationChange('promotional_emails', e.target.checked)}
                    className="h-4 w-4 text-brand-accent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-neutral-900">Новини</h4>
                    <p className="text-body-sm text-neutral-600">Отримувати новини та оновлення сервісу</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.newsletter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleNotificationChange('newsletter', e.target.checked)}
                    className="h-4 w-4 text-brand-accent"
                  />
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Зберегти налаштування
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Приватність
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Управління даними</h4>
                  <p className="text-body-sm text-neutral-600 mb-4">
                    Ви можете завантажити або видалити свої особисті дані
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline">
                      Завантажити дані
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      Видалити акаунт
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-neutral-900 mb-2">Політика конфіденційності</h4>
                  <p className="text-body-sm text-neutral-600 mb-4">
                    Ознайомтеся з нашою політикою конфіденційності
                  </p>
                  <Button variant="outline" asChild>
                    <Link href="/privacy">Переглянути політику</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
