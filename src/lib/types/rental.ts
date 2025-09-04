// ============================================================================
// RENTAL SYSTEM TYPES
// ============================================================================

import type { Database } from '../database.types'

// Используем тип Book из database.types.ts
export type Book = Database['public']['Tables']['books']['Row']

export interface User {
	id: string
	email: string
	name?: string
	phone?: string
	created_at: string
	updated_at: string
}

export interface Rental {
	id: string
	user_id: string
	book_id: string
	rental_date: string
	due_date: string | null
	return_date: string | null
	status: RentalStatus
	notes: string | null
	created_at: string
	updated_at: string
	book?: Book
	user?: User
}

export interface RentalRequest {
	id: string
	name: string
	email: string
	phone: string
	social: string | null
	book_id: string | null
	plan: SubscriptionPlan
	delivery: DeliveryMethod | null
	payment_method: PaymentMethod
	note: string | null
	screenshot_url: string | null
	status: RentalRequestStatus
	rental_id: string | null
	privacy_consent: boolean
	created_at: string
	updated_at: string
	book?: Book
}

// ============================================================================
// ENUMS
// ============================================================================

export type RentalStatus = 'active' | 'overdue' | 'returned' | 'lost'

export type RentalRequestStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export type SubscriptionPlan = 'mini' | 'maxi'

export type PaymentMethod = 'Онлайн оплата' | 'Переказ на карту' | 'Готівка при отриманні'

export type DeliveryMethod = 'pickup' | 'delivery'

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
	success: boolean
	data?: T
	error?: string
	message?: string
	details?: any
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
		hasNext: boolean
		hasPrev: boolean
	}
}

export interface RentalsResponse extends PaginatedResponse<Rental> {
	statistics?: {
		statusCounts: Record<RentalStatus, number>
		total: number
	}
}

export interface RentalRequestsResponse extends PaginatedResponse<RentalRequest> {
	statistics?: {
		statusCounts: Record<RentalRequestStatus, number>
		total: number
	}
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface SubscribeFormData {
	name: string
	phone: string
	email: string
	social?: string
	plan: SubscriptionPlan
	payment: PaymentMethod
	note?: string
	screenshot?: File
	privacyConsent: boolean
}

export interface RentalFormData {
	bookId: string
	userId: string
	dueDate?: string
	notes?: string
}

// ============================================================================
// STATUS CONFIGURATION TYPES
// ============================================================================

export interface StatusConfig {
	label: string
	color: string
	icon: React.ComponentType<{ className?: string }>
	description: string
}

export interface StatusConfigMap {
	[K: string]: StatusConfig
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface ApiError {
	message: string
	code?: string
	details?: any
	statusCode?: number
}

export interface ValidationError {
	field: string
	message: string
	code?: string
}

export interface FormError {
	field: string
	message: string
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface RentalFilters {
	status?: RentalStatus
	userId?: string
	email?: string
	page?: number
	limit?: number
	search?: string
	sortBy?: 'created_at' | 'updated_at' | 'rental_date' | 'due_date' | 'status'
	sortOrder?: 'asc' | 'desc'
}

export interface RentalRequestFilters {
	status?: RentalRequestStatus
	page?: number
	limit?: number
	search?: string
	sortBy?: 'created_at' | 'updated_at' | 'name' | 'status' | 'plan'
	sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface RentalStatistics {
	totalRentals: number
	activeRentals: number
	overdueRentals: number
	returnedRentals: number
	lostRentals: number
	averageRentalDuration: number
	mostPopularBooks: Array<{
		book: Book
		rentalCount: number
	}>
}

export interface RentalRequestStatistics {
	totalRequests: number
	pendingRequests: number
	processingRequests: number
	completedRequests: number
	cancelledRequests: number
	conversionRate: number
	popularPlans: Array<{
		plan: SubscriptionPlan
		count: number
		percentage: number
	}>
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
	id: string
	type: 'success' | 'error' | 'warning' | 'info'
	title: string
	message: string
	duration?: number
	action?: {
		label: string
		onClick: () => void
	}
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>

// ============================================================================
// CONSTANTS
// ============================================================================

export const RENTAL_STATUSES: Record<RentalStatus, StatusConfig> = {
	active: {
		label: 'Активная',
		color: 'bg-green-100 text-green-800 border-green-200',
		icon: () => null, // Will be set by components
		description: 'Книга в аренде'
	},
	overdue: {
		label: 'Просрочена',
		color: 'bg-red-100 text-red-800 border-red-200',
		icon: () => null,
		description: 'Просрочена дата возврата'
	},
	returned: {
		label: 'Возвращена',
		color: 'bg-blue-100 text-blue-800 border-blue-200',
		icon: () => null,
		description: 'Книга возвращена'
	},
	lost: {
		label: 'Утеряна',
		color: 'bg-gray-100 text-gray-800 border-gray-200',
		icon: () => null,
		description: 'Книга утеряна'
	}
}

export const RENTAL_REQUEST_STATUSES: Record<RentalRequestStatus, StatusConfig> = {
	pending: {
		label: 'Ожидает',
		color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
		icon: () => null,
		description: 'Новая заявка'
	},
	processing: {
		label: 'В обработке',
		color: 'bg-blue-100 text-blue-800 border-blue-200',
		icon: () => null,
		description: 'Обрабатывается'
	},
	completed: {
		label: 'Завершена',
		color: 'bg-green-100 text-green-800 border-green-200',
		icon: () => null,
		description: 'Успешно завершена'
	},
	cancelled: {
		label: 'Отменена',
		color: 'bg-red-100 text-red-800 border-red-200',
		icon: () => null,
		description: 'Заявка отменена'
	}
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, { label: string; price: string; features: string[] }> = {
	mini: {
		label: 'Mini',
		price: '300 ₴/міс',
		features: ['2 книги одночасно', 'Безкоштовна доставка', 'Обмін книг']
	},
	maxi: {
		label: 'Maxi',
		price: '500 ₴/міс',
		features: ['4 книги одночасно', 'Пріоритетна доставка', 'Ексклюзивні книги', 'Персональний менеджер']
	}
}

export const PAYMENT_METHODS: PaymentMethod[] = [
	'Онлайн оплата',
	'Переказ на карту',
	'Готівка при отриманні'
]
