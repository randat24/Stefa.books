"use client"

import { useState, useEffect } from "react"
import { Plus, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import type { AuthorRow } from "@/lib/types/admin"

// ============================================================================
// КОМПОНЕНТ ВЫБОРА АВТОРА
// ============================================================================

interface AuthorSelectProps {
  value?: string | null
  onChange: (authorId: string | null, authorName: string) => void
  disabled?: boolean
}

export function AuthorSelect({ value, onChange, disabled }: AuthorSelectProps) {
  const [authors, setAuthors] = useState<AuthorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newAuthorName, setNewAuthorName] = useState('')
  const [adding, setAdding] = useState(false)

  // Загрузка авторов
  useEffect(() => {
    loadAuthors()
  }, [])

  const loadAuthors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/authors')
      const data = await response.json()
      
      if (data.success) {
        setAuthors(data.data)
      } else {
        console.error('Failed to load authors:', data.error)
      }
    } catch (error) {
      console.error('Error loading authors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAuthor = async () => {
    if (!newAuthorName.trim()) return

    try {
      setAdding(true)
      const response = await fetch('/api/authors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAuthorName.trim() })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAuthors(prev => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)))
        onChange(data.data.id, data.data.name)
        setNewAuthorName('')
        setShowAddDialog(false)
      } else {
        console.error('Failed to add author:', data.error)
        alert('Ошибка добавления автора: ' + data.error)
      }
    } catch (error) {
      console.error('Error adding author:', error)
      alert('Ошибка добавления автора')
    } finally {
      setAdding(false)
    }
  }

  const handleValueChange = (authorId: string) => {
    const author = authors.find(a => a.id === authorId)
    onChange(authorId, author?.name || '')
  }

  const selectedAuthor = authors.find(a => a.id === value)

  return (
    <div className="space-y-2">
      <Label>Автор *</Label>
      <div className="flex gap-2">
        <Select 
          value={value || ''} 
          onValueChange={handleValueChange}
          disabled={disabled || loading}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={loading ? "Загружается..." : "Выберите автора"}>
              {selectedAuthor && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {selectedAuthor.name}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {authors.map((author) => (
              <SelectItem key={author.id} value={author.id}>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{author.name}</span>
                  {author.nationality && (
                    <span className="text-xs text-muted-foreground">
                      ({author.nationality})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              size="md"
              disabled={disabled}
              title="Добавить нового автора"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Добавить автора</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="author-name">Имя автора *</Label>
                <Input
                  id="author-name"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  placeholder="Введите имя автора"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAuthor()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Отмена
                </Button>
                <Button
                  type="button"
                  onClick={handleAddAuthor}
                  disabled={!newAuthorName.trim() || adding}
                >
                  {adding ? 'Добавление...' : 'Добавить'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}