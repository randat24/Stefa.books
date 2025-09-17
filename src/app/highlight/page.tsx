'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Highlighter, 
  Download, 
  Upload, 
  Copy,
  Trash2,
  Palette,
  Type,
  Bold,
  Italic
} from 'lucide-react'
import { logger } from '@/lib/logger'

interface Highlight {
  id: string
  text: string
  color: string
  start: number
  end: number
}

const HIGHLIGHT_COLORS = [
  { name: 'Желтый', value: 'bg-yellow-200', class: 'bg-yellow-200' },
  { name: 'Зеленый', value: 'bg-green-200', class: 'bg-green-200' },
  { name: 'Синий', value: 'bg-blue-200', class: 'bg-blue-200' },
  { name: 'Розовый', value: 'bg-pink-200', class: 'bg-pink-200' },
  { name: 'Фиолетовый', value: 'bg-purple-200', class: 'bg-purple-200' },
  { name: 'Оранжевый', value: 'bg-orange-200', class: 'bg-orange-200' }
]

export default function HighlightPage() {
  const [text, setText] = useState('')
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [selectedText, setSelectedText] = useState('')
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].value)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [isSelecting, setIsSelecting] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const handleSelection = () => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      
      if (start !== end) {
        setSelectionStart(start)
        setSelectionEnd(end)
        setSelectedText(text.substring(start, end))
        setIsSelecting(true)
      } else {
        setIsSelecting(false)
      }
    }

    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener('mouseup', handleSelection)
      textarea.addEventListener('keyup', handleSelection)
      
      return () => {
        textarea.removeEventListener('mouseup', handleSelection)
        textarea.removeEventListener('keyup', handleSelection)
      }
    }
  }, [text])

  const addHighlight = () => {
    if (!selectedText.trim() || !isSelecting) return

    const newHighlight: Highlight = {
      id: Date.now().toString(),
      text: selectedText,
      color: selectedColor,
      start: selectionStart,
      end: selectionEnd
    }

    setHighlights(prev => [...prev, newHighlight])
    setSelectedText('')
    setIsSelecting(false)
    
    // Очищаем выделение
    if (textareaRef.current) {
      textareaRef.current.setSelectionRange(0, 0)
    }

    logger.info('Добавлено выделение:', newHighlight)
  }

  const removeHighlight = (id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id))
    logger.info('Удалено выделение:', id)
  }

  const clearAllHighlights = () => {
    setHighlights([])
    logger.info('Очищены все выделения')
  }

  const copyText = () => {
    navigator.clipboard.writeText(text)
    logger.info('Текст скопирован в буфер обмена')
  }

  const downloadHighlights = () => {
    const data = {
      text,
      highlights,
      timestamp: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `highlights-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    logger.info('Выделения экспортированы')
  }

  const loadHighlights = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.text && data.highlights) {
          setText(data.text)
          setHighlights(data.highlights)
          logger.info('Выделения загружены из файла')
        }
      } catch (error) {
        logger.error('Ошибка загрузки файла:', error)
      }
    }
    reader.readAsText(file)
  }

  const renderTextWithHighlights = () => {
    if (!text) return text

    let result = text
    const sortedHighlights = [...highlights].sort((a, b) => b.start - a.start)

    sortedHighlights.forEach(highlight => {
      const before = result.substring(0, highlight.start)
      const highlighted = result.substring(highlight.start, highlight.end)
      const after = result.substring(highlight.end)
      
      const colorClass = HIGHLIGHT_COLORS.find(c => c.value === highlight.color)?.class || 'bg-yellow-200'
      
      result = before + `<mark class="${colorClass} px-1 rounded">${highlighted}</mark>` + after
    })

    return result
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Highlighter className="h-6 w-6 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Инструмент выделения текста</h1>
          </div>
          <p className="text-gray-600">Выделяйте важные части текста разными цветами</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основная область */}
          <div className="lg:col-span-2 space-y-6">
            {/* Панель инструментов */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Текстовый редактор
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Выделение */}
                {isSelecting && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Выделенный текст:</p>
                        <p className="text-sm text-blue-700">"{selectedText}"</p>
                      </div>
                      <Button size="sm" onClick={addHighlight}>
                        <Highlighter className="h-4 w-4 mr-2" />
                        Выделить
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-blue-900">Цвет:</span>
                      <div className="flex gap-1">
                        {HIGHLIGHT_COLORS.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setSelectedColor(color.value)}
                            className={`w-6 h-6 rounded border-2 ${
                              selectedColor === color.value ? 'border-gray-900' : 'border-gray-300'
                            } ${color.class}`}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Текстовое поле */}
                <Textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Введите или вставьте текст для выделения..."
                  className="min-h-[400px] resize-none"
                />

                {/* Кнопки действий */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={copyText}>
                    <Copy className="h-4 w-4 mr-2" />
                    Копировать
                  </Button>
                  
                  <Button variant="outline" onClick={downloadHighlights}>
                    <Download className="h-4 w-4 mr-2" />
                    Экспорт
                  </Button>
                  
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Импорт
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={loadHighlights}
                      className="hidden"
                    />
                  </label>
                  
                  {highlights.length > 0 && (
                    <Button variant="destructive" onClick={clearAllHighlights}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Очистить все
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Предварительный просмотр */}
            {text && (
              <Card>
                <CardHeader>
                  <CardTitle>Предварительный просмотр</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose max-w-none p-4 bg-white rounded border"
                    dangerouslySetInnerHTML={{ __html: renderTextWithHighlights() }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Статистика */}
            <Card>
              <CardHeader>
                <CardTitle>Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Символов:</span>
                  <span className="font-medium">{text.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Слов:</span>
                  <span className="font-medium">{text.split(/\s+/).filter(w => w.length > 0).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Выделений:</span>
                  <span className="font-medium">{highlights.length}</span>
                </div>
              </CardContent>
            </Card>

            {/* Список выделений */}
            <Card>
              <CardHeader>
                <CardTitle>Выделения ({highlights.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {highlights.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Нет выделений
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {highlights.map((highlight) => {
                      const colorInfo = HIGHLIGHT_COLORS.find(c => c.value === highlight.color)
                      return (
                        <div
                          key={highlight.id}
                          className="flex items-start gap-2 p-2 rounded border"
                        >
                          <div className={`w-4 h-4 rounded flex-shrink-0 mt-0.5 ${colorInfo?.class}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{highlight.text}</p>
                            <p className="text-xs text-gray-500">
                              {colorInfo?.name} • {highlight.start}-{highlight.end}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeHighlight(highlight.id)}
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Инструкции */}
            <Card>
              <CardHeader>
                <CardTitle>Как использовать</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>1. Введите или вставьте текст</p>
                <p>2. Выделите нужный фрагмент</p>
                <p>3. Выберите цвет выделения</p>
                <p>4. Нажмите "Выделить"</p>
                <p>5. Экспортируйте результат</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
