import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchBook, fetchBooksByCategory } from "@/lib/api/books";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BookCard from "@/components/BookCard";
import { BookViewTracker } from "@/components/BookViewTracker";
import { BookImageGallery } from "@/components/BookImageGallery";
import { BookSpecifications } from "@/components/BookSpecifications";
import { BookReviews } from "@/components/BookReviews";
import { BookReadingSample } from "@/components/BookReadingSample";
import { 
  BookOpen, 
  Award, 
  Star, 
  ChevronRight,
  Hash,
  FileText,
  MessageCircle,
  Heart,
  ShoppingCart
} from "lucide-react";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

import { BookStructuredData } from "@/components/seo/BookStructuredData";
import { BreadcrumbStructuredData } from "@/components/seo/BreadcrumbStructuredData";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const { data: book } = await supabase
      .from('books')
      .select(`
        *,
        category:categories(name, slug)
      `)
      .eq('id', id)
      .single();
    
    if (!book) {
      return {
        title: 'Книга не найдена | Stefa.books',
        description: 'Запрашиваемая книга не найдена в нашей библиотеке'
      };
    }
    
    const bookData = book as any; // Временное решение для типизации
    const title = `${bookData.title} - ${bookData.author} | Stefa.books`;
    const description = bookData.description || 
      `Читайте "${bookData.title}" автора ${bookData.author}. Украинская детская книга для аренды онлайн в библиотеке Stefa.books.`;
    
    return {
      title,
      description,
      keywords: [
        bookData.title,
        bookData.author,
        'дитячі книги',
        'українські книги',
        'книги для дітей',
        bookData.category?.name || 'дитяча література',
        'оренда книг',
        'читання онлайн',
        'Stefa.books'
      ],
      openGraph: {
        title,
        description,
        type: 'book',
        locale: 'uk_UA',
        url: `https://stefa-books.com.ua/books/${bookData.id}`,
        siteName: 'Stefa.books',
        images: [
          {
            url: bookData.cover_url,
            width: 400,
            height: 600,
            alt: `Обложка книги "${bookData.title}"`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [bookData.cover_url],
      },
      alternates: {
        canonical: `https://stefa-books.com.ua/books/${bookData.id}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata for book:', error);
    return {
      title: 'Книга | Stefa.books',
      description: 'Детская книга в библиотеке Stefa.books'
    };
  }
}


export default async function BookPage({ params }: { params: Params }) {
  const { id } = await params;
  const bookResponse = await fetchBook(id);
  if (!bookResponse.success || !bookResponse.data) return notFound();

  const book = bookResponse.data;

  // Get related books (same category, excluding current book)
  const relatedBooksResponse = await fetchBooksByCategory(book.category, 8);
  const relatedBooks = relatedBooksResponse.success
    ? relatedBooksResponse.data
        .filter(b => b.id !== book.id && b.available)
        .slice(0, 5)
    : [];

  // Use description from database, with fallback
  const fullDescription = book.description || 
    book.short_description || 
    "Захоплююча дитяча книга, що поєднує в собі пригоди, навчання та розваги. Ідеально підходить для читання разом з батьками або самостійного вивчення. Допоможе розвинути фантазію та мовні навички.";

  // Breadcrumb data
  const breadcrumbs = [
    { name: "Головна", url: "https://stefa-books.com.ua/" },
    { name: "Каталог", url: "https://stefa-books.com.ua/catalog" },
    { name: book.category, url: `https://stefa-books.com.ua/categories/${book.category.toLowerCase()}` },
    { name: book.title, url: `https://stefa-books.com.ua/books/${book.id}` }
  ];

  return (
    <>
      <BookViewTracker bookId={book.id} book={book} />
      
      {/* Structured Data */}
      <BookStructuredData book={book} />
      <BreadcrumbStructuredData breadcrumbs={breadcrumbs} />
      
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Головна</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/catalog" className="hover:text-gray-900">Каталог</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/categories/${book.category.toLowerCase()}`} className="hover:text-gray-900">
            {book.category}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{book.title}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Main book info section */}
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
          {/* Book Cover Gallery */}
          <div className="space-y-4">
            <BookImageGallery 
              title={book.title}
              cover_url={book.cover_url}
            />
            
          </div>
          
          {/* Book Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
                    {book.title}
                  </h1>
                  <p className="text-xl text-gray-700 mb-2">{book.author}</p>
                  
                  {/* Rating */}
                  {book.rating && book.rating_count && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(book.rating!) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {book.rating.toFixed(1)} ({book.rating_count} відгуків)
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      {book.code}
                    </span>
                    {book.category && (
                      <Badge variant="secondary" className="text-xs">
                        {book.category}
                      </Badge>
                    )}
                    {book.age_range && (
                      <Badge variant="outline" className="text-xs">
                        {book.age_range}
                      </Badge>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      book.available 
                        ? "text-green-700 bg-green-100" 
                        : "text-red-700 bg-red-100"
                    }`}>
                      {book.available ? "✓ Доступна" : "✗ Видана"}
                    </span>
                  </div>
                </div>
                <FavoriteButton id={book.id} />
              </div>
              <p className="text-sm text-slate-600 leading-relaxed text-left">
                {book.short_description}
              </p>

              {/* Order Button */}
              {book.available && (
                <div className="pt-4">
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href={`/books/${book.id}/order`}>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Оформити замовлення
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Badges */}
            {book.badges && book.badges.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Нагороди та відзнаки</h4>
                <div className="flex flex-wrap gap-2">
                  {book.badges.map((badge, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <Award className="h-3 w-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="card p-8">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="description" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Опис
              </TabsTrigger>
              <TabsTrigger value="specifications" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Характеристики
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Відгуки
              </TabsTrigger>
              <TabsTrigger value="sample" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Уривок
              </TabsTrigger>
              <TabsTrigger value="author" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Автор
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="prose prose-slate max-w-none">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  Про книгу
                </h2>
                {fullDescription.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-700 mb-4 leading-relaxed text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <BookSpecifications book={book} />
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <BookReviews 
                rating={book.rating}
                rating_count={book.rating_count}
              />
            </TabsContent>
            
            <TabsContent value="sample" className="mt-6">
              <BookReadingSample title={book.title} />
            </TabsContent>
            
            <TabsContent value="author" className="mt-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Heart className="h-6 w-6" />
                  Про автора
                </h2>
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {book.author.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{book.author}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Детальна інформація про автора буде додана пізніше. 
                      Поки що ви можете знайти більше книг цього автора в нашому каталозі.
                    </p>
                    <Button variant="outline" size="md" className="mt-3 h-8 text-xs">
                      Всі книги автора
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related books */}
        {relatedBooks.length > 0 && (
          <div className="card p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                Схожі книги
              </h2>
              <Button variant="outline" size="md" asChild>
                <Link href={`/categories/${book.category.toLowerCase()}`}>
                  Дивитися всі
                </Link>
              </Button>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {relatedBooks.map((relatedBook) => (
                <BookCard key={relatedBook.id} book={relatedBook} />
              ))}
            </div>
            
            {/* Additional books notice */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">
                Знайдіть ще більше книг у категорії &quot;{book.category}&quot;
              </p>
              <Button variant="outline" asChild>
                <Link href={`/categories/${book.category.toLowerCase()}`}>
                  Переглянути категорію
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}