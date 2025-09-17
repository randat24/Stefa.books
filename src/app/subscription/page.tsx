import React from 'react';
import { Metadata } from 'next';
import { SubscriptionPurchase } from '@/components/subscription/SubscriptionPurchase';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Підписка на дитячі книги | Stefa Books',
  description: 'Оформіть підписку на дитячі книги з доставкою додому. Вибирайте між Mini (1 книга) та Maxi (3 книги) планами.',
  keywords: 'підписка на книги, дитячі книги, доставка книг, оренда книг',
  openGraph: {
    title: 'Підписка на дитячі книги | Stefa Books',
    description: 'Оформіть підписку на дитячі книги з доставкою додому',
    type: 'website',
  }
};

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Заголовок страницы */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Підписка на дитячі книги
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Оберіть зручний план підписки та отримуйте улюблені дитячі книги прямо додому.
            Без необхідності купівлі - просто читайте і повертайте.
          </p>
        </div>

        {/* Преимущества подписки */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Велика колекція</h3>
            <p className="text-gray-600">Понад 1000 дитячих книг різних жанрів та віків</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Безкоштовна доставка</h3>
            <p className="text-gray-600">Доставляємо книги прямо до ваших дверей</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Гнучкість</h3>
            <p className="text-gray-600">Тримайте книги стільки, скільки потрібно</p>
          </div>
        </div>

        {/* Компонент покупки подписки */}
        <SubscriptionPurchase />

        {/* FAQ */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Часті запитання</h2>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                Як працює підписка?
              </h3>
              <p className="text-gray-600">
                Після оплати підписки ви можете обирати книги з нашого каталогу та замовляти їх доставку.
                Кількість книг одночасно залежить від обраного плану.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                Скільки можна тримати книги?
              </h3>
              <p className="text-gray-600">
                Немає обмеження по часу. Ви можете читати книги в зручному для вас темпі.
                Коли закінчите - просто поверніть їх і замовте нові.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                Чи можна скасувати підписку?
              </h3>
              <p className="text-gray-600">
                Так, ви можете скасувати підписку в будь-який час через особистий кабінет.
                Підписка діятиме до кінця оплаченого періоду.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                Що робити, якщо книга пошкоджена?
              </h3>
              <p className="text-gray-600">
                Ми перевіряємо всі книги перед відправкою. Якщо ви отримали пошкоджену книгу,
                зв'яжіться з нами і ми безкоштовно замінимо її.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
