"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export function UserProfile() {
  const { user, profile, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  // Split the name into first and last name for editing
  const [firstName, setFirstName] = useState(profile?.name ? profile.name.split(' ')[0] || '' : '');
  const [lastName, setLastName] = useState(profile?.name ? profile.name.split(' ')[1] || '' : '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) {
    return null;
  }

  const handleSave = async () => {
    setError('');
    setSuccess('');

    try {
      const response = await updateProfile({
        name: `${firstName} ${lastName}`,
        phone
      });

      if (response.success) {
        setSuccess('Профіль успішно оновлено');
        setIsEditing(false);
      } else {
        setError(response.error || 'Не вдалося оновити профіль');
      }
    } catch {
      setError('Сталася неочікувана помилка');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      setError('Не вдалося вийти з системи');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Профіль користувача</CardTitle>
        <CardDescription>
          Керуйте своїм обліковим записом та налаштуваннями
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div>
            <Label>Електронна пошта</Label>
            <div className="mt-1 text-body-sm text-neutral-900">
              {user.email}
            </div>
          </div>
          
          <Separator />
          
          {isEditing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ім&apos;я</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    placeholder="Іван"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Прізвище</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                    placeholder="Петренко"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                  placeholder="+380XXXXXXXXX"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Повне ім&apos;я</Label>
                <div className="mt-1 text-body-sm text-neutral-900">
                  {profile?.name || 'Не вказано'}
                </div>
              </div>
              
              <div>
                <Label>Телефон</Label>
                <div className="mt-1 text-body-sm text-neutral-900">
                  {profile?.phone || 'Не вказано'}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
        {isEditing ? (
          <>
            <Button onClick={() => setIsEditing(false)} variant="outline">
              Скасувати
            </Button>
            <Button onClick={handleSave}>
              Зберегти зміни
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)}>
              Редагувати профіль
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Вийти
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}