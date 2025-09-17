import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { z } from 'zod'

// ============================================================================
// MY RENTALS API - Управление арендой пользователей
// ============================================================================

const QueryParamsSchema = z.object({
	userId: z.string().optional().nullable(),
	email: z.string().email().optional().nullable(),
	status: z.enum(['active', 'overdue', 'returned', 'lost']).optional().nullable(),
	page: z.string().transform(val => val ? parseInt(val) : 1).pipe(z.number().min(1)).default('1'),
	limit: z.string().transform(val => val ? parseInt(val) : 20).pipe(z.number().min(1).max(100)).default('20') })

/**
 * GET /api/my-rentals - Получить аренды пользователя
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		
		const queryParams = QueryParamsSchema.safeParse({
			userId: searchParams.get('userId') || undefined,
			email: searchParams.get('email') || undefined,
			status: searchParams.get('status') || undefined,
			page: searchParams.get('page') || '1',
			limit: searchParams.get('limit') || '20' })

		if (!queryParams.success) {
			logger.warn('Invalid query parameters in my-rentals API', {
				errors: queryParams.error.errors,
				params: Object.fromEntries(searchParams.entries())
			})
			return NextResponse.json(
				{ 
					error: 'Неправильные параметры запроса',
					details: queryParams.error.errors 
				},
				{ status: 400 }
			)
		}

		const { userId, email, status, page, limit } = queryParams.data

		if (!userId && !email) {
			logger.warn('My rentals API called without user identification')
			return NextResponse.json(
				{ error: 'Требуется ID пользователя или email' },
				{ status: 400 }
			)
		}

		// Построение запроса
		let rentalsQuery = supabase
			.from('rentals')
			.select(`
				id,
				user_id,
				book_id,
				rental_date,
				due_date,
				return_date,
				status,
				notes,
				created_at,
				updated_at,
				books!inner (
					id,
					title,
					author,
					cover_url,
					category
				)
			`, { count: 'exact' })
			.order('rental_date', { ascending: false })

		if (userId) {
			rentalsQuery = rentalsQuery.eq('user_id', userId)
		} else if (email) {
			// Получение пользователя по email
			const { data: user, error: userError } = await supabase
				.from('users')
				.select('id')
				.eq('email', email)
				.single()

			if (userError || !user) {
				logger.info('No user found for email in my rentals', { email })
				return NextResponse.json({ 
					rentals: [],
					total: 0,
					message: 'Пользователь не найден'
				})
			}

			rentalsQuery = rentalsQuery.eq('user_id', (user as any).id)
		}

		if (status) {
			rentalsQuery = rentalsQuery.eq('status', status)
		}

		const offset = (page - 1) * limit
		rentalsQuery = rentalsQuery.range(offset, offset + limit - 1)

		const { data: rentals, error, count } = await rentalsQuery

		if (error) {
			logger.error('Error fetching user rentals', { 
				error: error.message,
				userId: userId || 'via email',
				status,
				page,
				limit
			})
			return NextResponse.json(
				{ error: 'Ошибка получения аренд' },
				{ status: 500 }
			)
		}

		// Трансформация данных
		const rentalsWithBooks = rentals?.map((rental: any) => ({
			...rental,
			book: rental.books
		})) || []

		const totalPages = count ? Math.ceil(count / limit) : 0

		logger.info('User rentals fetched successfully', {
			userId: userId || 'via email',
			rentalCount: rentalsWithBooks.length,
			totalCount: count,
			page,
			limit,
			status: status || 'all'
		})

		return NextResponse.json({
			success: true,
			rentals: rentalsWithBooks,
			pagination: {
				page,
				limit,
				total: count || 0,
				totalPages,
				hasNext: page < totalPages,
				hasPrev: page > 1
			}
		})

	} catch (error) {
		logger.error('Unexpected error in my-rentals API', { 
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined
		})
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}

/**
 * POST /api/my-rentals - Создать новую аренду
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		
		const rentalDataSchema = z.object({
			bookId: z.string().uuid('Неправильный ID книги'),
			userId: z.string().uuid('Неправильный ID пользователя'),
			dueDate: z.string().datetime('Неправильная дата возврата').optional(),
			notes: z.string().max(500, 'Заметки слишком длинные').optional() })

		const validationResult = rentalDataSchema.safeParse(body)
		if (!validationResult.success) {
			return NextResponse.json(
				{ 
					error: 'Неправильные данные аренды',
					details: validationResult.error.errors 
				},
				{ status: 400 }
			)
		}

		const { bookId, userId, dueDate, notes } = validationResult.data

		// Проверка существования книги
		const { data: book, error: bookError } = await supabase
			.from('books')
			.select('id, title, available')
			.eq('id', bookId)
			.single()

		if (bookError || !book) {
			return NextResponse.json(
				{ error: 'Книга не найдена' },
				{ status: 404 }
			)
		}

		if (!(book as any).available) {
			return NextResponse.json(
				{ error: 'Книга недоступна для аренды' },
				{ status: 409 }
			)
		}

		// Создание аренды
		const { data: newRental, error: rentalError } = await (supabase as any)
			.from('rentals')
			.insert({
				user_id: userId,
				book_id: bookId,
				rental_date: new Date().toISOString(),
				due_date: dueDate || null,
				status: 'active',
				notes: notes || null })
			.select()
			.single()

		if (rentalError) {
			logger.error('Error creating rental', { 
				error: rentalError.message,
				bookId,
				userId
			})
			return NextResponse.json(
				{ error: 'Ошибка создания аренды' },
				{ status: 500 }
			)
		}

		// Обновление статуса книги
		await (supabase as any)
			.from('books')
			.update({ available: false })
			.eq('id', bookId)

		logger.info('Rental created successfully', {
			rentalId: (newRental as any)?.id,
			bookId,
			userId,
			bookTitle: (book as any)?.title
		})

		return NextResponse.json({
			success: true,
			rental: newRental,
			message: 'Аренда успешно создана'
		}, { status: 201 })

	} catch (error) {
		logger.error('Unexpected error creating rental', { 
			error: error instanceof Error ? error.message : 'Unknown error'
		})
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}