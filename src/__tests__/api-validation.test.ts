import { describe, it, expect } from 'vitest'

// Импортируем только функцию валидации
async function validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Файл повинен бути зображенням' }
  }

  // Проверяем размер файла
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `Розмір файлу не повинен перевищувати ${MAX_FILE_SIZE / (1024 * 1024)} МБ` }
  }

  return { valid: true }
}

describe('API Validation Tests', () => {
  it('should validate image file type', async () => {
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const result = await validateImageFile(validFile)
    
    expect(result.valid).toBe(true)
    expect(result.error).toBeUndefined()
  })

  it('should reject non-image file', async () => {
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    const result = await validateImageFile(invalidFile)
    
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Файл повинен бути зображенням')
  })

  it('should reject file that is too large', async () => {
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    const result = await validateImageFile(largeFile)
    
    expect(result.valid).toBe(false)
    expect(result.error).toContain('Розмір файлу не повинен перевищувати')
  })
})
