'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, Loader2 } from 'lucide-react';
import SimplifiedBookCard, { type SimplifiedBookCardProps } from '@/components/SimplifiedBookCard';

// Wrapper component to handle the key prop
const BookCardWrapper = ({ book, ...props }: SimplifiedBookCardProps & { key?: string }) => {
  return <SimplifiedBookCard book={book} {...props} />;
};
import { fetchNewBooks, fetchCategories, getCategoriesFromBooks } from '@/lib/api/books';
import type { Book } from '@/lib/supabase';

export function Catalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загружаем книги и категории при монтировании компонента
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Загружаем книги и категории параллельно
        const [booksResponse, categoriesResponse] = await Promise.all([
          fetchNewBooks(20), // Больше книг для главной
          fetchCategories()
        ]);

        if (booksResponse.success) {
          setBooks(booksResponse.data);
          
        } else {
          throw new Error(booksResponse.error || 'Ошибка загрузки книг');
        }

        if (categoriesResponse.success) {
          // Преобразуем объекты категорий в массив строк
          let categoryList: string[] = [];
          
          if (Array.isArray(categoriesResponse.data)) {
            // Если это массив объектов с полем name
            if (categoriesResponse.data.length > 0 && typeof categoriesResponse.data[0] === 'object' && 'name' in categoriesResponse.data[0]) {
              categoryList = categoriesResponse.data.map((cat: any) => cat.name);
            } else {
              // Если это уже массив строк
              categoryList = categoriesResponse.data as unknown as string[];
            }
          }
          
          // Также добавляем категории из самих книг для полноты
          const booksCategories = getCategoriesFromBooks(booksResponse.data);
          const allUniqueCategories = [...new Set([...categoryList, ...booksCategories])];
          
          // Добавляем "Новинки" в начало списка категорий
          const allCategories = ['Новинки', ...allUniqueCategories.sort()];
          setCategories(allCategories);
          
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError(errorMessage);
        
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Фільтрація книг за пошуком та категоріями
  const filteredBooks = useMemo(() => {
    if (!books || books.length === 0) return [];
    let filtered = books;

    // Фільтр за категорією
    if (selectedCategory) {
      if (selectedCategory === 'Новинки') {
        // Для "Новинки" показываем последние добавленные книги (уже отсортированы по created_at DESC)
        filtered = books.slice(0, 12);
      } else {
        filtered = filtered.filter(book => 
          book.category === selectedCategory
        );
      }
    }

    // Фільтр за пошуковим запитом
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        (book.category && book.category.toLowerCase().includes(query)) ||
        (book.description && book.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [books, searchQuery, selectedCategory]);

  // максимум 8 штук = 2 ряда по 4 на десктопе
  const items = filteredBooks?.slice(0, 8) || [];

  return (
    <section className="section">
      <header className="mb-12 text-center">
        <div className="max-w-3xl mx-auto mb-8">
          <h2 className="text-h1 text-neutral-900 mb-4">Каталог дитячих книг для оренди в Миколаєві</h2>
          <p className="text-body-lg text-neutral-600 mb-8">Великий вибір українських дитячих книг різних вікових категорій. Орендуйте книжки з підпискою Stefa.books. Постійно поповнюємо каталог новинками української літератури.</p>
          
          {/* Пошук та кнопка каталогу */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 max-w-2xl mx-auto">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[var(--text-muted)]" />
              </div>
              <input
                type="text"
                placeholder="Пошук за назвою, автором або категорією..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="field pl-12 pr-12"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:text-[var(--text)] transition-colors"
                >
                  <X className="h-5 w-5 text-[var(--text-muted)]" />
                </button>
              )}
            </div>
            <Link
              href="/books"
              className="btn btn-primary btn-lg"
            >
              Увесь каталог →
            </Link>
          </div>
        </div>
        
        {/* Категорії */}
        {!loading && categories.length > 0 && (
          <div className="mb-8 max-w-6xl mx-auto">
            <div className="flex gap-3 overflow-x-auto pb-2 px-2 scrollbar-thin scrollbar-thumb-[var(--line)] scrollbar-track-transparent hover:scrollbar-thumb-[var(--text-muted)]">
              {categories.map((category) => {
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                    className={`inline-flex items-center px-4 py-3 rounded-[var(--radius-lg)] border transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === category
                        ? 'bg-[var(--accent)] text-[var(--surface)] border-[var(--accent)] shadow-lg'
                        : 'bg-[var(--surface)] text-[var(--text)] border-[var(--line)] hover:border-[var(--text-muted)] hover:shadow-md'
                    }`}
                  >
                    <span className={`font-medium small whitespace-nowrap ${
                      selectedCategory === category ? 'text-[var(--surface)]' : 'text-[var(--text)]'
                    }`}>
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>
            {/* Индикатор прокрутки */}
            {categories.length > 6 && (
              <div className="text-center mt-2">
                <span className="text-xs text-[var(--text-muted)]">← прокрутіть для перегляду всіх категорій →</span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Загрузка */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-[var(--text-muted)]">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="h3">Завантаження книг...</span>
          </div>
        </div>
      )}

      {/* Ошибка */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="alert alert-error mb-4">
            <X className="w-4 h-4" />
            <span className="font-medium">Помилка завантаження</span>
          </div>
          <p className="small text-[var(--text-muted)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Спробувати знову
          </button>
        </div>
      )}

      {/* Результати */}
      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((b) => (
            <BookCardWrapper 
              key={b.id} 
              book={b} 
              priorityLoading={false}
            />
          ))}
        </div>
      )}

      {/* Пусто */}
      {!loading && !error && items.length === 0 && books && books.length > 0 && (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <BookOpen className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-6" />
            <h3 className="h3 text-[var(--text)] mb-4">Книги не знайдені</h3>
            <p className="text-body text-[var(--text-muted)] mb-8">Спробуйте змінити пошуковий запит або обрати іншу категорію</p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                }}
                className="btn btn-primary btn-lg"
              >
                Скинути фільтри
              </button>
            )}
          </div>
        </div>
      )}

      {/* Нет книг в базе */}
      {!loading && !error && (!books || books.length === 0) && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-body-lg text-neutral-600 mb-4">Каталог порожній</p>
          <p className="text-body-sm text-neutral-500">Книги скоро з&apos;являться у нашому каталозі</p>
        </div>
      )}
      
      {/* Показуємо кількість знайдених книг */}
      {(searchQuery || selectedCategory) && items.length > 0 && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)] shadow-sm">
            <span className="text-body-sm text-[var(--text)]">
              Показано <span className="font-semibold text-[var(--accent)]">{items.length}</span> з <span className="font-semibold">{filteredBooks.length}</span> книг
            </span>
            {filteredBooks.length > 8 && (
              <span className="text-xs text-[var(--text-muted)] ml-2">
                • Перегляньте весь каталог для всіх результатів
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
