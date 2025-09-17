'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { logger } from '@/lib/logger'

interface Payment {
  id: string
  invoiceId: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'success' | 'failure'
  description: string
  createdAt: string
  updatedAt: string
  paymentUrl?: string
}

export default function PaymentPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payments')
      if (response.ok) {
        const data = await response.json()
        setPayments(data)
      }
    } catch (error) {
      logger.error('Ошибка загрузки платежей:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshPayments = async () => {
    setRefreshing(true)
    await loadPayments()
    setRefreshing(false)
  }

  const checkPaymentStatus = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/payments/monobank?invoice_id=${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Обновляем статус платежа
          setPayments(prev => prev.map(p => 
            p.invoiceId === invoiceId 
              ? { ...p, status: data.status, updatedAt: new Date().toISOString() }
              : p
          ))
        }
      }
    } catch (error) {
      logger.error('Ошибка проверки статуса платежа:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'processing':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'failure':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Успешно</Badge>
      case 'processing':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Обрабатывается</Badge>
      case 'failure':
        return <Badge variant="destructive">Ошибка</Badge>
      default:
        return <Badge variant="secondary">Ожидает</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const downloadReceipt = (payment: Payment) => {
    const receipt = {
      id: payment.id,
      invoiceId: payment.invoiceId,
      amount: payment.amount,
      currency: payment.currency,
      description: payment.description,
      status: payment.status,
      date: payment.createdAt
    }
    
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${payment.invoiceId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка платежей...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Платежи</h1>
              <p className="text-gray-600">История и управление платежами</p>
            </div>
            <Button onClick={refreshPayments} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Всего платежей</p>
                  <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Успешных</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {payments.filter(p => p.status === 'success').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Обрабатываются</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {payments.filter(p => p.status === 'processing').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ошибок</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {payments.filter(p => p.status === 'failure').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>История платежей</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Нет платежей</h3>
                <p className="text-gray-600 mb-6">
                  У вас пока нет платежей. Оформите подписку или арендуйте книгу.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button asChild>
                    <Link href="/subscribe">Оформить подписку</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/catalog">Каталог книг</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Платеж
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Сумма
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.description}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {payment.invoiceId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.amount} {payment.currency}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.status)}
                            {getStatusBadge(payment.status)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(payment.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            {payment.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => checkPaymentStatus(payment.invoiceId)}
                              >
                                Проверить
                              </Button>
                            )}
                            
                            {payment.paymentUrl && payment.status === 'pending' && (
                              <Button
                                size="sm"
                                asChild
                              >
                                <a href={payment.paymentUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Оплатить
                                </a>
                              </Button>
                            )}
                            
                            {payment.status === 'success' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadReceipt(payment)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Чек
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}