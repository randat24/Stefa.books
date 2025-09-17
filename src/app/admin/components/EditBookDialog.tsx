"use client"

import { useState, useEffect } from "react"
import { Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog"
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { CoverUpload } from "./CoverUpload"
import { AuthorSelect } from "./AuthorSelect"
import { CategorySelect } from "./CategorySelect"
import { updateBook } from "../actions"
import { useBookCodes } from "@/lib/hooks/useBookCodes"
import { getCodePrefixForCategory } from "@/lib/book-codes"
import type { BookRow, UpdateBookForm } from "@/lib/types/admin"

// ============================================================================
// ДІАЛОГ РЕДАГУВАННЯ КНИГИ
// ============================================================================

interface EditBookDialogProps {
  book: BookRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBookUpdated: () => void
}

export function EditBookDialog({ book, open, onOpenChange, onBookUpdated }: EditBookDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  
  // Форма редагування
  const [form, setForm] = useState<UpdateBookForm>({
    id: '',
    code: '',
    title: '',
    author: '',
    author_id: null,
    category_id: null,
    category_name: '',
    qty_total: 1,
    price_uah: undefined,
    status: 'available',
    location: '',
    cover_url: undefined,
    description: ''
  })
  
  // Дополнительные состояния для категорий
  const [mainCategoryId, setMainCategoryId] = useState<string | null>(null)
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null)
  
  // Хук для работы с кодами книг
  const { generateCodeForCategory, validateCode, loading: codeLoading } = useBookCodes({
    onCodeGenerated: (code) => {
      setForm(prev => ({ ...prev, code }))
    }
  })

  // ============================================================================
  // ІНІЦІАЛІЗАЦІЯ ФОРМИ
  // ============================================================================

  useEffect(() => {
    if (book && open) {
      setForm({
        id: book.id,
        code: book.code,
        title: book.title,
        author: book.author,
        author_id: book.author_id || null,
        category_id: book.category,
        category_name: book.category_name || '',
        subcategory: book.subcategory || '',
        qty_total: book.qty_total,
        price_uah: book.price_uah || undefined,
        status: book.status,
        location: book.location || '',
        cover_url: book.cover_url || undefined,
        description: book.description || '',
        short_description: book.short_description || ''
      })
      
      // Инициализировать ID категорий (потребуется загрузить из API)
      setMainCategoryId(null) // TODO: получить из book.main_category_id
      setSubcategoryId(null)  // TODO: получить из book.subcategory_id
    }
  }, [book, open])

  // ============================================================================
  // ОБРОБКА ОБКЛАДИНКИ
  // ============================================================================

  function handleCoverUploaded(coverUrl: string) {
    setForm(prev => ({ ...prev, cover_url: coverUrl }))
  }

  function handleCoverRemoved() {
    setForm(prev => ({ ...prev, cover_url: undefined }))
  }

  async function handleOldCoverDelete(publicId: string) {
    try {
      const response = await fetch(`/api/admin/upload/cover?public_id=${publicId}`, {
        method: 'DELETE' })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Ошибка удаления обложки')
      }
    } catch (error) {
      console.error('Delete cover error:', error)
      throw error
    }
  }

  // ============================================================================
  // ОБРОБКА КОДОВ КНИГ
  // ============================================================================

  async function handleCategoryChange(categoryId: string | null, categoryName: string) {
    if (!categoryId) return
    
    setForm(prev => ({ 
      ...prev, 
      category_id: categoryId, 
      category_name: categoryName 
    }))

    // Автогенерация кода при изменении категории
    if (categoryName) {
      await generateCodeForCategory(categoryName)
    }
  }

  function handleCodeChange(code: string) {
    setForm(prev => ({ ...prev, code }))
  }

  async function handleGenerateCode() {
    if (form.category_name) {
      await generateCodeForCategory(form.category_name)
    }
  }

  // ============================================================================
  // ОБРОБКА САБМІТУ ФОРМИ
  // ============================================================================

  async function handleSubmit() {
    if (!book) return

    try {
      // Валідація обов'язкових полів
      if (!form.code?.trim() || !form.title?.trim() || !form.author?.trim() || !form.category_id) {
        alert('Будь ласка, заповніть всі обов\'язкові поля')
        return
      }

      // Валідація коду книги
      if (!validateCode(form.code)) {
        alert('Невірний формат коду книги. Використовуйте формат: XX-001')
        return
      }

      setSubmitting(true)

      // Оновлюємо книгу
      const result = await updateBook(book.id, {
        code: form.code.trim(),
        title: form.title.trim(),
        author: form.author.trim(),
        category_id: form.category_id,
        category_name: form.category_name,
        subcategory: form.subcategory?.trim() || undefined,
        qty_total: Math.max(1, form.qty_total || 1),
        price_uah: form.price_uah || undefined,
        status: form.status || 'available',
        location: form.location?.trim() || undefined,
        description: form.description?.trim() || undefined,
        short_description: form.short_description?.trim() || undefined,
        cover_url: form.cover_url
      })

      if (result.success) {
        // Закриваємо діалог
        onOpenChange(false)
        
        // Оновлюємо список книг
        onBookUpdated()
        
        alert('Книгу успішно оновлено!')
      } else {
        alert(`Помилка: ${result.error}`)
      }

    } catch (error) {
      console.error('Update error:', error)
      alert('Помилка оновлення книги')
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================================
  // РЕНДЕР ФОРМИ
  // ============================================================================

  if (!book) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="size-5" />
            Редагувати книгу
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Завантаження обкладинки */}
          <CoverUpload
            currentCoverUrl={form.cover_url}
            onCoverUploaded={handleCoverUploaded}
            onCoverRemoved={handleCoverRemoved}
            onOldCoverDelete={handleOldCoverDelete}
            disabled={submitting}
          />

          {/* Основна інформація */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code">Код книги *</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-code"
                  placeholder="DL-001"
                  value={form.code}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleCodeChange(e.target.value)}
                  disabled={submitting}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCode}
                  disabled={submitting || codeLoading || !form.category_name}
                  className="px-3"
                >
                  {codeLoading ? '...' : 'Авто'}
                </Button>
              </div>
              {form.category_name && getCodePrefixForCategory(form.category_name) && (
                <p className="text-caption text-neutral-500">
                  Автоматично: {getCodePrefixForCategory(form.category_name)}-XXX
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Назва *</Label>
              <Input
                id="edit-title"
                placeholder="Назва книги"
                value={form.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, title: e.target.value }))}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Выбор автора */}
          <AuthorSelect
            value={form.author_id}
            onChange={(authorId, authorName) => setForm(prev => ({ 
              ...prev, 
              author_id: authorId, 
              author: authorName 
            }))}
            disabled={submitting}
          />

          {/* Выбор категорий */}
          <CategorySelect
            mainCategoryId={mainCategoryId}
            subcategoryId={subcategoryId}
            onMainCategoryChange={handleCategoryChange}
            onSubcategoryChange={(subcategoryId, subcategoryName) => {
              setSubcategoryId(subcategoryId)
              setForm(prev => ({ ...prev, subcategory: subcategoryName }))
            }}
            disabled={submitting}
          />

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-qtyTotal">Кількість екземплярів *</Label>
              <Input
                id="edit-qtyTotal"
                type="number"
                min="1"
                value={form.qty_total}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, qty_total: parseInt(e.target.value) || 1 }))}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Ціна закупки (грн)</Label>
              <Input
                id="edit-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="180.00"
                value={form.price_uah || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, price_uah: parseFloat(e.target.value) || undefined }))}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Статус *</Label>
              <Select
                value={form.status}
                onValueChange={(value: any) => setForm(prev => ({ ...prev, status: value }))}
                disabled={submitting}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Точка видачі</Label>
            <Input
              id="edit-location"
              placeholder="вул. Маріупольська 13/2, Кафе 'Книжкова'"
              value={form.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, location: e.target.value }))}
              disabled={submitting}
            />
          </div>

          {/* Опис */}
          <div className="space-y-2">
            <Label htmlFor="edit-description">Опис книги</Label>
            <Textarea
              id="edit-description"
              className="min-h-[100px] resize-none"
              placeholder="Короткий опис змісту, вік читачів, особливості..."
              value={form.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(prev => ({ ...prev, description: e.target.value }))}
              disabled={submitting}
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Скасувати
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting}
            className="min-w-[120px]"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-2xl h-4 w-4 border-b-2 border-neutral-0"></div>
                Збереження...
              </div>
            ) : (
              'Зберегти зміни'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}