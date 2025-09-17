'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Star,
  Clock,
  Users,
  Heart,
  ShoppingCart
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { logger } from '@/lib/logger'

interface Book {
  id: string
  title: string
  author: string
  category: string
  subcategory?: string
  description: string
  short_description: string
  cover_url: string
  status: string
  available: boolean
  rating: number
  rating_count: number
  age_range: string
  language: string
  pages: number
  price_daily?: number
  price_weekly?: number
  price_monthly?: number
  badges?: string[]
  tags?: string[]
}

interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
}

export default function CatalogPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    loadBooks()
    loadCategories()
  }, [])

  useEffect(() => {
    filterBooks()
  }, [books, searchQuery, selectedCategory])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      }
    } catch (error) {
      logger.error('Ошибка загрузки книг:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      logger.error('Ошибка загрузки категорий:', error)
    }
  }

  const filterBooks = () => {
    let filtered = books

    // Фильтр по поисковому запросу
    if (searchQuery) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Фильтр по категории
    if (selectedCategory) {
      filtered = filtered.filter(book => book.category === selectedCategory)
    }

    setFilteredBooks(filtered)
  }

  const toggleFavorite = (bookId: string) => {
    setFavorites(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    )
  }

  const getStatusBadge = (book: Book) => {
    if (!book.available) {
      return <Badge variant="destructive">Недоступна</Badge>
    }
    
    switch (book.status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Доступна</Badge>
      case 'issued':
        return <Badge variant="secondary">Выдана</Badge>
      case 'reserved':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Зарезервирована</Badge>
      default:
        return <Badge variant="secondary">Неизвестно</Badge>
    }
  }

  const getAgeBadge = (ageRange: string) => {
    const colors = {
      '0-3': 'bg-pink-100 text-pink-800',
      '3-6': 'bg-blue-100 text-blue-800',
      '6-12': 'bg-green-100 text-green-800',
      '12+': 'bg-purple-100 text-purple-800'
    }
    return <Badge className={colors[ageRange as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {ageRange} років
    </Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка каталога...</p>
        </div>
      </div>
    )
	}
	
	return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Каталог книг</h1>
          <p className="text-gray-600">Выберите книги для аренды или подписки</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Поиск по названию, автору или описанию..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все категории</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-0">
                {/* Book Cover */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                  <Image
                    src={book.cover_url || '/placeholder-book.jpg'}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
                      onClick={() => toggleFavorite(book.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          favorites.includes(book.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'
                        }`} 
                      />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(book)}
                  </div>
                </div>

                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                  
                  <div className="flex items-center gap-2 mb-3">
                    {getAgeBadge(book.age_range)}
                    <Badge variant="outline">{book.language}</Badge>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{book.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({book.rating_count})</span>
				</div>
				
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {book.short_description || book.description}
                  </p>

                  {/* Pricing */}
                  {book.price_monthly && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500">Аренда в месяц</div>
                      <div className="text-lg font-semibold text-green-600">
                        {book.price_monthly} ₴
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      asChild 
                      className="flex-1"
                      disabled={!book.available}
                    >
                      <Link href={`/book/${book.id}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Подробнее
								</Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={!book.available}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
									</div>
							</div>
              </CardContent>
            </Card>
						))}
					</div>

        {/* No Results */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Книги не найдены</h3>
            <p className="text-gray-600">
              Попробуйте изменить поисковый запрос или фильтры
            </p>
					</div>
				)}
			</div>
		</div>
	)
}