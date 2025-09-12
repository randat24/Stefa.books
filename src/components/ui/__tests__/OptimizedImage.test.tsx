import { render, screen, waitFor } from '@testing-library/react'
import { OptimizedImage, WebOptimizedImage, MobileOptimizedImage } from '../OptimizedImage'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}))

describe('OptimizedImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should render loading state initially', () => {
    render(
      <OptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
      />
    )

    expect(screen.getByText('Оптимизация изображения...')).toBeInTheDocument()
  })

  it('should render optimized image after successful fetch', async () => {
    const mockOptimizedUrl = 'https://res.cloudinary.com/test/image/upload/test.jpg'
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ optimized_url: mockOptimizedUrl }),
    })

    render(
      <OptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
      />
    )

    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toBeInTheDocument()
    })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/optimize/image')
    )
  })

  it('should render error state when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(
      <OptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки изображения')).toBeInTheDocument()
    })
  })

  it('should render error state when API returns error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API Error' }),
    })

    render(
      <OptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Ошибка загрузки изображения')).toBeInTheDocument()
    })
  })

  it('should render "not found" state when no URL is returned', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ optimized_url: '' }),
    })

    render(
      <OptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Изображение не найдено')).toBeInTheDocument()
    })
  })

  it('should call onLoad callback when image loads', async () => {
    const mockOnLoad = jest.fn()
    const mockOptimizedUrl = 'https://res.cloudinary.com/test/image/upload/test.jpg'
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ optimized_url: mockOptimizedUrl }),
    })

    render(
      <OptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
        onLoad={mockOnLoad}
      />
    )

    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toBeInTheDocument()
    })

    // Simulate image load
    const img = screen.getByAltText('Test image')
    img.dispatchEvent(new Event('load'))

    expect(mockOnLoad).toHaveBeenCalled()
  })

  it('should call onError callback when image fails to load', async () => {
    const mockOnError = jest.fn()
    const mockOptimizedUrl = 'https://res.cloudinary.com/test/image/upload/test.jpg'
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ optimized_url: mockOptimizedUrl }),
    })

    render(
      <OptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
        onError={mockOnError}
      />
    )

    await waitFor(() => {
      expect(screen.getByAltText('Test image')).toBeInTheDocument()
    })

    // Simulate image error
    const img = screen.getByAltText('Test image')
    img.dispatchEvent(new Event('error'))

    expect(mockOnError).toHaveBeenCalled()
  })

  it('should use custom transformations when provided', async () => {
    const mockOptimizedUrl = 'https://res.cloudinary.com/test/image/upload/test.jpg'
    const customTransformations = { width: 800, height: 600, crop: 'fill' }
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ optimized_url: mockOptimizedUrl }),
    })

    render(
      <OptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
        optimizationType="custom"
        customTransformations={customTransformations}
      />
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/optimize/image',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            public_id: 'test-image',
            transformations: [customTransformations],
            preset: 'custom',
          }),
        })
      )
    })
  })

  it('should apply correct optimization type for WebOptimizedImage', async () => {
    const mockOptimizedUrl = 'https://res.cloudinary.com/test/image/upload/test.jpg'
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ optimized_url: mockOptimizedUrl }),
    })

    render(
      <WebOptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
      />
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('preset=web')
      )
    })
  })

  it('should apply correct optimization type for MobileOptimizedImage', async () => {
    const mockOptimizedUrl = 'https://res.cloudinary.com/test/image/upload/test.jpg'
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ optimized_url: mockOptimizedUrl }),
    })

    render(
      <MobileOptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
      />
    )

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('preset=mobile')
      )
    })
  })

  it('should pass through all props to Image component', async () => {
    const mockOptimizedUrl = 'https://res.cloudinary.com/test/image/upload/test.jpg'
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ optimized_url: mockOptimizedUrl }),
    })

    render(
      <OptimizedImage
        publicId="test-image"
        alt="Test image"
        width={400}
        height={300}
        className="custom-class"
        priority={true}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    )

    await waitFor(() => {
      const img = screen.getByAltText('Test image')
      expect(img).toHaveClass('custom-class')
    })
  })

  it('should not fetch when publicId is empty', () => {
    render(
      <OptimizedImage
        publicId=""
        alt="Test image"
        width={400}
        height={300}
      />
    )

    expect(mockFetch).not.toHaveBeenCalled()
  })
})
