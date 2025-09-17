'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    email: 'admin@stefa-books.com.ua',
    password: 'Admin123!@#',
    name: 'Администратор'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ success: false, error: 'Ошибка сети' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Создание администратора</CardTitle>
          <CardDescription>
            Создайте нового администратора для системы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Имя</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Создание...' : 'Создать администратора'}
            </Button>
          </form>
          
          {result && (
            <div className={`mt-4 p-3 rounded-md ${
              result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {result.success ? (
                <div>
                  <p className="font-medium">✅ Администратор создан успешно!</p>
                  <p className="text-sm">Email: {result.data?.email}</p>
                  <p className="text-sm">Роль: {result.data?.role}</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">❌ Ошибка:</p>
                  <p className="text-sm">{result.error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
