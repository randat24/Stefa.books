'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
	Search, 
	Filter, 
	RefreshCw, 
	Edit, 
	Trash2, 
	Calendar,
	Mail,
	Phone,
	CreditCard,
	FileText,
	AlertCircle,
	CheckCircle,
	Clock,
	XCircle,
	Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/cn'
import { logger } from '@/lib/logger'

// ============================================================================
// TYPES
// ============================================================================

interface RentalRequest {
	id: string
	name: string
	email: string
	phone: string
	social: string | null
	book_id: string | null
	plan: string
	delivery: string | null
	payment_method: string
	note: string | null
	screenshot_url: string | null
	status: 'pending' | 'processing' | 'completed' | 'cancelled'
	rental_id: string | null
	privacy_consent: boolean
	created_at: string
	updated_at: string
}

interface RentalsResponse {
	success: boolean
	data: RentalRequest[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}
	statistics: {
		statusCounts: Record<string, number>
		total: number
	}
	error?: string
}

// ============================================================================
// STATUS CONFIGURATION
// ============================================================================

const STATUS_CONFIG = {
	pending: {
		label: 'Ожидает',
		color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		icon: Clock,
		description: 'Новая заявка'
	},
	processing: {
		label: 'В обработке',
		color: 'bg-blue-100 text-blue-800 border-blue-200',
		icon: Settings,
		description: 'Обрабатывается'
	},
	completed: {
		label: 'Завершена',
		color: 'bg-green-100 text-green-800 border-green-200',
		icon: CheckCircle,
		description: 'Успешно завершена'
	},
	cancelled: {
		label: 'Отменена',
		color: 'bg-red-100 text-red-800 border-red-200',
		icon: XCircle,
		description: 'Заявка отменена'
	}
} as const

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminRentalsPage() {
	const [rentals, setRentals] = useState<RentalRequest[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [statistics, setStatistics] = useState<RentalsResponse['statistics'] | null>(null)
	const [pagination, setPagination] = useState<RentalsResponse['pagination'] | null>(null)
	
	// Filters and search
	const [statusFilter, setStatusFilter] = useState<string>('all')
	const [searchQuery, setSearchQuery] = useState('')
	const [currentPage, setCurrentPage] = useState(1)
	const [sortBy, setSortBy] = useState('created_at')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
	
	// Modal states
	const [selectedRental, setSelectedRental] = useState<RentalRequest | null>(null)
	const [isEditModalOpen, setIsEditModalOpen] = useState(false)
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
	const [editNote, setEditNote] = useState('')
	const [editStatus, setEditStatus] = useState<string>('')
	const [isUpdating, setIsUpdating] = useState(false)

	// Load rentals
	const fetchRentals = useCallback(async () => {
		setLoading(true)
		setError(null)

		try {
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: '50',
				sortBy,
				sortOrder
			})

			if (statusFilter !== 'all') {
				params.append('status', statusFilter)
			}

			if (searchQuery.trim()) {
				params.append('search', searchQuery.trim())
			}

			const response = await fetch(`/api/admin/rentals?${params}`)
			const data: RentalsResponse = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Ошибка загрузки заявок')
			}

			setRentals(data.data)
			setStatistics(data.statistics)
			setPagination(data.pagination)
			
			logger.info('Admin rentals fetched successfully', {
				count: data.data.length,
				totalCount: data.statistics.total,
				page: currentPage,
				statusFilter,
				searchQuery: searchQuery ? 'provided' : 'not provided'
			})

		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
			setError(errorMessage)
			setRentals([])
			setStatistics(null)
			setPagination(null)
			
			logger.error('Error fetching admin rentals', {
				error: errorMessage,
				page: currentPage,
				statusFilter,
				searchQuery
			})
		} finally {
			setLoading(false)
		}
	}, [currentPage, sortBy, sortOrder, statusFilter, searchQuery])

	// Handle search
	const handleSearch = () => {
		setCurrentPage(1)
		fetchRentals()
	}

	// Handle status filter change
	const handleStatusFilterChange = (newStatus: string) => {
		setStatusFilter(newStatus)
		setCurrentPage(1)
		fetchRentals()
	}

	// Handle page change
	const handlePageChange = (newPage: number) => {
		setCurrentPage(newPage)
		fetchRentals()
	}

	// Handle sort change
	const handleSortChange = (newSortBy: string) => {
		setSortBy(newSortBy)
		setCurrentPage(1)
		fetchRentals()
	}

	// Handle sort order change
	const handleSortOrderChange = (newSortOrder: 'asc' | 'desc') => {
		setSortOrder(newSortOrder)
		setCurrentPage(1)
		fetchRentals()
	}

	// Open edit modal
	const openEditModal = (rental: RentalRequest) => {
		setSelectedRental(rental)
		setEditNote(rental.note || '')
		setEditStatus(rental.status)
		setIsEditModalOpen(true)
	}

	// Open delete modal
	const openDeleteModal = (rental: RentalRequest) => {
		setSelectedRental(rental)
		setIsDeleteModalOpen(true)
	}

	// Update rental
	const handleUpdateRental = async () => {
		if (!selectedRental) return

		setIsUpdating(true)
		try {
			const response = await fetch('/api/admin/rentals', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: selectedRental.id,
					status: editStatus,
					note: editNote
				})
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Ошибка обновления заявки')
			}

			logger.info('Rental request updated successfully', {
				rentalId: selectedRental.id,
				newStatus: editStatus
			})

			setIsEditModalOpen(false)
			fetchRentals()
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
			alert(`Ошибка обновления: ${errorMessage}`)
			logger.error('Error updating rental request', {
				error: errorMessage,
				rentalId: selectedRental.id
			})
		} finally {
			setIsUpdating(false)
		}
	}

	// Delete rental
	const handleDeleteRental = async () => {
		if (!selectedRental) return

		setIsUpdating(true)
		try {
			const response = await fetch(`/api/admin/rentals?id=${selectedRental.id}`, {
				method: 'DELETE'
			})

			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Ошибка удаления заявки')
			}

			logger.info('Rental request deleted successfully', {
				rentalId: selectedRental.id
			})

			setIsDeleteModalOpen(false)
			fetchRentals()
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка'
			alert(`Ошибка удаления: ${errorMessage}`)
			logger.error('Error deleting rental request', {
				error: errorMessage,
				rentalId: selectedRental.id
			})
		} finally {
			setIsUpdating(false)
		}
	}

	// Format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('uk-UA', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	// Load data on mount and when filters change
	useEffect(() => {
		fetchRentals()
	}, [currentPage, sortBy, sortOrder, fetchRentals])

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Управление заявками на аренду
					</h1>
					<p className="text-gray-600">
						Просмотр и управление заявками пользователей на аренду книг
					</p>
				</div>

				{/* Statistics */}
				{statistics && (
					<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
						<Card>
							<CardContent className="p-4">
								<div className="flex items-center gap-3">
									<FileText className="h-8 w-8 text-brand-accent" />
									<div>
										<p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
										<p className="text-sm text-gray-600">Всего заявок</p>
									</div>
								</div>
							</CardContent>
						</Card>
						
						{Object.entries(STATUS_CONFIG).map(([status, config]) => {
							const count = statistics.statusCounts[status] || 0
							const Icon = config.icon
							return (
								<Card key={status}>
									<CardContent className="p-4">
										<div className="flex items-center gap-3">
											<Icon className="h-8 w-8 text-gray-500" />
											<div>
												<p className="text-2xl font-bold text-gray-900">{count}</p>
												<p className="text-sm text-gray-600">{config.label}</p>
											</div>
										</div>
									</CardContent>
								</Card>
							)
						})}
					</div>
				)}

				{/* Filters */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Filter className="h-5 w-5" />
							Фильтры и поиск
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							<div>
								<Label htmlFor="search">Поиск</Label>
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
									<Input
										id="search"
										placeholder="Имя, email, телефон..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
										className="pl-10"
									/>
								</div>
							</div>
							
							<div>
								<Label>Статус</Label>
								<Select value={statusFilter} onValueChange={handleStatusFilterChange}>
									<SelectTrigger>
										<SelectValue placeholder="Все статусы" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">Все статусы</SelectItem>
										<SelectItem value="pending">Ожидает</SelectItem>
										<SelectItem value="processing">В обработке</SelectItem>
										<SelectItem value="completed">Завершена</SelectItem>
										<SelectItem value="cancelled">Отменена</SelectItem>
									</SelectContent>
								</Select>
							</div>
							
							<div>
								<Label>Сортировка</Label>
								<Select value={sortBy} onValueChange={handleSortChange}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="created_at">Дата создания</SelectItem>
										<SelectItem value="updated_at">Дата обновления</SelectItem>
										<SelectItem value="name">Имя</SelectItem>
										<SelectItem value="status">Статус</SelectItem>
										<SelectItem value="plan">План</SelectItem>
									</SelectContent>
								</Select>
							</div>
							
							<div>
								<Label>Порядок</Label>
								<Select value={sortOrder} onValueChange={handleSortOrderChange}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="desc">По убыванию</SelectItem>
										<SelectItem value="asc">По возрастанию</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						
						<div className="flex gap-3 mt-4">
							<Button onClick={handleSearch} disabled={loading}>
								{loading ? (
									<>
										<RefreshCw className="h-4 w-4 mr-2 animate-spin" />
										Поиск...
									</>
								) : (
									<>
										<Search className="h-4 w-4 mr-2" />
										Найти
									</>
								)}
							</Button>
							
							<Button variant="outline" onClick={fetchRentals}>
								<RefreshCw className="h-4 w-4 mr-2" />
								Обновить
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Error Message */}
				{error && (
					<Card className="mb-8 border-red-200 bg-red-50">
						<CardContent className="pt-6">
							<div className="flex items-center gap-2 text-red-800">
								<AlertCircle className="h-5 w-5" />
								<span className="font-medium">Ошибка:</span>
								<span>{error}</span>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Rentals Table */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center justify-between">
							<span>Заявки на аренду</span>
							{pagination && (
								<span className="text-sm font-normal text-gray-600">
									{pagination.total} заявок
								</span>
							)}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Клиент</TableHead>
										<TableHead>Контакты</TableHead>
										<TableHead>План</TableHead>
										<TableHead>Оплата</TableHead>
										<TableHead>Статус</TableHead>
										<TableHead>Дата</TableHead>
										<TableHead>Действия</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{rentals.map((rental) => {
										const statusConfig = STATUS_CONFIG[rental.status]
										const StatusIcon = statusConfig.icon
										
										return (
											<TableRow key={rental.id}>
												<TableCell>
													<div>
														<p className="font-medium text-gray-900">{rental.name}</p>
														{rental.social && (
															<p className="text-sm text-gray-500">{rental.social}</p>
														)}
													</div>
												</TableCell>
												
												<TableCell>
													<div className="space-y-1">
														<div className="flex items-center gap-2 text-sm">
															<Mail className="h-3 w-3 text-gray-400" />
															<span>{rental.email}</span>
														</div>
														<div className="flex items-center gap-2 text-sm">
															<Phone className="h-3 w-3 text-gray-400" />
															<span>{rental.phone}</span>
														</div>
													</div>
												</TableCell>
												
												<TableCell>
													<Badge variant="outline">
														{rental.plan}
													</Badge>
												</TableCell>
												
												<TableCell>
													<div className="flex items-center gap-2">
														<CreditCard className="h-4 w-4 text-gray-400" />
														<span className="text-sm">{rental.payment_method}</span>
													</div>
												</TableCell>
												
												<TableCell>
													<Badge className={cn('flex items-center gap-1', statusConfig.color)}>
														<StatusIcon className="h-3 w-3" />
														{statusConfig.label}
													</Badge>
												</TableCell>
												
												<TableCell>
													<div className="flex items-center gap-2 text-sm text-gray-600">
														<Calendar className="h-3 w-3" />
														<span>{formatDate(rental.created_at)}</span>
													</div>
												</TableCell>
												
												<TableCell>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="md"
															onClick={() => openEditModal(rental)}
														>
															<Edit className="h-4 w-4" />
														</Button>
														
														<Button
															variant="ghost"
															size="md"
															onClick={() => openDeleteModal(rental)}
															className="text-red-600 hover:text-red-700"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
												</TableCell>
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						{pagination && pagination.totalPages > 1 && (
							<div className="flex items-center justify-between mt-6">
								<div className="text-sm text-gray-600">
									Показано {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} из {pagination.total}
								</div>
								
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="md"
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={!pagination.hasPrev}
									>
										Предыдущая
									</Button>
									
									<div className="flex items-center gap-1">
										{Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
											const page = i + 1
											return (
												<Button
													key={page}
													variant={page === currentPage ? "primary" : "outline"}
													size="md"
													onClick={() => handlePageChange(page)}
													className="w-10"
												>
													{page}
												</Button>
											)
										})}
									</div>
									
									<Button
										variant="outline"
										size="md"
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={!pagination.hasNext}
									>
										Следующая
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Edit Modal */}
				<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Редактировать заявку</DialogTitle>
						</DialogHeader>
						
						{selectedRental && (
							<div className="space-y-4">
								<div>
									<Label htmlFor="editStatus">Статус</Label>
									<Select value={editStatus} onValueChange={setEditStatus}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pending">Ожидает</SelectItem>
											<SelectItem value="processing">В обработке</SelectItem>
											<SelectItem value="completed">Завершена</SelectItem>
											<SelectItem value="cancelled">Отменена</SelectItem>
										</SelectContent>
									</Select>
								</div>
								
								<div>
									<Label htmlFor="editNote">Заметка</Label>
									<Textarea
										id="editNote"
										value={editNote}
										onChange={(e) => setEditNote(e.target.value)}
										placeholder="Добавить заметку..."
										rows={3}
									/>
								</div>
								
								<div className="flex gap-3">
									<Button
										variant="outline"
										onClick={() => setIsEditModalOpen(false)}
										className="flex-1"
									>
										Отмена
									</Button>
									<Button
										onClick={handleUpdateRental}
										disabled={isUpdating}
										className="flex-1"
									>
										{isUpdating ? 'Сохранение...' : 'Сохранить'}
									</Button>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>

				{/* Delete Modal */}
				<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
					<DialogContent className="max-w-md">
						<DialogHeader>
							<DialogTitle>Удалить заявку</DialogTitle>
						</DialogHeader>
						
						{selectedRental && (
							<div className="space-y-4">
								<p className="text-gray-600">
									Вы уверены, что хотите удалить заявку от <strong>{selectedRental.name}</strong>?
									Это действие нельзя отменить.
								</p>
								
								<div className="flex gap-3">
									<Button
										variant="outline"
										onClick={() => setIsDeleteModalOpen(false)}
										className="flex-1"
									>
										Отмена
									</Button>
									<Button
										variant="dark"
										onClick={handleDeleteRental}
										disabled={isUpdating}
										className="flex-1"
									>
										{isUpdating ? 'Удаление...' : 'Удалить'}
									</Button>
								</div>
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	)
}
