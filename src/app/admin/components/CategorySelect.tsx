"use client"

import { useState, useEffect } from "react"
import { Plus, Folder, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"

// ============================================================================
// ТИПЫ ДЛЯ КАТЕГОРИЙ
// ============================================================================

interface MainCategory {
  id: string
  name: string
  display_order: number
}

interface Subcategory {
  id: string
  name: string
  main_category_id: string
  display_order: number
}

interface CategoryData {
  mainCategories: MainCategory[]
  subcategories: Subcategory[]
}

// ============================================================================
// КОМПОНЕНТ ВЫБОРА КАТЕГОРИЙ
// ============================================================================

interface CategorySelectProps {
  mainCategoryId?: string | null
  subcategoryId?: string | null
  onMainCategoryChange: (categoryId: string | null, categoryName: string) => void
  onSubcategoryChange: (subcategoryId: string | null, subcategoryName: string) => void
  disabled?: boolean
}

export function CategorySelect({ 
  mainCategoryId, 
  subcategoryId, 
  onMainCategoryChange, 
  onSubcategoryChange,
  disabled 
}: CategorySelectProps) {
  const [categoryData, setCategoryData] = useState<CategoryData>({
    mainCategories: [],
    subcategories: []
  })
  const [loading, setLoading] = useState(true)
  const [showAddMainDialog, setShowAddMainDialog] = useState(false)
  const [showAddSubDialog, setShowAddSubDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [adding, setAdding] = useState(false)

  // Загрузка категорий
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      const data = await response.json()
      
      if (data.success) {
        // Распарсить структурированные категории
        const mainCategories: MainCategory[] = []
        const subcategories: Subcategory[] = []
        
        data.data.forEach((mainCat: any) => {
          mainCategories.push({
            id: mainCat.id,
            name: mainCat.name,
            display_order: mainCat.display_order
          })
          
          if (mainCat.subcategories) {
            mainCat.subcategories.forEach((subCat: any) => {
              subcategories.push({
                id: subCat.id,
                name: subCat.name,
                main_category_id: mainCat.id,
                display_order: subCat.display_order
              })
            })
          }
        })
        
        setCategoryData({ mainCategories, subcategories })
      } else {
        console.error('Failed to load categories:', data.error)
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMainCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      setAdding(true)
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newCategoryName.trim(),
          type: 'main'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadCategories() // Перезагрузить категории
        onMainCategoryChange(data.data.id, data.data.name)
        setNewCategoryName('')
        setShowAddMainDialog(false)
      } else {
        console.error('Failed to add main category:', data.error)
        alert('Ошибка добавления категории: ' + data.error)
      }
    } catch (error) {
      console.error('Error adding main category:', error)
      alert('Ошибка добавления категории')
    } finally {
      setAdding(false)
    }
  }

  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim() || !mainCategoryId) return

    try {
      setAdding(true)
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newSubcategoryName.trim(),
          type: 'sub',
          main_category_id: mainCategoryId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadCategories() // Перезагрузить категории
        onSubcategoryChange(data.data.id, data.data.name)
        setNewSubcategoryName('')
        setShowAddSubDialog(false)
      } else {
        console.error('Failed to add subcategory:', data.error)
        alert('Ошибка добавления подкатегории: ' + data.error)
      }
    } catch (error) {
      console.error('Error adding subcategory:', error)
      alert('Ошибка добавления подкатегории')
    } finally {
      setAdding(false)
    }
  }

  const handleMainCategoryChange = (categoryId: string) => {
    const category = categoryData.mainCategories.find(c => c.id === categoryId)
    onMainCategoryChange(categoryId, category?.name || '')
    // Очистить подкатегорию при смене основной категории
    onSubcategoryChange(null, '')
  }

  const handleSubcategoryChange = (subcategoryId: string) => {
    const subcategory = categoryData.subcategories.find(s => s.id === subcategoryId)
    onSubcategoryChange(subcategoryId, subcategory?.name || '')
  }

  const selectedMainCategory = categoryData.mainCategories.find(c => c.id === mainCategoryId)
  const selectedSubcategory = categoryData.subcategories.find(s => s.id === subcategoryId)
  const availableSubcategories = mainCategoryId 
    ? categoryData.subcategories.filter(s => s.main_category_id === mainCategoryId)
    : []

  return (
    <div className="space-y-4">
      {/* Основная категория */}
      <div className="space-y-2">
        <Label>Основная категория *</Label>
        <div className="flex gap-2">
          <Select 
            value={mainCategoryId || ''} 
            onValueChange={handleMainCategoryChange}
            disabled={disabled || loading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={loading ? "Загружается..." : "Выберите категорию"}>
                {selectedMainCategory && (
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    {selectedMainCategory.name}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categoryData.mainCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-muted-foreground" />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showAddMainDialog} onOpenChange={setShowAddMainDialog}>
            <DialogTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="md"
                disabled={disabled}
                title="Добавить основную категорию"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Добавить основную категорию</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="main-category-name">Название категории *</Label>
                  <Input
                    id="main-category-name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Введите название категории"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMainCategory()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddMainDialog(false)}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddMainCategory}
                    disabled={!newCategoryName.trim() || adding}
                  >
                    {adding ? 'Добавление...' : 'Добавить'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Подкатегория */}
      <div className="space-y-2">
        <Label>Подкатегория</Label>
        <div className="flex gap-2">
          <Select 
            value={subcategoryId || ''} 
            onValueChange={handleSubcategoryChange}
            disabled={disabled || loading || !mainCategoryId}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={
                !mainCategoryId ? "Сначала выберите основную категорию" :
                loading ? "Загружается..." : "Выберите подкатегорию"
              }>
                {selectedSubcategory && (
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    {selectedSubcategory.name}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableSubcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{subcategory.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showAddSubDialog} onOpenChange={setShowAddSubDialog}>
            <DialogTrigger asChild>
              <Button 
                type="button" 
                variant="outline" 
                size="md"
                disabled={disabled || !mainCategoryId}
                title="Добавить подкатегорию"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Добавить подкатегорию</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="subcategory-name">Название подкатегории *</Label>
                  <Input
                    id="subcategory-name"
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    placeholder="Введите название подкатегории"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubcategory()}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  Будет добавлена в категорию: <strong>{selectedMainCategory?.name}</strong>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddSubDialog(false)}
                  >
                    Отмена
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddSubcategory}
                    disabled={!newSubcategoryName.trim() || adding}
                  >
                    {adding ? 'Добавление...' : 'Добавить'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}