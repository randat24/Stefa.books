"use client"

import { 
	BookOpen, Brain, Baby, ScrollText, Sparkles, Heart,
	BookMarked, Users, Calendar, Search, GraduationCap, Eye, UserCheck,
	Shield, Clock, Globe, Compass, Crown
} from "lucide-react"
import { useEffect, useState } from "react"

export const dynamic = 'force-dynamic'

type CategoryWithStats = {
	id: string
	name: string
	description: string
	Icon: React.ComponentType<{ className?: string }>
	total: number             // кількість книг у категорії
	available: number         // доступні книги
}

type Category = {
	id: string
	name: string
	description: string
	display_order: number
	parent_id: string | null
	icon: string | null
	color: string | null
	subcategories: Category[]
}

type Book = {
	id: string
	title: string
	author: string
	category: string | null
	subcategory: string | null
	available: boolean
}

type ApiResponse<T> = {
	success: boolean
	data: T
	count?: number
	type?: string
}

// Маппинг иконок для категорий
const getCategoryIcon = (category: string) => {
	// Точные совпадения для каждой категории
	switch (category) {
		case 'Психологія і саморозвиток':
			return Brain
		case 'Казки':
			return Crown
		case 'Найменші':
			return Baby
		case 'За віком':
			return Calendar
		case 'Повний каталог':
			return BookMarked
		case 'Сучасна проза':
			return BookOpen
		case 'Дошкільний вік':
			return GraduationCap
		case 'За жанром':
			return Search
		case 'Пізнавальні':
			return Eye
		case 'Для дорослих':
			return UserCheck
		case 'Детектив':
			return Shield
		case 'Молодший вік':
			return Users
		case 'Середній вік':
			return Clock
		case 'Пригоди':
			return Compass
		case 'Підлітковий вік':
			return Heart
		case 'Повість':
			return ScrollText
		case 'Фентезі':
			return Sparkles
		case 'Реалістична проза':
			return Globe
		case 'Романтика':
			return Heart
		default:
			return BookOpen
	}
}

// Генерация описания для категории
const getCategoryDescription = (category: string) => {
	switch (category) {
		case 'Психологія і саморозвиток':
			return "Розвиток особистості та самопізнання"
		case 'Казки':
			return "Чарівні історії для дітей"
		case 'Найменші':
			return "Книги для найменших читачів"
		case 'За віком':
			return "Література за віковими групами"
		case 'Повний каталог':
			return "Всі книги нашої бібліотеки"
		case 'Сучасна проза':
			return "Сучасні твори української та світової літератури"
		case 'Дошкільний вік':
			return "Книги для дошкільнят"
		case 'За жанром':
			return "Література за жанрами"
		case 'Пізнавальні':
			return "Цікаві факти та знання"
		case 'Для дорослих':
			return "Література для дорослих читачів"
		case 'Детектив':
			return "Загадкові історії та розслідування"
		case 'Молодший вік':
			return "Книги для молодших школярів"
		case 'Середній вік':
			return "Література для середнього шкільного віку"
		case 'Пригоди':
			return "Захоплюючі пригодницькі історії"
		case 'Підлітковий вік':
			return "Книги для підлітків"
		case 'Повість':
			return "Повісті та оповідання"
		case 'Фентезі':
			return "Подорожі у неймовірні світи"
		case 'Реалістична проза':
			return "Реалістичні твори про життя"
		case 'Романтика':
			return "Романтичні історії"
		default:
			return "Захоплююча література для читання"
	}
}

// Маппинг цветов для категорий
const getCategoryColors = (category: string) => {
	switch (category) {
		case 'Психологія і саморозвиток':
			return {
				bg: 'bg-purple-50',
				border: 'border-purple-200',
				icon: 'text-purple-600',
				accent: 'bg-purple-100'
			}
		case 'Казки':
			return {
				bg: 'bg-yellow-50',
				border: 'border-yellow-200',
				icon: 'text-brand-yellow-dark',
				accent: 'bg-yellow-100'
			}
		case 'Найменші':
			return {
				bg: 'bg-pink-50',
				border: 'border-pink-200',
				icon: 'text-pink-600',
				accent: 'bg-pink-100'
			}
		case 'За віком':
			return {
				bg: 'bg-blue-50',
				border: 'border-blue-200',
				icon: 'text-brand-accent-light',
				accent: 'bg-blue-100'
			}
		case 'Повний каталог':
			return {
				bg: 'bg-gray-50',
				border: 'border-gray-200',
				icon: 'text-gray-600',
				accent: 'bg-gray-100'
			}
		case 'Сучасна проза':
			return {
				bg: 'bg-emerald-50',
				border: 'border-emerald-200',
				icon: 'text-emerald-600',
				accent: 'bg-emerald-100'
			}
		case 'Дошкільний вік':
			return {
				bg: 'bg-orange-50',
				border: 'border-orange-200',
				icon: 'text-orange-600',
				accent: 'bg-orange-100'
			}
		case 'За жанром':
			return {
				bg: 'bg-indigo-50',
				border: 'border-indigo-200',
				icon: 'text-indigo-600',
				accent: 'bg-indigo-100'
			}
		case 'Пізнавальні':
			return {
				bg: 'bg-cyan-50',
				border: 'border-cyan-200',
				icon: 'text-cyan-600',
				accent: 'bg-cyan-100'
			}
		case 'Для дорослих':
			return {
				bg: 'bg-gray-50',
				border: 'border-gray-200',
				icon: 'text-gray-600',
				accent: 'bg-gray-100'
			}
		case 'Детектив':
			return {
				bg: 'bg-red-50',
				border: 'border-red-200',
				icon: 'text-red-600',
				accent: 'bg-red-100'
			}
		case 'Молодший вік':
			return {
				bg: 'bg-green-50',
				border: 'border-green-200',
				icon: 'text-green-600',
				accent: 'bg-green-100'
			}
		case 'Середній вік':
			return {
				bg: 'bg-teal-50',
				border: 'border-teal-200',
				icon: 'text-teal-600',
				accent: 'bg-teal-100'
			}
		case 'Пригоди':
			return {
				bg: 'bg-amber-50',
				border: 'border-amber-200',
				icon: 'text-amber-600',
				accent: 'bg-amber-100'
			}
		case 'Підлітковий вік':
			return {
				bg: 'bg-rose-50',
				border: 'border-rose-200',
				icon: 'text-rose-600',
				accent: 'bg-rose-100'
			}
		case 'Повість':
			return {
				bg: 'bg-violet-50',
				border: 'border-violet-200',
				icon: 'text-violet-600',
				accent: 'bg-violet-100'
			}
		case 'Фентезі':
			return {
				bg: 'bg-fuchsia-50',
				border: 'border-fuchsia-200',
				icon: 'text-fuchsia-600',
				accent: 'bg-fuchsia-100'
			}
		case 'Реалістична проза':
			return {
				bg: 'bg-sky-50',
				border: 'border-sky-200',
				icon: 'text-sky-600',
				accent: 'bg-sky-100'
			}
		case 'Романтика':
			return {
				bg: 'bg-pink-50',
				border: 'border-pink-200',
				icon: 'text-pink-600',
				accent: 'bg-pink-100'
			}
		default:
			return {
				bg: 'bg-gray-50',
				border: 'border-gray-200',
				icon: 'text-gray-600',
				accent: 'bg-gray-100'
			}
	}
}

export default function Categories() {
	const [categories, setCategories] = useState<CategoryWithStats[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const loadCategories = async () => {
			try {
				console.log('Loading categories...')
				const [categoriesResponse, booksResponse] = await Promise.all([
					fetch('/api/categories').then(res => res.json()) as Promise<ApiResponse<Category[]>>,
					fetch('/api/books?limit=200').then(res => res.json()) as Promise<ApiResponse<Book[]>> // Получаем больше книг для статистики
				])

				console.log('Categories response:', categoriesResponse)
				console.log('Books response:', booksResponse)

				if (categoriesResponse.success && booksResponse.success) {
					const books = booksResponse.data
						
					// Создаем статистику для основных категорий
					const categoryStats: CategoryWithStats[] = []
					
					categoriesResponse.data.forEach((mainCategory: Category) => {
						// Проверяем, есть ли подкатегории
						if (mainCategory.subcategories && mainCategory.subcategories.length > 0) {
							// Если есть подкатегории, используем их
							mainCategory.subcategories.forEach((subcategory: Category) => {
								const booksInCategory = books.filter((book: Book) => 
									book.subcategory === subcategory.name
								)
								const availableBooks = booksInCategory.filter((book: Book) => book.available)
								
								categoryStats.push({
									id: subcategory.id,
									name: subcategory.name,
									description: getCategoryDescription(subcategory.name),
									Icon: getCategoryIcon(subcategory.name),
									total: booksInCategory.length,
									available: availableBooks.length
								})
							})
						} else {
							// Если подкатегорий нет, используем основные категории
							// Проверяем, есть ли книги в этой категории
							const booksInCategory = books.filter((book: Book) => {
								if (!book.category) return false
								return book.category === mainCategory.name
							})
							const availableBooks = booksInCategory.filter((book: Book) => book.available)
							
							// Показываем все категории, даже если в них нет книг
							categoryStats.push({
								id: mainCategory.id,
								name: mainCategory.name,
								description: getCategoryDescription(mainCategory.name),
								Icon: getCategoryIcon(mainCategory.name),
								total: booksInCategory.length,
								available: availableBooks.length
							})
						}
					})
					
					// Сортируем по количеству книг (больше книг = выше)
					categoryStats.sort((a, b) => b.total - a.total)
					console.log('Final category stats:', categoryStats)
					setCategories(categoryStats)
				} else {
					console.error('Failed to load categories from API', { categoriesResponse, booksResponse })
					setCategories([])
				}
			} catch (error) {
				console.error('Error loading categories:', error)
				setCategories([])
			} finally {
				setLoading(false)
			}
		}

		loadCategories()
	}, [])

	const navigateToBooks = (category?: string) => {
		if (category) {
			window.location.href = `/books?category=${encodeURIComponent(category)}`
		} else {
			window.location.href = '/books'
		}
	}


	if (loading) {
		return (
			<section id="catalog" className="py-16 lg:py-24">
				<div className="flex items-end justify-between mb-5">
					<div>
						<h2 className="h2">Категорії</h2>
						<p className="text-gray-600">Вибирай настрій читання — і вперед!</p>
					</div>
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{[...Array(6)].map((_, i) => (
						<div key={i} className="rounded-3xl border border-gray-200 bg-white p-6 animate-pulse">
							<div className="flex items-start gap-4">
								<div className="size-12 rounded-2xl bg-gray-200"></div>
								<div className="grid gap-2 flex-1">
									<div className="h-5 bg-gray-200 rounded w-3/4"></div>
									<div className="h-4 bg-gray-200 rounded w-full"></div>
								</div>
							</div>
						</div>
					))}
				</div>
			</section>
		)
	}

	return (
		<section id="catalog" className="py-16 lg:py-24">
			<div className="flex items-end justify-between mb-5">
				<div>
					<h2 className="h2">Категорії</h2>
					<p className="text-gray-600">Вибирай настрій читання — і вперед!</p>
				</div>
				<button 
					onClick={() => navigateToBooks()}
					className="inline-flex items-center justify-center rounded-2xl font-semibold h-10 px-4 bg-transparent text-gray-900 hover:bg-gray-50 transition-colors"
				>
					Дивитись всі книги
				</button>
			</div>

			{/* великі плитки */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{categories.slice(0, 6).map((category) => {
					const Icon = category.Icon
					const colors = getCategoryColors(category.name)
					
					return (
						<button
							key={category.id}
							onClick={() => navigateToBooks(category.name)}
							className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 hover:shadow-soft transition text-left hover:scale-[1.02]"
						>
							<div className="flex items-start gap-4">
								<div className={`size-12 rounded-2xl border-2 grid place-items-center ${colors.bg} ${colors.border}`}>
									<Icon className={`size-6 ${colors.icon}`} />
								</div>
								<div className="grid gap-1">
									<h3 className="text-body-lg font-semibold">{category.name}</h3>
									<p className="text-body-sm text-gray-600">{category.description}</p>
								</div>
							</div>

							<div className={`mt-6 inline-flex items-center gap-2 rounded-2xl ${colors.accent} px-4 py-2 text-body-sm border ${colors.border}`}>
								Дивитись у каталозі
								<svg className="size-4 -mr-0.5 transition -rotate-45 group-hover:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
							</div>

							{/* кількість книг */}
							<div className={`absolute top-4 right-4 text-caption rounded-2xl ${colors.accent} px-2 py-1 ${colors.icon}`}>
								{category.available} книг
							</div>
						</button>
					)
				})}
			</div>
		</section>
	)
}

