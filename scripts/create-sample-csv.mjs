#!/usr/bin/env node

/**
 * Скрипт для создания примера CSV файла с правильной структурой
 * Использование: node scripts/create-sample-csv.mjs
 */

import { writeFileSync } from 'fs'

// Пример данных с правильной структурой
const sampleBooks = [
  {
    'Название': '13 ключів до розуміння себе',
    'Автор': 'Анна Просвєтова',
    'ISBN': '978-966-448-1226',
    'Описание': 'Книга про розуміння себе та своїх емоцій',
    'Обложка': 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/13-keys.jpg',
    'Категория': 'Психологія і саморозвиток',
    'Возраст': '16+',
    'Краткое описание': 'Книга про саморозвиток',
    'Количество': '5',
    'Доступно': '3',
    'Цена': '305',
    'Местоположение': 'Полка А-1',
    'Код': 'SB-2025-0001',
    'Доступна': 'true'
  },
  {
    'Название': 'Дві білки і шишка з гілки',
    'Автор': 'Рейчел Брайт',
    'ISBN': '978-966-448-1227',
    'Описание': 'Чарівна історія про дружбу та взаємодопомогу',
    'Обложка': 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/two-squirrels.jpg',
    'Категория': 'Казки',
    'Возраст': '3-6',
    'Краткое описание': 'Казка про білок',
    'Количество': '8',
    'Доступно': '6',
    'Цена': '380',
    'Местоположение': 'Полка Б-2',
    'Код': 'SB-2025-0002',
    'Доступна': 'true'
  },
  {
    'Название': 'Дикий робот',
    'Автор': 'Пітер Браун',
    'ISBN': '978-966-448-1228',
    'Описание': 'Пригоди робота на дикому острові',
    'Обложка': 'https://res.cloudinary.com/stefa-books/image/upload/v1704067200/books/wild-robot.jpg',
    'Категория': 'Пригоди',
    'Возраст': '8-12',
    'Краткое описание': 'Пригоди робота',
    'Количество': '4',
    'Доступно': '2',
    'Цена': '256',
    'Местоположение': 'Полка В-3',
    'Код': 'SB-2025-0003',
    'Доступна': 'true'
  }
]

// Создаем CSV содержимое
function createCSV(data) {
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || ''
        // Экранируем кавычки и запятые
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}

// Создаем CSV файл
const csvContent = createCSV(sampleBooks)
writeFileSync('sample-books.csv', csvContent, 'utf8')

console.log('✅ Создан пример CSV файла: sample-books.csv')
console.log('\n📋 Структура файла:')
console.log('  - Название: Название книги')
console.log('  - Автор: Автор книги')
console.log('  - ISBN: ISBN код')
console.log('  - Описание: Полное описание')
console.log('  - Обложка: URL обложки')
console.log('  - Категория: Название категории (Казки, Пригоди, Психологія і саморозвиток)')
console.log('  - Возраст: Возрастная группа')
console.log('  - Краткое описание: Краткое описание')
console.log('  - Количество: Общее количество')
console.log('  - Доступно: Доступное количество')
console.log('  - Цена: Цена в гривнах')
console.log('  - Местоположение: Где хранится')
console.log('  - Код: Уникальный код книги')
console.log('  - Доступна: true/false')
console.log('\n🚀 Теперь вы можете:')
console.log('1. Открыть sample-books.csv в Excel/Google Sheets')
console.log('2. Добавить ваши 105 книг с правильными категориями')
console.log('3. Сохранить как books.csv')
console.log('4. Запустить: node scripts/load-all-105-books.mjs books.csv')
