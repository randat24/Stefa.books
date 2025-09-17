import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImageUpload } from '../ImageUpload'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn() } }))

describe('ImageUpload', () => {
  const defaultProps = {
    uploadEndpoint: '/api/upload/image',
    fieldName: 'file',
    onImageUploaded: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  it('should render upload area', () => {
    render(<ImageUpload {...defaultProps} />)
    
    expect(screen.getByText('Перетягніть зображення сюди')).toBeInTheDocument()
    expect(screen.getByText('або')).toBeInTheDocument()
    expect(screen.getByText('виберіть файл')).toBeInTheDocument()
  })

  it('should render custom placeholder', () => {
    render(
      <ImageUpload 
        {...defaultProps} 
        placeholder="Custom placeholder text"
      />
    )
    
    expect(screen.getByText('Custom placeholder text')).toBeInTheDocument()
  })

  it('should handle file selection via input', async () => {
    const user = userEvent.setup()
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        secure_url: 'https://example.com/test.jpg',
        public_id: 'test-id'
      }) })

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/виберіть файл/i)
    await user.upload(fileInput, mockFile)

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/upload/image',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData) })
    )
  })

  it('should handle drag and drop', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        secure_url: 'https://example.com/test.jpg',
        public_id: 'test-id'
      }) })

    render(<ImageUpload {...defaultProps} />)
    
    const dropArea = screen.getByText('Перетягніть зображення сюди').closest('div')
    
    fireEvent.dragEnter(dropArea!, { dataTransfer: { files: [mockFile] } })
    fireEvent.drop(dropArea!, { dataTransfer: { files: [mockFile] } })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  it('should show preview after successful upload', async () => {
    const user = userEvent.setup()
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        secure_url: 'https://example.com/test.jpg',
        public_id: 'test-id'
      }) })

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/виберіть файл/i)
    await user.upload(fileInput, mockFile)

    await waitFor(() => {
      expect(screen.getByAltText('Попередній перегляд')).toBeInTheDocument()
    })
  })

  it('should call onImageUploaded callback', async () => {
    const user = userEvent.setup()
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const mockOnImageUploaded = jest.fn()
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ 
        success: true, 
        secure_url: 'https://example.com/test.jpg',
        public_id: 'test-id'
      }) })

    render(
      <ImageUpload 
        {...defaultProps} 
        onImageUploaded={mockOnImageUploaded}
      />
    )
    
    const fileInput = screen.getByLabelText(/виберіть файл/i)
    await user.upload(fileInput, mockFile)

    await waitFor(() => {
      expect(mockOnImageUploaded).toHaveBeenCalledWith('https://example.com/test.jpg')
    })
  })

  it('should show error message on upload failure', async () => {
    const user = userEvent.setup()
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Upload failed' }) })

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/виберіть файл/i)
    await user.upload(fileInput, mockFile)

    await waitFor(() => {
      expect(screen.getByText('Помилка завантаження: Upload failed')).toBeInTheDocument()
    })
  })

  it('should show error message on network failure', async () => {
    const user = userEvent.setup()
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/виберіть файл/i)
    await user.upload(fileInput, mockFile)

    await waitFor(() => {
      expect(screen.getByText('Помилка завантаження: Network error')).toBeInTheDocument()
    })
  })

  it('should validate file type', async () => {
    const user = userEvent.setup()
    const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' })

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/виберіть файл/i)
    await user.upload(fileInput, mockFile)

    await waitFor(() => {
      expect(screen.getByText('Будь ласка, виберіть зображення (JPG, PNG, WebP, GIF, AVIF)')).toBeInTheDocument()
    })
  })

  it('should validate file size', async () => {
    const user = userEvent.setup()
    // Create a file larger than 10MB
    const mockFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/виберіть файл/i)
    await user.upload(fileInput, mockFile)

    await waitFor(() => {
      expect(screen.getByText('Розмір файлу не повинен перевищувати 10 МБ')).toBeInTheDocument()
    })
  })

  it('should show file info after selection', async () => {
    const user = userEvent.setup()
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/виберіть файл/i)
    await user.upload(fileInput, mockFile)

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
      expect(screen.getByText('5 байт')).toBeInTheDocument()
    })
  })

  it('should allow removing uploaded file', async () => {
    const user = userEvent.setup()
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/виберіть файл/i)
    await user.upload(fileInput, mockFile)

    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument()
    })

    const removeButton = screen.getByText('Видалити')
    await user.click(removeButton)

    expect(screen.queryByText('test.jpg')).not.toBeInTheDocument()
    expect(screen.getByText('Перетягніть зображення сюди')).toBeInTheDocument()
  })

  it('should show different preview sizes', () => {
    const { rerender } = render(
      <ImageUpload {...defaultProps} previewSize="sm" />
    )
    
    expect(screen.getByText('Перетягніть зображення сюди')).toBeInTheDocument()

    rerender(
      <ImageUpload {...defaultProps} previewSize="lg" />
    )
    
    expect(screen.getByText('Перетягніть зображення сюди')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(
      <ImageUpload 
        {...defaultProps} 
        className="custom-upload-class"
      />
    )
    
    const uploadArea = screen.getByText('Перетягніть зображення сюди').closest('div')
    expect(uploadArea).toHaveClass('custom-upload-class')
  })

  it('should show loading state during upload', async () => {
    const user = userEvent.setup()
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    
    // Mock a slow response
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          ok: true,
          json: async () => ({ 
            success: true, 
            secure_url: 'https://example.com/test.jpg',
            public_id: 'test-id'
          }) }), 100)
      )
    )

    render(<ImageUpload {...defaultProps} />)
    
    const fileInput = screen.getByLabelText(/виберіть файл/i)
    await user.upload(fileInput, mockFile)

    expect(screen.getByText('Завантаження...')).toBeInTheDocument()
  })

  it('should handle drag enter and leave events', () => {
    render(<ImageUpload {...defaultProps} />)
    
    const dropArea = screen.getByText('Перетягніть зображення сюди').closest('div')
    
    fireEvent.dragEnter(dropArea!)
    fireEvent.dragLeave(dropArea!)
    
    // Should not throw any errors
    expect(dropArea).toBeInTheDocument()
  })
})
