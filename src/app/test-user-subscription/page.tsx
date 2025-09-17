'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserSubscription } from '@/lib/hooks/useUserSubscription';
import { BookPreviewModal } from '@/components/BookPreviewModal';
import { OptimizedBookCard } from '@/components/OptimizedBookCard';
import type { Book } from '@/lib/supabase';

// Тестовая книга для демонстрации
const testBook: Book = {
  id: 'test-book-id',
  code: 'TEST-001',
  title: 'Тестова книга для перевірки системи',
  author: 'Тестовий автор',
  category: 'Дитячі книги',
  cover_url: '/images/book-placeholder.svg',
  price_uah: 299,
  is_active: true,
  status: 'available',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString() };

export default function TestUserSubscriptionPage() {
  const userSubscription = useUserSubscription();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Введіть email та пароль');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const supabase = supabaseBrowser;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setMessage(`Помилка входу: ${error.message}`);
      } else {
        setMessage('Успішний вхід! Оновлюємо дані...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      setMessage('Непередбачена помилка');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const supabase = supabaseBrowser;
      await supabase.auth.signOut();
      setMessage('Вихід виконано');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage('Помилка при виході');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Тест системи підписок та аренди</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Статус пользователя */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Статус користувача</h2>

          {userSubscription.isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Завантаження...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Аутентифікація:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    userSubscription.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userSubscription.isAuthenticated ? 'Увійшов' : 'Не увійшов'}
                  </span>
                </div>
                <div>
                  <strong>Підписка:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    userSubscription.hasActiveSubscription ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userSubscription.hasActiveSubscription ? 'Активна' : 'Немає'}
                  </span>
                </div>
                <div>
                  <strong>Тип підписки:</strong>
                  <span className="ml-2 text-gray-600">
                    {userSubscription.subscriptionType || 'Немає'}
                  </span>
                </div>
                <div>
                  <strong>Можна орендувати:</strong>
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    userSubscription.canRent ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {userSubscription.canRent ? 'Так' : 'Ні'}
                  </span>
                </div>
                <div>
                  <strong>Макс. книг:</strong>
                  <span className="ml-2 text-gray-600">{userSubscription.maxRentals}</span>
                </div>
                <div>
                  <strong>Поточно орендовано:</strong>
                  <span className="ml-2 text-gray-600">{userSubscription.currentRentals}</span>
                </div>
              </div>

              {userSubscription.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                  <strong>Помилка:</strong> {userSubscription.error}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Форма входу */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {userSubscription.isAuthenticated ? 'Керування акаунтом' : 'Тестовий вхід'}
          </h2>

          {userSubscription.isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-green-600">Ви увійшли в систему</p>
              <Button onClick={handleLogout} disabled={loading} variant="outline">
                {loading ? 'Виходимо...' : 'Вийти'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="password"
                />
              </div>
              <Button onClick={handleLogin} disabled={loading}>
                {loading ? 'Входимо...' : 'Увійти'}
              </Button>
            </div>
          )}

          {message && (
            <div className={`mt-4 p-3 rounded text-sm ${
              message.includes('Помилка') || message.includes('помилка')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-green-50 border border-green-200 text-green-800'
            }`}>
              {message}
            </div>
          )}
        </Card>

        {/* Тестовая карточка книги */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Карточка книги</h2>
          <p className="text-sm text-gray-600 mb-4">
            Ця карточка показує, як виглядатимуть кнопки для різних типів користувачів:
          </p>
          <div className="max-w-xs">
            <OptimizedBookCard book={testBook} />
          </div>
        </Card>

        {/* Модальное окно */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Модальне вікно</h2>
          <p className="text-sm text-gray-600 mb-4">
            Перевірте, як змінюються кнопки в модальному вікні:
          </p>
          <Button onClick={() => setShowModal(true)}>
            Відкрити модальне вікно книги
          </Button>
        </Card>
      </div>

      {/* Модальное окно */}
      <BookPreviewModal
        book={showModal ? testBook : null}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}