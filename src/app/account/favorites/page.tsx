'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Heart, Star, Calendar } from 'lucide-react';

// Mock favorites data - in a real app, this would come from your API
const mockFavorites = [
  {
    id: 1,
    title: 'Пригоди Котигорошка',
    author: 'Олена Пчілка',
    category_id: 'folk-tales',
    category_name: 'Народні казки',
    rating: 4.8,
    addedDate: '2024-01-15',
    coverUrl: 'https://res.cloudinary.com/dchx7vd97/image/upload/v1758038702/subscription-plans/subscription-plans/mini-plan.png'
  },
  {
    id: 2,
    title: 'Аліса в Країні Чудес',
    author: 'Льюїс Керролл',
    category_id: 'foreign-literature',
    category_name: 'Зарубіжна література',
    rating: 4.9,
    addedDate: '2024-01-10',
    coverUrl: 'https://res.cloudinary.com/dchx7vd97/image/upload/v1758038723/subscription-plans/subscription-plans/maxi-plan.png'
  },
  {
    id: 3,
    title: 'Маленький принц',
    author: 'Антуан де Сент-Екзюпері',
    category_id: 'foreign-literature',
    category_name: 'Зарубіжна література',
    rating: 4.7,
    addedDate: '2024-01-05',
    coverUrl: 'https://res.cloudinary.com/dchx7vd97/image/upload/v1758038702/subscription-plans/subscription-plans/mini-plan.png'
  }
];

export default function FavoritesPage() {
  const [favorites] = useState(mockFavorites);

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-8">
        <Heart className="h-8 w-8 text-red-500" />
        <div>
          <h1 className="text-h1">Мої обрані книги</h1>
          <p className="text-neutral-500">Книги, які ви додали до обраного</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Card className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-body-sm font-medium text-neutral-900">Немає обраних книг</h3>
          <p className="mt-1 text-body-sm text-neutral-500">
            Додайте книги до обраного, щоб легко знайти їх пізніше.
          </p>
          <div className="mt-6">
            <Link href="/books">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Переглянути книги
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((book: any) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4">
                <div className="flex items-start gap-4">
                  <div className="aspect-[3/4] w-16 rounded overflow-hidden">
                    <Image 
                      src={book.coverUrl} 
                      alt={book.title}
                      width={64}
                      height={85}
                      className="w-full h-full object-cover"
                      onError={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/book-placeholder.svg';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-body font-semibold leading-tight">
                      {book.title}
                    </CardTitle>
                    <p className="text-body-sm text-neutral-500 truncate">{book.author}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{book.category_name}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-accent-light fill-yellow-400" />
                    <span className="text-body-sm font-medium">{book.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-caption text-neutral-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(book.addedDate).toLocaleDateString('uk-UA')}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/books/${book.id}`} className="flex-1">
                    <Button variant="outline" size="md" className="w-full">
                      Детальніше
                    </Button>
                  </Link>
                  <Link href={`/books?rent=${book.id}`} className="flex-1">
                    <Button size="md" className="w-full">
                      Орендувати
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}