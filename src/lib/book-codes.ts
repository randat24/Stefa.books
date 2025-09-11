// ============================================================================
// СИСТЕМА АВТОМАТИЧЕСКОЙ ГЕНЕРАЦИИ КОДОВ КНИГ
// ============================================================================

// Маппинг категорий на префиксы кодов
export const CATEGORY_CODE_PREFIXES = {
  'Підліткова література': 'PL',
  'Дитяча література': 'DL', 
  'Книжки-картинки': 'KP',
  'Класична література': 'KL',
  'Науково-популярна література': 'NP',
  'Історична література': 'IL',
  'Психологія та розвиток': 'PD'
} as const

export type CategoryCodePrefix = keyof typeof CATEGORY_CODE_PREFIXES

// ============================================================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С КОДАМИ
// ============================================================================

/**
 * Извлекает префикс и номер из кода книги
 * @param code - код книги (например, "PL-001")
 * @returns объект с префиксом и номером
 */
export function parseBookCode(code: string): { prefix: string; number: number } | null {
  const match = code.match(/^([A-Z]{2})-(\d{3})$/)
  if (!match) return null
  
  return {
    prefix: match[1],
    number: parseInt(match[2], 10)
  }
}

/**
 * Генерирует код книги по префиксу и номеру
 * @param prefix - префикс кода
 * @param number - номер (1-999)
 * @returns сгенерированный код
 */
export function generateBookCode(prefix: string, number: number): string {
  return `${prefix}-${number.toString().padStart(3, '0')}`
}

/**
 * Получает префикс кода для категории
 * @param categoryName - название категории
 * @returns префикс кода или null
 */
export function getCodePrefixForCategory(categoryName: string): string | null {
  return CATEGORY_CODE_PREFIXES[categoryName as CategoryCodePrefix] || null
}

/**
 * Находит следующий доступный номер для категории
 * @param existingCodes - массив существующих кодов
 * @param categoryName - название категории
 * @returns следующий номер или 1 если это первая книга в категории
 */
export function getNextCodeNumber(existingCodes: string[], categoryName: string): number {
  const prefix = getCodePrefixForCategory(categoryName)
  if (!prefix) return 1

  // Фильтруем коды по префиксу
  const categoryCodes = existingCodes
    .map(code => parseBookCode(code))
    .filter(parsed => parsed?.prefix === prefix)
    .map(parsed => parsed!.number)
    .sort((a, b) => a - b)

  // Если нет кодов в этой категории, начинаем с 1
  if (categoryCodes.length === 0) return 1

  // Находим первый пропуск или следующий номер
  for (let i = 0; i < categoryCodes.length; i++) {
    const expectedNumber = i + 1
    if (categoryCodes[i] !== expectedNumber) {
      return expectedNumber
    }
  }

  // Если все номера заняты, возвращаем следующий
  return categoryCodes[categoryCodes.length - 1] + 1
}

/**
 * Генерирует следующий код для категории
 * @param existingCodes - массив существующих кодов
 * @param categoryName - название категории
 * @returns сгенерированный код или null если категория не поддерживается
 */
export function generateNextBookCode(existingCodes: string[], categoryName: string): string | null {
  const prefix = getCodePrefixForCategory(categoryName)
  if (!prefix) return null

  const nextNumber = getNextCodeNumber(existingCodes, categoryName)
  return generateBookCode(prefix, nextNumber)
}

// ============================================================================
// ВАЛИДАЦИЯ КОДОВ
// ============================================================================

/**
 * Проверяет, является ли код валидным
 * @param code - код для проверки
 * @returns true если код валидный
 */
export function isValidBookCode(code: string): boolean {
  return parseBookCode(code) !== null
}

/**
 * Проверяет, соответствует ли код категории
 * @param code - код книги
 * @param categoryName - название категории
 * @returns true если код соответствует категории
 */
export function isCodeForCategory(code: string, categoryName: string): boolean {
  const parsed = parseBookCode(code)
  const expectedPrefix = getCodePrefixForCategory(categoryName)
  
  return parsed !== null && expectedPrefix !== null && parsed.prefix === expectedPrefix
}

// ============================================================================
// ПОЛУЧЕНИЕ ИНФОРМАЦИИ О КАТЕГОРИИ ПО КОДУ
// ============================================================================

/**
 * Получает название категории по префиксу кода
 * @param prefix - префикс кода
 * @returns название категории или null
 */
export function getCategoryByCodePrefix(prefix: string): string | null {
  for (const [categoryName, categoryPrefix] of Object.entries(CATEGORY_CODE_PREFIXES)) {
    if (categoryPrefix === prefix) {
      return categoryName
    }
  }
  return null
}

/**
 * Получает информацию о категории по коду книги
 * @param code - код книги
 * @returns объект с информацией о категории или null
 */
export function getCategoryInfoByCode(code: string): { categoryName: string; prefix: string; number: number } | null {
  const parsed = parseBookCode(code)
  if (!parsed) return null

  const categoryName = getCategoryByCodePrefix(parsed.prefix)
  if (!categoryName) return null

  return {
    categoryName,
    prefix: parsed.prefix,
    number: parsed.number
  }
}
