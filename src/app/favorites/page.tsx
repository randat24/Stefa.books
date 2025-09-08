'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-h2">Увійдіть в систему</CardTitle>
            <CardDescription>
              Щоб додавати книги до вибраного, потрібно увійти в систему
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                <BookOpen className="mr-2 h-4 w-4" />
                Увійти
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                На головну
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="md" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Link>
        </Button>
        <div>
          <h1 className="text-h1">Мої улюблені книги</h1>
          <p className="text-muted-foreground">Книги, які ви додали до вибраного</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Вибрані книги
          </CardTitle>
          <CardDescription>
            Тут будуть відображатися книги, які ви додали до вибраного
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Поки що у вас немає вибраних книг
            </p>
            <Button asChild>
              <Link href="/books">
                <BookOpen className="mr-2 h-4 w-4" />
                Переглянути каталог
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
