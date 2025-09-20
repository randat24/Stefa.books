"use client"

import Image from "next/image";
import { useState, useMemo, useCallback } from "react"
import { 
  Eye, Edit, Trash2, ImageIcon, ExternalLink, CheckCircle, BookOpenCheck, Clock, XCircle,
  BookOpen, FileText, User, Tag, Hash, CreditCard, Settings, Search, Filter,
  ChevronLeft, ChevronRight, Package, Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddBookDialog } from "../../app/admin/components/AddBookDialog"
import { EditBookDialog } from "../admin/EditBookDialog"
import type { BookRow } from "@/lib/types/admin"

interface EnhancedBooksManagerProps {
  books: BookRow[]
  onRefresh: () => void
  onBookCreated: () => void
}

interface FilterState {
  search: string
  category: string
  status: string
  availability: string
  priceRange: { min: number; max: number }
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function EnhancedBooksManager({ books, onRefresh, onBookCreated }: EnhancedBooksManagerProps) {
  const [selectedBook, setSelectedBook] = useState<BookRow | null>(null)
  const [editingBook, setEditingBook] = useState<BookRow | null>(null)
  const [imageViewBook, setImageViewBook] = useState<BookRow | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    status: '',
    availability: '',
    priceRange: { min: 0, max: 1000 },
    sortBy: 'title',
    sortOrder: 'asc'
  })

  // ============================================================================
  // ФІЛЬТРАЦІЯ ТА СОРТУВАННЯ
  // ============================================================================

  const filteredBooks = useMemo(() => {
    const filtered = books.filter(book => {
      // Пошук
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (!book.title.toLowerCase().includes(search) &&
            !book.author.toLowerCase().includes(search) &&
            !book.code.toLowerCase().includes(search) &&
            !(book.description?.toLowerCase().includes(search) || false)) {
          return false
        }
      }

      // Категорія
      if (filters.category && book.category_name !== filters.category) {
        return false
      }

      // Статус
      if (filters.status && book.status !== filters.status) {
        return false
      }

      // Доступність
      if (filters.availability === 'available' && book.qty_available === 0) {
        return false
      }
      if (filters.availability === 'unavailable' && book.qty_available > 0) {
        return false
      }

      // Ціновий діапазон
      if (book.price_uah) {
        if (book.price_uah < filters.priceRange.min || book.price_uah > filters.priceRange.max) {
          return false
        }
      }

      return true
    })

    // Сортування
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'author':
          aValue = a.author.toLowerCase()
          bValue = b.author.toLowerCase()
          break
        case 'price':
          aValue = a.price_uah || 0
          bValue = b.price_uah || 0
          break
        case 'availability':
          aValue = a.qty_available
          bValue = b.qty_available
          break
        case 'created':
          aValue = new Date(a.created_at || '').getTime()
          bValue = new Date(b.created_at || '').getTime()
          break
        default:
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [books, filters])

  const paginatedBooks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredBooks.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredBooks, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)

  // ============================================================================
  // ФУНКЦІЇ ДЛЯ РОБОТИ З КНИГАМИ
  // ============================================================================

  const handleViewBook = useCallback((book: BookRow) => {
    setSelectedBook(book)
  }, [])

  const handleViewCover = useCallback((book: BookRow) => {
    setImageViewBook(book)
  }, [])

  const handleEditBook = useCallback((book: BookRow) => {
    setEditingBook(book)
  }, [])

  const handleDeleteBook = useCallback(async (book: BookRow) => {
    if (!confirm(`Ви впевнені, що хочете видалити книгу "${book.title}"?\n\nЦю дію неможливо скасувати!`)) {
      return
    }

    try {
      const { deleteBook } = await import('../../app/admin/actions')
      const result = await deleteBook(book.id)
      
      if (result.success) {
        onRefresh()
        alert('Книгу успішно видалено!')
      } else {
        alert(`Помилка видалення: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Помилка видалення книги. Перевірте підключення до бази даних.')
    }
  }, [onRefresh])

  const handleBulkDelete = useCallback(async () => {
    if (selectedBooks.size === 0) return

    if (!confirm(`Ви впевнені, що хочете видалити ${selectedBooks.size} книг?\n\nЦю дію неможливо скасувати!`)) {
      return
    }

    try {
      const { deleteBook } = await import('../../app/admin/actions')
      const promises = Array.from(selectedBooks).map(id => deleteBook(id))
      await Promise.all(promises)
      
      setSelectedBooks(new Set())
      onRefresh()
      alert(`${selectedBooks.size} книг успішно видалено!`)
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('Помилка видалення книг. Перевірте підключення до бази даних.')
    }
  }, [selectedBooks, onRefresh])

  const handleSelectBook = useCallback((bookId: string) => {
    setSelectedBooks(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bookId)) {
        newSet.delete(bookId)
      } else {
        newSet.add(bookId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedBooks.size === paginatedBooks.length) {
      setSelectedBooks(new Set())
    } else {
      setSelectedBooks(new Set(paginatedBooks.map(book => book.id)))
    }
  }, [selectedBooks.size, paginatedBooks])

  const handleExportBooks = useCallback(() => {
    const csvContent = [
      ['Код', 'Назва', 'Автор', 'Категорія', 'Ціна', 'Доступно', 'Всього', 'Статус'],
      ...filteredBooks.map(book => [
        book.code,
        book.title,
        book.author,
        book.category_name || '',
        book.price_uah?.toString() || '',
        book.qty_available?.toString() || '',
        book.qty_total?.toString() || '',
        book.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `books-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }, [filteredBooks])

  // ============================================================================
  // ДОПОМІЖНІ ФУНКЦІЇ
  // ============================================================================

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: {
        label: "Доступна",
        icon: <CheckCircle className="size-3" />,
        className: "bg-green-50 text-green-700 border-green-200"
      },
      issued: {
        label: "Видана",
        icon: <BookOpenCheck className="size-3" />,
        className: "bg-blue-50 text-blue-700 border-blue-200"
      },
      reserved: {
        label: "Зарезервована",
        icon: <Clock className="size-3" />,
        className: "bg-yellow-50 text-yellow-700 border-yellow-200"
      },
      lost: {
        label: "Втрачена",
        icon: <XCircle className="size-3" />,
        className: "bg-red-50 text-red-700 border-red-200"
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available

    return (
      <Chip 
        variant="status" 
        className={config.className}
      >
        {config.icon}
        {config.label}
      </Chip>
    )
  }

  const getQuantityIndicator = (available: number, total: number) => {
    const percentage = total > 0 ? (available / total) * 100 : 0
    
    let color = "text-green-600"
    let bgColor = "bg-green-200"
    
    if (available === 0) {
      color = "text-red-600"
      bgColor = "bg-red-200"
    } else if (available <= 1) {
      color = "text-amber-600"
      bgColor = "bg-amber-200"
    }

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className={`text-h2 ${color}`}>
          {available}
        </div>
        <div className="text-caption text-neutral-500 font-medium">
          з {total} шт
        </div>
        <div className={`w-16 h-2 rounded-2xl ${bgColor}`}>
          <div 
            className={`h-full rounded-2xl transition-all duration-500 ${color.replace('text-', 'bg-')}`}
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>
    )
  }

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(books.map(book => book.category_name).filter(Boolean)))
    return uniqueCategories
  }, [books])

  // ============================================================================
  // РЕНДЕР
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Заголовок з інструментами */}
      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center">
                <BookOpen className="size-6 text-neutral-0" />
              </div>
              <div>
                <CardTitle className="text-body-lg text-neutral-900">Управління книгами</CardTitle>
                <p className="text-body-sm text-neutral-600">
                  Всього книг: <span className="font-semibold text-neutral-900">{books.length}</span>
                  {filters.search && (
                    <span className="ml-2">
                      • Знайдено: <span className="font-semibold text-neutral-900">{filteredBooks.length}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AddBookDialog 
                onBookCreated={onBookCreated} 
              />
              <Button onClick={handleExportBooks} variant="outline" size="default">
                <Download className="size-4 mr-2" />
                Експорт
              </Button>
              <Button 
                onClick={() => setShowFilters(!showFilters)} 
                variant="outline" 
                size="default"
              >
                <Filter className="size-4 mr-2" />
                Фільтри
              </Button>
              <div className="flex items-center gap-1 border border-neutral-200 rounded-lg p-1">
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  <FileText className="size-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Package className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {/* Пошук та фільтри */}
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                placeholder="Пошук по назві, автору, коду..."
                value={filters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 h-11 border-neutral-200 focus:border-neutral-400 focus:ring-gray-400"
              />
            </div>
            <div className="flex items-center gap-2 text-body-sm text-neutral-600">
              <Filter className="size-4" />
              <span>Фільтри: {filteredBooks.length} з {books.length}</span>
            </div>
          </div>

          {/* Розширені фільтри */}
          {showFilters && (
            <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label className="text-body-sm font-medium text-neutral-700">Категорія</Label>
                  <select
                    value={filters.category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-neutral-200 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Всі категорії</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-body-sm font-medium text-neutral-700">Статус</Label>
                  <select
                    value={filters.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-neutral-200 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Всі статуси</option>
                    <option value="available">Доступна</option>
                    <option value="issued">Видана</option>
                    <option value="reserved">Зарезервована</option>
                    <option value="lost">Втрачена</option>
                  </select>
                </div>
                <div>
                  <Label className="text-body-sm font-medium text-neutral-700">Доступність</Label>
                  <select
                    value={filters.availability}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-neutral-200 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Всі</option>
                    <option value="available">Доступні</option>
                    <option value="unavailable">Недоступні</option>
                  </select>
                </div>
                <div>
                  <Label className="text-body-sm font-medium text-neutral-700">Сортування</Label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const [sortBy, sortOrder] = e.target.value.split('-')
                      setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }))
                    }}
                    className="w-full mt-1 px-3 py-2 border border-neutral-200 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="title-asc">Назва А-Я</option>
                    <option value="title-desc">Назва Я-А</option>
                    <option value="author-asc">Автор А-Я</option>
                    <option value="author-desc">Автор Я-А</option>
                    <option value="price-asc">Ціна зростання</option>
                    <option value="price-desc">Ціна спадання</option>
                    <option value="availability-asc">Доступність зростання</option>
                    <option value="availability-desc">Доступність спадання</option>
                    <option value="created-desc">Нові спочатку</option>
                    <option value="created-asc">Старі спочатку</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Масові дії */}
      {selectedBooks.size > 0 && (
        <Card className="rounded-2xl border-orange-200 bg-orange-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                  {selectedBooks.size} обрано
                </Badge>
                <span className="text-body-sm text-neutral-700">
                  Обрані книги для масових дій
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                  <Trash2 className="size-4 mr-2" />
                  Видалити
                </Button>
                <Button onClick={() => setSelectedBooks(new Set())} variant="outline" size="sm">
                  Скасувати
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Таблиця */}
      <Card className="rounded-2xl border-neutral-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px] lg:min-w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50 border-b-2 border-neutral-200">
                    <TableHead className="w-12 bg-neutral-50 font-semibold text-neutral-700 p-4">
                      <input
                        type="checkbox"
                        checked={selectedBooks.size === paginatedBooks.length && paginatedBooks.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-neutral-300 text-accent focus:ring-accent"
                      />
                    </TableHead>
                    <TableHead className="w-20 bg-neutral-50 font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="size-4" />
                        <span className="hidden sm:inline">Обкладинка</span>
                      </div>
                    </TableHead>
                    <TableHead className="w-28 font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <FileText className="size-4" />
                        <span className="hidden sm:inline">Код</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[280px] font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="size-4" />
                        Книга
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[180px] font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <User className="size-4" />
                        <span className="hidden lg:inline">Автор</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[140px] font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <Tag className="size-4" />
                        <span className="hidden lg:inline">Категорія</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-32 font-semibold text-neutral-700 p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Hash className="size-4" />
                        <span className="hidden sm:inline">Кількість</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right w-28 font-semibold text-neutral-700 p-4">
                      <div className="flex items-center justify-end gap-2">
                        <CreditCard className="size-4" />
                        <span className="hidden sm:inline">Ціна</span>
                      </div>
                    </TableHead>
                    <TableHead className="w-32 font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        <span className="hidden lg:inline">Статус</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-44 bg-neutral-100 font-semibold text-neutral-800 p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Settings className="size-4" />
                        Дії
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedBooks.map((book, index) => (
                    <TableRow 
                      key={book.id} 
                      className={`group hover:bg-neutral-50 transition-all duration-200 border-b border-neutral-100 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } ${selectedBooks.has(book.id) ? 'bg-blue-50' : ''}`}
                    >
                      {/* Чекбокс */}
                      <TableCell className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedBooks.has(book.id)}
                          onChange={() => handleSelectBook(book.id)}
                          className="rounded border-neutral-300 text-accent focus:ring-accent"
                        />
                      </TableCell>

                      {/* Обкладинка */}
                      <TableCell className="p-4">
                        <div className="relative">
                          {book.cover_url ? (
                            <div 
                              className="relative group/cover cursor-pointer"
                              onClick={() => handleViewCover(book)}
                            >
                              <Image
                                src={book.cover_url}
                                alt={`Обкладинка: ${book.title}`}
                                width={48}
                                height={64}
                                className="rounded-lg object-cover border border-neutral-200 shadow-sm transition-transform group-hover/cover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                <Eye className="size-4 text-neutral-0" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-16 bg-neutral-100 border border-neutral-200 rounded-lg flex items-center justify-center">
                              <ImageIcon className="size-5 text-neutral-400" />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Код книги */}
                      <TableCell className="p-4">
                        <div className="inline-block px-3 py-2 bg-neutral-100 text-neutral-800 rounded-lg text-body-sm font-mono font-semibold border border-neutral-300 shadow-sm whitespace-nowrap">
                          {book.code}
                        </div>
                      </TableCell>

                      {/* Назва та опис */}
                      <TableCell className="p-4">
                        <div className="space-y-2">
                          <div 
                            className="font-bold text-neutral-900 line-clamp-2 cursor-pointer hover:text-neutral-600 transition-colors duration-200 text-body-sm leading-snug"
                            onClick={() => handleViewBook(book)}
                            title={book.title}
                          >
                            {book.title}
                          </div>
                          {book.description && (
                            <div 
                              className="text-caption text-neutral-500 line-clamp-2 leading-relaxed" 
                              title={book.description}
                            >
                              {book.description}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Автор */}
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-neutral-200 rounded-2xl flex items-center justify-center">
                            <User className="size-4 text-neutral-600" />
                          </div>
                          <div className="text-body-sm text-neutral-700 font-semibold truncate max-w-[140px]" title={book.author}>
                            {book.author}
                          </div>
                        </div>
                      </TableCell>

                      {/* Категорія */}
                      <TableCell className="p-4">
                        <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 rounded-2xl text-caption font-semibold border border-emerald-200 shadow-sm">
                          <Tag className="size-3" />
                          <span className="truncate max-w-[100px]" title={book.category_name || 'No category'}>
                            {book.category_name || 'No category'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Кількість */}
                      <TableCell className="text-center p-4">
                        {getQuantityIndicator(book.qty_available, book.qty_total)}
                      </TableCell>

                      {/* Ціна */}
                      <TableCell className="text-right p-4">
                        {book.price_uah ? (
                          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-2xl font-bold text-body-sm border border-green-200 shadow-sm">
                            <CreditCard className="size-3" />
                            {book.price_uah.toLocaleString('uk-UA')} ₴
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-body-sm font-medium">—</span>
                        )}
                      </TableCell>

                      {/* Статус */}
                      <TableCell className="p-4">
                        {getStatusBadge(book.status)}
                      </TableCell>

                      {/* Дії */}
                      <TableCell className="w-44 bg-neutral-50 p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="group w-9 h-9 rounded-xl bg-neutral-600 text-neutral-0 hover:bg-neutral-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 hover:-translate-y-0.5"
                            onClick={() => handleViewBook(book)}
                            title="Переглянути деталі"
                          >
                            <Eye className="size-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            className="group w-9 h-9 rounded-xl bg-neutral-500 text-neutral-0 hover:bg-neutral-600 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 hover:-translate-y-0.5"
                            onClick={() => handleEditBook(book)}
                            title="Редагувати"
                          >
                            <Edit className="size-4 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            className="group w-9 h-9 rounded-xl bg-neutral-800 text-neutral-0 hover:bg-neutral-900 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 hover:-translate-y-0.5"
                            onClick={() => handleDeleteBook(book)}
                            title="Видалити"
                          >
                            <Trash2 className="size-4 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedBooks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3 text-neutral-500">
                          <ImageIcon className="size-12 text-neutral-300" />
                          <p className="text-body-lg font-medium">Книги не знайдено</p>
                          {filters.search ? (
                            <p className="text-sm">Спробуйте змінити пошуковий запит або фільтри</p>
                          ) : (
                            <p className="text-sm">Додайте першу книгу до колекції</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Пагінація */}
      {totalPages > 1 && (
        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-body-sm text-neutral-600">
                Показано {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredBooks.length)} з {filteredBooks.length} книг
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-3"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline ml-1">Назад</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="default"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-9 w-9 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-3"
                >
                  <span className="hidden sm:inline mr-1">Вперед</span>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Діалог деталей книги */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Деталі книги</DialogTitle>
          </DialogHeader>
          
          {selectedBook && (
            <div className="grid gap-6">
              {/* Обкладинка */}
              {selectedBook.cover_url && (
                <div className="flex justify-center">
                  <div className="relative">
                    <Image
                      src={selectedBook.cover_url}
                      alt={`Обкладинка: ${selectedBook.title}`}
                      width={250}
                      height={375}
                      className="rounded-lg object-cover border border-neutral-200 shadow-lg"
                    />
                    <Button
                      size="default"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => selectedBook.cover_url && window.open(selectedBook.cover_url, '_blank')}
                    >
                      <ExternalLink className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Інформація */}
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Код</Label>
                    <p className="font-mono text-body-sm bg-neutral-100 px-2 py-1 rounded">{selectedBook.code}</p>
                  </div>
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Статус</Label>
                    <div className="mt-1">{getStatusBadge(selectedBook.status)}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-body-sm font-medium text-neutral-600">Назва</Label>
                  <p className="text-body-lg font-medium text-neutral-900">{selectedBook.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Автор</Label>
                    <p className="font-medium text-neutral-700">{selectedBook.author}</p>
                  </div>
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Категорія</Label>
                    <p className="text-neutral-700">{selectedBook.category_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Кількість</Label>
                    <p className="text-neutral-700">
                      <span className="font-medium">{selectedBook.qty_available}</span> доступно з{' '}
                      <span className="font-medium">{selectedBook.qty_total}</span> загалом
                    </p>
                  </div>
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Ціна закупки</Label>
                    <p className="text-neutral-700">
                      {selectedBook.price_uah ? `${selectedBook.price_uah.toLocaleString('uk-UA')} ₴` : '—'}
                    </p>
                  </div>
                </div>

                {selectedBook.location && (
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Локація</Label>
                    <p className="text-neutral-700">{selectedBook.location}</p>
                  </div>
                )}

                {selectedBook.description && (
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Опис</Label>
                    <p className="text-neutral-700 text-body-sm leading-relaxed">{selectedBook.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Створено</Label>
                    <p className="text-caption text-neutral-500">
                      {selectedBook.created_at ? new Date(selectedBook.created_at).toLocaleString('uk-UA') : '—'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Оновлено</Label>
                    <p className="text-caption text-neutral-500">
                      {selectedBook.updated_at ? new Date(selectedBook.updated_at).toLocaleString('uk-UA') : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Діалог редагування книги */}
      <EditBookDialog
        book={editingBook}
        open={!!editingBook}
        onOpenChange={(open: boolean) => !open && setEditingBook(null)}
        onBookUpdated={onRefresh}
      />

      {/* Діалог перегляду обкладинки */}
      <Dialog open={!!imageViewBook} onOpenChange={() => setImageViewBook(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Обкладинка книги</DialogTitle>
          </DialogHeader>
          
          {imageViewBook?.cover_url && (
            <div className="flex flex-col items-center gap-4">
              <Image
                src={imageViewBook.cover_url}
                alt={`Обкладинка: ${imageViewBook.title}`}
                width={300}
                height={450}
                className="rounded-lg object-cover border border-neutral-200 shadow-lg"
              />
              <div className="text-center">
                <p className="font-medium text-neutral-900">{imageViewBook.title}</p>
                <p className="text-body-sm text-neutral-600">{imageViewBook.author}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => imageViewBook.cover_url && window.open(imageViewBook.cover_url, '_blank')}
                className="w-full"
              >
                <ExternalLink className="size-4 mr-2" />
                Відкрити в повному розмірі
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
