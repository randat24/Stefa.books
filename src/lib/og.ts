/**
 * Утилиты для генерации Open Graph изображений
 */

export function generateOGImageUrl({
  title,
  description,
  type = 'default'
}: {
  title: string;
  description?: string;
  type?: 'default' | 'book' | 'category' | 'search';
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua';
  const params = new URLSearchParams({
    title: title.substring(0, 100), // Ограничиваем длину
    ...(description && { description: description.substring(0, 200) }),
    type
  });

  return `${baseUrl}/api/og?${params.toString()}`;
}

export function generateBookOGImage(book: {
  title: string;
  author: string;
  description?: string;
}) {
  return generateOGImageUrl({
    title: `${book.title} - ${book.author}`,
    description: book.description || `Книга "${book.title}" автора ${book.author}`,
    type: 'book'
  });
}

export function generateCategoryOGImage(category: {
  name: string;
  description?: string;
}) {
  return generateOGImageUrl({
    title: `Категорія: ${category.name}`,
    description: category.description || `Книги в категорії "${category.name}"`,
    type: 'category'
  });
}

export function generateSearchOGImage(query: string) {
  return generateOGImageUrl({
    title: `Пошук: "${query}"`,
    description: `Результати пошуку книг за запитом "${query}"`,
    type: 'search'
  });
}

export function generateDefaultOGImage() {
  return generateOGImageUrl({
    title: 'Stefa.books - Дитяча бібліотека книг',
    description: 'Орендуйте та читайте українські дитячі книги онлайн. Великий каталог українських дитячих книг для різних вікових категорій.',
    type: 'default'
  });
}
