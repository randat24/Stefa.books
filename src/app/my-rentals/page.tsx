'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
	Search, 
	Mail, 
	Calendar, 
	BookOpen, 
	Clock, 
	CheckCircle, 
	AlertTriangleIcon,
	XCircle,
	RefreshCw,
	ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/cn'
import { logger } from '@/lib/logger'

// ============================================================================
// TYPES
// ============================================================================

interface RentalWithBook {
	id: string
	user_id: string
	book_id: string
	rental_date: string
	due_date: string | null
	return_date: string | null
	status: string | null
	notes: string | null
	created_at: string
	updated_at: string
	book?: {
		id: string
		title: string
		author: string
		cover_url: string | null
		category: string
	}
}

interface RentalsResponse {
	success: boolean
	rentals: RentalWithBook[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}
	error?: string
}

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const STATUS_CONFIG = {
	active: {
		label: 'Активная',
		color: 'bg-green-100 text-green-800 border-green-200',
		icon: CheckCircle,
		description: 'Книга в аренде'
	},
	overdue: {
		label: 'Просрочена',
		color: 'bg-red-100 text-red-800 border-red-200',
		icon: AlertTriangleIcon,
		description: 'Просрочена дата возврата'
	},
	returned: {
		label: 'Возвращена',
		color: 'bg-blue-100 text-blue-800 border-blue-200',
		icon: CheckCircle,
		description: 'Книга возвращена'
	},
	lost: {
		label: 'Утеряна',
		color: 'bg-neutral-100 text-neutral-800 border-neutral-200',
		icon: XCircle,
		description: 'Книга утеряна'
	}
} as const

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function MyRentalsContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	
	const [email, setEmail] = useState('')
	const [rentals, setRentals] = useState<RentalWithBook[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [currentPage, setCurrentPage] = useState(1)
	const [pagination, setPagination] = useState<RentalsResponse['pagination'] | null>(null)

	// Инициализация из URL параметров
	useEffect(() => {
		const emailParam = searchParams?.get('email')
		const statusParam = searchParams?.get('status')
		const pageParam = searchParams?.get('page')
		
		if (emailParam) {
			setEmail(emailParam)
		}
		if (statusParam) {
			setStatusFilter(statusParam)
		}
		if (pageParam) {
			setCurrentPage(parseInt(pageParam, 10))
		}
	}, [searchParams])

	// Загрузка аренд
	const fetchRentals = async (emailValue: string, status: string, page: number) => {
		if (!emailValue.trim()) {
			setRentals([])
			setPagination(null)
			return
		}

		setLoading(true)
		setError(null)

		try {
			const params = new URLSearchParams({
				email: emailValue.trim(),
				page: page.toString(),
				limit: '10'
			})

			if (status !== 'all') {
				params.append('status', status)
			}

			const response = await fetch(`/api/my-rentals?${params}`)
			const data: RentalsResponse = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Ошибка загрузки аренд')
			}

			setRentals(data.rentals)
			setPagination(data.pagination)
			
			logger.info('Rentals fetched successfully', {
				email: emailValue,
				count: data.rentals.length,
				status,
				page
			})

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
			setError(errorMessage)
			setRentals([])
			setPagination(null)
			
			logger.error('Error fetching rentals', {
				error: errorMessage,
				email: emailValue,
				status,
				page
			})
		} finally {
			setLoading(false)
		}
	}

	// Обработка поиска
	const handleSearch = () => {
		setCurrentPage(1)
		fetchRentals(email, statusFilter, 1)
		
		// Обновление URL
		const params = new URLSearchParams()
		if (email.trim()) params.set('email', email.trim())
		if (statusFilter !== 'all') params.set('status', statusFilter)
		router.push(`/my-rentals?${params}`)
	}

	// Обработка изменения фильтра
	const handleStatusFilterChange = (newStatus: string) => {
		setStatusFilter(newStatus)
		setCurrentPage(1)
		fetchRentals(email, newStatus, 1)
		
		// Обновление URL
		const params = new URLSearchParams()
		if (email.trim()) params.set('email', email.trim())
		if (newStatus !== 'all') params.set('status', newStatus)
		router.push(`/my-rentals?${params}`)
	}

	// Обработка пагинации
	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage)
		fetchRentals(email, statusFilter, newPage)
		
		// Обновление URL
		const params = new URLSearchParams()
		if (email.trim()) params.set('email', email.trim())
		if (statusFilter !== 'all') params.set('status', statusFilter)
		params.set('page', newPage.toString())
		router.push(`/my-rentals?${params}`)
	}

	// Форматирование даты
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('uk-UA', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

	// Проверка просрочки
	const isOverdue = (dueDate: string | null) => {
		if (!dueDate) return false
		return new Date(dueDate) < new Date()
	}

	return (
		<div className="min-h-screen bg-neutral-50">
			<div className="container mx-auto px-4 py-6">
				{/* Breadcrumbs */}
				<div className="mb-6">
					<nav className="flex items-center space-x-2 text-body-sm text-neutral-600">
						<Link href="/" className="hover:text-neutral-900">Головна</Link>
						<ChevronRight className="h-4 w-4" />
						<span className="text-neutral-900 font-medium">Мои аренды</span>
					</nav>
				</div>
				
				{/* Centered Header */}
				<div className="mb-8 text-center">
					<h1 className="text-h1 text-neutral-900 mb-2">
						Мои аренды
					</h1>
					<p className="text-body text-neutral-600">
						Найдите историю ваших аренд по email адресу
					</p>
				</div>

				{/* Improved Search Form */}
				<div className="max-w-2xl mx-auto">
					<Card className="mb-6">
						<CardContent className="p-6">
							<div className="space-y-4">
								{/* Email Input */}
								<div>
									<label htmlFor="email" className="block text-body-sm font-medium text-neutral-700 mb-2">
										Email адрес
									</label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
										<Input
											id="email"
											type="email"
											placeholder="your@email.com"
											value={email}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
											onKeyDown={(e: React.ChangeEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
											className="pl-12 h-12 text-base"
										/>
									</div>
								</div>
								
								{/* Status Filter */}
								<div>
									<label className="block text-body-sm font-medium text-neutral-700 mb-2">
										Статус
									</label>
									<Select value={statusFilter} onValueChange={handleStatusFilterChange}>
										<SelectTrigger className="h-12 text-base">
											<SelectValue placeholder="Все статусы" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="all">Все статусы</SelectItem>
											<SelectItem value="active">Активные</SelectItem>
											<SelectItem value="overdue">Просроченные</SelectItem>
											<SelectItem value="returned">Возвращенные</SelectItem>
											<SelectItem value="lost">Утерянные</SelectItem>
										</SelectContent>
									</Select>
								</div>
								
								{/* Search Button */}
								<Button 
									onClick={handleSearch}
									disabled={loading || !email.trim()}
									className="w-full h-12 text-body font-medium"
								>
									{loading ? (
										<>
											<RefreshCw className="h-5 w-5 mr-2 animate-spin" />
											Поиск...
										</>
									) : (
										<>
											<Search className="h-5 w-5 mr-2" />
											Найти аренды
										</>
									)}
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
						<div className="flex items-center gap-2 text-red-800 text-sm">
							<AlertTriangleIcon className="h-4 w-4" />
							<span className="font-medium">Ошибка:</span>
							<span>{error}</span>
						</div>
					</div>
				)}

				{/* Results */}
				{rentals.length > 0 && (
					<div className="max-w-4xl mx-auto space-y-4">
						{/* Results Header */}
						<div className="text-center mb-6">
							<h2 className="text-body-lg font-semibold text-neutral-900 mb-2">
								Найдено аренд: {pagination?.total || 0}
							</h2>
							{statusFilter !== 'all' && (
								<Badge variant="outline" className="text-sm">
									{STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label || statusFilter}
								</Badge>
							)}
						</div>

						{/* Compact Rentals List */}
						<div className="space-y-3">
							{rentals.map((rental) => {
								const statusConfig = STATUS_CONFIG[rental.status as keyof typeof STATUS_CONFIG]
								const isOverdueStatus = rental.status === 'active' && isOverdue(rental.due_date)

								return (
									<Card key={rental.id} className="hover:shadow-sm transition-shadow">
										<CardContent className="p-4">
															<div className="flex">
					{/* Compact Book Cover */}
					<div className="flex-shrink-0">
						{rental.book?.cover_url ? (
							<Image
								src={rental.book.cover_url}
								alt={rental.book.title}
								width={96}
								height={128}
								className="w-24 h-32 object-cover rounded-md shadow-sm"
							/>
						) : (
							<div className="w-24 h-32 bg-neutral-200 rounded-md flex items-center justify-center">
								<BookOpen className="h-10 w-10 text-neutral-400" />
							</div>
						)}
					</div>

					{/* Compact Book Info */}
					<div className="flex-1 min-w-0 ml-4">
													<div className="flex items-start justify-between mb-2">
														<div className="min-w-0 flex-1">
															<h3 className="font-medium text-neutral-900 truncate">
																{rental.book?.title || 'Неизвестная книга'}
															</h3>
															<p className="text-body text-neutral-700 truncate font-medium">
																{rental.book?.author || 'Неизвестный автор'}
															</p>
															{rental.book?.category && (
																<Badge variant="secondary" className="text-body-sm px-0">
																	{rental.book.category}
																</Badge>
															)}
														</div>
														
														<div className="flex items-center gap-2 ml-3">
															<Badge 
																className={cn(
																	'text-xs',
																	isOverdueStatus 
																		? STATUS_CONFIG.overdue.color
																		: statusConfig?.color || 'bg-neutral-100 text-neutral-800'
																)}
															>
																{isOverdueStatus ? 'Просрочена' : statusConfig?.label || rental.status}
															</Badge>
														</div>
													</div>

													{/* Compact Rental Details */}
													<div className="flex flex-wrap gap-4 text-caption text-neutral-600">
														<div className="flex items-center">
															<Calendar className="h-3 w-3 mr-1" />
															<span>Аренда: {formatDate(rental.rental_date)}</span>
														</div>
														
														{rental.due_date && (
															<div className="flex items-center">
																<Clock className="h-3 w-3 mr-1" />
																<span className={cn(
																	isOverdue(rental.due_date) ? 'text-red-600 font-medium' : ''
																)}>
																	Возврат: {formatDate(rental.due_date)}
																</span>
															</div>
														)}
														
														{rental.return_date && (
															<div className="flex items-center">
																<CheckCircle className="h-3 w-3 mr-1" />
																<span>Возвращена: {formatDate(rental.return_date)}</span>
															</div>
														)}
													</div>

													{rental.notes && (
														<div className="mt-2 py-2 bg-neutral-50 rounded text-caption text-neutral-600">
															<strong>Заметки:</strong> {rental.notes}
														</div>
													)}
												</div>
											</div>
										</CardContent>
									</Card>
								)
							})}
						</div>

						{/* Compact Pagination */}
						{pagination && pagination.totalPages > 1 && (
							<div className="flex items-center justify-center gap-2 pt-4">
								<Button
									variant="outline"
									size="md"
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={!pagination.hasPrev}
									className="h-8 px-3 text-sm"
								>
									←
								</Button>
								
								<div className="flex items-center gap-1">
									{Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
										const page = i + 1
										return (
											<Button
												key={page}
												variant={page === currentPage ? "primary" : "outline"}
												size="md"
												onClick={() => handlePageChange(page)}
												className="w-8 h-8 px-0 text-sm"
											>
												{page}
											</Button>
										)
									})}
									{pagination.totalPages > 3 && (
										<span className="text-body-sm text-neutral-500 px-2">...</span>
									)}
								</div>
								
								<Button
									variant="outline"
									size="md"
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={!pagination.hasNext}
									className="h-8 px-3 text-sm"
								>
									→
								</Button>
							</div>
						)}
					</div>
				)}

				{/* Compact Empty State */}
				{!loading && email && rentals.length === 0 && !error && (
					<div className="max-w-2xl mx-auto text-center py-8">
						<BookOpen className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
						<h4 className="font-medium text-neutral-900 mb-1">
							Аренды не найдены
						</h4>
						<p className="text-body-sm text-neutral-600">
							По вашему email адресу не найдено активных или завершенных аренд
						</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default function MyRentalsPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center">
				<div className="text-center">
					<RefreshCw className="h-12 w-12 text-neutral-400 mx-auto mb-4 animate-spin" />
					<p className="text-neutral-600">Загрузка...</p>
				</div>
			</div>
		}>
			<MyRentalsContent />
		</Suspense>
	)
}
