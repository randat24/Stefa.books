'use client'

import { useState } from 'react'
import SubscribeModal from '@/components/SubscribeModal'
import { Button } from '@/components/ui/button'
import type { Book } from '@/lib/types/rental'

export default function TestSubscribePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    book?: Book | null
    defaultPlan?: 'mini' | 'maxi'
  }>({})

  const mockBook: Book = {
    id: 'test-book-1',
    code: 'TEST-001',
    title: 'Тестова книга для перевірки форми',
    author: 'Тестовий автор',
    category_id: 'test-category',
    cover_url: '/api/placeholder/300/450',
    price_uah: 299,
    available: true,
    description: 'Це тестова книга для перевірки форми підписки',
    short_description: 'Тестова книга',
    isbn: '978-000-000-000-0',
    publisher: 'Тестове видавництво',
    publication_year: 2024,
    pages: 120,
    language: 'Українська',
    age_category_id: 'test-age-category',
    age_range: '6-8',
    rating: 4.5,
    qty_available: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_active: true,
    status: 'active',
    badges: null,
    featured: false,
    weight: null,
    tags: null,
    review_count: 0,
    inventory_checked: null,
    featured_end_date: null,
    featured_priority: null,
    series_id: null,
    volume_number: null,
    difficulty_level: null,
    reading_time_minutes: null,
    topics: null,
    educational_value: null,
    awards: null,
    illustrations_count: null,
    print_quality: null,
    binding_type: null,
    special_features: null
  }

  const openModal = (config: typeof modalConfig = {}) => {
    setModalConfig(config)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Тестування форми підписки SubscribeModal
        </h1>

        <div className="space-y-6">
          {/* Тестовые кнопки */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Тестові сценарії</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Button
                onClick={() => openModal()}
                className="h-auto p-4 flex flex-col items-start"
                variant="outline"
              >
                <strong>Базова форма</strong>
                <span className="text-sm text-gray-600">
                  Відкрити форму без книги, план Mini
                </span>
              </Button>

              <Button
                onClick={() => openModal({ defaultPlan: 'maxi' })}
                className="h-auto p-4 flex flex-col items-start"
                variant="outline"
              >
                <strong>План Maxi</strong>
                <span className="text-sm text-gray-600">
                  Відкрити форму з планом Maxi за замовчуванням
                </span>
              </Button>

              <Button
                onClick={() => openModal({ book: mockBook })}
                className="h-auto p-4 flex flex-col items-start"
                variant="outline"
              >
                <strong>З книгою</strong>
                <span className="text-sm text-gray-600">
                  Відкрити форму з тестовою книгою
                </span>
              </Button>

              <Button
                onClick={() => openModal({ book: mockBook, defaultPlan: 'maxi' })}
                className="h-auto p-4 flex flex-col items-start"
                variant="outline"
              >
                <strong>Книга + Maxi</strong>
                <span className="text-sm text-gray-600">
                  Відкрити форму з книгою та планом Maxi
                </span>
              </Button>
            </div>
          </div>

          {/* Инструкции для тестирования */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Інструкції для тестування</h2>
            <div className="space-y-4">

              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-semibold">Валідація полів</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Ім'я: мінімум 2 символи</li>
                  <li>Телефон: формат +380XXXXXXXXX</li>
                  <li>Email: правильний формат email</li>
                  <li>Нік: опціональний, формат @username або username</li>
                  <li>Згода на обробку даних: обов'язкова</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-semibold">Способи оплати</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Онлайн оплата: без додаткових полів</li>
                  <li>Переказ на карту: показує реквізити та поле для скриншота</li>
                </ul>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-semibold">Завантаження файлів</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Тільки зображення (image/*)</li>
                  <li>Максимальний розмір: 5MB</li>
                  <li>Показується тільки для "Переказ на карту"</li>
                </ul>
              </div>

              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-semibold">Що перевірити</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Відкриття/закриття модального вікна</li>
                  <li>Валідацію всіх полів</li>
                  <li>Вибір планів підписки</li>
                  <li>Зміну способу оплати</li>
                  <li>Завантаження скриншота</li>
                  <li>Відправку форми</li>
                  <li>Показ екрану успіху</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Тестовые данные */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Тестові дані</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Правильні дані:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs">
{`Ім'я: Анна Петренко
Телефон: +380501234567
Email: anna@example.com
Нік: @anna_books`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Неправильні дані:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs">
{`Ім'я: А (занадто коротке)
Телефон: 0501234567 (без +380)
Email: anna@
Нік: @@ (неправильний формат)`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно */}
      <SubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        book={modalConfig.book}
        defaultPlan={modalConfig.defaultPlan}
      />
    </div>
  )
}