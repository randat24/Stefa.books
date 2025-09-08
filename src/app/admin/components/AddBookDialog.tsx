"use client"

import { useState } from "react"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"
import { 
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { CoverUpload } from "./CoverUpload"
import { AuthorSelect } from "./AuthorSelect"
import { CategorySelect } from "./CategorySelect"
import { createBook } from "../actions"
import type { CreateBookForm } from "@/lib/types/admin"

// ============================================================================
// ДІАЛОГ ДОДАВАННЯ НОВОЇ КНИГИ
// ============================================================================

interface AddBookDialogProps {
  onBookCreated: () => void
}

export function AddBookDialog({ onBookCreated }: AddBookDialogProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  
  // Форма
  const [form, setForm] = useState<CreateBookForm>({
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

  // ============================================================================
  // ГЕНЕРАЦІЯ УНІКАЛЬНОГО КОДУ
  // ============================================================================

  function generateUniqueCode() {
    // Генерируем код в формате: SB-YYYY-NNNN
    // SB - Stefa Books, YYYY - год, NNNN - случайное число
    const year = new Date().getFullYear()
    const randomNum = Math.floor(Math.random() * 9000) + 1000 // 1000-9999
    return `SB-${year}-${randomNum}`
  }

  function handleGenerateCode() {
    const newCode = generateUniqueCode()
    setForm(prev => ({ ...prev, code: newCode }))
  }

  // Автоматическая генерация кода при открытии диалога
  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (newOpen && !form.code) {
      // Генерируем код только если поле пустое
      handleGenerateCode()
    }
  }

  // ============================================================================
  // ОБРОБКА ОБКЛАДИНКИ
  // ============================================================================

  function handleCoverUploaded(coverUrl: string) {
    setForm(prev => ({ ...prev, cover_url: coverUrl }))
  }

  function handleCoverRemoved() {
    setForm(prev => ({ ...prev, cover_url: undefined }))
  }

  // ============================================================================
  // ОБРОБКА САБМІТУ ФОРМИ
  // ============================================================================

  async function handleSubmit() {
    try {
      // Валідація обов'язкових полів
      if (!form.code.trim() || !form.title.trim() || !form.author.trim() || !form.category_id) {
        alert('Будь ласка, заповніть всі обов\'язкові поля')
        return
      }

      setSubmitting(true)

      // Створюємо книгу
      const result = await createBook({
        ...form,
        code: form.code.trim(),
        title: form.title.trim(),
        author: form.author.trim(),
        category_id: form.category_id,
        category_name: form.category_name,
        qty_total: Math.max(1, form.qty_total),
        price_uah: form.price_uah || undefined,
        location: form.location?.trim() || undefined,
        description: form.description?.trim() || undefined,
        cover_url: form.cover_url
      })

      if (result.success) {
        // Очищаємо форму
        setForm({
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
        
        // Очищаем состояния категорий
        setMainCategoryId(null)
        setSubcategoryId(null)
        
        // Закриваємо діалог
        setOpen(false)
        
        // Оновлюємо список книг
        onBookCreated()
        
        alert('Книгу успішно додано!')
      } else {
        alert(`Помилка: ${result.error}`)
      }

    } catch (error) {
      console.error('Submit error:', error)
      alert('Помилка створення книги')
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================================
  // РЕНДЕР ФОРМИ
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl gap-2">
          <Plus className="size-4" />
          Додати книгу
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[700px] rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Додати нову книгу</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Завантаження обкладинки */}
          <CoverUpload
            currentCoverUrl={form.cover_url}
            onCoverUploaded={handleCoverUploaded}
            onCoverRemoved={handleCoverRemoved}
            disabled={submitting}
          />

          {/* Основна інформація */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Код книги *</Label>
              <div className="flex gap-2">
                <Input
                  id="code"
                  placeholder="SB-2025-1234"
                  value={form.code}
                  onChange={(e) => setForm(prev => ({ ...prev, code: e.target.value }))}
                  disabled={submitting}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateCode}
                  disabled={submitting}
                  title="Згенерувати унікальний код"
                  className="px-3"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-caption text-gray-500">
                Формат: SB-YYYY-NNNN (наприклад: SB-2025-1234)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Назва *</Label>
              <Input
                id="title"
                placeholder="Назва книги"
                value={form.title}
                onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
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
            onMainCategoryChange={(categoryId, categoryName) => {
              setMainCategoryId(categoryId)
              setForm(prev => ({ ...prev, category_id: categoryId, category_name: categoryName }))
            }}
            onSubcategoryChange={(subcategoryId, subcategoryName) => {
              setSubcategoryId(subcategoryId)
              setForm(prev => ({ ...prev, subcategory: subcategoryName }))
            }}
            disabled={submitting}
          />

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qtyTotal">Кількість екземплярів *</Label>
              <Input
                id="qtyTotal"
                type="number"
                min="1"
                value={form.qty_total}
                onChange={(e) => setForm(prev => ({ ...prev, qty_total: parseInt(e.target.value) || 1 }))}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Ціна закупки (грн)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="180.00"
                value={form.price_uah || ''}
                onChange={(e) => setForm(prev => ({ ...prev, price_uah: parseFloat(e.target.value) || undefined }))}
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Статус *</Label>
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
            <Label htmlFor="location">Точка видачі</Label>
            <Input
              id="location"
              placeholder="вул. Маріупольська 13/2, Кафе 'Книжкова'"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              disabled={submitting}
            />
          </div>

          {/* Опис */}
          <div className="space-y-2">
            <Label htmlFor="description">Опис книги</Label>
            <Textarea
              id="description"
              className="min-h-[100px] resize-none"
              placeholder="Короткий опис змісту, вік читачів, особливості..."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              disabled={submitting}
            />
            <p className="text-caption text-gray-500">
              Додайте цікавий опис, який допоможе батькам обрати книгу для дітей
            </p>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
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
                <div className="animate-spin rounded-2xl h-4 w-4 border-b-2 border-white"></div>
                Збереження...
              </div>
            ) : (
              'Зберегти книгу'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}