'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  BookOpen, 
  User, 
  Tag, 
  Hash, 
  CreditCard, 
  MapPin,
  Check,
  X
} from 'lucide-react'
import type { BookRow } from '@/lib/types/admin'

interface EditBookDialogProps {
  book: BookRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookUpdated?: () => void
}

interface BookFormData {
  code: string
  title: string
  author: string
  category: string | null
  category_name: string
  subcategory: string
  description: string
  short_description: string
  isbn: string
  pages: number | null
  age_range: string
  language: string
  publisher: string
  publication_year: number | null
  cover_url: string
  status: 'available' | 'issued' | 'reserved' | 'lost'
  qty_total: number
  qty_available: number
  price_uah: number | null
  location: string
  rating: number | null
  badges: string[]
  tags: string[]
}

export function EditBookDialog({ book, open, onOpenChange, onBookUpdated }: EditBookDialogProps) {
  const [formData, setFormData] = useState<BookFormData>({
    code: '',
    title: '',
    author: '',
    category: null,
    category_name: '',
    subcategory: '',
    description: '',
    short_description: '',
    isbn: '',
    pages: null,
    age_range: '',
    language: 'uk',
    publisher: '',
    publication_year: null,
    cover_url: '',
    status: 'available',
    qty_total: 1,
    qty_available: 1,
    price_uah: null,
    location: '',
    rating: null,
    badges: [],
    tags: []
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([])

  // Загружаем категории при открытии диалога
  useEffect(() => {
    if (open) {
      loadCategories()
    }
  }, [open])

  // Заполняем форму данными книги
  useEffect(() => {
    if (book && open) {
      setFormData({
        code: book.code || '',
        title: book.title || '',
        author: book.author || '',
        category: book.category_id || null,
        category_name: book.category_name || '',
        subcategory: book.subcategory || '',
        description: book.description || '',
        short_description: book.short_description || '',
        isbn: book.isbn || '',
        pages: book.pages || null,
        age_range: book.age_range || '',
        language: book.language || 'uk',
        publisher: book.publisher || '',
        publication_year: book.publication_year || null,
        cover_url: book.cover_url || '',
        status: book.status || 'available',
        qty_total: book.qty_total || 1,
        qty_available: book.qty_available || 1,
        price_uah: book.price_uah || null,
        location: book.location || '',
        rating: book.rating || null,
        badges: book.badges || [],
        tags: book.tags || []
      })
    }
  }, [book, open])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleInputChange = (field: keyof BookFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      category_name: category?.name || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!book) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/books/${book.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        onBookUpdated?.()
        onOpenChange(false)
      } else {
        setError(result.error || 'Помилка оновлення книги')
      }
    } catch (error) {
      console.error('Error updating book:', error)
      setError('Помилка оновлення книги')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
    }
  }

  if (!book) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="size-5" />
            Редагувати книгу
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Основная информация */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code" className="flex items-center gap-2">
                <Hash className="size-4" />
                Код книги *
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('code', e.target.value)}
                placeholder="DL-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center gap-2">
                <BookOpen className="size-4" />
                Назва книги *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                placeholder="Назва книги"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="author" className="flex items-center gap-2">
                <User className="size-4" />
                Автор *
              </Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('author', e.target.value)}
                placeholder="Ім'я автора"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="size-4" />
                Категорія
              </Label>
              <Select
                value={formData.category || ''}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть категорію" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <Label htmlFor="description">Опис</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
              placeholder="Повний опис книги"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Короткий опис</Label>
            <Textarea
              id="short_description"
              value={formData.short_description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('short_description', e.target.value)}
              placeholder="Короткий опис для картки"
              rows={2}
            />
          </div>

          {/* Детали */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('isbn', e.target.value)}
                placeholder="978-0-123456-78-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pages">Сторінки</Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('pages', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age_range">Вікова категорія</Label>
              <Input
                id="age_range"
                value={formData.age_range}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('age_range', e.target.value)}
                placeholder="6+"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="publisher">Видавництво</Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('publisher', e.target.value)}
                placeholder="Назва видавництва"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publication_year">Рік видання</Label>
              <Input
                id="publication_year"
                type="number"
                value={formData.publication_year || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('publication_year', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="2024"
              />
            </div>
          </div>

          {/* Количество и цена */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="qty_total">Всього екземплярів *</Label>
              <Input
                id="qty_total"
                type="number"
                min="1"
                value={formData.qty_total}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('qty_total', parseInt(e.target.value) || 1)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty_available">Доступно *</Label>
              <Input
                id="qty_available"
                type="number"
                min="0"
                value={formData.qty_available}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('qty_available', parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_uah" className="flex items-center gap-2">
                <CreditCard className="size-4" />
                Ціна (₴)
              </Label>
              <Input
                id="price_uah"
                type="number"
                step="0.01"
                value={formData.price_uah || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('price_uah', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="150.00"
              />
            </div>
          </div>

          {/* Статус и местоположение */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Доступна</SelectItem>
                  <SelectItem value="issued">Видана</SelectItem>
                  <SelectItem value="reserved">Зарезервована</SelectItem>
                  <SelectItem value="lost">Втрачена</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="size-4" />
                Місцезнаходження
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('location', e.target.value)}
                placeholder="Полиця А-1"
              />
            </div>
          </div>

          {/* Обложка */}
          <div className="space-y-2">
            <Label htmlFor="cover_url">URL обкладинки</Label>
            <Input
              id="cover_url"
              value={formData.cover_url}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('cover_url', e.target.value)}
              placeholder="https://res.cloudinary.com/..."
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="size-4 mr-2" />
              Скасувати
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              <Check className="size-4 mr-2" />
              {loading ? 'Збереження...' : 'Зберегти зміни'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
