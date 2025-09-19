// ============================================================================
// АДМІНІСТРАТИВНІ ТИПИ ДЛЯ STEFA.BOOKS
// ============================================================================

export interface AdminDashboardData {
  stats: {
    totalBooks: number
    availableBooks: number
    activeUsers: number
    totalRevenue: number
    totalBooksCost: number
  }
  books: BookRow[]
  users: UserRow[]
  rentals: RentalRow[]
  payments: PaymentRow[]
}

// ============================================================================
// ТИПИ АВТОРОВ
// ============================================================================

export interface AuthorRow {
  id: string
  name: string
  bio?: string | null
  birth_year?: number | null
  nationality?: string | null
  created_at?: string
  updated_at?: string
}

// ============================================================================
// ТИПИ КНИГ
// ============================================================================

export interface BookRow {
  id: string
  code: string
  title: string
  author: string
  author_id?: string | null
  category_id: string | null
  category_name?: string
  subcategory?: string | null
  description?: string | null
  short_description?: string | null
  isbn?: string | null
  pages?: number | null
  age_range?: string | null
  language?: string | null
  publisher?: string | null
  publication_year?: number | null
  cover_url?: string | null
  status: 'available' | 'issued' | 'reserved' | 'lost'
  available: boolean
  qty_total: number
  qty_available: number
  price_uah?: number | null
  full_price_uah?: number | null
  location?: string | null
  rating?: number | null
  rating_count?: number | null
  badges?: string[] | null
  tags?: string[] | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CreateBookForm {
  code: string
  title: string
  author: string
  author_id?: string | null
  category_id: string | null
  category_name?: string
  subcategory?: string
  description?: string
  short_description?: string
  isbn?: string
  pages?: number
  age_range?: string
  language?: string
  publisher?: string
  publication_year?: number
  cover_url?: string
  status: 'available' | 'issued' | 'reserved' | 'lost'
  qty_total: number
  price_uah?: number
  location?: string
  rating?: number
  rating_count?: number
  badges?: string[]
  tags?: string[]
}

export interface UpdateBookForm extends Partial<CreateBookForm> {
  id: string
}

// ============================================================================
// ТИПИ КОРИСТУВАЧІВ
// ============================================================================

export interface UserRow {
  id: string
  name: string
  email: string
  phone?: string | null
  subscription_type: 'mini' | 'maxi' | 'premium'
  subscription_start?: string | null
  subscription_end?: string | null
  status: 'active' | 'inactive' | 'suspended'
  address?: string | null
  notes?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface CreateUserForm {
  name: string
  email: string
  phone?: string
  subscription_type: 'mini' | 'maxi' | 'premium'
  subscription_start?: string
  subscription_end?: string
  status: 'active' | 'inactive' | 'suspended'
  address?: string
  notes?: string
}

export interface UpdateUserForm extends Partial<CreateUserForm> {
  id: string
}

// ============================================================================
// ТИПИ ОРЕНДНИХ ЗАПИСІВ
// ============================================================================

export interface RentalRow {
  id: string
  user_id: string
  book_id: string
  rental_date: string
  due_date: string
  return_date?: string | null
  status: 'active' | 'overdue' | 'returned' | 'lost'
  notes?: string | null
  created_at?: string | null
  updated_at?: string | null
  // Joined fields
  user_name?: string
  user_email?: string
  book_title?: string
  book_article?: string
}

export interface CreateRentalForm {
  user_id: string
  book_id: string
  rental_date: string
  due_date: string
  status: 'active' | 'overdue' | 'returned' | 'lost'
  notes?: string
}

export interface UpdateRentalForm extends Partial<CreateRentalForm> {
  id: string
  return_date?: string
}

// ============================================================================
// ТИПИ ПЛАТЕЖІВ
// ============================================================================

export interface PaymentRow {
  id: string
  user_id: string
  amount_uah: number
  currency: string
  payment_method: 'monobank' | 'online' | 'cash'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string | null
  payment_date?: string | null
  description?: string | null
  created_at?: string | null
  updated_at?: string | null
  // Joined fields
  user_name?: string
  user_email?: string
}

export interface CreatePaymentForm {
  user_id: string
  amount_uah: number
  currency: 'UAH'
  payment_method: 'monobank' | 'online' | 'cash'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transaction_id?: string
  payment_date?: string
  description?: string
}

export interface UpdatePaymentForm extends Partial<CreatePaymentForm> {
  id: string
}

// ============================================================================
// ТИПИ ПАГІНАЦІЇ ТА ФІЛЬТРАЦІЇ
// ============================================================================

export interface PaginationParams {
  offset?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface BookFilters {
  search?: string
  category?: string
  author?: string
  status?: 'available' | 'issued' | 'reserved' | 'lost'
  available?: boolean
  minPrice?: number
  maxPrice?: number
}

export interface UserFilters {
  search?: string
  subscription_type?: 'mini' | 'maxi' | 'premium'
  status?: 'active' | 'inactive' | 'suspended'
}

export interface RentalFilters {
  search?: string
  status?: 'active' | 'overdue' | 'returned' | 'lost'
  user_id?: string
  book_id?: string
  dateFrom?: string
  dateTo?: string
}

export interface PaymentFilters {
  search?: string
  status?: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_method?: 'monobank' | 'online' | 'cash'
  user_id?: string
  dateFrom?: string
  dateTo?: string
}

// ============================================================================
// ТИПИ ВІДПОВІДЕЙ API
// ============================================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  hasMore: boolean
  nextCursor?: string
}

// ============================================================================
// ТИПИ АНАЛІТИКИ
// ============================================================================

export interface AnalyticsData {
  totalBooks: number
  availableBooks: number
  issuedBooks: number
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRevenue: number
  popularBooks: Array<{
    book_id: string
    title: string
    rental_count: number
  }>
  userActivity: Array<{
    user_id: string
    name: string
    rental_count: number
    last_rental: string
  }>
  categoryStats: Array<{
    category_id: string | null
  category_name?: string
    book_count: number
    rental_count: number
  }>
}

// ============================================================================
// ТИПИ ЕКСПОРТУ
// ============================================================================

export interface ExportOptions {
  type: 'books' | 'users' | 'rentals' | 'payments'
  format: 'csv' | 'json' | 'xlsx'
  filters?: BookFilters | UserFilters | RentalFilters | PaymentFilters
  columns?: string[]
}

export interface ExportResult {
  success: boolean
  filename?: string
  downloadUrl?: string
  error?: string
}

// ============================================================================
// ТИПИ НАЛАШТУВАНЬ
// ============================================================================

export interface AdminSettings {
  rental_period_days: number
  late_fee_per_day: number
  max_books_per_user: number
  notification_settings: {
    email_notifications: boolean
    sms_notifications: boolean
    reminder_days_before_due: number
  }
  subscription_prices: {
    mini: number
    maxi: number
    premium: number
  }
}