"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, BookOpen, Clock, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react"

interface RentalRow {
  id: string
  user_id: string
  book_id: string
  rental_date: string
  due_date: string
  return_date?: string
  status: 'active' | 'overdue' | 'returned' | 'lost'
  notes?: string
  created_at: string
  updated_at: string
  user_name?: string
  user_email?: string
  book_title?: string
  book_code?: string
  users?: {
    name: string
    email: string
  }
  books?: {
    title: string
    code: string
  }
}

interface RentalsTableProps {
  onRefresh?: () => void
}

export function RentalsTable({ 
  onRefresh // eslint-disable-line @typescript-eslint/no-unused-vars
}: RentalsTableProps) {
  const [rentals, setRentals] = useState<RentalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRentals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/rentals')
      const data = await response.json()
      
      if (data.success) {
        setRentals(data.data || [])
        // Вызываем onRefresh если он передан
        onRefresh?.()
      } else {
        setError('Помилка завантаження оренд')
      }
    } catch (err) {
      console.error('Error loading rentals:', err)
      setError('Помилка завантаження оренд')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRentals()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'overdue': return 'destructive'
      case 'returned': return 'secondary'
      case 'lost': return 'outline'
      default: return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активна'
      case 'overdue': return 'Просрочена'
      case 'returned': return 'Повернута'
      case 'lost': return 'Втрачена'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="size-4" />
      case 'overdue': return <AlertTriangle className="size-4" />
      case 'returned': return <CheckCircle className="size-4" />
      case 'lost': return <AlertTriangle className="size-4" />
      default: return <Clock className="size-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA')
  }

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = now.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  if (loading) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Calendar className="size-5" />
            Оренди
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="size-6 animate-spin text-slate-400" />
            <span className="ml-2 text-slate-600">Завантаження оренд...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Calendar className="size-5" />
            Оренди
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadRentals} variant="outline">
              <RefreshCw className="size-4 mr-2" />
              Спробувати знову
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-900 flex items-center gap-2">
            <Calendar className="size-5" />
            Оренди ({rentals.length})
          </CardTitle>
          <Button onClick={loadRentals} variant="outline" size="md">
            <RefreshCw className="size-4 mr-2" />
            Оновити
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rentals.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Calendar className="size-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-semibold text-slate-700 mb-2">Немає оренд</p>
            <p className="text-slate-500">Орендні записи з&apos;являться тут після видачі книг</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map((rental) => (
              <div
                key={rental.id}
                className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge variant={getStatusBadgeVariant(rental.status)} className="flex items-center gap-1">
                        {getStatusIcon(rental.status)}
                        {getStatusText(rental.status)}
                      </Badge>
                      {rental.status === 'overdue' && (
                        <Badge variant="destructive">
                          Просрочена на {getDaysOverdue(rental.due_date)} дн.
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="size-4 text-slate-500" />
                          <span className="font-medium">{rental.users?.name || rental.user_name || 'Невідомий користувач'}</span>
                          <span className="text-slate-500">({rental.users?.email || rental.user_email || 'немає email'})</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="size-4 text-slate-500" />
                          <span className="font-medium">{rental.books?.title || rental.book_title || 'Невідома книга'}</span>
                          <span className="text-slate-500">({rental.books?.code || rental.book_code || 'немає коду'})</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>Видано: {formatDate(rental.rental_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4" />
                          <span>Повернути до: {formatDate(rental.due_date)}</span>
                        </div>
                        {rental.return_date && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="size-4" />
                            <span>Повернуто: {formatDate(rental.return_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {rental.notes && (
                      <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                        {rental.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
