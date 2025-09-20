'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('welcome');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendEmail = async () => {
    if (!email || !name) {
      toast({
        title: "Помилка",
        description: "Будь ласка, заповніть всі поля",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, type }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Успіх",
          description: "Email успішно відправлено!",
        });
      } else {
        toast({
          title: "Помилка",
          description: data.error || "Не вдалося відправити email",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Сталася помилка при відправці email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-default py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Тестування Email Повідомлень</CardTitle>
          <CardDescription>
            Відправте тестові email повідомлення для перевірки функціональності
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email адреса</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Ім'я</Label>
            <Input
              id="name"
              type="text"
              placeholder="Іван Петренко"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Тип повідомлення</Label>
            <select
              id="type"
              className="w-full p-2 border rounded-md"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="welcome">Ласкаво просимо</option>
              <option value="password-reset">Скидання пароля</option>
              <option value="payment">Платіж</option>
              <option value="subscription-cancelled">Скасування підписки</option>
              <option value="book-return">Нагадування про повернення книги</option>
            </select>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSendEmail}
            disabled={loading}
          >
            {loading ? 'Відправка...' : 'Відправити тестовий email'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}