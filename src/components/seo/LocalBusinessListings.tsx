'use client'

import { useState } from 'react'

interface LocalBusinessData {
  name: string
  address: string
  phone: string
  email: string
  website: string
  description: string
  categories: string[]
  socialMedia: {
    facebook?: string
    instagram?: string
    telegram?: string
  }
}

const BUSINESS_DATA: LocalBusinessData = {
  name: "Stefa.books - Дитяча бібліотека з підпискою",
  address: "Миколаїв, Україна (доставка по всьому місту)",
  phone: "+380-63-123-45-67",
  email: "info@stefa-books.com.ua",
  website: "https://stefa-books.com.ua",
  description: "Перша в Миколаєві служба оренди дитячих книг з підпискою та доставкою додому. Великий вибір українських дитячих книг для всіх вікових категорій.",
  categories: [
    "Дитячі книги",
    "Оренда книг",
    "Бібліотека",
    "Підписка на книги",
    "Доставка книг"
  ],
  socialMedia: {
    facebook: "https://facebook.com/stefabooks",
    instagram: "https://instagram.com/stefa.books",
    telegram: "https://t.me/stefabooks"
  }
}

const LOCAL_DIRECTORIES = [
  {
    name: "Google My Business",
    url: "https://business.google.com/",
    priority: "high",
    instructions: "Найважливіший листинг для локального SEO. Обов'язково додайте фото, години роботи та отримайте відгуки."
  },
  {
    name: "Facebook Business",
    url: "https://business.facebook.com/",
    priority: "high",
    instructions: "Створіть бізнес-сторінку з детальною інформацією про сервіс оренди книг."
  },
  {
    name: "Foursquare",
    url: "https://foursquare.com/business/",
    priority: "medium",
    instructions: "Додайте локацію та категорію 'Книгарня' або 'Освітні послуги'."
  },
  {
    name: "Bing Places",
    url: "https://www.bingplaces.com/",
    priority: "medium",
    instructions: "Листинг для пошукової системи Bing."
  },
  {
    name: "Яндекс.Справочник",
    url: "https://directory.yandex.ru/",
    priority: "medium",
    instructions: "Важливо для аудиторії, що користується Яндексом."
  },
  {
    name: "OLX Послуги",
    url: "https://www.olx.ua/uk/uslugi/",
    priority: "low",
    instructions: "Розмістіть оголошення про послуги оренди дитячих книг."
  },
  {
    name: "Prom.ua",
    url: "https://prom.ua/",
    priority: "low",
    instructions: "Створіть магазин або каталог з вашими послугами."
  },
  {
    name: "Yellow Pages України",
    url: "https://yellowpages.ua/",
    priority: "medium",
    instructions: "Український каталог підприємств."
  }
]

interface LocalBusinessListingsProps {
  className?: string
}

export function LocalBusinessListings({ className }: LocalBusinessListingsProps) {
  const [copiedText, setCopiedText] = useState<string>('')

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(''), 2000)
  }

  const generateBusinessDescription = (directory: string) => {
    const baseDescription = BUSINESS_DATA.description

    switch (directory) {
      case 'Google My Business':
        return `${baseDescription} Замовляйте онлайн на нашому сайті або телефоном. Безкоштовна доставка по Миколаєву.`
      case 'Facebook Business':
        return `📚 ${baseDescription}

🎯 Що ми пропонуємо:
• Оренда українських дитячих книг
• Підписка від 299 грн/місяць
• Доставка додому в Миколаєві
• Книги для всіх вікових категорій

📞 Замовлення: ${BUSINESS_DATA.phone}
🌐 Сайт: ${BUSINESS_DATA.website}`
      default:
        return baseDescription
    }
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${className || ''}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🗺️ Локальні бізнес-листинги для SEO
        </h2>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <p className="text-blue-800">
            <strong>Мета:</strong> Покращити локальну видимість в пошуку "оренда дитячих книг Миколаїв"
            та з'явитися в Google Maps при пошуку книгарень.
          </p>
        </div>

        {/* Готові дані для копіювання */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">📋 Основна інформація</h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Назва бізнесу:</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 p-2 rounded text-sm">
                  {BUSINESS_DATA.name}
                </code>
                <button
                  onClick={() => copyToClipboard(BUSINESS_DATA.name, 'name')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {copiedText === 'name' ? '✓ Скопійовано' : '📋 Копіювати'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Адреса:</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 p-2 rounded text-sm">
                  {BUSINESS_DATA.address}
                </code>
                <button
                  onClick={() => copyToClipboard(BUSINESS_DATA.address, 'address')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {copiedText === 'address' ? '✓ Скопійовано' : '📋 Копіювати'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Телефон:</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 p-2 rounded text-sm">
                  {BUSINESS_DATA.phone}
                </code>
                <button
                  onClick={() => copyToClipboard(BUSINESS_DATA.phone, 'phone')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {copiedText === 'phone' ? '✓ Скопійовано' : '📋 Копіювати'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-600">Email:</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 bg-gray-100 p-2 rounded text-sm">
                  {BUSINESS_DATA.email}
                </code>
                <button
                  onClick={() => copyToClipboard(BUSINESS_DATA.email, 'email')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {copiedText === 'email' ? '✓ Скопійовано' : '📋 Копіювати'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">🏷️ Категорії</h3>
            <div className="space-y-1">
              {BUSINESS_DATA.categories.map((category, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {category}
                  </span>
                </div>
              ))}
            </div>

            <h3 className="text-lg font-semibold text-gray-800">🌐 Соціальні мережі</h3>
            <div className="space-y-1">
              {Object.entries(BUSINESS_DATA.socialMedia).map(([platform, url]) => (
                <div key={platform} className="flex items-center space-x-2">
                  <span className="font-medium text-sm capitalize">{platform}:</span>
                  <code className="bg-gray-100 p-1 rounded text-xs">{url}</code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Список директорій */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">🗂️ Каталоги для реєстрації</h3>

          <div className="grid gap-4">
            {LOCAL_DIRECTORIES.map((directory, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-lg">{directory.name}</h4>
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${directory.priority === 'high' ? 'bg-red-100 text-red-800' : ''}
                      ${directory.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${directory.priority === 'low' ? 'bg-green-100 text-green-800' : ''}
                    `}>
                      {directory.priority === 'high' ? 'Високий пріоритет' : ''}
                      {directory.priority === 'medium' ? 'Середній пріоритет' : ''}
                      {directory.priority === 'low' ? 'Низький пріоритет' : ''}
                    </span>
                  </div>
                  <a
                    href={directory.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
                  >
                    Перейти →
                  </a>
                </div>

                <p className="text-gray-600 text-sm mb-3">{directory.instructions}</p>

                <div className="bg-gray-50 p-3 rounded">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Опис для {directory.name}:
                  </label>
                  <div className="flex items-start space-x-2">
                    <textarea
                      readOnly
                      value={generateBusinessDescription(directory.name)}
                      className="flex-1 bg-white border rounded p-2 text-sm h-20 resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard(generateBusinessDescription(directory.name), `desc-${index}`)}
                      className="text-blue-600 hover:text-blue-800 text-sm whitespace-nowrap"
                    >
                      {copiedText === `desc-${index}` ? '✓ Скопійовано' : '📋 Копіювати'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Поради */}
        <div className="mt-8 bg-green-50 border-l-4 border-green-400 p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">💡 Поради для успішної реєстрації:</h3>
          <ul className="text-green-700 space-y-1 text-sm">
            <li>• Використовуйте однакову назву та адресу в усіх листингах</li>
            <li>• Додавайте якісні фото книг та процесу доставки</li>
            <li>• Вказуйте години роботи (наприклад, "Приймаємо замовлення 9:00-20:00")</li>
            <li>• Просіть задоволених клієнтів залишати відгуки</li>
            <li>• Регулярно оновлюйте інформацію про нові книги</li>
          </ul>
        </div>
      </div>
    </div>
  )
}