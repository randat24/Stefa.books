'use client'

import SubscribeFormHome from '@/components/subscribe/SubscribeFormHome'

export default function TestSubscribeHomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Тестування SubscribeFormHome
        </h1>

        <div className="space-y-8">
          {/* Инструкции */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Що тестувати</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Обов'язкові поля:</strong> Ім'я, Телефон, Email, План підписки, Спосіб оплати, Згода на обробку даних</p>
              <p><strong>Опціональні поля:</strong> Нік в Telegram/Instagram, Додаткова інформація</p>
              <p><strong>Валідація телефону:</strong> +380XXXXXXXXX (автоматично підставляється +380)</p>
              <p><strong>Валідація email:</strong> правильний формат email</p>
              <p><strong>Валідація ніка:</strong> @username або username (мінімум 3 символи)</p>
            </div>
          </div>

          {/* Тестовые данные */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Тестові дані</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold mb-2">Правильні дані:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs">
{`Ім'я: Анна Петренко
Телефон: +380501234567
Email: anna@example.com
Нік: @anna_books (опціонально)
Додаткова інформація: (опціонально)`}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Неправильні дані:</h3>
                <pre className="bg-gray-100 p-2 rounded text-xs">
{`Ім'я: А (занадто коротке)
Телефон: 0501234567 (без +380)
Email: anna@ (неправильний формат)
Нік: @@ (неправильний формат)`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Форма */}
      <SubscribeFormHome />
    </div>
  )
}