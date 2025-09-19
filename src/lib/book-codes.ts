// ============================================================================
// СИСТЕМА АВТОМАТИЧЕСКОЙ ГЕНЕРАЦИИ АРТИКУЛОВ КНИГ
// ============================================================================

// Маппинг категорий на префиксы артикулов
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
// УТИЛИТЫ ДЛЯ РАБОТЫ С АРТИКУЛАМИ
// ============================================================================

/**
 * Извлекает префикс и номер из артикула книги
 * @param article - артикул книги (например, "PL-001")
 * @returns объект с префиксом и номером
 */
export function parseBookArticle(article: string): { prefix: string; number: number } | null {
  const match = article.match(/^([A-Z]{2})-(\d{3})$/)
  if (!match) return null
  
  return {
    prefix: match[1],
    number: parseInt(match[2], 10)
  }
}

/**
 * Генерирует артикул книги по префиксу и номеру
 * @param prefix - префикс артикула
 * @param number - номер (1-999)
 * @returns сгенерированный артикул
 */
export function generateBookArticle(prefix: string, number: number): string {
  return `${prefix}-${number.toString().padStart(3, '0')}`
}

/**
 * Получает префикс артикула для категории
 * @param categoryName - название категории
 * @returns префикс артикула или null
 */
export function getArticlePrefixForCategory(categoryName: string): string | null {
  return CATEGORY_CODE_PREFIXES[categoryName as CategoryCodePrefix] || null
}

/**
 * Находит следующий доступный номер для категории
 * @param existingArticles - массив существующих артикулов
 * @param categoryName - название категории
 * @returns следующий номер или 1 если это первая книга в категории
 */
export function getNextArticleNumber(existingArticles: string[], categoryName: string): number {
  const prefix = getArticlePrefixForCategory(categoryName)
  if (!prefix) return 1

  // Фильтруем артикулы по префиксу
  const categoryArticles = existingArticles
    .map(article => parseBookArticle(article))
    .filter(parsed => parsed?.prefix === prefix)
    .map(parsed => parsed!.number)
    .sort((a, b) => a - b)

  // Если нет артикулов в этой категории, начинаем с 1
  if (categoryArticles.length === 0) return 1

  // Находим первый пропуск или следующий номер
  for (let i = 0; i < categoryArticles.length; i++) {
    const expectedNumber = i + 1
    if (categoryArticles[i] !== expectedNumber) {
      return expectedNumber
    }
  }

  // Если все номера заняты, возвращаем следующий
  return categoryArticles[categoryArticles.length - 1] + 1
}

/**
 * Генерирует следующий артикул для категории
 * @param existingArticles - массив существующих артикулов
 * @param categoryName - название категории
 * @returns сгенерированный артикул или null если категория не поддерживается
 */
export function generateNextBookArticle(existingArticles: string[], categoryName: string): string | null {
  const prefix = getArticlePrefixForCategory(categoryName)
  if (!prefix) return null

  const nextNumber = getNextArticleNumber(existingArticles, categoryName)
  return generateBookArticle(prefix, nextNumber)
}

// ============================================================================
// ВАЛИДАЦИЯ АРТИКУЛОВ
// ============================================================================

/**
 * Проверяет, является ли артикул валидным
 * @param article - артикул для проверки
 * @returns true если артикул валидный
 */
export function isValidBookArticle(article: string): boolean {
  return parseBookArticle(article) !== null
}

/**
 * Проверяет, соответствует ли артикул категории
 * @param article - артикул книги
 * @param categoryName - название категории
 * @returns true если артикул соответствует категории
 */
export function isArticleForCategory(article: string, categoryName: string): boolean {
  const parsed = parseBookArticle(article)
  const expectedPrefix = getArticlePrefixForCategory(categoryName)
  
  return parsed !== null && expectedPrefix !== null && parsed.prefix === expectedPrefix
}

// ============================================================================
// ПОЛУЧЕНИЕ ИНФОРМАЦИИ О КАТЕГОРИИ ПО АРТИКУЛУ
// ============================================================================

/**
 * Получает название категории по префиксу артикула
 * @param prefix - префикс артикула
 * @returns название категории или null
 */
export function getCategoryByArticlePrefix(prefix: string): string | null {
  for (const [categoryName, categoryPrefix] of Object.entries(CATEGORY_CODE_PREFIXES)) {
    if (categoryPrefix === prefix) {
      return categoryName
    }
  }
  return null
}

/**
 * Получает информацию о категории по артикулу книги
 * @param article - артикул книги
 * @returns объект с информацией о категории или null
 */
export function getCategoryInfoByArticle(article: string): { categoryName: string; prefix: string; number: number } | null {
  const parsed = parseBookArticle(article)
  if (!parsed) return null

  const categoryName = getCategoryByArticlePrefix(parsed.prefix)
  if (!categoryName) return null

  return {
    categoryName,
    prefix: parsed.prefix,
    number: parsed.number
  }
}

// ============================================================================
// ОБРАТНАЯ СОВМЕСТИМОСТЬ (DEPRECATED)
// ============================================================================

/**
 * @deprecated Используйте parseBookArticle вместо parseBookCode
 */
export const parseBookCode = parseBookArticle

/**
 * @deprecated Используйте generateBookArticle вместо generateBookCode
 */
export const generateBookCode = generateBookArticle

/**
 * @deprecated Используйте getArticlePrefixForCategory вместо getCodePrefixForCategory
 */
export const getCodePrefixForCategory = getArticlePrefixForCategory

/**
 * @deprecated Используйте generateNextBookArticle вместо generateNextBookCode
 */
export const generateNextBookCode = generateNextBookArticle

/**
 * @deprecated Используйте isValidBookArticle вместо isValidBookCode
 */
export const isValidBookCode = isValidBookArticle

/**
 * @deprecated Используйте isArticleForCategory вместо isCodeForCategory
 */
export const isCodeForCategory = isArticleForCategory

/**
 * @deprecated Используйте getCategoryByArticlePrefix вместо getCategoryByCodePrefix
 */
export const getCategoryByCodePrefix = getCategoryByArticlePrefix

/**
 * @deprecated Используйте getCategoryInfoByArticle вместо getCategoryInfoByCode
 */
export const getCategoryInfoByCode = getCategoryInfoByArticle
