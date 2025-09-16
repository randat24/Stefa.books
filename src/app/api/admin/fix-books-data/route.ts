import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

// ============================================================================
// API ДЛЯ ИСПРАВЛЕНИЯ ДАННЫХ КНИГ В АДМИН-ПАНЕЛИ
// ============================================================================

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      logger.error('Missing Supabase configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    logger.info('Starting books data fix...')

    // Сначала удаляем все записи из таблицы books
    const { error: deleteError } = await supabase
      .from('books')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Удаляем все записи

    if (deleteError) {
      logger.error('Error deleting books:', deleteError)
      return NextResponse.json(
        { error: 'Failed to clear books table' },
        { status: 500 }
      )
    }

    logger.info('Books table cleared successfully')

    // Добавляем правильные тестовые данные книг
    const sampleBooks = [
      {
        id: 'book-1',
        code: 'DL-001',
        title: 'Казки українських письменників',
        author: 'Тарас Шевченко',
        category: 'Дитяча література',
        subcategory: 'Казки',
        description: 'Збірка найкращих казок для дітей від українських письменників',
        short_description: 'Казки для дітей',
        isbn: '978-617-123-456-7',
        pages: 120,
        age_range: '6+',
        language: 'Ukrainian',
        publisher: 'Видавництво А-БА-БА-ГА-ЛА-МА-ГА',
        publication_year: 2023,
        cover_url: '/images/books/sample-1.jpg',
        status: 'available',
        available: true,
        qty_total: 3,
        qty_available: 2,
        price_uah: 150,
        location: 'Стелаж А-1',
        rating: 4.8,
        rating_count: 25,
        badges: ['Популярна', 'Новинка'],
        tags: ['казки', 'дитяча література', 'українська'],
        is_active: true
      },
      {
        id: 'book-2',
        code: 'DL-002',
        title: 'Пригоди Незнайки',
        author: 'Микола Носов',
        category: 'Дитяча література',
        subcategory: 'Пригоди',
        description: 'Класичні пригоди веселого коротульки Незнайки та його друзів',
        short_description: 'Пригоди Незнайки',
        isbn: '978-617-123-457-4',
        pages: 200,
        age_range: '8+',
        language: 'Ukrainian',
        publisher: 'Видавництво Школа',
        publication_year: 2022,
        cover_url: '/images/books/sample-2.jpg',
        status: 'available',
        available: true,
        qty_total: 2,
        qty_available: 1,
        price_uah: 180,
        location: 'Стелаж А-2',
        rating: 4.9,
        rating_count: 18,
        badges: ['Класика', 'Рекомендована'],
        tags: ['пригоди', 'дитяча література', 'класика'],
        is_active: true
      },
      {
        id: 'book-3',
        code: 'DL-003',
        title: 'Маленький принц',
        author: 'Антуан де Сент-Екзюпері',
        category: 'Дитяча література',
        subcategory: 'Філософська казка',
        description: 'Філософська казка про дружбу, любов та сенс життя',
        short_description: 'Маленький принц',
        isbn: '978-617-123-458-1',
        pages: 96,
        age_range: '10+',
        language: 'Ukrainian',
        publisher: 'Видавництво Основи',
        publication_year: 2024,
        cover_url: '/images/books/sample-3.jpg',
        status: 'available',
        available: true,
        qty_total: 4,
        qty_available: 3,
        price_uah: 120,
        location: 'Стелаж Б-1',
        rating: 4.7,
        rating_count: 32,
        badges: ['Світова класика', 'Бестселер'],
        tags: ['філософія', 'казка', 'світова література'],
        is_active: true
      },
      {
        id: 'book-4',
        code: 'DL-004',
        title: 'Гаррі Поттер і філософський камінь',
        author: 'Джоан Роулінг',
        category: 'Дитяча література',
        subcategory: 'Фентезі',
        description: 'Перша книга про пригоди молодого чарівника Гаррі Поттера',
        short_description: 'Гаррі Поттер',
        isbn: '978-617-123-459-8',
        pages: 320,
        age_range: '10+',
        language: 'Ukrainian',
        publisher: 'Видавництво А-БА-БА-ГА-ЛА-МА-ГА',
        publication_year: 2021,
        cover_url: '/images/books/sample-4.jpg',
        status: 'available',
        available: true,
        qty_total: 5,
        qty_available: 4,
        price_uah: 250,
        location: 'Стелаж Б-2',
        rating: 4.9,
        rating_count: 45,
        badges: ['Бестселер', 'Популярна'],
        tags: ['фентезі', 'пригоди', 'чарівництво'],
        is_active: true
      },
      {
        id: 'book-5',
        code: 'DL-005',
        title: 'Чарлі і шоколадна фабрика',
        author: 'Роальд Дал',
        category: 'Дитяча література',
        subcategory: 'Пригоди',
        description: 'Чарівна історія про хлопчика Чарлі та його пригоди на шоколадній фабриці',
        short_description: 'Чарлі і фабрика',
        isbn: '978-617-123-460-4',
        pages: 180,
        age_range: '8+',
        language: 'Ukrainian',
        publisher: 'Видавництво Школа',
        publication_year: 2023,
        cover_url: '/images/books/sample-5.jpg',
        status: 'available',
        available: true,
        qty_total: 2,
        qty_available: 1,
        price_uah: 160,
        location: 'Стелаж А-3',
        rating: 4.6,
        rating_count: 22,
        badges: ['Класика', 'Рекомендована'],
        tags: ['пригоди', 'сімейна', 'казка'],
        is_active: true
      }
    ]

    // Вставляем тестовые данные
    const { data: insertedBooks, error: insertError } = await supabase
      .from('books')
      .insert(sampleBooks)
      .select()

    if (insertError) {
      logger.error('Error inserting books:', insertError)
      return NextResponse.json(
        { error: 'Failed to insert sample books' },
        { status: 500 }
      )
    }

    logger.info(`Successfully inserted ${insertedBooks?.length || 0} books`)

    return NextResponse.json({
      success: true,
      message: 'Books data fixed successfully',
      booksInserted: insertedBooks?.length || 0,
      data: insertedBooks
    })

  } catch (error) {
    logger.error('Error fixing books data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
