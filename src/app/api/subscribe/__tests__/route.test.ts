import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    select: jest.fn(() => Promise.resolve({ data: [], error: null })) })) }

jest.mock('@/lib/supabase', () => ({
  supabase: mockSupabase }))

// Mock logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn() } }))

describe('/api/subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should reject request with missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        // Missing email, phone, plan, paymentMethod
      }) })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toBeDefined()
  })

  it('should reject request with invalid email', async () => {
    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        phone: '+380123456789',
        plan: 'mini',
        paymentMethod: 'card',
        privacyConsent: true }) })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toContain('email')
  })

  it('should reject request with invalid phone', async () => {
    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: 'invalid-phone',
        plan: 'mini',
        paymentMethod: 'card',
        privacyConsent: true }) })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toContain('phone')
  })

  it('should reject request without privacy consent', async () => {
    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+380123456789',
        plan: 'mini',
        paymentMethod: 'card',
        privacyConsent: false }) })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toContain('privacy')
  })

  it('should accept valid subscription request', async () => {
    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+380123456789',
        plan: 'mini',
        paymentMethod: 'card',
        privacyConsent: true }) })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.success).toBe(true)
    expect(result.message).toBe('Заявка успішно відправлена')
  })

  it('should accept subscription request with screenshot URL', async () => {
    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+380123456789',
        plan: 'mini',
        paymentMethod: 'bank_transfer',
        screenshot: 'https://example.com/screenshot.jpg',
        privacyConsent: true }) })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.success).toBe(true)
  })

  it('should handle different subscription plans', async () => {
    const plans = ['mini', 'maxi']
    
    for (const plan of plans) {
      const request = new NextRequest('http://localhost:3000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '+380123456789',
          plan,
          paymentMethod: 'card',
          privacyConsent: true }) })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
    }
  })

  it('should handle different payment methods', async () => {
    const paymentMethods = ['card', 'bank_transfer']
    
    for (const paymentMethod of paymentMethods) {
      const request = new NextRequest('http://localhost:3000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          phone: '+380123456789',
          plan: 'mini',
          paymentMethod,
          privacyConsent: true }) })

      const response = await POST(request)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.success).toBe(true)
    }
  })

  it('should handle optional fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+380123456789',
        plan: 'mini',
        paymentMethod: 'card',
        social: '@testuser',
        message: 'Test message',
        privacyConsent: true }) })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result.success).toBe(true)
  })

  it('should handle database errors', async () => {
    // Mock database error
    mockSupabase.from.mockReturnValueOnce({
      insert: jest.fn(() => Promise.resolve({ 
        data: null, 
        error: { message: 'Database error' } 
      })) })

    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+380123456789',
        plan: 'mini',
        paymentMethod: 'card',
        privacyConsent: true }) })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result.error).toBe('Помилка збереження заявки')
  })

  it('should handle invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json' })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toBe('Невірний формат JSON')
  })

  it('should validate plan enum', async () => {
    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+380123456789',
        plan: 'invalid_plan',
        paymentMethod: 'card',
        privacyConsent: true }) })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toBeDefined()
  })

  it('should validate payment method enum', async () => {
    const request = new NextRequest('http://localhost:3000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '+380123456789',
        plan: 'mini',
        paymentMethod: 'invalid_method',
        privacyConsent: true }) })

    const response = await POST(request)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result.error).toBeDefined()
  })
})
