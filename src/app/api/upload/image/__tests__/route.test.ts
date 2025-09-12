import { NextRequest } from 'next/server'
import { POST } from '../route'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('/api/upload/image', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should reject request without file', async () => {
    const formData = new FormData()
    const request = new NextRequest('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const result = await response.json()

    console.log('Response status:', response.status)
    console.log('Response result:', result)

    expect(response.status).toBe(400)
    expect(result.error).toBe('Файл не знайдено')
  })

  it('should reject invalid file type', async () => {
    const formData = new FormData()
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' })
    formData.append('file', invalidFile)
    formData.append('type', 'cover')

    const request = new NextRequest('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toContain('Непідтримуваний тип файлу')
  })

  it('should reject file that is too large', async () => {
    const formData = new FormData()
    // Create a file larger than 10MB
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })
    formData.append('file', largeFile)
    formData.append('type', 'cover')

    const request = new NextRequest('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toContain('Файл занадто великий')
  })

  it('should accept valid image file', async () => {
    const formData = new FormData()
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    formData.append('file', validFile)
    formData.append('type', 'cover')

    const request = new NextRequest('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.success).toBe(true)
    expect(result.secure_url).toBe('https://res.cloudinary.com/test/image/upload/test.jpg')
    expect(result.public_id).toBe('test-public-id')
  })

  it('should handle different image types correctly', async () => {
    const testCases = [
      { type: 'cover', expectedFolder: 'stefa-books/covers' },
      { type: 'screenshot', expectedFolder: 'stefa-books/subscription-screenshots' },
      { type: 'avatar', expectedFolder: 'stefa-books/avatars' },
      { type: 'hero', expectedFolder: 'stefa-books/hero-images' },
      { type: 'general', expectedFolder: 'stefa-books/uploads' },
    ]

    for (const testCase of testCases) {
      const formData = new FormData()
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
      formData.append('file', validFile)
      formData.append('type', testCase.type)

      const request = new NextRequest('http://localhost:3000/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
    }
  })

  it('should handle Cloudinary upload errors', async () => {
    const formData = new FormData()
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    formData.append('file', validFile)
    formData.append('type', 'cover')

    // Mock Cloudinary upload error by temporarily overriding the mock
    const { v2: cloudinary } = await import('cloudinary')
    const originalMock = cloudinary.uploader.upload_stream
    
    vi.mocked(cloudinary.uploader.upload_stream).mockImplementationOnce((options, callback) => {
      setTimeout(() => {
        callback(new Error('Cloudinary upload failed'), null)
      }, 0)
      return {
        end: vi.fn(),
      }
    })

    const request = new NextRequest('http://localhost:3000/api/upload/image', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.error).toContain('Внутрішня помилка сервера')
    
    // Restore original mock
    cloudinary.uploader.upload_stream = originalMock
  })
})
