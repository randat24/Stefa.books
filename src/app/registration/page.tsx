'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { logger } from '@/lib/logger'

interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
  agreeToMarketing: boolean
}

export default function RegistrationPage() {
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Київ',
    postalCode: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToMarketing: false
  })
  const [errors, setErrors] = useState<Partial<RegistrationData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationData> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ім\'я обов\'язкове'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Прізвище обов\'язкове'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обов\'язковий'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Невірний формат email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обов\'язковий'
    } else if (!/^\+380\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Невірний формат телефону (+380XXXXXXXXX)'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Адреса обов\'язкова'
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обов\'язковий'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль повинен містити мінімум 6 символів'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Паролі не співпадають'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Необхідно погодитися з умовами'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postalCode,
          password: formData.password,
          marketing_consent: formData.agreeToMarketing
        })
      })

      const result = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        logger.info('Регистрация успешна:', { email: formData.email })
      } else {
        setErrors({ email: result.error || 'Помилка реєстрації' })
        logger.error('Ошибка регистрации:', result)
      }
    } catch (error) {
      logger.error('Ошибка регистрации:', error)
      setErrors({ email: 'Помилка з\'єднання з сервером' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof RegistrationData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Реєстрація успішна!</h2>
            <p className="text-gray-600 mb-6">
              Ваш акаунт створено. На вашу пошту надіслано лист з підтвердженням.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/login">Увійти в акаунт</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">На головну</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Створити акаунт</CardTitle>
            <p className="text-gray-600">Заповніть форму для реєстрації</p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Имя и фамилия */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Ім'я *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Прізвище *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="example@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Телефон */}
              <div>
                <Label htmlFor="phone">Телефон *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="+380123456789"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Адрес */}
              <div>
                <Label htmlFor="address">Адреса *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`pl-10 ${errors.address ? 'border-red-500' : ''}`}
                    placeholder="вул. Прикладна, 123"
                  />
                </div>
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                )}
              </div>

              {/* Город и почтовый индекс */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">Місто</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Поштовий індекс</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="01001"
                  />
                </div>
              </div>

              {/* Пароль */}
              <div>
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Подтверждение пароля */}
              <div>
                <Label htmlFor="confirmPassword">Підтвердження пароля *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Соглашения */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                    className={errors.agreeToTerms ? 'border-red-500' : ''}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm">
                    Я погоджуюся з{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      умовами використання
                    </Link>{' '}
                    та{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      політикою конфіденційності
                    </Link>
                    *
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-sm text-red-600">{errors.agreeToTerms}</p>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agreeToMarketing"
                    checked={formData.agreeToMarketing}
                    onCheckedChange={(checked) => handleInputChange('agreeToMarketing', checked as boolean)}
                  />
                  <Label htmlFor="agreeToMarketing" className="text-sm text-gray-600">
                    Я хочу отримувати новини та пропозиції на email
                  </Label>
                </div>
              </div>

              {/* Кнопка отправки */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Створення акаунта...
                  </>
                ) : (
                  'Створити акаунт'
                )}
              </Button>
            </form>

            {/* Ссылка на вход */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Вже маєте акаунт?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  Увійти
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
