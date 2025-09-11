'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
	CheckCircle, 
	Heart, 
	BookOpen, 
	Phone, 
	Mail, 
	MessageSquare,
	Clock,
	MapPin,
	CreditCard,
	ArrowLeft,
	FileText,
	Calendar,
	Shield,
	Star,
	Users,
	CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@/lib/logger'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function RentalSuccessContent() {
	const searchParams = useSearchParams()
	const router = useRouter()
	
	const [rentalId, setRentalId] = useState<string | null>(null)
	const [bookTitle, setBookTitle] = useState<string>('')
	const [bookAuthor, setBookAuthor] = useState<string>('')
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
  const id = searchParams?.get('rentalId')
  const title = searchParams?.get('bookTitle')
  const author = searchParams?.get('bookAuthor')
		
		setRentalId(id || null)
		setBookTitle(title || '')
		setBookAuthor(author || '')

		// Если нет rental ID, перенаправляем на главную через 5 секунд
		if (!id) {
			logger.warn('Rental success page accessed without rental ID')
			const timer = setTimeout(() => {
				router.push('/')
			}, 5000)
			return () => clearTimeout(timer)
		}

		setIsLoading(false)
		
		logger.info('Rental success page loaded', {
			rentalId: id,
			bookTitle: title
		})
	}, [searchParams, router])

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
				<div className="text-center">
					<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 animate-pulse" />
					<p className="text-neutral-600">Загрузка...</p>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Navigation */}
					<div className="mb-8">
						<Button
							variant="ghost"
							size="md"
							onClick={() => router.push('/')}
							className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
						>
							<ArrowLeft className="h-4 w-4" />
							На главную
						</Button>
					</div>

					{/* Success Header */}
					<div className="text-center mb-12">
						<div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-2xl mb-6 animate-pulse">
							<CheckCircle className="h-16 w-16 text-green-600" />
						</div>
						
						<h1 className="text-display font-bold text-neutral-900 mb-4">
							Заявка надіслана успішно!
						</h1>
						
						<div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-8 max-w-2xl mx-auto">
							<div className="flex items-center justify-center gap-3 text-green-700 mb-4">
								<Heart className="h-6 w-6" />
								<span className="text-body-lg font-semibold">Дякуємо за довіру до Stefa.books</span>
							</div>
							
							{bookTitle && (
								<div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
									<h3 className="font-semibold text-blue-900 mb-2">Ваша заявка на книгу:</h3>
									<p className="text-body-lg text-blue-800">
										<strong>&quot;{bookTitle}&quot;</strong>
										{bookAuthor && <span className="block text-body-sm text-brand-accent-light mt-1">— {bookAuthor}</span>}
									</p>
								</div>
							)}
							
							{rentalId && (
								<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
									<div className="flex items-center justify-center gap-2 mb-3">
										<FileText className="h-5 w-5 text-brand-accent-light" />
										<span className="font-semibold text-blue-900">Номер заявки:</span>
									</div>
									<p className="text-2xl font-mono font-bold text-blue-700 mb-2">
										{rentalId}
									</p>
									<p className="text-body-sm text-brand-accent-light">
										Збережіть цей номер для зв&apos;язку з нашою службою підтримки
									</p>
								</div>
							)}
							
							<p className="text-neutral-600 leading-relaxed mt-6">
								Ваша заявка на оренду отримана та буде оброблена найближчим часом. 
								Наш менеджер зв&apos;яжеться з вами для підтвердження деталей та уточнення способу доставки.
							</p>
						</div>
					</div>

					{/* Next Steps */}
					<Card className="mb-8 shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-h4">
								<Clock className="h-6 w-6 text-brand-accent-light" />
								Що далі?
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid md:grid-cols-3 gap-6">
								<div className="flex items-start gap-4 p-6 bg-blue-50 rounded-xl border border-blue-200">
									<div className="flex-shrink-0 w-10 h-10 bg-brand-accent-light text-neutral-0 rounded-2xl flex items-center justify-center text-h4">
										1
									</div>
									<div>
										<h3 className="font-semibold text-blue-900 mb-2">Підтвердження заявки</h3>
										<p className="text-blue-800 text-body-sm leading-relaxed">
											Протягом 2-4 годин ми зв&apos;яжемося з вами для підтвердження деталей оренди та уточнення способу доставки.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
									<div className="flex-shrink-0 w-10 h-10 bg-accent-dark text-neutral-0 rounded-2xl flex items-center justify-center text-h4">
										2
									</div>
									<div>
										<h3 className="font-semibold text-yellow-900 mb-2">Оплата оренди</h3>
										<p className="text-yellow-800 text-body-sm leading-relaxed">
											Оберете зручний спосіб оплати: онлайн, переказ на карту або готівка при отриманні.
										</p>
									</div>
								</div>

								<div className="flex items-start gap-4 p-6 bg-green-50 rounded-xl border border-green-200">
									<div className="flex-shrink-0 w-10 h-10 bg-green-600 text-neutral-0 rounded-2xl flex items-center justify-center text-h4">
										3
									</div>
									<div>
										<h3 className="font-semibold text-green-900 mb-2">Отримання книги</h3>
										<p className="text-green-800 text-body-sm leading-relaxed">
											Заберіть книгу в точці видачі або отримайте доставку відповідно до обраного способу.
										</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Contact Information */}
					<Card className="mb-8 shadow-lg">
						<CardHeader>
							<CardTitle className="flex items-center gap-3 text-h4">
								<MessageSquare className="h-6 w-6 text-purple-600" />
								Є питання? Зв&apos;яжіться з нами
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid md:grid-cols-2 gap-6">
								<div className="space-y-4">
									<div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
										<div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
											<Phone className="h-6 w-6 text-brand-accent-light" />
										</div>
										<div>
											<p className="font-semibold text-neutral-900">Телефон</p>
											<p className="text-neutral-600">+38 (063) 856-54-14</p>
											<p className="text-caption text-neutral-500">Пн-Пт: 9:00-18:00</p>
										</div>
									</div>
									
									<div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
										<div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
											<Mail className="h-6 w-6 text-green-600" />
										</div>
										<div>
											<p className="font-semibold text-neutral-900">Email</p>
											<p className="text-neutral-600">info@stefa.books</p>
											<p className="text-caption text-neutral-500">Відповідаємо протягом 2 годин</p>
										</div>
									</div>
								</div>

								<div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
									<div className="flex items-start gap-3">
										<MapPin className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
										<div>
											<h4 className="font-semibold text-purple-900 mb-2">Точка видачі</h4>
											<p className="text-purple-800 text-body-sm mb-2">
												вул. Маріупольська 13/2<br />
												Кафе &quot;Книжкова&quot;, Миколаїв
											</p>
											<div className="flex items-center gap-2 text-caption text-purple-700">
												<Calendar className="h-3 w-3" />
												<span>Пн-Пт: 9:00-18:00, Сб: 10:00-16:00</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<Card className="mb-8 shadow-lg">
						<CardHeader>
							<CardTitle className="text-center">Продовжити користування</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid sm:grid-cols-3 gap-4">
								<Button asChild className="h-12">
									<Link href="/catalog" className="flex items-center justify-center gap-2">
										<BookOpen className="h-5 w-5" />
										Переглянути каталог
									</Link>
								</Button>
								
								<Button variant="outline" asChild className="h-12">
									<Link href="/my-rentals" className="flex items-center justify-center gap-2">
										<FileText className="h-5 w-5" />
										Мої оренди
									</Link>
								</Button>
								
								<Button variant="outline" asChild className="h-12">
									<Link href="/plans" className="flex items-center justify-center gap-2">
										<CreditCard className="h-5 w-5" />
										Тарифи підписки
									</Link>
								</Button>
							</div>
						</CardContent>
					</Card>

					{/* Additional Information */}
					<div className="grid md:grid-cols-2 gap-6 mb-8">
						{/* Tips */}
						<Card className="shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Star className="h-5 w-5 text-amber-500" />
									Корисні поради
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-3 text-body-sm text-neutral-600">
									<li className="flex items-start gap-2">
										<CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Переконайтеся, що ваш телефон увімкнений для швидкого зв&apos;язку</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Перевірте папку &quot;Спам&quot; у вашій поштовій скриньці</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Підготуйте документи для підтвердження особи при отриманні</span>
									</li>
									<li className="flex items-start gap-2">
										<CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
										<span>Ознайомтеся з умовами оренди та повернення книг</span>
									</li>
								</ul>
							</CardContent>
						</Card>

						{/* Trust Indicators */}
						<Card className="shadow-lg">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-lg">
									<Shield className="h-5 w-5 text-brand-accent" />
									Надійність та якість
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="flex items-center gap-3">
										<Users className="h-5 w-5 text-brand-accent" />
										<div>
											<p className="font-semibold text-neutral-900">10,000+</p>
											<p className="text-body-sm text-neutral-600">успішних оренд за рік</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<Star className="h-5 w-5 text-accent" />
										<div>
											<p className="font-semibold text-neutral-900">4.9/5</p>
											<p className="text-body-sm text-neutral-600">середня оцінка клієнтів</p>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<CheckCircle className="h-5 w-5 text-green-500" />
										<div>
											<p className="font-semibold text-neutral-900">100%</p>
											<p className="text-body-sm text-neutral-600">гарантія якості книг</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Email Confirmation */}
					<Card className="shadow-lg border-blue-200 bg-blue-50">
						<CardContent className="pt-6">
							<div className="flex items-center justify-center gap-3 text-blue-800">
								<Mail className="h-5 w-5" />
								<span className="font-medium">
									Ви також отримаєте підтвердження на електронну пошту
								</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

export default function RentalSuccessPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
				<div className="text-center">
					<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4 animate-pulse" />
					<p className="text-neutral-600">Завантаження...</p>
				</div>
			</div>
		}>
			<RentalSuccessContent />
		</Suspense>
	)
}
