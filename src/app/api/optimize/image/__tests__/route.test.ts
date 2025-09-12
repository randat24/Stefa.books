import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

// Mock Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    url: jest.fn(() => 'https://res.cloudinary.com/test/image/upload/test.jpg'),
  },
}))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

describe('/api/optimize/image', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET', () => {
    it('should reject request without public_id', async () => {
      const request = new NextRequest('http://localhost:3000/api/optimize/image')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Public ID не указан')
    })

    it('should generate optimized URL with basic parameters', async () => {
      const { v2: cloudinary } = require('cloudinary')
      cloudinary.url.mockReturnValue('https://res.cloudinary.com/test/image/upload/w_400,h_600,c_limit,q_auto:best,f_auto/test.jpg')

      const request = new NextRequest('http://localhost:3000/api/optimize/image?public_id=test.jpg&width=400&height=600')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.optimized_url).toBe('https://res.cloudinary.com/test/image/upload/w_400,h_600,c_limit,q_auto:best,f_auto/test.jpg')
      expect(result.public_id).toBe('test.jpg')
    })

    it('should apply web preset correctly', async () => {
      const { v2: cloudinary } = require('cloudinary')
      cloudinary.url.mockReturnValue('https://res.cloudinary.com/test/image/upload/f_auto,q_auto:good,fl_progressive,fl_strip_profile,cs_srgb,dpr_auto/test.jpg')

      const request = new NextRequest('http://localhost:3000/api/optimize/image?public_id=test.jpg&preset=web')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.preset).toBe('web')
    })

    it('should apply mobile preset correctly', async () => {
      const { v2: cloudinary } = require('cloudinary')
      cloudinary.url.mockReturnValue('https://res.cloudinary.com/test/image/upload/f_auto,q_auto:best,fl_progressive,fl_strip_profile,cs_srgb,dpr_auto,w_auto,responsive/test.jpg')

      const request = new NextRequest('http://localhost:3000/api/optimize/image?public_id=test.jpg&preset=mobile')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.preset).toBe('mobile')
    })

    it('should apply print preset correctly', async () => {
      const { v2: cloudinary } = require('cloudinary')
      cloudinary.url.mockReturnValue('https://res.cloudinary.com/test/image/upload/f_auto,q_auto:best,fl_strip_profile,cs_srgb,dpr_auto/test.jpg')

      const request = new NextRequest('http://localhost:3000/api/optimize/image?public_id=test.jpg&preset=print')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.preset).toBe('print')
    })

    it('should apply social preset correctly', async () => {
      const { v2: cloudinary } = require('cloudinary')
      cloudinary.url.mockReturnValue('https://res.cloudinary.com/test/image/upload/f_auto,q_auto:good,fl_progressive,fl_strip_profile,cs_srgb,dpr_auto,g_auto/test.jpg')

      const request = new NextRequest('http://localhost:3000/api/optimize/image?public_id=test.jpg&preset=social')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.preset).toBe('social')
    })

    it('should handle custom transformations', async () => {
      const { v2: cloudinary } = require('cloudinary')
      cloudinary.url.mockReturnValue('https://res.cloudinary.com/test/image/upload/w_300,h_450,c_fill,g_auto,q_auto:best,f_auto/test.jpg')

      const request = new NextRequest('http://localhost:3000/api/optimize/image?public_id=test.jpg&width=300&height=450&crop=fill&gravity=auto&quality=auto:best')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.transformations).toBeDefined()
    })

    it('should handle Cloudinary errors', async () => {
      const { v2: cloudinary } = require('cloudinary')
      cloudinary.url.mockImplementation(() => {
        throw new Error('Cloudinary error')
      })

      const request = new NextRequest('http://localhost:3000/api/optimize/image?public_id=test.jpg')

      const response = await GET(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.error).toBe('Ошибка оптимизации изображения')
    })
  })

  describe('POST', () => {
    it('should reject request without public_id', async () => {
      const request = new NextRequest('http://localhost:3000/api/optimize/image', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(400)
      expect(result.error).toBe('Public ID не указан')
    })

    it('should create optimized version with preset', async () => {
      const { v2: cloudinary } = require('cloudinary')
      cloudinary.url.mockReturnValue('https://res.cloudinary.com/test/image/upload/f_auto,q_auto:good,fl_progressive,fl_strip_profile,cs_srgb,dpr_auto/test.jpg')

      const request = new NextRequest('http://localhost:3000/api/optimize/image', {
        method: 'POST',
        body: JSON.stringify({
          public_id: 'test.jpg',
          preset: 'web',
        }),
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.optimized_url).toBe('https://res.cloudinary.com/test/image/upload/f_auto,q_auto:good,fl_progressive,fl_strip_profile,cs_srgb,dpr_auto/test.jpg')
      expect(result.derived_url).toBeDefined()
    })

    it('should create optimized version with custom transformations', async () => {
      const { v2: cloudinary } = require('cloudinary')
      cloudinary.url.mockReturnValue('https://res.cloudinary.com/test/image/upload/w_400,h_600,c_limit,q_auto:best,f_auto/test.jpg')

      const request = new NextRequest('http://localhost:3000/api/optimize/image', {
        method: 'POST',
        body: JSON.stringify({
          public_id: 'test.jpg',
          transformations: [
            { width: 400, height: 600, crop: 'limit' },
            { quality: 'auto:best', fetch_format: 'auto' },
          ],
        }),
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.transformations).toBeDefined()
      expect(result.transformations.length).toBeGreaterThan(0)
    })

    it('should combine preset and custom transformations', async () => {
      const { v2: cloudinary } = require('cloudinary')
      cloudinary.url.mockReturnValue('https://res.cloudinary.com/test/image/upload/w_300,h_450,c_limit,q_auto:good,fl_progressive,fl_strip_profile,cs_srgb,dpr_auto/test.jpg')

      const request = new NextRequest('http://localhost:3000/api/optimize/image', {
        method: 'POST',
        body: JSON.stringify({
          public_id: 'test.jpg',
          preset: 'web',
          transformations: [
            { width: 300, height: 450, crop: 'limit' },
          ],
        }),
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
      expect(result.preset).toBe('web')
      expect(result.transformations).toBeDefined()
    })

    it('should handle invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/optimize/image', {
        method: 'POST',
        body: 'invalid json',
      })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(500)
      expect(result.error).toBe('Ошибка создания оптимизированного изображения')
    })
  })
})
