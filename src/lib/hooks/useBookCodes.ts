'use client'

import { useState, useCallback } from 'react'
import { generateNextBookCode, getCodePrefixForCategory, isValidBookCode } from '@/lib/book-codes'

// ============================================================================
// ХУК ДЛЯ РАБОТЫ С КОДАМИ КНИГ
// ============================================================================

interface UseBookCodesOptions {
  existingCodes?: string[]
  onCodeGenerated?: (code: string) => void
}

export function useBookCodes(options: UseBookCodesOptions = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============================================================================
  // ГЕНЕРАЦИЯ КОДА ПО КАТЕГОРИИ
  // ============================================================================

  const generateCodeForCategory = useCallback(async (categoryName: string): Promise<string | null> => {
    try {
      setLoading(true)
      setError(null)

      // Проверяем, поддерживается ли категория
      const prefix = getCodePrefixForCategory(categoryName)
      if (!prefix) {
        setError(`Категория "${categoryName}" не поддерживает автоматическую генерацию кодов`)
        return null
      }

      // Если есть локальные коды, используем их
      if (options.existingCodes) {
        const nextCode = generateNextBookCode(options.existingCodes, categoryName)
        if (nextCode) {
          options.onCodeGenerated?.(nextCode)
          return nextCode
        }
      }

      // Иначе запрашиваем с сервера
      const response = await fetch(`/api/admin/books/next-code?category=${encodeURIComponent(categoryName)}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка генерации кода')
      }

      if (result.success && result.code) {
        options.onCodeGenerated?.(result.code)
        return result.code
      }

      return null

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
      setError(errorMessage)
      console.error('Generate code error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [options.existingCodes, options.onCodeGenerated])

  // ============================================================================
  // ВАЛИДАЦИЯ КОДА
  // ============================================================================

  const validateCode = useCallback((code: string): boolean => {
    return isValidBookCode(code)
  }, [])

  // ============================================================================
  // ПРОВЕРКА КОДА НА УНИКАЛЬНОСТЬ
  // ============================================================================

  const isCodeUnique = useCallback((code: string): boolean => {
    if (!options.existingCodes) return true
    return !options.existingCodes.includes(code)
  }, [options.existingCodes])

  // ============================================================================
  // ОЧИСТКА ОШИБОК
  // ============================================================================

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    generateCodeForCategory,
    validateCode,
    isCodeUnique,
    clearError
  }
}
