import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Блог Stefa.books - Поради про дитяче читання | Рецензії книг',
  description: 'Корисні статті про виховання любові до читання у дітей, рецензії українських дитячих книг та поради батькам від експертів.',
  keywords: [
    'дитяче читання',
    'рецензії дитячих книг',
    'поради батькам',
    'українські дитячі книги',
    'розвиток дитини через читання',
    'як привчити дитину до читання',
    'вікові рекомендації книг',
    'новинки дитячої літератури'
  ],
  openGraph: {
    title: 'Блог Stefa.books - Все про дитяче читання',
    description: 'Експертні поради та рецензії українських дитячих книг',
    type: 'website',
    locale: 'uk_UA'
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Blog Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Блог Stefa.books
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Експертні поради про дитяче читання, рецензії українських книг
            та все, що допоможе виховати у дитини любов до літератури
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm p-2 flex space-x-1">
            <a
              href="/blog"
              className="px-4 py-2 rounded-md text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
              Всі статті
            </a>
            <a
              href="/blog/category/reviews"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              Рецензії
            </a>
            <a
              href="/blog/category/guides"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              Поради батькам
            </a>
            <a
              href="/blog/category/age-recommendations"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              За віком
            </a>
            <a
              href="/blog/category/ukrainian-literature"
              className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              Українська література
            </a>
          </div>
        </nav>

        {children}
      </div>
    </div>
  )
}