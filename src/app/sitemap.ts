import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stefa-books.com.ua'
  
  // Статические страницы
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0 },
    {
      url: `${baseUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9 },
    {
      url: `${baseUrl}/plans`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8 },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7 },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7 },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8 },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7 }
  ]
  
  try {
    // Динамические страницы книг
    const { data: books } = await supabase
      .from('books')
      .select('id, updated_at, title, author')
      .eq('available', true)
      .order('updated_at', { ascending: false })
    
    const bookPages = books?.map((book: any) => ({
      url: `${baseUrl}/books/${book.id}`,
      lastModified: new Date(book.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      // Добавляем альтернативные локализации для книг
      alternates: {
        languages: {
          'uk': `${baseUrl}/books/${book.id}`,
          'ru': `${baseUrl}/ru/books/${book.id}`,
          'en': `${baseUrl}/en/books/${book.id}`
        }
      }
    })) || []
    
    // Страницы категорий
    const { data: categories } = await supabase
      .from('categories')
      .select('slug, updated_at, name')
      .eq('active', true)
    
    const categoryPages = categories?.map((category: any) => ({
      url: `${baseUrl}/catalog/${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      // Добавляем альтернативные локализации для категорий
      alternates: {
        languages: {
          'uk': `${baseUrl}/catalog/${category.slug}`,
          'ru': `${baseUrl}/ru/catalog/${category.slug}`,
          'en': `${baseUrl}/en/catalog/${category.slug}`
        }
      }
    })) || []
    
    // Страницы авторов
    const { data: authors } = await supabase
      .from('authors')
      .select('id, updated_at, name')
      .eq('active', true)
    
    const authorPages = authors?.map((author: any) => ({
      url: `${baseUrl}/authors/${author.id}`,
      lastModified: new Date(author.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7 })) || []
    
    return [...staticPages, ...bookPages, ...categoryPages, ...authorPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Возвращаем только статические страницы в случае ошибки
    return staticPages
  }
}
