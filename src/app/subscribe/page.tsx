'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  CheckCircle, 
  Star,
  Users,
  BookOpen,
  CreditCard,
  Shield,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { logger } from '@/lib/logger'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
  color: string
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'mini',
    name: 'Mini',
    price: 300,
    description: 'Идеально для начинающих читателей',
    features: [
      '1 книга одновременно',
      'Доставка по Киеву',
      'Возврат в течение 7 дней',
      'Поддержка 24/7'
    ],
    color: 'blue'
  },
  {
    id: 'maxi',
    name: 'Maxi',
    price: 500,
    description: 'Для активных читателей',
    features: [
      '2 книги одновременно',
      'Доставка по всей Украине',
      'Возврат в течение 14 дней',
      'Приоритетная поддержка',
      'Ранний доступ к новинкам'
    ],
    popular: true,
    color: 'purple'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1500,
    description: 'Максимальный комфорт чтения',
    features: [
      '3 книги одновременно',
      'Бесплатная доставка',
      'Возврат в течение 30 дней',
      'Персональный менеджер',
      'Эксклюзивные издания',
      'Скидки на покупку книг'
    ],
    color: 'gold'
  }
]

export default function SubscribePage() {
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Київ',
    notes: '',
    agreeToTerms: false,
    agreeToMarketing: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedPlan) {
      newErrors.plan = 'Выберите план подписки'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Неверный формат email'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен'
    } else if (!/^\+380\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Неверный формат телефона (+380XXXXXXXXX)'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен'
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Необходимо согласиться с условиями'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          subscription_type: selectedPlan
        })
      })

      const result = await response.json()

      if (response.ok && result.redirect_url) {
        // Перенаправляем на страницу оплаты
        window.location.href = result.redirect_url
      } else {
        setErrors({ submit: result.error || 'Ошибка создания подписки' })
      }
    } catch (error) {
      logger.error('Ошибка создания подписки:', error)
      setErrors({ submit: 'Ошибка соединения с сервером' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getPlanColor = (color: string) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50',
      purple: 'border-purple-200 bg-purple-50',
      gold: 'border-yellow-200 bg-yellow-50'
    }
    return colors[color as keyof typeof colors] || 'border-gray-200 bg-gray-50'
  }

  const getPlanButtonColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      gold: 'bg-yellow-600 hover:bg-yellow-700'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-600 hover:bg-gray-700'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Crown className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Выберите план подписки</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Получите доступ к тысячам детских книг с доставкой на дом
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedPlan === plan.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              } ${getPlanColor(plan.color)}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Популярный
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 ml-1">₴/мес</span>
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className={`w-full ${getPlanButtonColor(plan.color)}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {selectedPlan === plan.id ? 'Выбрано' : 'Выбрать план'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Form */}
        {selectedPlan && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Оформление подписки
              </CardTitle>
              <p className="text-gray-600">
                Заполните форму для завершения оформления подписки
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Имя и фамилия *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={errors.name ? 'border-red-500' : ''}
                      placeholder="Иван Иванов"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={errors.email ? 'border-red-500' : ''}
                      placeholder="ivan@example.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={errors.phone ? 'border-red-500' : ''}
                      placeholder="+380123456789"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="city">Город</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Адрес доставки *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={errors.address ? 'border-red-500' : ''}
                    placeholder="ул. Примерная, 123, кв. 45"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Дополнительные пожелания</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Любые пожелания по доставке или выбору книг..."
                    rows={3}
                  />
                </div>

                {/* Agreements */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
                      className={errors.agreeToTerms ? 'border-red-500' : ''}
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm">
                      Я согласен с{' '}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        условиями использования
                      </Link>{' '}
                      и{' '}
                      <Link href="/privacy" className="text-blue-600 hover:underline">
                        политикой конфиденциальности
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
                      Я хочу получать новости и предложения на email
                    </Label>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  {errors.submit && (
                    <p className="text-sm text-red-600 mb-4">{errors.submit}</p>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Обработка...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Перейти к оплате
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Безопасность</h3>
            <p className="text-gray-600">
              Все платежи защищены современными методами шифрования
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Поддержка</h3>
            <p className="text-gray-600">
              Наша команда всегда готова помочь с любыми вопросами
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Качество</h3>
            <p className="text-gray-600">
              Только проверенные и качественные детские книги
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}