'use client';

import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react'

export default function Contacts() {
  // авто-префікс + маска для UA
  const onPhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.currentTarget.value.replace(/\s+/g, "");
    if (!v.startsWith("+380")) v = "+380";
    // Разрешаем только + и цифры, ограничим до +380 + 9 цифр
    v = "+" + v.replace(/[^\d]/g, "");
    if (!v.startsWith("+380")) v = "+380";
    v = v.slice(0, 13);
    e.currentTarget.value = v;
  };
  return (
		<section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 lg:py-24">
      <div className="container max-w-6xl mx-auto px-4">
				<div className="text-center mb-16">
					<h2 className="text-h1 text-gray-900 mb-4">
						Зв&apos;яжіться з нами
					</h2>
					<p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
						Маєте питання? Наша команда готова допомогти вам з усім, що стосується книжкової підписки
					</p>
				</div>

				<div className="grid lg:grid-cols-2 gap-12 items-start">
					{/* Контактна інформація */}
					<div className="space-y-8">
						<div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
							<h3 className="text-h2 text-gray-900 mb-6">
								Контактна інформація
							</h3>
							
							<div className="space-y-6">
								<div className="flex items-start space-x-4">
									<div className="bg-blue-100 p-3 rounded-2xl">
										<Phone className="w-6 h-6 text-brand-accent-light" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">Телефон</h4>
										<p className="text-gray-600">+38 (063) 856-54-14</p>
										<p className="text-body-sm text-gray-500">Пн-Пт: 9:00-18:00</p>
									</div>
								</div>

								<div className="flex items-start space-x-4">
									<div className="bg-green-100 p-3 rounded-2xl">
										<Mail className="w-6 h-6 text-green-600" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">Email</h4>
										<p className="text-gray-600">info@stefa.books</p>
										<p className="text-body-sm text-gray-500">Відповідаємо протягом 24 годин</p>
									</div>
								</div>

								<div className="flex items-start space-x-4">
									<div className="bg-purple-100 p-3 rounded-2xl">
										<MapPin className="w-6 h-6 text-purple-600" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">Адреса</h4>
										<a 
											href="https://maps.google.com/?q=вул. Маріупольська 13/2, Миколаїв"
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-600 hover:text-gray-900 transition"
										>
											вул. Маріупольська 13/2, Миколаїв
										</a>
										<p className="text-body-sm text-gray-500">Самовивіз книг</p>
									</div>
								</div>

								<div className="flex items-start space-x-4">
									<div className="bg-orange-100 p-3 rounded-2xl">
										<Clock className="w-6 h-6 text-orange-600" />
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">Графік роботи</h4>
										<p className="text-gray-600">Понеділок - П&apos;ятниця: 9:00 - 18:00</p>
										<p className="text-gray-600">Субота: 10:00 - 16:00</p>
										<p className="text-body-sm text-gray-500">Неділя: Вихідний</p>
									</div>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
							<h3 className="text-h2 text-gray-900 mb-6">
								Швидка підтримка
							</h3>
							<p className="text-gray-600 mb-4">
								Потрібна допомога з вибором тарифу або маєте технічні питання?
							</p>
							<div className="flex items-center space-x-3">
								<MessageCircle className="w-5 h-5 text-brand-accent-light" />
								<span className="text-brand-accent-light font-medium">Онлайн чат доступний 24/7</span>
							</div>
						</div>
					</div>

					{/* Форма зворотного зв'язку */}
					<div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
						<h3 className="text-h2 text-gray-900 mb-6">
							Напишіть нам
						</h3>
						
						<form className="space-y-6">
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label htmlFor="firstName" className="block text-body-sm font-medium text-gray-700 mb-2">
										Ім&apos;я *
									</label>
									<input
										type="text"
										id="firstName"
										name="firstName"
										required
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors"
										placeholder="Ваше ім&apos;я"
									/>
								</div>
								<div>
									<label htmlFor="lastName" className="block text-body-sm font-medium text-gray-700 mb-2">
										Прізвище
									</label>
									<input
										type="text"
										id="lastName"
										name="lastName"
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors"
										placeholder="Ваше прізвище"
									/>
								</div>
            </div>

							<div>
								<label htmlFor="email" className="block text-body-sm font-medium text-gray-700 mb-2">
									Email *
								</label>
								<input
									type="email"
									id="email"
									name="email"
									required
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors"
									placeholder="your@email.com"
								/>
          </div>

							<div>
								<label htmlFor="phone" className="block text-body-sm font-medium text-gray-700 mb-2">
									Телефон
								</label>
								<input
									type="tel"
									id="phone"
									name="phone"
									inputMode="tel"
									onChange={onPhoneInput}
									defaultValue="+380"
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors"
									placeholder="+380 XX XXX XX XX"
								/>
            </div>

							<div>
								<label htmlFor="subject" className="block text-body-sm font-medium text-gray-700 mb-2">
									Тема *
								</label>
								<select
									id="subject"
									name="subject"
									required
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors"
								>
									<option value="">Оберіть тему</option>
									<option value="general">Загальне питання</option>
									<option value="subscription">Підписка та тарифи</option>
									<option value="delivery">Доставка та самовивіз</option>
									<option value="technical">Технічна підтримка</option>
									<option value="partnership">Співпраця</option>
								</select>
          </div>

							<div>
								<label htmlFor="message" className="block text-body-sm font-medium text-gray-700 mb-2">
									Повідомлення *
								</label>
								<textarea
									id="message"
									name="message"
									rows={5}
									required
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-colors resize-none"
									placeholder="Опишіть ваше питання або пропозицію..."
								></textarea>
            </div>

							<button
								type="submit"
								className="w-full bg-brand-accent-light text-white py-3 px-6 rounded-2xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
							>
								Надіслати повідомлення
							</button>
						</form>
          </div>
        </div>
      </div>
    </section>
	)
}
