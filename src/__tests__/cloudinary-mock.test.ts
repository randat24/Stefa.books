import { describe, it, expect, vi } from 'vitest'

describe('Cloudinary Mock Test', () => {
  it('should have cloudinary mocked', async () => {
    const { v2: cloudinary } = await import('cloudinary')
    
    console.log('Cloudinary config function:', typeof cloudinary.config)
    console.log('Cloudinary uploader:', typeof cloudinary.uploader)
    console.log('Upload stream function:', typeof cloudinary.uploader.upload_stream)
    
    expect(cloudinary.config).toBeDefined()
    expect(cloudinary.uploader).toBeDefined()
    expect(cloudinary.uploader.upload_stream).toBeDefined()
  })

  it('should test upload stream mock', async () => {
    const { v2: cloudinary } = await import('cloudinary')
    
    const mockCallback = vi.fn()
    const result = cloudinary.uploader.upload_stream({}, mockCallback)
    
    expect(result).toBeDefined()
    expect(result.end).toBeDefined()
    
    // Wait a bit for the async callback
    await new Promise(resolve => setTimeout(resolve, 20))
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      public_id: 'test-public-id',
      secure_url: 'https://res.cloudinary.com/test/image/upload/test.jpg'
    }))
  })
})
