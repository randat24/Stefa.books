'use client'

import { useState, useCallback } from 'react'
import { generateNextBookArticle, getArticlePrefixForCategory, isValidBookArticle } from '@/lib/book-codes'

// ============================================================================
// ХУК ДЛЯ РАБОТЫ С АРТИКУЛАМИ КНИГ
// ============================================================================

interface UseBookArticlesOptions {
  existingArticles?: string[]
  onArticleGenerated?: (article: string) => void
}

export function useBookArticles(options: UseBookArticlesOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============================================================================
  // ГЕНЕРАЦИЯ АРТИКУЛА ПО КАТЕГОРИИ
  // ============================================================================

  const generateArticleForCategory = useCallback(async (categoryName: string): Promise<string | null> => {
    try {
      setLoading(true)
      setError(null)

      // Проверяем, поддерживается ли категория
      const prefix = getArticlePrefixForCategory(categoryName)
      if (!prefix) {
        setError(`Категория "${categoryName}" не поддерживает автоматическую генерацию артикулов`)
        return null
      }

      // Если есть локальные артикулы, используем их
      if (options.existingArticles) {
        const nextArticle = generateNextBookArticle(options.existingArticles, categoryName)
        if (nextArticle) {
          options.onArticleGenerated?.(nextArticle)
          return nextArticle
        }
      }

      // Иначе запрашиваем с сервера
      const response = await fetch(`/api/admin/books/next-article?category=${encodeURIComponent(categoryName)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка генерации артикула')
      }

      if (result.success && result.article) {
        options.onArticleGenerated?.(result.article)
        return result.article
      }

      return null

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(errorMessage)
      console.error('Generate article error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [options])

  // ============================================================================
  // ВАЛИДАЦИЯ АРТИКУЛА
  // ============================================================================

  const validateArticle = useCallback((article: string): boolean => {
    return isValidBookArticle(article)
  }, [])

  // ============================================================================
  // ПРОВЕРКА АРТИКУЛА НА УНИКАЛЬНОСТЬ
  // ============================================================================

  const isArticleUnique = useCallback((article: string): boolean => {
    if (!options.existingArticles) return true
    return !options.existingArticles.includes(article)
  }, [options.existingArticles])

  // ============================================================================
  // ОЧИСТКА ОШИБОК
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    generateArticleForCategory,
    validateArticle,
    isArticleUnique,
    clearError
  }
}

// ============================================================================
// ОБРАТНАЯ СОВМЕСТИМОСТЬ (DEPRECATED)
// ============================================================================

/**
 * @deprecated Используйте useBookArticles вместо useBookCodes
 */
export function useBookCodes(options: UseBookArticlesOptions = {}) {
  return useBookArticles(options)
}
