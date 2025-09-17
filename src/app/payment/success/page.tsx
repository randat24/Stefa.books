'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logger } from '@/lib/logger'

interface PaymentStatus {
  status: 'success' | 'processing' | 'failure' | 'pending'
  amount?: number
  reference?: string
  invoiceId?: string
  message?: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const invoiceId = searchParams.get('invoice_id')
  
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'pending',
    message: 'Перевіряємо статус платежу...'
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!reference && !invoiceId) {
        setPaymentStatus({
          status: 'failure',
          message: 'Не вдалося знайти дані платежу'
        })
        setIsLoading(false)
        return
      }

      try {
        // Если есть invoiceId, проверяем статус через API
        if (invoiceId) {
          const response = await fetch(`/api/payments/monobank?invoice_id=${invoiceId}`)
          const result = await response.json()

          if (result.success) {
            setPaymentStatus({
              status: result.status === 'success' ? 'success' : 'processing',
              amount: result.amount,
              reference: result.reference,
              invoiceId: result.invoiceId,
              message: result.status === 'success' 
                ? 'Платіж успішно оброблено! Ваша підписка активована.'
                : 'Платіж обробляється...'
            })
          } else {
            setPaymentStatus({
              status: 'failure',
              message: 'Не вдалося перевірити статус платежу'
            })
          }
        } else {
          // Если есть только reference, предполагаем успешный платеж
          setPaymentStatus({
            status: 'success',
            reference,
            message: 'Платіж успішно оброблено! Ваша підписка активована.'
          })
        }
      } catch (error) {
        logger.error('Payment status check error', error)
        setPaymentStatus({
          status: 'failure',
          message: 'Помилка при перевірці статусу платежу'
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkPaymentStatus()
  }, [reference, invoiceId])

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
    }

    switch (paymentStatus.status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />
      case 'processing':
        return <Loader2 className="h-16 w-16 text-yellow-600 animate-spin" />
      case 'failure':
        return <AlertCircle className="h-16 w-16 text-red-600" />
      default:
        return <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'processing':
        return 'bg-yellow-50 border-yellow-200'
      case 'failure':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getStatusTitle = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'Оплата успішна!'
      case 'processing':
        return 'Обробка платежу...'
      case 'failure':
        return 'Помилка оплати'
      default:
        return 'Перевірка платежу...'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className={`rounded-lg border-2 p-8 text-center ${getStatusColor()}`}>
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getStatusTitle()}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {paymentStatus.message}
          </p>

          {paymentStatus.amount && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Сума платежу</p>
              <p className="text-2xl font-bold text-gray-900">
                {paymentStatus.amount} ₴
              </p>
            </div>
          )}

          {paymentStatus.reference && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Номер платежу</p>
              <p className="text-sm font-mono text-gray-900">
                {paymentStatus.reference}
              </p>
            </div>
          )}

          {paymentStatus.status === 'success' && (
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  Ваша підписка активована!
                </h3>
                <p className="text-sm text-green-700">
                  Тепер ви можете користуватися всіма перевагами підписки Stefa.Books
                </p>
          </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
            <Link href="/catalog">
              Перейти до каталогу
            </Link>
          </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/profile">
                    Мій профіль
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {paymentStatus.status === 'processing' && (
            <div className="space-y-4">
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Платіж обробляється
                </h3>
                <p className="text-sm text-yellow-700">
                  Будь ласка, зачекайте кілька хвилин. Ми надішлемо вам підтвердження на email.
                </p>
              </div>
              
              <Button asChild className="w-full">
                <Link href="/">
                  Повернутися на головну
                </Link>
              </Button>
            </div>
          )}

          {paymentStatus.status === 'failure' && (
            <div className="space-y-4">
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">
                  Помилка оплати
                </h3>
                <p className="text-sm text-red-700">
                  Щось пішло не так з вашим платежем. Будь ласка, спробуйте ще раз або зверніться до підтримки.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <Link href="/subscribe">
                    Спробувати ще раз
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/contact">
                    Зв'язатися з підтримкою
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {paymentStatus.status === 'pending' && (
            <div className="space-y-4">
              <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Перевірка платежу
                </h3>
                <p className="text-sm text-blue-700">
                  Будь ласка, зачекайте, поки ми перевіримо статус вашого платежу.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Якщо у вас виникли питання, зверніться до{' '}
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">
              служби підтримки
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}