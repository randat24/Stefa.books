'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
	CheckCircle, 
	Info, 
	CreditCard, 
	Building2, 
	Copy, 
	Check, 
	Upload, 
	Star, 
	X,
	AlertCircle,
	Loader2,
	Phone,
	Mail,
	User,
	MessageSquare,
	Shield
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

import { Checkbox } from '@/components/ui/Checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import { logger } from '@/lib/logger'
import type { Book } from '@/lib/types/rental'

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const subscribeFormSchema = z.object({
	name: z.string()
		.min(2, 'Ім&apos;я повинно містити мінімум 2 символи')
		.max(50, 'Ім&apos;я занадто довге'),
	phone: z.string()
		.regex(/^\+380\d{9}$/, 'Неправильний формат телефону (+380XXXXXXXXX)'),
	email: z.string()
		.email('Неправильний формат email'),
	social: z.string()
		.min(3, 'Введіть ваш нік в Telegram або Instagram')
		.max(50, 'Нік занадто довгий')
		.regex(/^@?[a-zA-Z0-9_]+$/, 'Неправильний формат ніка (використовуйте @username або username)'),
	plan: z.enum(['mini', 'maxi'], {
		required_error: 'Оберіть план підписки'
	}),
	payment: z.enum(['Онлайн оплата', 'Переказ на карту'], {
		required_error: 'Оберіть спосіб оплати'
	}),
	note: z.string()
		.max(500, 'Повідомлення занадто довге')
		.optional(),
	screenshot: z.instanceof(File)
		.optional(),
	privacyConsent: z.boolean()
		.refine((val) => val === true, 'Необхідно підтвердити згоду на обробку даних')
})

type SubscribeFormData = z.infer<typeof subscribeFormSchema>

// ============================================================================
// PLAN CONFIGURATION
// ============================================================================

const PLAN_CONFIG = {
	mini: {
		label: 'Mini',
		price: '300 ₴/міс',
		color: 'border-green-500 bg-green-50',
		textColor: 'text-green-900',
		description: 'До 2 книг одночасно',
		features: ['2 книги одночасно', 'Безкоштовна доставка', 'Обмін книг']
	},
	maxi: {
		label: 'Maxi',
		price: '500 ₴/міс',
		color: 'border-accent bg-yellow-50',
		textColor: 'text-yellow-900',
		description: 'До 4 книг одночасно',
		features: ['4 книги одночасно', 'Пріоритетна доставка', 'Ексклюзивні книги', 'Персональний менеджер']
	}
} as const

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface SubscribeModalProps {
	isOpen: boolean
	onClose: () => void
	book?: Book | null
	defaultPlan?: 'mini' | 'maxi'
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SubscribeModal({ isOpen, onClose, book, defaultPlan }: SubscribeModalProps) {
	const [sent, setSent] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [copiedCard, setCopiedCard] = useState(false)
	const [uploadProgress, setUploadProgress] = useState(0)
	const fileRef = useRef<HTMLInputElement | null>(null)

	const {
		register,
		handleSubmit,
		formState: { errors, isValid },
		watch,
		setValue,
		reset,
		trigger
	} = useForm<SubscribeFormData>({
		resolver: zodResolver(subscribeFormSchema as any),
		mode: 'onChange',
		defaultValues: {
			plan: defaultPlan || 'mini',
			payment: 'Онлайн оплата',
			phone: '+380',
			privacyConsent: false,
		}
	})

	const watchedPlan = watch('plan')
	const watchedPayment = watch('payment')
	const watchedPrivacyConsent = watch('privacyConsent')

	// Modal control
	const modalRef = useRef<HTMLDivElement>(null)

	const handleClose = useCallback(() => {
		reset()
		setSent(false)
		setIsSubmitting(false)
		setCopiedCard(false)
		setUploadProgress(0)
		onClose()
	}, [reset, onClose])

	// Close modal on outside click
	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent) => {
			if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
				handleClose()
			}
		}

		if (isOpen) {
			document.addEventListener('mousedown', handleOutsideClick)
			document.body.style.overflow = 'hidden'
		}

		return () => {
			document.removeEventListener('mousedown', handleOutsideClick)
			document.body.style.overflow = ''
		}
	}, [isOpen, handleClose])

	// Close modal on Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				handleClose()
			}
		}

		if (isOpen) {
			document.addEventListener('keydown', handleEscape)
		}

		return () => {
			document.removeEventListener('keydown', handleEscape)
		}
	}, [isOpen, handleClose])

	const copyCardNumber = async () => {
		try {
			await navigator.clipboard.writeText('4149 4993 5699 6777')
			setCopiedCard(true)
			setTimeout(() => setCopiedCard(false), 2000)
		} catch (err) {
			logger.error('Failed to copy card number', err)
		}
	}

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				alert('Файл занадто великий. Максимальний розмір: 5MB')
				return
			}
			
			// Validate file type
			if (!file.type.startsWith('image/')) {
				alert('Будь ласка, виберіть зображення')
				return
			}
			
			setValue('screenshot', file)
			trigger('screenshot')
		}
	}

	const handleSubmitForm = async (data: SubscribeFormData) => {
		setIsSubmitting(true)
		setUploadProgress(0)
		
		try {
			let screenshotUrl = ''
			
			// Upload screenshot if provided
			if (data.screenshot && data.screenshot instanceof File) {
				setUploadProgress(25)
				
				const formData = new FormData()
				formData.append('file', data.screenshot)
				formData.append('upload_preset', 'subscription_screenshots')
				
				try {
					const cloudinaryResponse = await fetch(
						`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'stefa-books'}/image/upload`,
						{
							method: 'POST',
							body: formData,
						}
					)
					
					setUploadProgress(50)
					
					if (cloudinaryResponse.ok) {
						const cloudinaryResult = await cloudinaryResponse.json()
						screenshotUrl = cloudinaryResult.secure_url
						setUploadProgress(75)
					}
				} catch (uploadError) {
					logger.warn('Screenshot upload failed', uploadError)
				}
			}
			
			setUploadProgress(90)
			
			// Submit to API
			const response = await fetch('/api/subscribe', { 
				method: 'POST', 
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: data.name,
					email: data.email,
					phone: data.phone,
					social: data.social,
					plan: data.plan,
					paymentMethod: data.payment,
					message: data.note || (book ? `Зацікавився книгою: ${book.title} - ${book.author}` : ''),
					screenshot: screenshotUrl,
					privacyConsent: data.privacyConsent
				})
			})

			const result = await response.json()
			setUploadProgress(100)

			if (response.ok) {
				logger.info('Subscription form submitted successfully', { 
					submissionId: result.submissionId, 
					plan: data.plan,
					bookTitle: book?.title 
				})
				setSent(true)
				if (fileRef.current) fileRef.current.value = ""
			} else {
				throw new Error(result.error || 'Server error')
			}
			
		} catch (error) {
			logger.error('Subscription form error', error)
			alert(`Помилка відправки форми: ${error instanceof Error ? error.message : 'Невідома помилка'}`)
		} finally {
			setIsSubmitting(false)
			setUploadProgress(0)
		}
	}

	if (!isOpen) return null

	if (sent) {
		return (
			<div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
				<div ref={modalRef} className="relative w-full max-w-md bg-neutral-0 rounded-2xl shadow-2xl p-6">
					<button
						onClick={handleClose}
						className="absolute top-4 right-4 p-2 rounded-lg hover:bg-neutral-100 transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
					
					<div className="text-center space-y-4">
						<div className="mx-auto w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
							<CheckCircle className="h-8 w-8 text-green-600" />
						</div>
						<div>
							<h3 className="text-body-lg font-semibold text-neutral-900 mb-2">
								Заявку надіслано!
							</h3>
							<p className="text-neutral-600">
								Дякуємо за ваш інтерес! Ми зв&apos;яжемося з вами найближчим часом для оформлення підписки.
							</p>
						</div>
						<div className="flex gap-3">
							<Button
								variant="outline"
								onClick={handleClose}
								className="flex-1"
							>
								Закрити
							</Button>
							<Button
								onClick={handleClose}
								className="flex-1"
							>
								Переглянути каталог
							</Button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
			<div ref={modalRef} className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-neutral-0 rounded-2xl shadow-2xl">
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-neutral-200">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-yellow-100 rounded-2xl flex items-center justify-center">
							<Star className="h-5 w-5 text-accent-dark" />
						</div>
						<div>
							<h2 className="text-h3 text-neutral-900">
								Оформити підписку
							</h2>
							{book && (
								<p className="text-body-sm text-neutral-600">
									{book.title} — {book.author}
								</p>
							)}
						</div>
					</div>
					<button
						onClick={handleClose}
						className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Content */}
				<div className="overflow-y-auto max-h-[calc(90vh-120px)]">
					<form onSubmit={handleSubmit(handleSubmitForm)} className="p-6 space-y-6">
						{/* Plan Selection */}
						<div>
							<Label className="block text-body-sm font-semibold text-neutral-700 mb-3">
								План підписки *
							</Label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{Object.entries(PLAN_CONFIG).map(([key, config]) => (
									<Card
										key={key}
										className={cn(
											"cursor-pointer transition-all hover:shadow-md",
											watchedPlan === key
												? config.color
												: 'border-neutral-200 hover:border-neutral-300'
										)}
										onClick={() => setValue('plan', key as 'mini' | 'maxi')}
									>
										<CardContent className="p-4">
											<div className="flex items-center gap-3 mb-3">
												<div className={cn(
													"w-4 h-4 rounded-2xl border-2 flex items-center justify-center",
													watchedPlan === key 
														? 'border-current bg-current' 
														: 'border-neutral-300'
												)}>
													{watchedPlan === key && <div className="w-1.5 h-1.5 bg-neutral-0 rounded-2xl" />}
												</div>
												<div>
													<p className={cn(
														"font-semibold text-sm",
														watchedPlan === key ? config.textColor : 'text-neutral-700'
													)}>
														{config.label}
													</p>
													<p className={cn(
														"text-xs",
														watchedPlan === key ? config.textColor : 'text-neutral-500'
													)}>
														{config.price}
													</p>
												</div>
											</div>
											<p className="text-caption text-neutral-600 mb-2">{config.description}</p>
											<ul className="space-y-1">
												{config.features.map((feature, index) => (
													<li key={index} className="text-caption text-neutral-600 flex items-center gap-1">
														<CheckCircle className="h-3 w-3 text-green-500" />
														{feature}
													</li>
												))}
											</ul>
										</CardContent>
									</Card>
								))}
							</div>
							{errors.plan && (
								<p className="mt-2 text-body-sm text-red-600 flex items-center gap-1">
									<AlertCircle className="h-4 w-4" />
									{errors.plan.message}
								</p>
							)}
							<input type="hidden" {...register('plan')} />
						</div>

						{/* Personal Information */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="name" className="block text-body-sm font-semibold text-neutral-700 mb-2">
									Ім&apos;я та прізвище *
								</Label>
								<div className="relative">
									<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
									<Input
										{...register("name")}
										id="name"
										type="text"
										className="pl-10"
										placeholder="Ваше ім&apos;я"
									/>
								</div>
								{errors.name && (
									<p className="mt-1 text-body-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.name.message}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="phone" className="block text-body-sm font-semibold text-neutral-700 mb-2">
									Телефон *
								</Label>
								<div className="relative">
									<Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
									<Input
										{...register("phone")}
										id="phone"
										type="tel"
										className="pl-10"
										placeholder="+380"
									/>
								</div>
								{errors.phone && (
									<p className="mt-1 text-body-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.phone.message}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="email" className="block text-body-sm font-semibold text-neutral-700 mb-2">
									Email *
								</Label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
									<Input
										{...register("email")}
										id="email"
										type="email"
										className="pl-10"
										placeholder="you@email.com"
									/>
								</div>
								{errors.email && (
									<p className="mt-1 text-body-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.email.message}
									</p>
								)}
							</div>

							<div>
								<Label htmlFor="social" className="block text-body-sm font-semibold text-neutral-700 mb-2">
									Нік в Telegram/Instagram *
								</Label>
								<div className="relative">
									<MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
									<Input
										{...register("social")}
										id="social"
										type="text"
										className="pl-10"
										placeholder="@username"
									/>
								</div>
								{errors.social && (
									<p className="mt-1 text-body-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.social.message}
									</p>
								)}
							</div>
						</div>

						{/* Payment Method */}
						<div>
							<Label className="block text-body-sm font-semibold text-neutral-700 mb-3">
								Спосіб оплати *
							</Label>
							<div className="space-y-3">
								{[
									{ value: "Онлайн оплата", label: "Онлайн оплата", icon: CreditCard },
									{ value: "Переказ на карту", label: "Переказ на карту ПриватБанку", icon: Building2 }
								].map((option) => (
									<div key={option.value} className="flex items-center space-x-3">
										<input
											type="radio"
											id={option.value}
											name="payment"
											value={option.value}
											checked={watchedPayment === option.value}
											onChange={(e) => setValue('payment', e.target.value as 'Онлайн оплата' | 'Переказ на карту')}
											className="h-4 w-4 text-brand-accent-light focus:ring-brand-accent border-neutral-300"
										/>
										<Label htmlFor={option.value} className="flex items-center gap-2 cursor-pointer">
											<option.icon className="h-4 w-4 text-neutral-500" />
											<span className="text-body-sm text-neutral-700">{option.label}</span>
										</Label>
									</div>
								))}
							</div>
							{errors.payment && (
								<p className="mt-2 text-body-sm text-red-600 flex items-center gap-1">
									<AlertCircle className="h-4 w-4" />
									{errors.payment.message}
								</p>
							)}
						</div>

						{/* Card info if bank transfer selected */}
						{watchedPayment === "Переказ на карту" && (
							<Card className="bg-blue-50 border-blue-200">
								<CardContent className="p-4">
									<div className="flex items-start gap-3">
										<Info className="h-5 w-5 text-brand-accent-light mt-0.5 flex-shrink-0" />
										<div className="flex-1">
											<h4 className="font-medium text-blue-900 mb-2">Реквізити для переказу</h4>
											<div className="space-y-1 text-body-sm text-blue-800">
												<p><strong>Банк:</strong> ПриватБанк</p>
												<div className="flex items-center gap-2">
													<span><strong>Номер карти:</strong> 4149 4993 5699 6777</span>
													<Button
														type="button"
														variant="ghost"
														size="md"
														onClick={copyCardNumber}
														className="h-6 px-2 text-brand-accent-light hover:text-blue-800"
													>
														{copiedCard ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
													</Button>
												</div>
												<p><strong>Отримувач:</strong> Федорова Анастасія</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Screenshot upload for bank transfer */}
						{watchedPayment === "Переказ на карту" && (
							<div>
								<Label htmlFor="screenshot" className="block text-body-sm font-semibold text-neutral-700 mb-2">
									Скріншот переказу
								</Label>
								<div className="relative">
									<Input
										ref={fileRef}
										id="screenshot"
										type="file"
										accept="image/*"
										onChange={handleFileChange}
										className="pr-10"
									/>
									<Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
								</div>
								<p className="mt-1 text-caption text-neutral-500">
									Додайте скріншот підтвердження переказу (максимум 5MB)
								</p>
								{errors.screenshot && (
									<p className="mt-1 text-body-sm text-red-600 flex items-center gap-1">
										<AlertCircle className="h-4 w-4" />
										{errors.screenshot.message}
									</p>
								)}
							</div>
						)}

						{/* Note */}
						<div>
							<Label htmlFor="note" className="block text-body-sm font-semibold text-neutral-700 mb-2">
								Додаткова інформація
							</Label>
							<div className="relative">
								<MessageSquare className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
								<Textarea
									{...register("note")}
									id="note"
									rows={3}
									className="pl-10"
									placeholder="Додаткові побажання або запитання"
								/>
							</div>
							{errors.note && (
								<p className="mt-1 text-body-sm text-red-600 flex items-center gap-1">
									<AlertCircle className="h-4 w-4" />
									{errors.note.message}
								</p>
							)}
						</div>

						{/* Privacy Consent */}
						<div className="flex items-start gap-3">
							<Checkbox
								id="privacyConsent"
								checked={watchedPrivacyConsent}
								onCheckedChange={(checked: boolean) => setValue('privacyConsent', checked)}
							/>
							<Label htmlFor="privacyConsent" className="text-body-sm text-neutral-600 leading-relaxed">
								Я погоджуюся з обробкою моїх персональних даних відповідно до{' '}
								<Link href="/privacy" className="text-brand-accent-light hover:underline">
									політики конфіденційності
								</Link>
								{errors.privacyConsent && (
									<span className="text-caption text-red-600 mt-1 flex items-center gap-1">
										<AlertCircle className="h-3 w-3" />
										{errors.privacyConsent.message}
									</span>
								)}
							</Label>
						</div>

						{/* Progress Bar */}
						{isSubmitting && uploadProgress > 0 && (
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span>Відправка форми...</span>
									<span>{uploadProgress}%</span>
								</div>
								<div className="w-full bg-neutral-200 rounded-2xl h-2">
									<div 
										className="bg-brand-accent-light h-2 rounded-2xl transition-all duration-300"
										style={{ width: `${uploadProgress}%` }}
									/>
								</div>
							</div>
						)}

						{/* Submit Button */}
						<div className="flex gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={handleClose}
								className="flex-1"
								disabled={isSubmitting}
							>
								Скасувати
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting || !isValid}
								className="flex-1 bg-accent hover:bg-accent-dark text-neutral-900"
							>
								{isSubmitting ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										Відправляємо...
									</>
								) : (
									<>
										<Shield className="h-4 w-4 mr-2" />
										Оформити підписку
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}
