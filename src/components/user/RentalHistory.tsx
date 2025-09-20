'use client';

import { useState, useEffect } from 'react';
import { 
  History, 
  BookOpen, 
  Star, 
  Calendar, 
  Clock,
  RefreshCw,
  Filter,
  Search,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RentalHistoryIconItem {
  id: string;
  book: {
    id: string;
    title: string;
    author: string;
    cover_url?: string;
    category: string;
    age_range: string;
  };
  rental_date: string;
  due_date: string;
  return_date?: string;
  status: 'active' | 'overdue' | 'returned' | 'exchanged' | 'cancelled';
  notes?: string;
  late_fee: number;
  days_left: number;
  is_overdue: boolean;
  can_exchange: boolean;
  can_return: boolean;
}

interface RentalHistoryIconData {
  rentals: RentalHistoryIconItem[];
  total: number;
  type: string;
}

export default function RentalHistoryIcon() {
  const [data, setData] = useState<RentalHistoryIconData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRentalHistoryIcon();
  }, [filter]);

  const loadRentalHistoryIcon = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/rentals?type=${filter}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load rental history');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (rentalId: string, bookId: string) => {
    try {
      const response = await fetch('/api/user/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'return',
          rentalId,
          bookId
        })
      });

      const result = await response.json();
      if (result.success) {
        loadRentalHistoryIcon(); // Refresh data
      }
    } catch (err) {
      console.error('Error returning book:', err);
    }
  };

  const handleExchangeBook = (rentalId: string) => {
    window.location.href = `/catalog?exchange=${rentalId}`;
  };

  const handleExtendRental = async (rentalId: string) => {
    try {
      const response = await fetch('/api/user/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'extend',
          rentalId
        })
      });

      const result = await response.json();
      if (result.success) {
        loadRentalHistoryIcon(); // Refresh data
      }
    } catch (err) {
      console.error('Error extending rental:', err);
    }
  };

  const getStatusBadge = (status: string, isOverdue: boolean) => {
    if (isOverdue) {
      return <Badge variant="destructive">Прострочено</Badge>;
    }
    
    switch (status) {
      case 'active':
        return <Badge variant="default">Активна</Badge>;
      case 'returned':
        return <Badge variant="outline">Повернено</Badge>;
      case 'exchanged':
        return <Badge variant="secondary">Обмінено</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Скасовано</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRentals = data?.rentals.filter(rental => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      rental.book.title.toLowerCase().includes(query) ||
      rental.book.author.toLowerCase().includes(query) ||
      rental.book.category.toLowerCase().includes(query)
    );
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-accent" />
        <span className="ml-2">Завантаження...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <History className="h-12 w-12 mx-auto mb-4 text-red-500" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadRentalHistoryIcon} variant="outline">
          Спробувати знову
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Історія оренди ({data?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Пошук по назві, авторові або категорії..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Фільтр" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всі оренди</SelectItem>
                <SelectItem value="active">Активні</SelectItem>
                <SelectItem value="history">Історія</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rentals List */}
      {filteredRentals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg font-semibold text-neutral-600 mb-2">
              {searchQuery ? 'Нічого не знайдено' : 'Історія оренд порожня'}
            </h3>
            <p className="text-neutral-500 mb-4">
              {searchQuery 
                ? 'Спробуйте змінити пошуковий запит'
                : 'Ваша історія оренд з&apos;явиться тут після першої оренди книги'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => window.location.href = '/catalog'}>
                Переглянути каталог
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRentals.map((rental) => (
            <Card key={rental.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <img 
                    src={rental.book.cover_url || '/placeholder-book.jpg'} 
                    alt={rental.book.title}
                    className="w-20 h-28 object-cover rounded-lg shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-neutral-900 truncate">
                          {rental.book.title}
                        </h3>
                        <p className="text-neutral-600 mb-2">{rental.book.author}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" >
                            {rental.book.category}
                          </Badge>
                          <Badge variant="outline" >
                            {rental.book.age_range}
                          </Badge>
                          {getStatusBadge(rental.status, rental.is_overdue)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Орендовано: {new Date(rental.rental_date).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Повернути до: {new Date(rental.due_date).toLocaleDateString('uk-UA')}
                        </span>
                      </div>
                      {rental.return_date && (
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4" />
                          <span>
                            Повернено: {new Date(rental.return_date).toLocaleDateString('uk-UA')}
                          </span>
                        </div>
                      )}
                      {rental.late_fee > 0 && (
                        <div className="flex items-center gap-2 text-red-600">
                          <span className="font-semibold">
                            Штраф: {rental.late_fee} UAH
                          </span>
                        </div>
                      )}
                    </div>

                    {rental.status === 'active' && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {rental.can_exchange && (
                          <Button 
                            variant="outline" 
                            onClick={() => handleExchangeBook(rental.id)}
                          >
                            Обміняти книгу
                          </Button>
                        )}
                        {rental.can_return && (
                          <Button 
                            variant="outline" 
                            onClick={() => handleReturnBook(rental.id, rental.book.id)}
                          >
                            Повернути книгу
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => handleExtendRental(rental.id)}
                        >
                          Продовжити на 7 днів
                        </Button>
                      </div>
                    )}

                    {rental.notes && (
                      <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                        <p className="text-sm text-neutral-600">
                          <strong>Примітки:</strong> {rental.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
