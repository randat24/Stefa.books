"use client"

import { useState, useMemo, useCallback } from "react"
import { 
  Users, User, Mail, Phone, Calendar, CreditCard, BookOpen, 
  Search, Filter, MoreHorizontal, Edit, Trash2, Eye, RefreshCw,
  CheckCircle, XCircle, AlertTriangle, Clock, TrendingUp, Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/Badge"
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card"
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table"
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { UserRow } from "@/lib/types/admin"

interface UserManagementProps {
  users: UserRow[]
  onRefresh: () => void
}

interface FilterState {
  search: string
  status: string
  subscriptionType: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export function UserManagement({ users, onRefresh }: UserManagementProps) {
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null)
  const [editingUser, setEditingUser] = useState<UserRow | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    subscriptionType: '',
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // ============================================================================
  // ФІЛЬТРАЦІЯ ТА СОРТУВАННЯ
  // ============================================================================

  const filteredUsers = useMemo(() => {
    const filtered = users.filter(user => {
      // Пошук
      if (filters.search) {
        const search = filters.search.toLowerCase()
        if (!user.name.toLowerCase().includes(search) &&
            !user.email.toLowerCase().includes(search) &&
            !(user.phone?.toLowerCase().includes(search) || false)) {
          return false
        }
      }

      // Статус
      if (filters.status && user.status !== filters.status) {
        return false
      }

      // Тип підписки
      if (filters.subscriptionType && user.subscription_type !== filters.subscriptionType) {
        return false
      }

      return true
    })

    // Сортування
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'created':
          aValue = new Date(a.created_at || '').getTime()
          bValue = new Date(b.created_at || '').getTime()
          break
        case 'lastActivity':
          aValue = new Date(a.updated_at || a.created_at || '').getTime()
          bValue = new Date(b.updated_at || b.created_at || '').getTime()
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [users, filters])

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredUsers, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  // ============================================================================
  // ФУНКЦІЇ ДЛЯ РОБОТИ З КОРИСТУВАЧАМИ
  // ============================================================================

  const handleViewUser = useCallback((user: UserRow) => {
    setSelectedUser(user)
  }, [])

  const handleEditUser = useCallback((user: UserRow) => {
    setEditingUser(user)
  }, [])

  const handleDeleteUser = useCallback(async (user: UserRow) => {
    if (!confirm(`Ви впевнені, що хочете видалити користувача "${user.name}"?\n\nЦю дію неможливо скасувати!`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        onRefresh()
        alert('Користувача успішно видалено!')
      } else {
        alert(`Помилка видалення: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Помилка видалення користувача. Перевірте підключення до бази даних.')
    }
  }, [onRefresh])

  const handleToggleUserStatus = useCallback(async (user: UserRow) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/toggle-status`, {
        method: 'PATCH'
      })
      const result = await response.json()
      
      if (result.success) {
        onRefresh()
        alert(`Користувач ${result.data.status === 'active' ? 'активовано' : 'деактивовано'}!`)
      } else {
        alert(`Помилка оновлення: ${result.error}`)
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      alert('Помилка оновлення статусу користувача.')
    }
  }, [onRefresh])

  // ============================================================================
  // ДОПОМІЖНІ ФУНКЦІЇ
  // ============================================================================

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        label: "Активний",
        icon: <CheckCircle className="size-3" />,
        className: "bg-green-50 text-green-700 border-green-200"
      },
      inactive: {
        label: "Неактивний",
        icon: <XCircle className="size-3" />,
        className: "bg-red-50 text-red-700 border-red-200"
      },
      suspended: {
        label: "Заблокований",
        icon: <AlertTriangle className="size-3" />,
        className: "bg-orange-50 text-orange-700 border-orange-200"
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active

    return (
      <Badge 
        variant="outline" 
        className={config.className}
      >
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const getSubscriptionBadge = (type: string) => {
    const typeConfig = {
      basic: {
        label: "Базовий",
        className: "bg-blue-50 text-blue-700 border-blue-200"
      },
      premium: {
        label: "Преміум",
        className: "bg-purple-50 text-purple-700 border-purple-200"
      },
      unlimited: {
        label: "Безлімітний",
        className: "bg-gold-50 text-gold-700 border-gold-200"
      }
    }

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.basic

    return (
      <Badge 
        variant="outline" 
        className={config.className}
      >
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleDateString('uk-UA')
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '—'
    return new Date(dateString).toLocaleString('uk-UA')
  }

  const getDaysSinceLastActivity = (lastLogin: string | null) => {
    if (!lastLogin) return 'Ніколи'
    const days = Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Сьогодні'
    if (days === 1) return 'Вчора'
    if (days < 7) return `${days} дн. тому`
    if (days < 30) return `${Math.floor(days / 7)} тиж. тому`
    return `${Math.floor(days / 30)} міс. тому`
  }

  const subscriptionTypes = useMemo(() => {
    const uniqueTypes = Array.from(new Set(users.map(user => user.subscription_type).filter(Boolean)))
    return uniqueTypes
  }, [users])

  // ============================================================================
  // РЕНДЕР
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Заголовок з інструментами */}
      <Card className="rounded-2xl border-neutral-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neutral-900 rounded-xl flex items-center justify-center">
                <Users className="size-6 text-neutral-0" />
              </div>
              <div>
                <CardTitle className="text-body-lg text-neutral-900">Управління користувачами</CardTitle>
                <p className="text-body-sm text-neutral-600">
                  Всього користувачів: <span className="font-semibold text-neutral-900">{users.length}</span>
                  {filters.search && (
                    <span className="ml-2">
                      • Знайдено: <span className="font-semibold text-neutral-900">{filteredUsers.length}</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowFilters(!showFilters)} 
                variant="outline" 
                size="md"
              >
                <Filter className="size-4 mr-2" />
                Фільтри
              </Button>
              <Button onClick={onRefresh} variant="outline" size="md">
                <RefreshCw className="size-4 mr-2" />
                Оновити
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Пошук та фільтри */}
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-neutral-400" />
              <Input
                placeholder="Пошук по імені, email, телефону..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 pr-4 h-11 border-neutral-200 focus:border-neutral-400 focus:ring-gray-400"
              />
            </div>
            <div className="flex items-center gap-2 text-body-sm text-neutral-600">
              <Filter className="size-4" />
              <span>Фільтри: {filteredUsers.length} з {users.length}</span>
            </div>
          </div>

          {/* Розширені фільтри */}
          {showFilters && (
            <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label className="text-body-sm font-medium text-neutral-700">Статус</Label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-neutral-200 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Всі статуси</option>
                    <option value="active">Активні</option>
                    <option value="inactive">Неактивні</option>
                    <option value="suspended">Заблоковані</option>
                  </select>
                </div>
                <div>
                  <Label className="text-body-sm font-medium text-neutral-700">Тип підписки</Label>
                  <select
                    value={filters.subscriptionType}
                    onChange={(e) => setFilters(prev => ({ ...prev, subscriptionType: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-neutral-200 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Всі типи</option>
                    {subscriptionTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-body-sm font-medium text-neutral-700">Сортування</Label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-')
                      setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }))
                    }}
                    className="w-full mt-1 px-3 py-2 border border-neutral-200 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="name-asc">Ім&apos;я А-Я</option>
                    <option value="name-desc">Ім&apos;я Я-А</option>
                    <option value="email-asc">Email А-Я</option>
                    <option value="email-desc">Email Я-А</option>
                    <option value="created-desc">Нові спочатку</option>
                    <option value="created-asc">Старі спочатку</option>
                    <option value="lastActivity-desc">Остання активність</option>
                    <option value="lastActivity-asc">Найстаріша активність</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Таблиця користувачів */}
      <Card className="rounded-2xl border-neutral-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px] lg:min-w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50 border-b-2 border-neutral-200">
                    <TableHead className="w-16 font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <User className="size-4" />
                        <span className="hidden sm:inline">Аватар</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[200px] font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <Users className="size-4" />
                        Користувач
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[180px] font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="size-4" />
                        <span className="hidden lg:inline">Email</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[140px] font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <Phone className="size-4" />
                        <span className="hidden lg:inline">Телефон</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[120px] font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="size-4" />
                        <span className="hidden lg:inline">Підписка</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px] font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-4" />
                        <span className="hidden lg:inline">Статус</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[140px] font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4" />
                        <span className="hidden lg:inline">Реєстрація</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[140px] font-semibold text-neutral-700 p-4">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4" />
                        <span className="hidden lg:inline">Остання активність</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center w-32 bg-neutral-100 font-semibold text-neutral-800 p-4">
                      <div className="flex items-center justify-center gap-2">
                        <MoreHorizontal className="size-4" />
                        Дії
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user, index) => (
                    <TableRow 
                      key={user.id} 
                      className={`group hover:bg-neutral-50 transition-all duration-200 border-b border-neutral-100 ${
                        index % 2 === 0 ? 'bg-neutral-0' : 'bg-slate-25'
                      }`}
                    >
                      {/* Аватар */}
                      <TableCell className="p-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center">
                          <span className="text-neutral-0 font-bold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </TableCell>

                      {/* Ім'я та інформація */}
                      <TableCell className="p-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-neutral-900">{user.name}</div>
                          <div className="text-body-sm text-neutral-600">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>

                      {/* Email */}
                      <TableCell className="p-4">
                        <div className="flex items-center gap-2">
                          <Mail className="size-4 text-neutral-500" />
                          <span className="text-body-sm text-neutral-700 truncate max-w-[160px]" title={user.email}>
                            {user.email}
                          </span>
                        </div>
                      </TableCell>

                      {/* Телефон */}
                      <TableCell className="p-4">
                        {user.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="size-4 text-neutral-500" />
                            <span className="text-body-sm text-neutral-700">{user.phone}</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-sm">—</span>
                        )}
                      </TableCell>

                      {/* Підписка */}
                      <TableCell className="p-4">
                        {getSubscriptionBadge(user.subscription_type)}
                      </TableCell>

                      {/* Статус */}
                      <TableCell className="p-4">
                        {getStatusBadge(user.status)}
                      </TableCell>

                      {/* Реєстрація */}
                      <TableCell className="p-4">
                        <div className="text-body-sm text-neutral-600">
                          {formatDate(user.created_at || null)}
                        </div>
                      </TableCell>

                      {/* Остання активність */}
                      <TableCell className="p-4">
                        <div className="text-body-sm text-neutral-600">
                          {getDaysSinceLastActivity(user.updated_at || user.created_at || null)}
                        </div>
                      </TableCell>

                      {/* Дії */}
                      <TableCell className="w-32 bg-neutral-50 p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            className="group w-8 h-8 rounded-lg bg-neutral-600 text-neutral-0 hover:bg-neutral-700 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110"
                            onClick={() => handleViewUser(user)}
                            title="Переглянути деталі"
                          >
                            <Eye className="size-3 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            className="group w-8 h-8 rounded-lg bg-neutral-500 text-neutral-0 hover:bg-neutral-600 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110"
                            onClick={() => handleEditUser(user)}
                            title="Редагувати"
                          >
                            <Edit className="size-3 group-hover:scale-110 transition-transform" />
                          </button>
                          <button
                            className="group w-8 h-8 rounded-lg bg-orange-500 text-neutral-0 hover:bg-orange-600 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110"
                            onClick={() => handleToggleUserStatus(user)}
                            title={user.status === 'active' ? 'Деактивувати' : 'Активувати'}
                          >
                            {user.status === 'active' ? (
                              <XCircle className="size-3 group-hover:scale-110 transition-transform" />
                            ) : (
                              <CheckCircle className="size-3 group-hover:scale-110 transition-transform" />
                            )}
                          </button>
                          <button
                            className="group w-8 h-8 rounded-lg bg-red-500 text-neutral-0 hover:bg-red-600 transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110"
                            onClick={() => handleDeleteUser(user)}
                            title="Видалити"
                          >
                            <Trash2 className="size-3 group-hover:scale-110 transition-transform" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3 text-neutral-500">
                          <Users className="size-12 text-neutral-300" />
                          <p className="text-body-lg font-medium">Користувачі не знайдені</p>
                          {filters.search ? (
                            <p className="text-sm">Спробуйте змінити пошуковий запит або фільтри</p>
                          ) : (
                            <p className="text-sm">Немає користувачів в системі</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Пагінація */}
      {totalPages > 1 && (
        <Card className="rounded-2xl border-neutral-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-body-sm text-neutral-600">
                Показано {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} з {filteredUsers.length} користувачів
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="h-9 px-3"
                >
                  Назад
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "primary" : "outline"}
                        size="md"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-9 w-9 p-0"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-3"
                >
                  Вперед
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Діалог деталей користувача */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Деталі користувача</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="grid gap-6">
              {/* Аватар та основна інформація */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-light rounded-2xl flex items-center justify-center">
                  <span className="text-neutral-0 font-bold text-h4">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-h3 text-neutral-900">{selectedUser.name}</h2>
                  <p className="text-neutral-600">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedUser.status)}
                    {getSubscriptionBadge(selectedUser.subscription_type)}
                  </div>
                </div>
              </div>

              {/* Контактна інформація */}
              <div className="grid gap-4">
                <h3 className="text-body-lg font-semibold text-neutral-900">Контактна інформація</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Email</Label>
                    <p className="text-neutral-700">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Телефон</Label>
                    <p className="text-neutral-700">{selectedUser.phone || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Статистика */}
              <div className="grid gap-4">
                <h3 className="text-body-lg font-semibold text-neutral-900">Статистика</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-h2 text-blue-600">0</div>
                    <div className="text-body-sm text-blue-600">Оренд</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-h2 text-green-600">0</div>
                    <div className="text-body-sm text-green-600">Повернень</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-h2 text-purple-600">0</div>
                    <div className="text-body-sm text-purple-600">Платежів</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-h2 text-orange-600">0</div>
                    <div className="text-body-sm text-orange-600">Днів активності</div>
                  </div>
                </div>
              </div>

              {/* Дати */}
              <div className="grid gap-4">
                <h3 className="text-body-lg font-semibold text-neutral-900">Дати</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Реєстрація</Label>
                    <p className="text-neutral-700">{formatDateTime(selectedUser.created_at || null)}</p>
                  </div>
                  <div>
                    <Label className="text-body-sm font-medium text-neutral-600">Остання активність</Label>
                    <p className="text-neutral-700">{formatDateTime(selectedUser.updated_at || selectedUser.created_at || null)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
