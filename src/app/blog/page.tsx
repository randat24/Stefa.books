import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Блог про дитяче читання | Stefa.books',
  description: 'Корисні статті про виховання любові до читання, рецензії українських дитячих книг та експертні поради батькам.',
}

// Демо-статті для структури контент-маркетингу
const DEMO_ARTICLES = [
  {
    id: 'how-to-love-reading',
    title: 'Як привчити дитину до читання: 10 перевірених способів',
    excerpt: 'Експертні поради від дитячих психологів та досвідчених батьків. Прості методи, які дійсно працюють.',
    category: 'Поради батькам',
    publishDate: '2025-09-15',
    readTime: '8 хв',
    image: '/blog/reading-tips.jpg',
    author: 'Марія Коваленко',
    tags: ['поради', 'психологія', 'мотивація']
  },
  {
    id: 'ukrainian-books-2025',
    title: 'Топ-20 українських дитячих книг 2025 року',
    excerpt: 'Найкращі новинки української дитячої літератури, які варто прочитати кожній дитині.',
    category: 'Рецензії',
    publishDate: '2025-09-12',
    readTime: '12 хв',
    image: '/blog/ukrainian-books.jpg',
    author: 'Олена Петренко',
    tags: ['рецензії', 'українська література', 'новинки']
  },
  {
    id: 'reading-by-age-3-5',
    title: 'Що читати дитині 3-5 років: віковий гід',
    excerpt: 'Детальні рекомендації книг для дошкільнят з урахуванням психологічного розвитку.',
    category: 'За віком',
    publishDate: '2025-09-10',
    readTime: '6 хв',
    image: '/blog/age-3-5.jpg',
    author: 'Андрій Мельник',
    tags: ['3-5 років', 'вікові рекомендації', 'розвиток']
  },
  {
    id: 'rental-vs-buying',
    title: 'Чому оренда книжок вигідніша за купівлю',
    excerpt: 'Економічний розрахунок: скільки можна заощадити на дитячих книгах завдяки підписці.',
    category: 'Поради батькам',
    publishDate: '2025-09-08',
    readTime: '5 хв',
    image: '/blog/rental-benefits.jpg',
    author: 'Марія Коваленко',
    tags: ['економія', 'підписка', 'бюджет']
  },
  {
    id: 'bedtime-stories',
    title: 'Казки на ніч: як вибрати правильні історії',
    excerpt: 'Психологи розповідають, які казки допомагають дітям краще засинати та розвиватися.',
    category: 'Поради батькам',
    publishDate: '2025-09-05',
    readTime: '7 хв',
    image: '/blog/bedtime-stories.jpg',
    author: 'Олена Петренко',
    tags: ['казки', 'сон', 'ритуали']
  },
  {
    id: 'mykolaiv-children-library',
    title: 'Дитячі бібліотеки Миколаєва: повний гід',
    excerpt: 'Огляд всіх дитячих бібліотек міста, їх особливості та як записатися.',
    category: 'Миколаїв',
    publishDate: '2025-09-03',
    readTime: '10 хв',
    image: '/blog/mykolaiv-libraries.jpg',
    author: 'Андрій Мельник',
    tags: ['Миколаїв', 'бібліотеки', 'місто']
  }
]

const CATEGORIES = [
  { name: 'Всі статті', count: DEMO_ARTICLES.length, slug: 'all' },
  { name: 'Поради батькам', count: 3, slug: 'guides' },
  { name: 'Рецензії', count: 1, slug: 'reviews' },
  { name: 'За віком', count: 1, slug: 'age-recommendations' },
  { name: 'Миколаїв', count: 1, slug: 'mykolaiv' }
]

export default function BlogPage() {
  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Featured Article */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="h-48 md:h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-6xl">📚</span>
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <div className="text-sm text-blue-600 font-medium mb-2">РЕКОМЕНДОВАНО</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {DEMO_ARTICLES[0].title}
              </h2>
              <p className="text-gray-600 mb-4">{DEMO_ARTICLES[0].excerpt}</p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>{DEMO_ARTICLES[0].author}</span>
                <span className="mx-2">•</span>
                <span>{DEMO_ARTICLES[0].readTime}</span>
                <span className="mx-2">•</span>
                <span>{new Date(DEMO_ARTICLES[0].publishDate).toLocaleDateString('uk-UA')}</span>
              </div>
              <Link
                href={`/blog/${DEMO_ARTICLES[0].id}`}
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Читати статтю →
              </Link>
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {DEMO_ARTICLES.slice(1).map((article) => (
            <article key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-4xl">📖</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">{article.readTime}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{article.author}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(article.publishDate).toLocaleDateString('uk-UA')}</span>
                  </div>
                  <Link
                    href={`/blog/${article.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Читати →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-8">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium">
            Завантажити більше статей
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Категорії</h3>
          <div className="space-y-2">
            {CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={category.slug === 'all' ? '/blog' : `/blog/category/${category.slug}`}
                className="flex items-center justify-between py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span>{category.name}</span>
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {category.count}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            📧 Підписка на новини
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Отримуйте корисні статті про дитяче читання щотижня
          </p>
          <form className="space-y-3">
            <input
              type="email"
              placeholder="Ваш email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium"
            >
              Підписатися
            </button>
          </form>
        </div>

        {/* Popular Tags */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярні теги</h3>
          <div className="flex flex-wrap gap-2">
            {['поради', 'рецензії', 'українська література', '3-5 років', 'психологія', 'Миколаїв', 'економія', 'розвиток'].map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="text-xs bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 px-3 py-1 rounded-full transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}